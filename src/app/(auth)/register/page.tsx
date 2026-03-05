"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
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
        setError(data.error || t("registrationFailed"));
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
      setError(t("somethingWrong"));
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
            {t("registerTitle")}
          </h1>
          <p className="text-neu-muted text-center mb-8 text-sm">
            {t("registerDescription")}
          </p>

          {error && (
            <div className="rounded-xl shadow-neu-inset-sm bg-red-50 text-red-600 px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neu-muted mb-2">{t("name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neu-input w-full"
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neu-muted mb-2">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neu-input w-full"
                placeholder={t("emailPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neu-muted mb-2">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="neu-input w-full"
                placeholder={t("minChars")}
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full neu-btn-primary rounded-full py-3 text-base disabled:opacity-50"
            >
              {loading ? t("creatingAccount") : tc("register")}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-neu-muted">
            {t("haveAccount")}{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              {tc("signIn")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
