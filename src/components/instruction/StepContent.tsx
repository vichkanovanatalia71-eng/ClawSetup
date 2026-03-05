"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StepContentProps {
  title: string;
  goal: string | null;
  prerequisites: string | null;
  contentMd: string;
  expectedResult: string | null;
  commonErrors: string | null;
  completed: boolean;
  onToggleComplete: () => void;
}

export default function StepContent({
  title,
  goal,
  prerequisites,
  contentMd,
  expectedResult,
  commonErrors,
  completed,
  onToggleComplete,
}: StepContentProps) {
  return (
    <div className="protected-content no-select">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button
          onClick={onToggleComplete}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            completed
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
        </button>
      </div>

      {goal && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 text-sm mb-1">Goal</h3>
          <p className="text-blue-800 text-sm">{goal}</p>
        </div>
      )}

      {prerequisites && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-900 text-sm mb-1">Prerequisites</h3>
          <p className="text-amber-800 text-sm">{prerequisites}</p>
        </div>
      )}

      <div className="prose prose-sm max-w-none mb-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre({ children }) {
              return <CodeBlock>{children}</CodeBlock>;
            },
            code({ children, className }) {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
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
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 text-sm mb-1">Expected Result</h3>
          <p className="text-green-800 text-sm whitespace-pre-wrap">{expectedResult}</p>
        </div>
      )}

      {commonErrors && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 text-sm mb-1">Common Errors</h3>
          <div className="text-red-800 text-sm whitespace-pre-wrap">{commonErrors}</div>
        </div>
      )}

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
      <pre className="bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-600"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
