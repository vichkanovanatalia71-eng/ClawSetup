"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

export default function ProfileClient({ hasSubscription }: { hasSubscription: boolean }) {
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
      toast("Failed to open subscription management", "error");
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
      toast("Failed to start checkout", "error");
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
        {loading ? "Loading..." : "Manage Subscription"}
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
      {loading ? "Loading..." : "Subscribe — $29/month"}
    </motion.button>
  );
}
