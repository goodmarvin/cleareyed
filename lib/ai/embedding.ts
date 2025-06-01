import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "../db";
import type { MentalModel } from "../db/types";

// Use text-embedding-3-small for 1536 dimensions to match database schema
const embeddingModel = openai.embedding("text-embedding-3-small");

// Cohere rerank integration
const COHERE_API_KEY = process.env.COHERE_API_KEY;

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((chunk) => chunk.trim().length > 0);
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

// Schema for dual description generation
const DualDescriptionSchema = z.object({
  concept_description: z.string().describe('2-sentence clear explanation of what this mental model is'),
  application_scenarios: z.array(z.string()).describe('Specific scenarios when this model applies'),
  emotional_triggers: z.array(z.string()).describe('Emotions or feelings that indicate this model is relevant'),
  keywords: z.array(z.string()).describe('Keywords that signal this model should be used')
});

// Generate concept and application descriptions for dual embeddings
export const generateDualDescriptions = async (
  name: string,
  body_md: string
): Promise<{
  conceptDescription: string;
  applicationDescription: string;
}> => {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: DualDescriptionSchema,
    prompt: `For the mental model "${name}", create both a concept description and application description.

Mental Model Content:
${body_md}

Generate:
1. A clear 2-sentence concept description (what it IS)
2. Specific scenarios when it applies (when to USE it)
3. Emotional triggers that indicate relevance
4. Keywords that signal this model should be used

Focus on practical application scenarios that users might describe.`
  });

  const conceptDescription = object.concept_description;
  
  const applicationDescription = [
    `Use when: ${object.application_scenarios.join(', ')}.`,
    `Emotional indicators: ${object.emotional_triggers.join(', ')}.`,
    `Keywords: ${object.keywords.join(', ')}.`
  ].join(' ');

  return {
    conceptDescription,
    applicationDescription
  };
};

// Generate dual embeddings for a mental model
export const generateDualEmbeddings = async (
  name: string,
  body_md: string
): Promise<{
  conceptEmbedding: number[];
  applicationEmbedding: number[];
  conceptDescription: string;
  applicationDescription: string;
}> => {
  // Generate descriptions
  const { conceptDescription, applicationDescription } = await generateDualDescriptions(name, body_md);
  
  // Generate embeddings for each description
  const conceptEmbedding = await generateEmbedding(conceptDescription);
  const applicationEmbedding = await generateEmbedding(applicationDescription);
  
  return {
    conceptEmbedding,
    applicationEmbedding,
    conceptDescription,
    applicationDescription
  };
};

// Schema for GPT-4o-mini final ranking
const FinalRankingSchema = z.object({
  rankings: z.array(z.object({
    name: z.string().describe('Mental model name'),
    relevance_score: z.number().min(0).max(1).describe('Relevance score 0-1'),
    reasoning: z.string().describe('Brief explanation of why this model is relevant to the scenario')
  })).length(3).describe('Top 3 most relevant mental models in order of relevance')
});

// GPT-4o-mini final ranking function
async function gptFinalRanking(
  userQuery: string,
  models: Array<MentalModel & { 
    similarity: number; 
    rerank_score?: number;
    concept_description: string;
    application_description: string; 
  }>
): Promise<Array<{ index: number; relevance_score: number; reasoning: string }>> {
  console.log('🧠 GPT-4o-mini final ranking called with:', {
    query: userQuery.substring(0, 50) + '...',
    modelCount: models.length
  });

  try {
    const modelsContext = models.map((model, index) => 
      `${index + 1}. **${model.name}**
Core Concept: ${model.concept_description}
When to Apply: ${model.application_description}
Vector Score: ${model.similarity.toFixed(2)}, Rerank Score: ${model.rerank_score?.toFixed(2) || 'N/A'}`
    ).join('\n\n');

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: FinalRankingSchema,
      prompt: `You are a wise advisor with deep knowledge of mental models and decision-making frameworks. 

User's Scenario: "${userQuery}"

You have been given 5 mental models that were selected through semantic similarity. Your task is to pick the 3 MOST CONCEPTUALLY RELEVANT ones for this person's specific scenario.

Consider:
- Which models provide the most actionable insights for THIS specific situation?
- Which models would genuinely change how they think about or approach this decision?
- Which models are most likely to lead to better outcomes for their scenario?

Mental Models to Choose From:
${modelsContext}

Select the top 3 most relevant models and provide a relevance score (0-1) and brief reasoning for each.`,
    });

    console.log('✅ GPT-4o-mini ranking results:', object.rankings.map(r => ({
      name: r.name,
      score: r.relevance_score,
      reasoning: r.reasoning.substring(0, 50) + '...'
    })));

    // Map back to original indexes
    return object.rankings.map(ranking => {
      const modelIndex = models.findIndex(m => m.name === ranking.name);
      return {
        index: modelIndex,
        relevance_score: ranking.relevance_score,
        reasoning: ranking.reasoning
      };
    }).filter(r => r.index !== -1);

  } catch (error) {
    console.error('💥 GPT-4o-mini ranking error:', error);
    // Fallback: return top 3 by rerank scores
    return models
      .map((_, index) => ({ index, relevance_score: 0.5, reasoning: 'Fallback ranking' }))
      .slice(0, 3);
  }
}

