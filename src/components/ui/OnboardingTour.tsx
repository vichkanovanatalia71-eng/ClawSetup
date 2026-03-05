"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export default function OnboardingTour() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    { title: t("step1Title"), description: t("step1Desc") },
    { title: t("step2Title"), description: t("step2Desc") },
    { title: t("step3Title"), description: t("step3Desc") },
    { title: t("step4Title"), description: t("step4Desc") },
    { title: t("step5Title"), description: t("step5Desc") },
  ];

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
          aria-label={`${currentStep + 1} / ${tourSteps.length}: ${step.title}`}
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
              {t("skipTour")}
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="neu-btn-primary rounded-full px-6 py-2.5 text-sm"
            >
              {currentStep === tourSteps.length - 1 ? tc("getStarted") : t("next")}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
