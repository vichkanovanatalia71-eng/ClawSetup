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
    <nav className="w-64 flex-shrink-0 overflow-y-auto bg-neu-bg p-4 m-2 rounded-2xl shadow-neu-sm">
      <div className="space-y-6">
        {modules.map((mod) => (
          <div key={mod.id}>
            <h3 className="text-xs font-semibold text-neu-muted uppercase tracking-wider mb-2 px-3">
              {mod.title}
            </h3>
            <ul className="space-y-1">
              {mod.steps.map((step) => {
                const isActive = step.slug === currentStepSlug;
                return (
                  <li key={step.id}>
                    <Link
                      href={`/instruction/${scenarioSlug}/${step.slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? "shadow-neu-inset-sm text-brand-600 font-medium"
                          : "text-neu-muted hover:shadow-neu-flat hover:text-neu-text"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs transition-all duration-200 ${
                          step.completed
                            ? "bg-green-500 text-white shadow-sm"
                            : isActive
                            ? "bg-gradient-to-br from-blue-500 to-brand-600 text-white shadow-sm"
                            : "shadow-neu-xs text-neu-muted"
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
