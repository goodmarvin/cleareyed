import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { InformationIcon, VercelIcon } from "./icons";

const ProjectOverview = () => {
  return (
    <motion.div
      className="w-full max-w-[600px] my-4"
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 5 }}
    >
      <div className="border rounded-lg p-6 flex flex-col gap-4 text-neutral-500 text-sm dark:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="flex flex-row justify-center gap-4 items-center text-neutral-900 dark:text-neutral-50">
          <span className="text-2xl">🎯</span>
          <span className="text-lg font-medium">Clear-Eyed</span>
          <span className="text-2xl">🧠</span>
        </p>
        <p>
          <strong>Clear-Eyed</strong> helps you make better decisions by applying proven mental models to your specific scenarios. 
          Describe your situation, and get practical insights powered by frameworks like{" "}
          <span className="text-blue-500">Second-Order Thinking</span>, 
          <span className="text-blue-500"> Circle of Competence</span>, and
          <span className="text-blue-500"> First Principles</span>.
        </p>
        <p>
          Built with{" "}
          <Link
            href="https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat"
            className="text-blue-500"
            target="_blank"
          >
            Vercel AI SDK
          </Link>{" "}
          and powered by mental model knowledge from leading decision-making frameworks.
          Get structured analysis with key insights and actionable next steps.
        </p>
      </div>
    </motion.div>
  );
};

export default ProjectOverview;
