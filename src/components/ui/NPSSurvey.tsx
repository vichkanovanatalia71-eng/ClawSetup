"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NPSSurvey() {
  const [show, setShow] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if user should see NPS survey
    const lastDismissed = localStorage.getItem("nps_dismissed");
    if (lastDismissed) {
      const days = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (days < 30) return;
    }

    // Check with server after 10 seconds
    const timer = setTimeout(() => {
      fetch("/api/nps")
        .then((r) => r.json())
        .then((data) => {
          if (data.shouldShow) setShow(true);
        })
        .catch(() => {});
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit() {
    if (score === null) return;
    await fetch("/api/nps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, comment: comment || undefined }),
    });
    setSubmitted(true);
    setTimeout(() => setShow(false), 2000);
  }

  function dismiss() {
    localStorage.setItem("nps_dismissed", String(Date.now()));
    setShow(false);
  }

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-[70] w-80 rounded-2xl shadow-neu p-5 bg-neu-bg"
      >
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium text-sm">Thanks for your feedback!</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-semibold text-neu-text">How likely are you to recommend ClawSetup?</p>
              <button onClick={dismiss} aria-label="Dismiss survey" className="text-neu-muted text-xs hover:text-neu-text ml-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-1 mb-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  aria-label={`Score ${n} out of 10`}
                  aria-pressed={score === n}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    score === n
                      ? "bg-brand-500 text-white shadow-sm"
                      : "shadow-neu-xs text-neu-muted hover:text-neu-text"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-neu-muted mb-3">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
            {score !== null && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any comments? (optional)"
                  className="neu-input w-full text-xs mb-3"
                  rows={2}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="w-full neu-btn-primary rounded-full py-2 text-xs"
                >
                  Submit
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
