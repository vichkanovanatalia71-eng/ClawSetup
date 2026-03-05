"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const tc = useTranslations("common");
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-neu-muted">{tc("loading")}</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
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
      setError(t("passwordsNoMatch"));
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
        setError(data.error || t("somethingWrong"));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t("networkError"));
    }

    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="rounded-2xl shadow-neu p-8 bg-neu-bg text-center max-w-md">
          <h1 className="text-2xl font-bold text-neu-text mb-2">{t("invalidLink")}</h1>
          <p className="text-neu-muted text-sm mb-6">{t("invalidLinkDescription")}</p>
          <Link href="/forgot-password" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
            {t("requestNewOne")}
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
              <h1 className="text-2xl font-bold text-neu-text mb-2">{t("passwordReset")}</h1>
              <p className="text-neu-muted text-sm mb-6">
                {t("passwordResetSuccess")}
              </p>
              <Link href="/login" className="neu-btn-primary rounded-full px-8 py-3 inline-block">
                {tc("signIn")}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-neu-text text-center mb-8">
                {t("setNewPassword")}
              </h1>

              {error && (
                <div className="rounded-xl shadow-neu-inset-sm bg-red-50 text-red-600 px-4 py-3 text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neu-muted mb-2">{t("newPassword")}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="neu-input w-full"
                    placeholder={t("newPasswordPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neu-muted mb-2">{t("confirmPassword")}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="neu-input w-full"
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full neu-btn-primary rounded-full py-3 text-base disabled:opacity-50"
                >
                  {loading ? t("resetting") : t("resetPassword")}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
