import { createMentalModel } from '../actions/mental-models';

// Mental models data extracted from instructions/mental_models.md
const mentalModelsData = [
  {
    name: "The Map is Not the Territory",
    body_md: `The map is not the territory reminds us that our mental models of the world are not the same as the world itself. It cautions against confusing our abstractions and representations with the complex, ever-­shifting reality they aim to describe.

It is dangerous to mistake the map for the territory. Consider the person with an outstanding résumé who checks all the boxes on paper but can't do the job.

Updating our maps is a difficult process of reconciling what we want to be true with what is true.

In many areas of life, we are offered maps by other people. We are reliant on the maps provided by experts, pundits, and teachers. In these cases, the best we can do is to choose our mapmakers wisely and to seek out those who are rigorous, transparent, and open to revision.

Ultimately, the map/territory distinction invites us to engage with the world as it is, not just as we imagine it. And remember, when you don't make the map, choose your cartographer wisely.`,
    tags: ['general-thinking', 'cognitive-bias', 'decision-making']
  },
  {
    name: "Circle of Competence",
    body_md: `The first rule of competition is that you are more likely to win if you play where you have an advantage. Playing to your advantage requires a firm understanding of what you know and don't know.

Your circle of competence is your personal sphere of expertise, where your knowledge and skills are concentrated. It's the domain where you have a deep understanding, where your judgments are reliable, and your decisions are sound. 

The size of your circle isn't as important as knowing the boundaries. The wise person knows the limits of their knowledge and can confidently say, "This falls within my circle," or "This is outside my area of expertise." 

While operating within your circle of competence is a recipe for confidence and effectiveness, venturing outside your circle of competence is a recipe for trouble. You're like a sailor navigating unfamiliar waters without a map, at the mercy of currents and storms you don't fully understand. This isn't to say that you should never venture outside your circle. Learning new things, gaining new skills, and mastering new domains is one of the most beautiful things about life. 

Celebrate your expertise, but also acknowledge your limitations.`,
    tags: ['decision-making', 'self-awareness', 'expertise']
  },
  {
    name: "First Principles Thinking",
    body_md: `First principles thinking is the art of breaking down complex problems into their fundamental truths. It's a way of thinking that goes beyond the surface and allows us to see things from a new perspective.

Thinking in first principles allows us to identify the root causes, strip away the layers of complexity, and focus on the most effective solutions. Reasoning from first principles allows us to step outside the way things have always been done and instead see what is possible.

First principles thinking is not easy. It requires a willingness to challenge the status quo. This is why it's often the domain of rebels and disrupters who believe there must be a better way. It's the thinking of those willing to start from scratch and build from the ground up.

In a world focused on incremental improvement, first principles thinking offers a competitive advantage because almost no one does it.`,
    tags: ['problem-solving', 'innovation', 'critical-thinking']
  },
  {
    name: "Thought Experiment",
    body_md: `Thought experiments are the sandbox of the mind, the place where we can play with ideas without constraints. They're a way of exploring the implications of our theories, of testing the boundaries of our understanding. They offer a powerful tool for clarifying our thinking, revealing hidden assumptions, and showing us unintended consequences.

The power of thought experiments lies in their ability to create a simplified model of reality where we can test our ideas. In the real world, confounding factors and messy details obscure the core principles at work. Thought experiments allow us to strip away the noise and focus on the essence of the problem.

Thought experiments remind us that some of the most profound insights and innovations start with a simple question: What if?`,
    tags: ['critical-thinking', 'innovation', 'problem-solving']
  },
  {
    name: "Second-Order Thinking",
    body_md: `Second-­order thinking is a method of thinking that goes beyond the surface level, beyond the knee-­jerk reactions and short-­term gains. It asks us to play the long game, to anticipate the ripple effects of our actions, and to make choices that will benefit us not just today but in the months and years to come.

Second-order thinking demands we ask: And then what?

Think of a chess master contemplating her next move. She doesn't just consider how the move will affect the next turn but how it will shape the entire game. She's thinking many steps ahead. She's considering her own strategy and her opponent's likely response.

In our daily lives, we're often driven by first-­order thinking. We make decisions based on what makes us happy now, what eases our current discomfort, or satisfies our immediate desires.

Second-­order thinking asks us to consider the long-­term implications of our choices to make decisions based not just on what feels good now but on what will lead to the best outcomes over time.

In the end, second-­order thinking is about playing the long game. It's about making choices for the next move and the entire journey.`,
    tags: ['systems-thinking', 'decision-making', 'long-term-thinking']
  },
  {
    name: "Probabilistic Thinking",
    body_md: `Probabilistic thinking is the art of navigating uncertainty. Successfully thinking in shades of probability means roughly identifying what matters, calculating the odds, checking our assumptions, and then deciding.

The challenge of probabilistic thinking is that it requires constant updating. As new information emerges, the probabilities change. What seemed likely yesterday may seem unlikely today. This explains why probabilistic thinkers always revise their beliefs with new data and why it's uncomfortable for many people.

It's much easier to believe something false is accurate than to deal with the fact that we might be wrong. Being a probabilistic thinker means being willing to say, "I don't know for sure, but based on the evidence, I think there's a 63 percent chance of X." The rewards of probabilistic thinking are immense.

By embracing uncertainty, we can make better decisions, avoid the pitfalls of overconfidence, and navigate complex situations with greater skill and flexibility. We can be more open-­ minded, more receptive to new ideas, and more resilient in the face of change.`,
    tags: ['decision-making', 'uncertainty', 'probability']
  },
  {
    name: "Inversion",
    body_md: `Much of success comes from simply avoiding common paths to failure.

Inversion is not the way we are taught to think. We are taught to identify what we want and explore things that will move us closer to our objective. However, avoiding things that ensure we don't get what we want dramatically increases our odds of success.

We can get fixated on solving problems one way, missing simpler solutions. Inversion breaks us out of this tunnel vision.

Instead of "How do I solve this?", inversion asks, "What would guarantee failure?" Rather than "How can I achieve this?", it asks "What's preventing me from achieving it?" This flip reveals insights our usual thinking overlooks.

When facing a tricky problem or ambitious goal, try inverting. Ask how you'd guarantee failure. The answers may surprise you—and unlock new solutions.`,
    tags: ['problem-solving', 'critical-thinking', 'decision-making']
  },
  {
    name: "Occam's Razor",
    body_md: `Occam's razor is the intellectual equivalent of "keep it simple."

When faced with competing explanations or solutions, Occam's razor suggests that the correct explanation is most likely the simplest one, the one that makes the fewest assumptions. This doesn't mean the simplest theory is always true, only that it should be preferred until proven otherwise. Sometimes, the truth is complex, and the simplest explanation doesn't account for all the facts. The key to wielding this model is understanding when it works for you and against you.

A theory that is too simple fails to capture reality, and one that is too complex collapses under its own weight.`,
    tags: ['decision-making', 'problem-solving', 'simplicity']
  },
  {
    name: "Hanlon's Razor",
    body_md: `Hanlon's razor is a mental safeguard against the temptation to label behavior as malicious when incompetence is the most common response. It's a reminder that people are not out to get you, and it's best to assume good faith and resist the urge to assign sinister motives without overwhelming evidence.

This isn't to say that genuine malice doesn't exist. Of course, it does. But in most interactions, stupidity is a far more common explanation than malevolence. People make mistakes. They forget things. They speak without thinking. They prioritize short-­term wins over long-term wins. They act on incomplete information. They fall prey to bias and prejudice. These actions might appear like deliberate attacks from the outside, but the reality is far more mundane.

Hanlon's razor's real power lies in how it shifts our perspective. When we assume stupidity rather than malice, we respond differently. Instead of getting defensive or lashing out, we approach the situation with empathy and clarity.

For most daily frustrations and confusion, Hanlon's razor is a powerful reminder to approach problems with a spirit of generosity. It's a way to reduce drama and stress and find practical solutions instead of descending into blame and escalation.`,
    tags: ['human-psychology', 'decision-making', 'social-dynamics']
  },
  {
    name: "Relativity",
    body_md: `Relativity is the idea that our perceptions and judgments are not absolute but are shaped by our unique vantage points and frames of reference. It's the understanding that our experiences are subjective.

We each inhabit a particular web of experiences. This context shapes how we see the world, what we notice and overlook, and what we value and dismiss. Two people can look at the same event and come away with vastly different interpretations based on their unique frames of reference.

Consider two people standing in the same room: They each experience the same absolute temperature differently. One can feel hot while the other feels cold, even though the temperature is the same. Similarly, consider political debates: Our beliefs are shaped by our unique experiences and social contexts. A policy that seems like common sense to an urban progressive might feel like complete nonsense to a rural conservative, and vice versa. In this way, understanding relativity is key to fostering empathy and finding common ground. However, relativity is not the same as relativism—­ the idea that all perspectives are equally valid.

Recognizing the relativity of our perceptions doesn't mean we don't have to make judgments about validity. Instead, it's a call to examine our assumptions, seek out diverse perspectives, and expand our frames of reference. We all have blind spots—­things we cannot see. Understanding that our perceptions are relative allows us to open ourselves to other ways of seeing. If you're wondering where to get started, try asking others what they see that you can't. Apply your judgment to their responses and update your beliefs accordingly.`,
    tags: ['perspective', 'cognitive-bias', 'critical-thinking']
  }
];

export async function seedMentalModels() {
  console.log('🌱 Starting mental models seeding...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, model] of mentalModelsData.entries()) {
    console.log(`\n📝 Creating mental model ${index + 1}/10: "${model.name}"`);
    
    try {
      const result = await createMentalModel({
        name: model.name,
        body_md: model.body_md,
        tags: model.tags
      });
      
      if (result.success) {
        console.log(`✅ Successfully created: ${model.name}`);
        successCount++;
      } else {
        console.error(`❌ Failed to create ${model.name}: ${result.message}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error creating ${model.name}:`, error);
      errorCount++;
    }
    
    // Add a small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 Seeding completed!');
  console.log(`✅ Successfully created: ${successCount} mental models`);
  console.log(`❌ Errors: ${errorCount} mental models`);
  
  if (errorCount > 0) {
    console.log('\nPlease check the errors above and retry if necessary.');
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedMentalModels()
    .then(() => {
      console.log('\n✨ Mental models seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during seeding:', error);
      process.exit(1);
    });
} 