"use client";


import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { LoadingIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InsightResponseSchema, type InsightResponse } from "@/lib/schemas/insight-schema";

export default function ClearEyedApp() {
  const [scenario, setScenario] = useState("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { object, submit, isLoading, error, stop } = useObject({
    api: '/api/query',
    schema: InsightResponseSchema,
    onFinish: ({ object, error }: { object?: InsightResponse; error?: any }) => {
      if (error) {
        toast.error("Failed to analyze scenario. Please try again!");
      } else if (object) {
        toast.success("Analysis complete!");
      }
    },
    onError: (error: any) => {
      toast.error("Something went wrong. Please try again!");
    },
  });

  useEffect(() => {
    if (object || isLoading) setIsExpanded(true);
  }, [object, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario.length >= 10) {
      submit(scenario);
      // Don't clear the scenario so user can see what they submitted
    }
  };



  return (
    <div className="min-h-screen w-full px-4 md:px-0 py-8" style={{ backgroundColor: '#F4F5F0' }}>
      <div className="flex flex-col items-center w-full max-w-[600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-[40px] font-bold text-[#32313B] mb-6 leading-tight">
            Mental Model Explorer
          </h1>
          {!isExpanded && (
            <p className="text-base leading-relaxed mb-8 max-w-[500px] mx-auto" style={{ color: '#32313B' }}>
              The best thinkers use mental models to see clearly and act decisively. But with 
              hundreds out there, it's hard to know which one fits your situation. Describe what 
              you're facing—we'll surface the right model and show you how to use it.
            </p>
          )}
        </div>
        
        {!isExpanded && (
          <motion.div className="w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                className="w-full p-4 text-base resize-none h-32 border border-[#EEEEEE] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#32313B] focus:border-transparent"
                style={{ backgroundColor: 'white', color: '#32313B' }}
                minLength={10}
                required
                value={scenario}
                placeholder="What's the situation or decision you're struggling with right now?"
                onChange={(e) => setScenario(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading || scenario.length < 10}
                  className="px-6 py-3 text-white font-medium rounded-[12px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#32313B' }}
                >
                  Give me clarity
                </button>
                {isLoading && (
                  <button 
                    type="button" 
                    onClick={stop}
                    className="px-4 py-3 bg-red-500 text-white rounded-[12px] hover:bg-red-600 text-sm"
                  >
                    Stop
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        {(isLoading || object || error) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <AnimatePresence>
              {isLoading ? (
                <RotatingPhrases />
              ) : object ? (
                <StructuredInsight insight={object} scenario={scenario} />
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-sm">
                    Error analyzing scenario. Please try again.
                  </div>
                </div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const YourScenarioCard = ({ scenario, analysis }: { scenario: string; analysis: any }) => {
  return (
    <div className="rounded-lg p-6 shadow-sm mb-6" style={{ backgroundColor: '#EBEDE1' }}>
      {/* Scenario Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#32313B] mb-2">
          {analysis?.scenario_title || "Your Scenario"}
        </h2>
        <div className="w-16 h-1 bg-[#32313B] rounded-full"></div>
      </div>
      
      {/* What you shared */}
      <div className="mb-4">
        <h3 className="font-semibold text-[#32313B] mb-2">What you shared</h3>
        <div className="bg-white rounded-lg p-4 border-l-4 border-[#32313B] shadow-sm">
          <p className="text-sm text-[#32313B] leading-relaxed">
            {scenario}
          </p>
        </div>
      </div>

      {/* What we heard */}
      {analysis?.what_we_heard && (
        <div className="mb-4">
          <h3 className="font-semibold text-[#32313B] mb-2">What we heard</h3>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-[#32313B] leading-relaxed">
              {analysis.what_we_heard}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const MentalModelCard = ({ model }: { model: any }) => {
  // Get placeholder emoji for the model
  const getModelEmoji = (modelName: string) => {
    const name = modelName.toLowerCase();
    if (name.includes('first principles')) return '🔬';
    if (name.includes('map') && name.includes('territory')) return '🗺️';
    if (name.includes('thought experiment')) return '💭';
    if (name.includes('relativity')) return '👁️';
    if (name.includes('inversion')) return '🔄';
    if (name.includes('circle') && name.includes('competence')) return '🎯';
    if (name.includes('second order')) return '🔮';
    if (name.includes('systems')) return '🌐';
    if (name.includes('mental model')) return '🧠';
    return '🧩'; // Default
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
      {/* Framework Title */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{getModelEmoji(model.name)}</span>
        <h4 className="font-semibold text-lg text-[#32313B]">{model.name}</h4>
      </div>

      {/* Core Idea */}
      <div className="mb-3">
        <h5 className="font-medium text-sm text-[#32313B] mb-1">Core Idea</h5>
        <p className="text-sm text-[#32313B]">
          {model.concept_description || "A mental framework for better decision making."}
        </p>
      </div>

      {/* Scenario Tie-In */}
      <div className="mb-4">
        <h5 className="font-medium text-sm text-[#32313B] mb-1">In Your Situation</h5>
        <p className="text-sm text-[#32313B]">
          {model.scenario_tie_in || model.application_description || "This framework helps you analyze your specific scenario by providing structured thinking tools."}
        </p>
      </div>

      {/* Do / Avoid Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Do Column */}
        <div>
          <h5 className="font-medium text-sm text-green-600 mb-2 flex items-center gap-1">
            <span>✅</span> Do
          </h5>
          <ul className="space-y-1 text-xs">
            {model.do_items && model.do_items.length > 0 ? (
              <li className="flex items-start gap-1">
                <span className="text-green-500 mt-0.5">•</span>
                <span className="text-[#32313B]">{model.do_items[0]}</span>
              </li>
            ) : (
              <li className="flex items-start gap-1">
                <span className="text-green-500 mt-0.5">•</span>
                <span className="text-[#32313B]">Apply this framework to your decision</span>
              </li>
            )}
          </ul>
        </div>

        {/* Avoid Column */}
        <div>
          <h5 className="font-medium text-sm text-red-600 mb-2 flex items-center gap-1">
            <span>❌</span> Avoid
          </h5>
          <ul className="space-y-1 text-xs">
            {model.avoid_items && model.avoid_items.length > 0 ? (
              <li className="flex items-start gap-1">
                <span className="text-red-500 mt-0.5">•</span>
                <span className="text-[#32313B]">{model.avoid_items[0]}</span>
              </li>
            ) : (
              <li className="flex items-start gap-1">
                <span className="text-red-500 mt-0.5">•</span>
                <span className="text-[#32313B]">Rushing to judgment</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* One Big Question */}
      <div className="bg-neutral-50 rounded-lg p-3">
        <h5 className="font-medium text-sm text-[#32313B] mb-1">💭 Reflection Question</h5>
        <p className="text-sm text-[#32313B] italic">
          "{model.reflection_question || "How would applying this mental model change your approach to this decision?"}"
        </p>
      </div>


    </div>
  );
};

const StructuredInsight = ({ insight, scenario }: { insight: any; scenario: string }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8"
      >
        {/* Your Scenario Card */}
        <YourScenarioCard scenario={scenario} analysis={insight?.analysis} />

        {/* Suggested Mental Models */}
        {insight?.mental_models && insight.mental_models.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-[#32313B] text-lg">Suggested Mental Models</h2>
            <div className="space-y-6">
              {insight.mental_models.map((model: any, index: number) => (
                model && (
                  <MentalModelCard key={index} model={model} />
                )
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const RotatingPhrases = () => {
  const phrases = [
    // General & Friendly
    "Thinking deeply about your scenario—just a moment.",
    "Carefully reviewing your situation—patience appreciated!",
    "Putting your words under thoughtful scrutiny.",
    "Searching for insights within your story—hold tight.",
    "Preparing a thoughtful response, tailor-made for you.",
    "Gently untangling your scenario.",
    "Reading your scenario with fresh eyes.",
    "Reviewing your scenario carefully, not quickly.",
    "Processing your scenario thoughtfully—almost there!",
    "Reflecting on your scenario like a good listener.",
    
    // Witty & Lighthearted
    "Analyzing your scenario with the curiosity of a kid at a science fair.",
    "Thinking through your dilemma like a friend who gives excellent advice.",
    "Sifting through your scenario—gold nuggets incoming.",
    "Brewing insights about your situation—fresh ideas ahead.",
    "Inspecting your scenario—no stone left unturned, hopefully.",
    "Sorting your thoughts like Marie Kondo organizes socks.",
    "Evaluating your scenario without judgment, mostly.",
    "Preparing to surprise you with insightful clarity.",
    "Turning your scenario into useful insights—stand by.",
    "Finding hidden gems in your scenario—give us a sec.",
    
    // Clever & Analytical
    "Matching your scenario to a timeless mental model.",
    "Aligning your scenario with proven thinking frameworks.",
    "Connecting dots you didn't even know existed.",
    "Weaving your scenario into meaningful insights.",
    "Mapping out your scenario's hidden patterns.",
    "Diving into your scenario—clarity surfacing shortly.",
    "Exploring your situation from multiple perspectives.",
    "Synthesizing wisdom tailored to your scenario.",
    "Charting a thoughtful path through your scenario.",
    "Decoding complexity—clarity loading.",
    
    // Playful & Relatable
    "Giving your scenario the careful thought it deserves.",
    "Putting on our thinking caps—insights coming right up.",
    "Carefully unpacking your scenario's baggage.",
    "Investigating your scenario—fresh clues incoming.",
    "Treating your scenario with thoughtful respect.",
    "Exploring every angle of your scenario.",
    "Deliberating thoughtfully about your dilemma.",
    "Unraveling your scenario—answers loading.",
    "Digging deep into your scenario for clarity.",
    "Preparing thoughtful insights to brighten your day.",
    
    // Metaphorical & Creative
    "Assembling insights from your scenario—some assembly required.",
    "Cooking up fresh insights from your scenario's ingredients.",
    "Sculpting clarity from the clay of your scenario.",
    "Stitching together insights from your scenario's threads.",
    "Painting a clearer picture of your scenario.",
    "Composing harmonious insights from your scenario's notes.",
    "Brewing a fresh pot of thoughtful analysis.",
    "Navigating through your scenario—steady as we go.",
    "Lighting up your scenario with a spark of clarity.",
    "Curating thoughtful reflections just for you."
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000); // Change phrase every 2 seconds

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPhraseIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-[#32313B]">
            <LoadingIcon />
          </div>
          <p className="text-[#32313B] text-base max-w-md mx-auto leading-relaxed">
            {phrases[currentPhraseIndex]}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
