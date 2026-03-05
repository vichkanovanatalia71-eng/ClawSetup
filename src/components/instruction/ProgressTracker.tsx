"use client";

interface ProgressTrackerProps {
  totalSteps: number;
  completedSteps: number;
}

export default function ProgressTracker({ totalSteps, completedSteps }: ProgressTrackerProps) {
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="rounded-2xl shadow-neu-sm p-5 bg-neu-bg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neu-text">Progress</span>
        <span className="text-sm text-neu-muted">
          {completedSteps}/{totalSteps} steps — {percentage}%
        </span>
      </div>
      <div className="neu-progress-track">
        <div
          className="neu-progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
