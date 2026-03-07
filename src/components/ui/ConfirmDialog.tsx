"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const tc = useTranslations("common");
  const cancelRef = useRef<HTMLButtonElement>(null);

  const resolvedConfirmLabel = confirmLabel ?? tc("confirm");
  const resolvedCancelLabel = cancelLabel ?? tc("cancel");

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/30 flex items-center justify-center px-4"
          onClick={onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl shadow-neu p-6 bg-neu-bg"
          >
            <h3 id="confirm-dialog-title" className="text-lg font-semibold text-neu-text mb-2">{title}</h3>
            <p className="text-sm text-neu-muted mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <motion.button
                ref={cancelRef}
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                className="neu-btn rounded-full px-5 py-2 text-sm text-neu-muted"
              >
                {resolvedCancelLabel}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                className={`rounded-full px-5 py-2 text-sm font-medium text-white ${
                  variant === "danger"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-brand-600 hover:bg-brand-700"
                } shadow-sm transition-colors`}
              >
                {resolvedConfirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
