"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

// --- NeuCard ---
interface NeuCardProps extends HTMLMotionProps<"div"> {
  variant?: "raised" | "flat" | "inset";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function NeuCard({
  variant = "raised",
  size = "md",
  className = "",
  children,
  ...props
}: NeuCardProps) {
  const shadowClass =
    variant === "raised"
      ? size === "sm"
        ? "shadow-neu-sm"
        : size === "lg"
        ? "shadow-neu"
        : "shadow-neu-sm"
      : variant === "inset"
      ? "shadow-neu-inset"
      : "shadow-neu-xs";

  const radiusClass = size === "sm" ? "rounded-xl" : "rounded-2xl";

  return (
    <motion.div
      className={`bg-neu-bg ${radiusClass} ${shadowClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- NeuButton ---
interface NeuButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  children: React.ReactNode;
}

export function NeuButton({
  variant = "default",
  size = "md",
  pill = false,
  className = "",
  disabled,
  children,
  ...props
}: NeuButtonProps) {
  const baseClass =
    variant === "primary" ? "neu-btn-primary" : variant === "ghost" ? "" : "neu-btn";

  const sizeClass =
    size === "sm"
      ? "text-xs px-4 py-2"
      : size === "lg"
      ? "text-base px-8 py-3"
      : "text-sm px-6 py-2.5";

  const pillClass = pill ? "neu-pill" : "";
  const disabledClass = disabled ? "opacity-50 pointer-events-none" : "";

  return (
    <motion.button
      className={`${baseClass} ${sizeClass} ${pillClass} ${disabledClass} ${className}`}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// --- NeuInput ---
interface NeuInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md";
}

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className = "", size = "md", ...props }, ref) => {
    const sizeClass =
      size === "sm" ? "text-xs py-2 px-3" : "text-sm py-3 px-4";

    return (
      <input
        ref={ref}
        className={`neu-input ${sizeClass} ${className}`}
        {...props}
      />
    );
  }
);
NeuInput.displayName = "NeuInput";

// --- NeuTextarea ---
export const NeuTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`neu-input resize-none ${className}`}
      {...props}
    />
  );
});
NeuTextarea.displayName = "NeuTextarea";

// --- NeuBadge ---
interface NeuBadgeProps {
  children: React.ReactNode;
  color?: "default" | "green" | "blue" | "amber" | "red" | "purple";
  className?: string;
}

const badgeColors = {
  default: "text-neu-text",
  green: "text-green-700 bg-green-50",
  blue: "text-brand-700 bg-brand-50",
  amber: "text-amber-700 bg-amber-50",
  red: "text-red-700 bg-red-50",
  purple: "text-purple-700 bg-purple-50",
};

export function NeuBadge({
  children,
  color = "default",
  className = "",
}: NeuBadgeProps) {
  return (
    <span
      className={`neu-badge ${badgeColors[color]} ${className}`}
    >
      {children}
    </span>
  );
}

// --- NeuProgress ---
interface NeuProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export function NeuProgress({
  value,
  max = 100,
  className = "",
}: NeuProgressProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={`neu-progress-track ${className}`}>
      <div
        className="neu-progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// --- NeuIconButton ---
interface NeuIconButtonProps extends HTMLMotionProps<"button"> {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function NeuIconButton({
  size = "md",
  className = "",
  children,
  ...props
}: NeuIconButtonProps) {
  const sizeClass =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-12 h-12"
      : "w-10 h-10";

  return (
    <motion.button
      className={`bg-neu-bg rounded-full shadow-neu-sm flex items-center justify-center text-neu-muted hover:text-neu-text transition-colors ${sizeClass} ${className}`}
      whileTap={{ scale: 0.93 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// --- Section animation wrapper ---
export function NeuSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
