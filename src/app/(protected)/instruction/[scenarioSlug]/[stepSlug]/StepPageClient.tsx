"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import StepNavigation from "@/components/instruction/StepNavigation";
import StepContent from "@/components/instruction/StepContent";
import AIAssistant from "@/components/instruction/AIAssistant";
import ProgressTracker from "@/components/instruction/ProgressTracker";
import Watermark from "@/components/instruction/Watermark";
import Celebration from "@/components/ui/Celebration";

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
  moduleId: string;
  videoUrl: string | null;
}

interface StepPageClientProps {
  scenarioSlug: string;
  scenarioName: string;
  moduleTitle: string;
  step: StepData;
  navModules: NavModule[];
  totalSteps: number;
  completedSteps: number;
}

type CelebrationInfo = {
  type: "module" | "milestone" | "complete";
  message: string;
} | null;

export default function StepPageClient({
  scenarioSlug,
  scenarioName,
  moduleTitle,
  step,
  navModules,
  totalSteps,
  completedSteps: initialCompleted,
}: StepPageClientProps) {
  const router = useRouter();
  const t = useTranslations("instruction");
  const [completed, setCompleted] = useState(step.completed);
  const [completedCount, setCompletedCount] = useState(initialCompleted);
  const [showAI, setShowAI] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationInfo>(null);

  // Track step view event
  useEffect(() => {
    const startTime = Date.now();
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId: step.id, event: "VIEWED" }),
    }).catch(() => {});

    return () => {
      const duration = Date.now() - startTime;
      if (duration > 3000) {
        navigator.sendBeacon(
          "/api/events",
          JSON.stringify({ stepId: step.id, event: "TIME_SPENT", durationMs: duration })
        );
      }
    };
  }, [step.id]);

  function checkMilestone(newCount: number) {
    // Check 100% completion
    if (newCount === totalSteps) {
      setCelebration({ type: "complete", message: "You have completed all steps in this guide! Your certificate is ready." });
      return;
    }

    // Check module completion
    const currentModule = navModules.find((m) => m.steps.some((s) => s.id === step.id));
    if (currentModule) {
      const moduleSteps = currentModule.steps;
      const allModuleDone = moduleSteps.every((s) =>
        s.id === step.id ? true : s.completed
      );
      if (allModuleDone) {
        setCelebration({ type: "module", message: `You completed "${currentModule.title}"! Great progress.` });
        return;
      }
    }

    // Check percentage milestones
    const pct = Math.round((newCount / totalSteps) * 100);
    const prevPct = Math.round(((newCount - 1) / totalSteps) * 100);
    for (const milestone of [75, 50, 25]) {
      if (pct >= milestone && prevPct < milestone) {
        setCelebration({ type: "milestone", message: `${milestone}% complete! Keep going, you're doing great.` });
        return;
      }
    }
  }

  async function toggleComplete() {
    const prevCompleted = completed;
    const prevCount = completedCount;
    const newValue = !completed;
    setCompleted(newValue);
    const newCount = completedCount + (newValue ? 1 : -1);
    setCompletedCount(newCount);

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: step.id, completed: newValue }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      // Rollback on failure
      setCompleted(prevCompleted);
      setCompletedCount(prevCount);
      return;
    }

    if (newValue) {
      checkMilestone(newCount);
    }
  }

  const handleCloseCelebration = useCallback(() => setCelebration(null), []);

  // Compute prev/next steps for keyboard nav
  const { prevStep, nextStep } = useMemo(() => {
    const allSteps = navModules.flatMap((m) =>
      m.steps.map((s) => ({ ...s, scenarioSlug }))
    );
    const idx = allSteps.findIndex((s) => s.id === step.id);
    return {
      prevStep: idx > 0 ? allSteps[idx - 1] : null,
      nextStep: idx < allSteps.length - 1 ? allSteps[idx + 1] : null,
    };
  }, [navModules, step.id, scenarioSlug]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't navigate when user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowLeft" && prevStep) {
        router.push(`/instruction/${scenarioSlug}/${prevStep.slug}`);
      } else if (e.key === "ArrowRight" && nextStep) {
        router.push(`/instruction/${scenarioSlug}/${nextStep.slug}`);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevStep, nextStep, scenarioSlug, router]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-neu-bg" onContextMenu={(e) => e.preventDefault()}>
      <Watermark />

      {celebration && (
        <Celebration
          type={celebration.type}
          message={celebration.message}
          onClose={handleCloseCelebration}
        />
      )}

      {/* Left: Navigation */}
      <div className="hidden lg:block">
        <StepNavigation scenarioSlug={scenarioSlug} modules={navModules} />
      </div>

      {/* Center: Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-neu-muted mb-4 flex-wrap">
            <Link href="/dashboard" className="hover:text-neu-text transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href={`/instruction/${scenarioSlug}`} className="hover:text-neu-text transition-colors">{scenarioName}</Link>
            <span>/</span>
            <span className="text-neu-muted">{moduleTitle}</span>
            <span>/</span>
            <span className="text-neu-text font-medium">{step.title}</span>
          </nav>

          <div className="mb-6">
            <ProgressTracker
              totalSteps={totalSteps}
              completedSteps={completedCount}
            />
          </div>

          <StepContent
            stepId={step.id}
            title={step.title}
            goal={step.goal}
            prerequisites={step.prerequisites}
            contentMd={step.contentMd}
            expectedResult={step.expectedResult}
            commonErrors={step.commonErrors}
            videoUrl={step.videoUrl}
            completed={completed}
            onToggleComplete={toggleComplete}
          />

          {/* Prev / Next navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-neu-dark/10">
            {prevStep ? (
              <Link
                href={`/instruction/${scenarioSlug}/${prevStep.slug}`}
                className="flex items-center gap-2 text-sm text-neu-muted hover:text-neu-text transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="max-w-[200px] truncate">{prevStep.title}</span>
              </Link>
            ) : <div />}
            {nextStep ? (
              <Link
                href={`/instruction/${scenarioSlug}/${nextStep.slug}`}
                prefetch
                className="flex items-center gap-2 text-sm text-neu-muted hover:text-neu-text transition-colors"
              >
                <span className="max-w-[200px] truncate">{nextStep.title}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>

      {/* Right: AI Assistant */}
      <div className="hidden xl:flex">
        <AIAssistant stepId={step.id} />
      </div>

      {/* Mobile AI toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAI(!showAI)}
        className="xl:hidden fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-brand-600 text-white rounded-full shadow-neu flex items-center justify-center z-40"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </motion.button>

      {/* Mobile AI panel */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="xl:hidden fixed inset-0 z-50 bg-neu-bg"
          >
            <div className="flex justify-between items-center p-4 shadow-neu-sm mx-4 mt-4 rounded-2xl bg-neu-bg">
              <h3 className="font-semibold text-neu-text">{t("aiTitle")}</h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAI(false)}
                className="w-8 h-8 rounded-xl shadow-neu-xs flex items-center justify-center text-neu-muted"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            <div className="h-[calc(100vh-80px)]">
              <AIAssistant stepId={step.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
