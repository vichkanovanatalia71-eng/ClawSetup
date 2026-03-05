"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import SearchDialog from "@/components/ui/SearchDialog";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <SearchDialog />
      </ToastProvider>
    </SessionProvider>
  );
}
