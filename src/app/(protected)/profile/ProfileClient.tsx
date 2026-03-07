"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "next-intl";

export default function ProfileClient({ hasSubscription }: { hasSubscription: boolean }) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleManageSubscription() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast(t("failedPortal"), "error");
    }
    setLoading(false);
  }

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast(t("failedCheckout"), "error");
    }
    setLoading(false);
  }

  if (hasSubscription) {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleManageSubscription}
        disabled={loading}
        className="mt-2 neu-btn rounded-full px-5 py-2 text-sm font-medium text-brand-600 disabled:opacity-50"
      >
        {loading ? tc("loading") : t("manageSubscription")}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handleSubscribe}
      disabled={loading}
      className="neu-btn-primary rounded-full px-6 py-2.5 text-sm disabled:opacity-50"
    >
      {loading ? tc("loading") : t("subscribePrice")}
    </motion.button>
  );
}
