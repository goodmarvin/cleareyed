import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject, streamObject } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { findRelevantMentalModelsHybrid } from '@/lib/ai/embedding';
import { InsightResponseSchema } from '@/lib/schemas/insight-schema';

// Intent extraction schema
const IntentSchema = z.object({
  tags: z.array(z.string()).describe('Relevant tags for filtering mental models'),
  domain: z.string().describe('Primary domain (e.g., business, personal, decision-making)'),
  complexity: z.enum(['simple', 'moderate', 'complex']).describe('Complexity level of the scenario'),
  key_concepts: z.array(z.string()).describe('Key concepts to focus mental model search')
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    // Handle both useObject format (scenario string) and legacy formats
    let userPrompt: string;
    if (typeof body === 'string') {
      // Direct string from useObject
      userPrompt = body;
    } else if (body.messages && Array.isArray(body.messages)) {
      // useChat format - get the last user message
      const lastUserMessage = body.messages.filter((m: any) => m.role === 'user').pop();
      if (!lastUserMessage?.content) {
        return NextResponse.json(
          { error: 'No user message found in messages array' },
          { status: 400 }
        );
      }
      userPrompt = lastUserMessage.content;
    } else if (body.prompt && typeof body.prompt === 'string') {
      // Direct prompt format
      userPrompt = body.prompt;
    } else {
      return NextResponse.json(
        { error: 'Scenario string, messages array, or prompt string is required' },
        { status: 400 }
      );
    }

    if (!userPrompt || userPrompt.length < 10) {
      return NextResponse.json(
        { error: 'Scenario must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // 1. Extract intent using GPT-4o-mini
    const { object: intent } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: IntentSchema,
      prompt: `Analyze this scenario and extract the intent for finding relevant mental models:

"${userPrompt}"

Focus on:
- What mental model tags would be most relevant (e.g., decision-making, cognitive-bias, systems-thinking)
- The primary domain this relates to  
- How complex this scenario is
- Key concepts that should guide the search

Be specific and practical.`,
    });

    // 2. Retrieve mental models using 3-stage pipeline: Vector → Cohere → GPT-4o-mini
    const models = await findRelevantMentalModelsHybrid(
      userPrompt,
      intent.tags, // Keep for future use, not used in scoring
      {
        matchThreshold: 0.1,
        candidateCount: 15,   // Vector search candidates
        rerankCount: 5,       // Cohere rerank to top 5
        finalCount: 3,        // GPT-4o-mini selects top 3
        useReranking: true,   // Enable Cohere reranking
        useFinalRanking: true // Enable GPT-4o-mini final selection
      }
    );

    if (models.length === 0) {
      return NextResponse.json(
        { error: 'No relevant mental models found for this scenario' },
        { status: 404 }
      );
    }

    // 3. Create models context for the LLM
    const modelsContext = models.map(m => 
      `**${m.name}** (vector: ${m.similarity.toFixed(2)}${m.rerank_score ? `, rerank: ${m.rerank_score.toFixed(2)}` : ''}${m.gpt_score ? `, gpt: ${m.gpt_score.toFixed(2)}` : ''})
      ${m.gpt_reasoning ? `GPT Reasoning: ${m.gpt_reasoning}` : ''}
      
Concept: ${m.concept_description}

When to use: ${m.application_description}

Full description:
${m.body_md}
---`
    ).join('\n\n');

    // 4. Generate structured insights using streamObject
    const duration = Date.now() - startTime;
    
    const result = streamObject({
      model: openai('gpt-4.1-mini'),
      schema: InsightResponseSchema,
      schemaName: 'InsightResponse',
      schemaDescription: 'Structured mental model insights and actionable advice for decision-making scenarios',
      prompt: `You are Clear-Eyed, an AI that helps people make better decisions by applying mental models to their specific scenarios.

SCENARIO: "${userPrompt}"

INTENT ANALYSIS:
- Domain: ${intent.domain}
- Complexity: ${intent.complexity}
- Key Concepts: ${intent.key_concepts.join(', ')}

AVAILABLE MENTAL MODELS:
${modelsContext}

INSTRUCTIONS:
1. Create a catchy, descriptive scenario title (3-6 words) that captures the essence of their situation
2. Generate a 1-2 sentence summary of what you understood from their scenario (for "what_we_heard" field)
3. Analyze the scenario using the provided mental models
4. For each mental model, provide:
   - concept_description: 1-2 punchy, opinionated sentences explaining the core idea (write like Scott Galloway - direct, bold, provocative)
   - scenario_tie_in: 1-2 punchy sentences on how this applies to their situation (Scott Galloway style - cut through BS, be direct)
   - do_items: Exactly 1 concrete, actionable step they should take using this model
   - avoid_items: Exactly 1 specific pitfall or mistake to avoid
   - reflection_question: One powerful question that will deepen their thinking about this scenario
5. Provide key insights from each mental model's perspective
6. Identify potential blind spots and alternative framings
7. Generate 2-4 specific, actionable steps they can take overall
8. Include follow-up questions for deeper exploration
9. Be practical, insightful, and concise

Focus on how these mental models change their perspective and what they should do differently.

Return a complete structured response with all required fields filled out based on the mental models and scenario provided. Make sure each mental model has all the new card fields populated with scenario-specific content.

Make sure to include:
- metadata.processing_time_ms: ${Date.now() - startTime}
- metadata.models_considered: ${models.length + 10} (includes vector search candidates)
- metadata.models_selected: ${models.length}

Use the retrieved mental models to provide thorough analysis and actionable insights.`,
      onFinish: async (event) => {
        // Log query to database with structured data
        try {
          await db.from('queries').insert({
            prompt: userPrompt,
            intent: intent as any,
            duration_ms: Date.now() - startTime,
            plan_b_count: 0
          });
          
          // Log matches for analytics
          if (event.object && models.length > 0) {
            const matchRecords = models.map(model => ({
              // We'll need to get the query_id from the insert above in a real implementation
              model_id: model.id,
              similarity: model.similarity,
              rerank_score: model.rerank_score || null,
            }));
            // For now, we'll skip the matches insert since we need the query_id
            // In a full implementation, you'd use a transaction or return the query_id
          }
        } catch (error) {
          console.error('Failed to log query:', error);
          // Don't fail the request for logging errors
        }
      },
    });

    // Return streaming object response
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Error in /api/query:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 