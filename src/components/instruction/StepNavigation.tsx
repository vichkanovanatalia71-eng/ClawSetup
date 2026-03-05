"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

interface NavStep {
  id: string;
  slug: string;
  title: string;
  order: number;
  completed: boolean;
}

interface NavModule {
  id: string;
  title: string;
  order: number;
  steps: NavStep[];
}

interface StepNavigationProps {
  scenarioSlug: string;
  modules: NavModule[];
}

export default function StepNavigation({ scenarioSlug, modules }: StepNavigationProps) {
  const params = useParams();
  const currentStepSlug = params?.stepSlug as string;

  return (
    <nav className="w-64 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50 p-4">
      <div className="space-y-6">
        {modules.map((mod) => (
          <div key={mod.id}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {mod.title}
            </h3>
            <ul className="space-y-1">
              {mod.steps.map((step) => {
                const isActive = step.slug === currentStepSlug;
                return (
                  <li key={step.id}>
                    <Link
                      href={`/instruction/${scenarioSlug}/${step.slug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                        isActive
                          ? "bg-brand-100 text-brand-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                          step.completed
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-brand-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.completed ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.order
                        )}
                      </span>
                      <span className="truncate">{step.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
