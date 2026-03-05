"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationProps {
  type: "module" | "milestone" | "complete";
  message: string;
  onClose: () => void;
}

export default function Celebration({ type, message, onClose }: CelebrationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import("canvas-confetti").then((confettiModule) => {
      const confetti = confettiModule.default;
      if (type === "complete") {
        // Big celebration for 100%
        const duration = 3000;
        const end = Date.now() + duration;
        const interval = setInterval(() => {
          confetti({
            particleCount: 50,
            spread: 80,
            origin: { x: Math.random(), y: Math.random() * 0.6 },
          });
          if (Date.now() > end) clearInterval(interval);
        }, 200);
      } else if (type === "module") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // Milestone: subtle burst
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      }
    });

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, type === "complete" ? 5000 : 3000);

    return () => clearTimeout(timer);
  }, [type, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="rounded-3xl shadow-neu p-8 bg-neu-bg max-w-sm mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">
              {type === "complete" ? "🏆" : type === "module" ? "🎉" : "⭐"}
            </div>
            <h3 className="text-xl font-bold text-neu-text mb-2">
              {type === "complete" ? "Guide Complete!" : type === "module" ? "Module Complete!" : "Milestone!"}
            </h3>
            <p className="text-neu-muted text-sm mb-4">{message}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
              className="neu-btn-primary rounded-full px-6 py-2.5 text-sm"
            >
              {type === "complete" ? "View Certificate" : "Continue"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
