"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-neu-muted">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="rounded-2xl shadow-neu p-8 bg-neu-bg text-center max-w-md">
          <h1 className="text-2xl font-bold text-neu-text mb-2">Invalid Link</h1>
          <p className="text-neu-muted text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    );
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
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl shadow-neu-sm mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-neu-text mb-2">Password Reset!</h1>
              <p className="text-neu-muted text-sm mb-6">
                Your password has been reset successfully.
              </p>
              <Link href="/login" className="neu-btn-primary rounded-full px-8 py-3 inline-block">
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-neu-text text-center mb-8">
                Set New Password
              </h1>

              {error && (
                <div className="rounded-xl shadow-neu-inset-sm bg-red-50 text-red-600 px-4 py-3 text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neu-muted mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="neu-input w-full"
                    placeholder="Min. 8 chars, uppercase, lowercase, number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neu-muted mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="neu-input w-full"
                    placeholder="Repeat your password"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full neu-btn-primary rounded-full py-3 text-base disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
