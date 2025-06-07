import { z } from 'zod';

// Mental model with scores for transparency and enhanced card data
export const MentalModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  concept_description: z.string().describe('1-2 punchy sentences explaining the core idea in Scott Galloway style'),
  application_description: z.string(),
  scenario_tie_in: z.string().describe('1-2 punchy sentences on how this applies to their situation in Scott Galloway style'),
  do_items: z.array(z.string()).describe('1 concrete action to take using this model'),
  avoid_items: z.array(z.string()).describe('1 common pitfall to avoid'),
  reflection_question: z.string().describe('A single powerful question to deepen thinking'),
  similarity: z.number(),
  rerank_score: z.number().optional(),
  gpt_score: z.number().optional(),
  gpt_reasoning: z.string().optional(),
});

// Action item structure
export const ActionItemSchema = z.object({
  title: z.string().describe('Brief title for the action'),
  description: z.string().describe('Detailed description of what to do'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level'),
});

// Main insight response structure
export const InsightResponseSchema = z.object({
  // Analysis section
  analysis: z.object({
    scenario_title: z.string().describe('A catchy, descriptive title for this scenario (3-6 words)'),
    what_we_heard: z.string().describe('AI-generated 1-2 sentence summary of what we understood from their scenario'),
    primary_domain: z.string().describe('The main domain this scenario belongs to'),
    complexity_level: z.enum(['simple', 'moderate', 'complex']),
    key_concepts: z.array(z.string()).describe('Main concepts identified in the scenario'),
    mental_models_applied: z.array(z.string()).describe('Names of mental models being applied'),
  }),
  
  // Mental models section
  mental_models: z.array(MentalModelSchema).describe('The relevant mental models with scores'),
  
  // Insights section
  insights: z.object({
    key_perspectives: z.array(z.string()).describe('Key insights from applying mental models'),
    blind_spots: z.array(z.string()).describe('Potential blind spots to consider'),
    reframes: z.array(z.string()).describe('Alternative ways to think about the situation'),
  }),
  
  // Action items section
  action_items: z.array(ActionItemSchema).describe('Specific actionable steps'),
  
  // Additional context
  context: z.object({
    confidence_level: z.enum(['low', 'medium', 'high']).describe('Confidence in the analysis'),
    follow_up_questions: z.array(z.string()).describe('Questions to explore further'),
    related_concepts: z.array(z.string()).describe('Related concepts worth exploring'),
  }),
  
  // Metadata for analytics
  metadata: z.object({
    processing_time_ms: z.number(),
    models_considered: z.number(),
    models_selected: z.number(),
  }),
});

// Type exports for TypeScript
export type MentalModel = z.infer<typeof MentalModelSchema>;
export type ActionItem = z.infer<typeof ActionItemSchema>;
export type InsightResponse = z.infer<typeof InsightResponseSchema>; 