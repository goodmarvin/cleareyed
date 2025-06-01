"use server";

import { db } from "../db";
import type { MentalModel, MentalModelInsert } from "../db/types";
import { generateEmbedding } from "../ai/embedding";

export interface CreateMentalModelParams {
  name: string;
  body_md: string;
  tags?: string[];
}

export interface ExtractedTags {
  topics: string[];
  cognitive_biases: string[];
  domains: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

// Function to extract tags from mental model content using LLM
export const extractTagsFromContent = async (name: string, content: string): Promise<string[]> => {
  // TODO: Implement LLM-based tag extraction as specified in to-do list
  // For now, return some basic tags based on content analysis
  const basicTags = [];
  
  // Simple keyword-based tagging (will be replaced with LLM)
  const lowerContent = `${name} ${content}`.toLowerCase();
  
  if (lowerContent.includes('bias') || lowerContent.includes('cognitive')) {
    basicTags.push('cognitive-bias');
  }
  if (lowerContent.includes('decision') || lowerContent.includes('choose')) {
    basicTags.push('decision-making');
  }
  if (lowerContent.includes('invert') || lowerContent.includes('reverse')) {
    basicTags.push('inversion');
  }
  if (lowerContent.includes('system') || lowerContent.includes('framework')) {
    basicTags.push('systems-thinking');
  }
  
  return basicTags;
};

export const createMentalModel = async (input: CreateMentalModelParams) => {
  try {
    const { name, body_md, tags: providedTags = [] } = input;

    // Extract additional tags from content if none provided
    const extractedTags = providedTags.length > 0 
      ? providedTags 
      : await extractTagsFromContent(name, body_md);

    // Generate embedding for the mental model content
    const embedding = await generateEmbedding(`${name}\n\n${body_md}`);
    const embeddingString = `[${embedding.join(',')}]`;

    // Insert the mental model into Supabase
    const { data: model, error } = await db
      .from('mental_models')
      .insert({
        name,
        body_md,
        tags: extractedTags,
        embedding: embeddingString
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mental model:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Mental model successfully created and embedded.",
      model
    };
  } catch (error) {
    console.error('Error in createMentalModel:', error);
    return {
      success: false,
      message: error instanceof Error && error.message.length > 0
        ? error.message
        : "Error creating mental model, please try again."
    };
  }
};

export const getAllMentalModels = async (): Promise<MentalModel[]> => {
  const { data: models, error } = await db
    .from('mental_models')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching mental models:', error);
    return [];
  }

  return models || [];
};

export const getMentalModelById = async (id: string): Promise<MentalModel | null> => {
  const { data: model, error } = await db
    .from('mental_models')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching mental model:', error);
    return null;
  }

  return model;
};

export const updateMentalModel = async (
  id: string, 
  updates: Partial<CreateMentalModelParams>
): Promise<{ success: boolean; message: string; model?: MentalModel }> => {
  try {
    const updateData: Partial<MentalModelInsert> = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.body_md) updateData.body_md = updates.body_md;
    if (updates.tags) updateData.tags = updates.tags;

    // Re-generate embedding if content changed
    if (updates.name || updates.body_md) {
      const currentModel = await getMentalModelById(id);
      if (currentModel) {
        const newName = updates.name || currentModel.name;
        const newContent = updates.body_md || currentModel.body_md;
        const embedding = await generateEmbedding(`${newName}\n\n${newContent}`);
        updateData.embedding = `[${embedding.join(',')}]`;
      }
    }

    const { data: model, error } = await db
      .from('mental_models')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Mental model updated successfully.",
      model
    };
  } catch (error) {
    console.error('Error updating mental model:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error updating mental model."
    };
  }
};

export const deleteMentalModel = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await db
      .from('mental_models')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Mental model deleted successfully."
    };
  } catch (error) {
    console.error('Error deleting mental model:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error deleting mental model."
    };
  }
}; 