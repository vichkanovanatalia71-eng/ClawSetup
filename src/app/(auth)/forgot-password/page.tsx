"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl shadow-neu p-8 bg-neu-bg">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl shadow-neu-sm mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-neu-text mb-2">Check Your Email</h1>
              <p className="text-neu-muted text-sm mb-6">
                If an account with that email exists, we&apos;ve sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <Link href="/login" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-neu-text text-center mb-2">
                Forgot Password
              </h1>
              <p className="text-neu-muted text-center mb-8 text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="rounded-xl shadow-neu-inset-sm bg-red-50 text-red-600 px-4 py-3 text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neu-muted mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="neu-input w-full"
                    placeholder="you@example.com"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full neu-btn-primary rounded-full py-3 text-base disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-neu-muted">
                Remember your password?{" "}
                <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
