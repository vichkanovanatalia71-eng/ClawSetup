"use client";

import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl shadow-neu mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neu-text mb-2">Something went wrong</h1>
        <p className="text-neu-muted text-sm mb-6">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="rounded-xl shadow-neu-inset-sm p-4 mb-6 text-left">
            <p className="text-xs font-mono text-red-500 break-all">{error.message}</p>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={reset}
          className="neu-btn-primary rounded-full px-8 py-3"
        >
          Try Again
        </motion.button>
      </motion.div>
    </div>
  );
}
