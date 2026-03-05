"use client";

interface ProgressTrackerProps {
  totalSteps: number;
  completedSteps: number;
}

export default function ProgressTracker({ totalSteps, completedSteps }: ProgressTrackerProps) {
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">
          {completedSteps}/{totalSteps} steps
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{percentage}% complete</p>
    </div>
  );
}
