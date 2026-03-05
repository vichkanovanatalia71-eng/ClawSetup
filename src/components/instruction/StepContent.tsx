"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import FeedbackWidget from "./FeedbackWidget";
import TroubleshootWizard from "./TroubleshootWizard";

interface StepContentProps {
  stepId: string;
  title: string;
  goal: string | null;
  prerequisites: string | null;
  contentMd: string;
  expectedResult: string | null;
  commonErrors: string | null;
  videoUrl: string | null;
  completed: boolean;
  onToggleComplete: () => void;
}

function estimateReadingTime(text: string): number {
  const words = text.replace(/[#*`\[\]()>_~|\\-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function StepContent({
  stepId,
  title,
  goal,
  prerequisites,
  contentMd,
  expectedResult,
  commonErrors,
  videoUrl,
  completed,
  onToggleComplete,
}: StepContentProps) {
  const readingTime = estimateReadingTime(
    [contentMd, goal, prerequisites, expectedResult, commonErrors].filter(Boolean).join(" ")
  );

  return (
    <div className="protected-content no-select">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neu-text">{title}</h1>
          <span className="text-xs text-neu-muted mt-1 inline-block">{readingTime} min read</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleComplete}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            completed
              ? "shadow-neu-inset-sm text-green-600"
              : "shadow-neu-btn text-neu-muted hover:text-neu-text"
          }`}
        >
          {completed ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </>
          ) : (
            "Mark as Done"
          )}
        </motion.button>
      </div>

      {goal && (
        <div className="rounded-2xl shadow-neu-sm p-5 mb-6 border-l-4 border-blue-400 bg-neu-bg">
          <h3 className="font-semibold text-neu-text text-sm mb-1">Goal</h3>
          <p className="text-neu-muted text-sm">{goal}</p>
        </div>
      )}

      {videoUrl && (
        <div className="rounded-2xl shadow-neu-sm overflow-hidden mb-6 bg-neu-bg">
          {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
            <iframe
              src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : videoUrl.includes("loom.com") ? (
            <iframe
              src={videoUrl.replace("/share/", "/embed/")}
              className="w-full aspect-video"
              allowFullScreen
            />
          ) : (
            <video src={videoUrl} controls className="w-full aspect-video" />
          )}
        </div>
      )}

      {prerequisites && (
        <div className="rounded-2xl shadow-neu-sm p-5 mb-6 border-l-4 border-amber-400 bg-neu-bg">
          <h3 className="font-semibold text-neu-text text-sm mb-1">Prerequisites</h3>
          <p className="text-neu-muted text-sm">{prerequisites}</p>
        </div>
      )}

      <div className="prose prose-sm max-w-none mb-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            pre({ children }) {
              return <CodeBlock>{children}</CodeBlock>;
            },
            code({ children, className }) {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-neu-bg px-1.5 py-0.5 rounded-md text-sm font-mono shadow-neu-inset-sm">
                    {children}
                  </code>
                );
              }
              return <code className={className}>{children}</code>;
            },
          }}
        >
          {contentMd}
        </ReactMarkdown>
      </div>

      {expectedResult && (
        <div className="rounded-2xl shadow-neu-sm p-5 mb-6 border-l-4 border-green-400 bg-neu-bg">
          <h3 className="font-semibold text-neu-text text-sm mb-1">Expected Result</h3>
          <p className="text-neu-muted text-sm whitespace-pre-wrap">{expectedResult}</p>
        </div>
      )}

      {commonErrors && (
        <div className="rounded-2xl shadow-neu-sm p-5 mb-6 border-l-4 border-red-400 bg-neu-bg">
          <h3 className="font-semibold text-neu-text text-sm mb-1">Common Errors</h3>
          <div className="text-neu-muted text-sm whitespace-pre-wrap">{commonErrors}</div>
        </div>
      )}

      <TroubleshootWizard stepId={stepId} />

      <FeedbackWidget stepId={stepId} />

      <div className="print-warning" />
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const codeEl = document.createElement("div");
    codeEl.innerHTML = typeof children === "string" ? children : "";

    const pre = document.querySelector("pre:hover code");
    const text = pre?.textContent || "";

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative group">
      <pre className="rounded-xl shadow-neu-inset bg-gray-900 text-gray-100 overflow-x-auto">
        {children}
      </pre>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleCopy}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg shadow-neu-xs bg-gray-700 text-gray-200 px-3 py-1.5 text-xs hover:bg-gray-600"
      >
        {copied ? "Copied!" : "Copy"}
      </motion.button>
    </div>
  );
}
