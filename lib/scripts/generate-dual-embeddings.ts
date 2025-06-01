import { db } from '../db';
import { generateDualEmbeddings } from '../ai/embedding';

export async function generateDualEmbeddingsForAll() {
  console.log('🚀 Starting dual embedding generation for all mental models...');
  
  try {
    // Get all mental models that don't have dual embeddings yet
    const { data: models, error } = await db
      .from('mental_models')
      .select('*')
      .is('concept_embedding', null);

    if (error) {
      throw new Error(`Error fetching mental models: ${error.message}`);
    }

    if (!models || models.length === 0) {
      console.log('✅ All mental models already have dual embeddings');
      return;
    }

    console.log(`📋 Found ${models.length} mental models to process`);

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      console.log(`\n🔄 Processing ${i + 1}/${models.length}: "${model.name}"`);

      try {
        // Generate dual embeddings and descriptions
        const {
          conceptEmbedding,
          applicationEmbedding,
          conceptDescription,
          applicationDescription
        } = await generateDualEmbeddings(model.name, model.body_md);

        // Convert embeddings to string format for database
        const conceptEmbeddingString = `[${conceptEmbedding.join(',')}]`;
        const applicationEmbeddingString = `[${applicationEmbedding.join(',')}]`;

        // Update the mental model with dual embeddings
        const { error: updateError } = await db
          .from('mental_models')
          .update({
            concept_embedding: conceptEmbeddingString,
            application_embedding: applicationEmbeddingString,
            concept_description: conceptDescription,
            application_description: applicationDescription
          })
          .eq('id', model.id);

        if (updateError) {
          console.error(`❌ Error updating ${model.name}:`, updateError.message);
          continue;
        }

        console.log(`✅ Updated "${model.name}"`);
        console.log(`   Concept: ${conceptDescription.substring(0, 100)}...`);
        console.log(`   Application: ${applicationDescription.substring(0, 100)}...`);

        // Rate limiting to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (modelError) {
        console.error(`❌ Error processing ${model.name}:`, modelError);
        continue;
      }
    }

    console.log('\n🎉 Dual embedding generation completed!');
    
    // Verify the results
    const { data: updatedModels, error: verifyError } = await db
      .from('mental_models')
      .select('name, concept_description, application_description')
      .not('concept_embedding', 'is', null);

    if (!verifyError && updatedModels) {
      console.log(`\n✅ Verification: ${updatedModels.length} models now have dual embeddings`);
    }

  } catch (error) {
    console.error('💥 Fatal error in dual embedding generation:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateDualEmbeddingsForAll()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
} 