// Cohere rerank function
async function cohereRerank(
  query: string,
  documents: string[],
  topK: number = 5
): Promise<Array<{ index: number; relevance_score: number }>> {
  console.log('🔍 cohereRerank called with:', { 
    query: query.substring(0, 50) + '...', 
    documentCount: documents.length, 
    topK,
    hasApiKey: !!COHERE_API_KEY 
  });

  if (!COHERE_API_KEY) {
    console.warn('❌ Cohere API key not found, skipping rerank');
    return documents.map((_, index) => ({ index, relevance_score: 0.5 }));
  }

  try {
    console.log('🚀 Calling Cohere rerank API v2...');
    
    const requestBody = {
      model: 'rerank-v3.5', // Use v2 API model
      query: query,
      documents: documents,
      top_n: topK, // Use v2 API parameter name
    };
    
    console.log('📤 Request body:', {
      model: requestBody.model,
      query: requestBody.query.substring(0, 100) + '...',
      documentCount: requestBody.documents.length,
      topN: requestBody.top_n
    });
    
    const response = await fetch('https://api.cohere.ai/v2/rerank', { // Use v2 endpoint
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('❌ Cohere API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Cohere rerank v2 success:', { 
      resultsCount: data.results?.length || 0,
      topScore: data.results?.[0]?.relevance_score,
      fullResponse: data.results?.slice(0, 3) // Show first 3 results for debugging
    });
    
    return data.results || [];
  } catch (error) {
    console.error('💥 Cohere rerank error:', error);
    // Fallback: return original order with neutral scores
    return documents.map((_, index) => ({ index, relevance_score: 0.5 }));
  }
}

// Updated for Clear-Eyed: Find relevant mental models using application embeddings
export const findRelevantMentalModels = async (
  userQuery: string,
  tags?: string[],
  matchThreshold: number = 0.3,
  matchCount: number = 5
): Promise<(MentalModel & { 
  similarity: number; 
  concept_description: string;
  application_description: string; 
})[]> => {
  try {
    // Generate embedding for user query
    const userQueryEmbedded = await generateEmbedding(userQuery);
    
    // Use the database function for application embedding similarity search
    const { data: models, error } = await db.rpc('match_mental_models_by_application', {
      query_embedding: userQueryEmbedded,
      match_threshold: matchThreshold,
      match_count: matchCount
    });

    if (error) {
      console.error('Error in application embedding search:', error);
      return [];
    }

    let results = models || [];

    // If tags provided, apply additional filtering (hybrid approach)
    if (tags && tags.length > 0) {
      results = results.filter(model => {
        const modelTags = Array.isArray(model.tags) ? model.tags : [];
        return tags.some(tag => 
          modelTags.some(modelTag => 
            typeof modelTag === 'string' && 
            modelTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    return results;
  } catch (error) {
    console.error('Error finding relevant mental models:', error);
    return [];
  }
};

// Enhanced hybrid retrieval with Cohere reranking + GPT-4o-mini final selection
export const findRelevantMentalModelsHybrid = async (
  userQuery: string,
  intentTags?: string[], // Keep for future library filtering, not used in scoring
  options: {
    matchThreshold?: number;
    candidateCount?: number;
    rerankCount?: number;
    finalCount?: number;
    useReranking?: boolean;
    useFinalRanking?: boolean;
  } = {}
): Promise<(MentalModel & { 
  similarity: number; 
  rerank_score?: number;
  gpt_score?: number;
  gpt_reasoning?: string;
  final_score: number;
  concept_description: string;
  application_description: string;
})[]> => {
  console.log('🚀 findRelevantMentalModelsHybrid called with:', {
    query: userQuery.substring(0, 50) + '...',
    intentTags,
    options,
    cohereApiKeyExists: !!COHERE_API_KEY
  });

  const {
    matchThreshold = 0.1,     // Lower threshold to get more candidates
    candidateCount = 15,      // Vector search candidates
    rerankCount = 5,          // Cohere rerank count
    finalCount = 3,           // Final GPT-4o-mini selection
    useReranking = true,
    useFinalRanking = true
  } = options;

  try {
    // Step 1: Vector search to get candidates
    const vectorResults = await findRelevantMentalModels(
      userQuery, 
      undefined, // Don't use tags for filtering in this step
      matchThreshold, 
      candidateCount
    );

    if (vectorResults.length === 0) {
      return [];
    }

    // Step 2: Cohere reranking
    if (useReranking && COHERE_API_KEY) {
      console.log('✅ Taking RERANKING path', { useReranking, hasApiKey: !!COHERE_API_KEY });
      
      // Enhanced query formatting - frame as scenario seeking framework
      const enhancedQuery = `User scenario: "${userQuery}"

The user is facing this situation and is looking for a mental framework or decision-making model to help them think through and analyze their situation more effectively. They need practical guidance on how to approach this decision or challenge.`;

      // Prepare comprehensive documents for reranking with rich context
      const documents = vectorResults.map(model => {
        // Parse tags safely
        const tags = Array.isArray(model.tags) ? model.tags : [];
        const tagList = tags.filter(tag => typeof tag === 'string').join(', ');
        
        return `Mental Framework: ${model.name}

Core Concept: ${model.concept_description}

When to Apply: ${model.application_description}

Categories: ${tagList}

Detailed Framework:
${model.body_md}

This mental model helps with: ${tagList ? `${tagList} situations` : 'general decision-making'}`;
      });

      console.log('📋 Enhanced documents prepared for reranking:', {
        enhancedQueryShort: enhancedQuery.substring(0, 100) + '...',
        documentCount: documents.length,
        firstDocPreview: documents[0]?.substring(0, 150) + '...',
        documentLengths: documents.map(d => d.length),
        totalTokensApprox: documents.reduce((sum, d) => sum + d.length, 0) / 4 // rough token estimate
      });

      // Get rerank scores from Cohere with enhanced content
      const rerankResults = await cohereRerank(enhancedQuery, documents, rerankCount);
      
      console.log('📊 Rerank results received:', rerankResults.map((r, i) => ({
        model: vectorResults[i]?.name,
        originalSimilarity: vectorResults[i]?.similarity,
        rerankScore: r.relevance_score
      })));

      // Map rerank results back to models
      const rerankedModels = rerankResults.map(rerankResult => {
        const model = vectorResults[rerankResult.index];
        return {
          ...model,
          rerank_score: rerankResult.relevance_score,
          final_score: rerankResult.relevance_score // Will be updated by GPT ranking
        };
      }).sort((a, b) => b.rerank_score! - a.rerank_score!);

      // Step 3: GPT-4o-mini final ranking (optional)
      if (useFinalRanking && rerankedModels.length > 0) {
        console.log('🧠 Taking FINAL RANKING path');
        
        const gptResults = await gptFinalRanking(userQuery, rerankedModels);
        
        console.log('🏆 GPT-4o-mini final results:', gptResults.map(r => ({
          model: rerankedModels[r.index]?.name,
          gptScore: r.relevance_score,
          reasoning: r.reasoning.substring(0, 50) + '...'
        })));

        // Return GPT-ranked results
        const finalResults = gptResults.map(gptResult => {
          const model = rerankedModels[gptResult.index];
          return {
            ...model,
            gpt_score: gptResult.relevance_score,
            gpt_reasoning: gptResult.reasoning,
            final_score: gptResult.relevance_score // Use GPT score as final
          };
        }).sort((a, b) => b.final_score - a.final_score);

        return finalResults;
      } else {
        console.log('📝 Skipping final ranking, returning Cohere results');
        return rerankedModels.slice(0, finalCount);
      }
      
    } else {
      console.log('❌ Taking FALLBACK path (no reranking)', { useReranking, hasApiKey: !!COHERE_API_KEY });
      
      // Fallback: use vector similarity scores
      return vectorResults
        .slice(0, finalCount)
        .map(model => ({
          ...model,
          final_score: model.similarity // Use vector similarity as final score
        }))
        .sort((a, b) => b.final_score - a.final_score);
    }

  } catch (error) {
    console.error('Error in hybrid retrieval:', error);
    return [];
  }
};

// Legacy function for backward compatibility during migration
export const findRelevantContent = async (userQuery: string) => {
  const models = await findRelevantMentalModels(userQuery);
  return models.map(model => ({
    name: model.name,
    similarity: model.similarity
  }));
};
