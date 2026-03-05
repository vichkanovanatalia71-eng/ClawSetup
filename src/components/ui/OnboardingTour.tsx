"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tourSteps = [
  {
    title: "Welcome to ClawSetup!",
    description: "Let us show you around. This guide will help you set up OpenClaw step by step.",
    position: "center" as const,
  },
  {
    title: "Choose Your Scenario",
    description: "Start by selecting a setup scenario — remote (Google Cloud VM) or local installation.",
    position: "center" as const,
  },
  {
    title: "Follow the Steps",
    description: "Each step has detailed instructions, copy-paste commands, and expected results. Mark steps as done to track progress.",
    position: "center" as const,
  },
  {
    title: "AI Assistant",
    description: "Stuck on an error? Use the AI assistant on every step — paste errors, upload screenshots, or use quick actions for instant help.",
    position: "center" as const,
  },
  {
    title: "You're Ready!",
    description: "Complete all steps to earn your completion certificate. Good luck!",
    position: "center" as const,
  },
];

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const complete = useCallback(() => {
    localStorage.setItem("onboarding_completed", "true");
    setShow(false);
  }, []);

  function next() {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      complete();
    }
  }

  useEffect(() => {
    if (!show) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") complete();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (!show) return null;

  const step = tourSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center"
        onClick={complete}
      >
        <motion.div
          key={currentStep}
          role="dialog"
          aria-modal="true"
          aria-label={`Onboarding step ${currentStep + 1} of ${tourSteps.length}: ${step.title}`}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="rounded-3xl shadow-neu p-8 bg-neu-bg max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? "bg-brand-500 w-6" : i < currentStep ? "bg-brand-300" : "bg-neu-dark/20"
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-brand-600 mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{currentStep + 1}</span>
            </div>
            <h3 className="text-xl font-bold text-neu-text mb-2">{step.title}</h3>
            <p className="text-neu-muted text-sm mb-6">{step.description}</p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={complete}
              className="text-xs text-neu-muted hover:text-neu-text transition-colors"
            >
              Skip tour
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="neu-btn-primary rounded-full px-6 py-2.5 text-sm"
            >
              {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
