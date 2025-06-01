"use server";

import { db } from "../db";
import type { MentalModelInsert } from "../db/types";
import { generateEmbedding } from "../ai/embedding";

export interface CreateMentalModelParams {
  name: string;
  body_md: string;
  tags?: string[];
}

export const createMentalModel = async (input: CreateMentalModelParams) => {
  try {
    const { name, body_md, tags = [] } = input;

    // Generate embedding for the mental model content
    const embedding = await generateEmbedding(`${name}\n\n${body_md}`);
    const embeddingString = `[${embedding.join(',')}]`;

    // Insert the mental model into Supabase
    const { data: model, error } = await db
      .from('mental_models')
      .insert({
        name,
        body_md,
        tags: tags,
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

// Legacy function name for backward compatibility during migration
export const createResource = async (input: { content: string }) => {
  return createMentalModel({
    name: "Imported Resource",
    body_md: input.content,
    tags: ["imported"]
  });
};
