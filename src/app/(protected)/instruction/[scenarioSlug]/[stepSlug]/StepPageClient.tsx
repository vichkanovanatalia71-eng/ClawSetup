"use client";

import { useState } from "react";
import StepNavigation from "@/components/instruction/StepNavigation";
import StepContent from "@/components/instruction/StepContent";
import AIAssistant from "@/components/instruction/AIAssistant";
import ProgressTracker from "@/components/instruction/ProgressTracker";
import Watermark from "@/components/instruction/Watermark";

interface NavStep {
  id: string;
  slug: string;
  title: string;
  order: number;
  completed: boolean;
}

interface NavModule {
  id: string;
  title: string;
  order: number;
  steps: NavStep[];
}

interface StepData {
  id: string;
  title: string;
  goal: string | null;
  prerequisites: string | null;
  contentMd: string;
  expectedResult: string | null;
  commonErrors: string | null;
  completed: boolean;
}

interface StepPageClientProps {
  scenarioSlug: string;
  step: StepData;
  navModules: NavModule[];
  totalSteps: number;
  completedSteps: number;
}

export default function StepPageClient({
  scenarioSlug,
  step,
  navModules,
  totalSteps,
  completedSteps: initialCompleted,
}: StepPageClientProps) {
  const [completed, setCompleted] = useState(step.completed);
  const [completedCount, setCompletedCount] = useState(initialCompleted);
  const [showAI, setShowAI] = useState(false);

  async function toggleComplete() {
    const newValue = !completed;
    setCompleted(newValue);
    setCompletedCount((prev) => prev + (newValue ? 1 : -1));

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId: step.id, completed: newValue }),
    });
  }

  return (
    <div className="flex h-[calc(100vh-64px)]" onContextMenu={(e) => e.preventDefault()}>
      <Watermark />

      {/* Left: Navigation */}
      <div className="hidden lg:block">
        <StepNavigation scenarioSlug={scenarioSlug} modules={navModules} />
      </div>

      {/* Center: Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-6">
            <ProgressTracker
              totalSteps={totalSteps}
              completedSteps={completedCount}
            />
          </div>

          <StepContent
            title={step.title}
            goal={step.goal}
            prerequisites={step.prerequisites}
            contentMd={step.contentMd}
            expectedResult={step.expectedResult}
            commonErrors={step.commonErrors}
            completed={completed}
            onToggleComplete={toggleComplete}
          />
        </div>
      </div>

      {/* Right: AI Assistant */}
      <div className="hidden xl:flex">
        <AIAssistant stepId={step.id} />
      </div>

      {/* Mobile AI toggle */}
      <button
        onClick={() => setShowAI(!showAI)}
        className="xl:hidden fixed bottom-6 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-700 transition z-40"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Mobile AI panel */}
      {showAI && (
        <div className="xl:hidden fixed inset-0 z-50 bg-white">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">AI Assistant</h3>
            <button onClick={() => setShowAI(false)} className="text-gray-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[calc(100vh-64px)]">
            <AIAssistant stepId={step.id} />
          </div>
        </div>
      )}
    </div>
  );
}
