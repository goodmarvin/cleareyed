import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject, streamText } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { findRelevantMentalModelsHybrid } from '@/lib/ai/embedding';

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
    
    // Handle both useChat format (messages array) and direct prompt format
    let userPrompt: string;
    if (body.messages && Array.isArray(body.messages)) {
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
        { error: 'Either messages array or prompt string is required' },
        { status: 400 }
      );
    }

    if (!userPrompt || userPrompt.length < 10) {
      return NextResponse.json(
        { error: 'Prompt must be at least 10 characters long' },
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

    // 3. Generate insights using the retrieved models
    const modelsContext = models.map(m => 
      `**${m.name}** (vector: ${m.similarity.toFixed(2)}${m.rerank_score ? `, rerank: ${m.rerank_score.toFixed(2)}` : ''}${m.gpt_score ? `, gpt: ${m.gpt_score.toFixed(2)}` : ''})
      ${m.gpt_reasoning ? `GPT Reasoning: ${m.gpt_reasoning}` : ''}
      
Concept: ${m.concept_description}

When to use: ${m.application_description}

Full description:
${m.body_md}
---`
    ).join('\n\n');

    const ideaStream = await streamText({
      model: openai('gpt-4o'),
      system: `You are Clear-Eyed, an AI that helps people make better decisions by applying mental models to their specific scenarios.

Given the user's scenario and these relevant mental models, provide practical insights and actionable advice.

Structure your response as:
1. **Key Mental Model(s)**: Which model(s) are most applicable and why
2. **Analysis**: How this mental model lens reveals new perspectives on their situation  
3. **Action Ideas**: 2-3 specific, actionable steps they can take

Be practical, insightful, and concise. Focus on how the mental models change their perspective and what they should do differently.

Mental Models Available:
${modelsContext}`,
      prompt: `Scenario: "${userPrompt}"

Intent Analysis: 
- Domain: ${intent.domain}
- Complexity: ${intent.complexity}
- Key Concepts: ${intent.key_concepts.join(', ')}

Please provide Clear-Eyed insights using the most relevant mental models.`,
    });

    // 4. Log query to database (simplified)
    const duration = Date.now() - startTime;
    await db.from('queries').insert({
      prompt: userPrompt,
      intent: intent as any,
      duration_ms: duration,
      plan_b_count: 0
    });

    // Return streaming response compatible with useChat
    return ideaStream.toDataStreamResponse();

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