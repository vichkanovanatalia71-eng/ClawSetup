"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function FeedbackWidget({ stepId }: { stepId: string }) {
  const t = useTranslations("instruction");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/feedback?stepId=${stepId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.helpful !== null) {
          setSubmitted(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [stepId]);

  async function submit(helpful: boolean) {
    setSubmitted(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, helpful }),
    });
  }

  return (
    <div className="rounded-2xl shadow-neu-sm p-4 bg-neu-bg text-center mt-8">
      <p className="text-sm text-neu-muted mb-3">{t("feedbackQuestion")}</p>
      {submitted ? (
        <p className="text-sm text-green-600 font-medium">
          Thanks for your feedback!
        </p>
      ) : (
        <div className="flex justify-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => submit(true)}
            className="w-11 h-11 rounded-xl shadow-neu-xs flex items-center justify-center text-green-500 hover:shadow-neu-inset-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => submit(false)}
            className="w-11 h-11 rounded-xl shadow-neu-xs flex items-center justify-center text-red-400 hover:shadow-neu-inset-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </motion.button>
        </div>
      )}
    </div>
  );
}
