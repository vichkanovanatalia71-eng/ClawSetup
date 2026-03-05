"use client";

import { useState } from "react";

export default function ProfileClient({ hasSubscription }: { hasSubscription: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleManageSubscription() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Failed to open subscription management");
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
      alert("Failed to start checkout");
    }
    setLoading(false);
  }

  if (hasSubscription) {
    return (
      <button
        onClick={handleManageSubscription}
        disabled={loading}
        className="mt-2 text-brand-600 hover:text-brand-700 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Loading..." : "Manage Subscription"}
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
    >
      {loading ? "Loading..." : "Subscribe — $29/month"}
    </button>
  );
}
