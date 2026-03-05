"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-neu-text text-center mb-2">
            Create Your Account
          </h1>
          <p className="text-neu-muted text-center mb-8 text-sm">
            Get access to the full OpenClaw setup guide with AI assistance.
          </p>

          {error && (
            <div className="rounded-xl shadow-neu-inset-sm bg-red-50 text-red-600 px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neu-muted mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neu-input w-full"
                placeholder="Your name"
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-neu-muted mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="neu-input w-full"
                placeholder="Min. 8 characters"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full neu-btn-primary rounded-full py-3 text-base disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-neu-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
