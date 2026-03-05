"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import SearchDialog from "@/components/ui/SearchDialog";
import NPSSurvey from "@/components/ui/NPSSurvey";
import OnboardingTour from "@/components/ui/OnboardingTour";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <SearchDialog />
        <NPSSurvey />
        <OnboardingTour />
      </ToastProvider>
    </SessionProvider>
  );
}
