"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface StepData {
  id: string;
  title: string;
  titleUk: string;
  slug: string;
  goal: string;
  goalUk: string;
  prerequisites: string;
  prerequisitesUk: string;
  contentMd: string;
  contentMdUk: string;
  expectedResult: string;
  expectedResultUk: string;
  commonErrors: string;
  commonErrorsUk: string;
  status: string;
  tags: string[];
  videoUrl: string;
}

export default function StepEditor({ step }: { step: StepData }) {
  const t = useTranslations("admin");
  const [form, setForm] = useState(step);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function update(field: keyof StepData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/steps", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  async function togglePublish() {
    const newStatus = form.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    update("status", newStatus);
    setSaving(true);
    await fetch("/api/admin/steps", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: newStatus }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Title & Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("title")}</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="neu-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("titleUk")}</label>
          <input
            value={form.titleUk}
            onChange={(e) => update("titleUk", e.target.value)}
            className="neu-input w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neu-muted mb-2">{t("slug")}</label>
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          className="neu-input w-full"
        />
      </div>

      {/* Goal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("goal")}</label>
          <textarea
            value={form.goal}
            onChange={(e) => update("goal", e.target.value)}
            rows={2}
            className="neu-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("goalUk")}</label>
          <textarea
            value={form.goalUk}
            onChange={(e) => update("goalUk", e.target.value)}
            rows={2}
            className="neu-input w-full"
          />
        </div>
      </div>

      {/* Prerequisites */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("prerequisites")}</label>
          <textarea
            value={form.prerequisites}
            onChange={(e) => update("prerequisites", e.target.value)}
            rows={2}
            className="neu-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("prerequisitesUk")}</label>
          <textarea
            value={form.prerequisitesUk}
            onChange={(e) => update("prerequisitesUk", e.target.value)}
            rows={2}
            className="neu-input w-full"
          />
        </div>
      </div>

      {/* Content (markdown) */}
      <div>
        <label className="block text-sm font-medium text-neu-muted mb-2">{t("contentMd")}</label>
        <textarea
          value={form.contentMd}
          onChange={(e) => update("contentMd", e.target.value)}
          rows={20}
          className="neu-input w-full font-mono"
          placeholder={t("stepContentPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neu-muted mb-2">{t("contentMdUk")}</label>
        <textarea
          value={form.contentMdUk}
          onChange={(e) => update("contentMdUk", e.target.value)}
          rows={20}
          className="neu-input w-full font-mono"
          placeholder={t("stepContentUkPlaceholder")}
        />
      </div>

      {/* Expected Result */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("expectedResult")}</label>
          <textarea
            value={form.expectedResult}
            onChange={(e) => update("expectedResult", e.target.value)}
            rows={3}
            className="neu-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("expectedResultUk")}</label>
          <textarea
            value={form.expectedResultUk}
            onChange={(e) => update("expectedResultUk", e.target.value)}
            rows={3}
            className="neu-input w-full"
          />
        </div>
      </div>

      {/* Common Errors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("commonErrors")}</label>
          <textarea
            value={form.commonErrors}
            onChange={(e) => update("commonErrors", e.target.value)}
            rows={5}
            className="neu-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neu-muted mb-2">{t("commonErrorsUk")}</label>
          <textarea
            value={form.commonErrorsUk}
            onChange={(e) => update("commonErrorsUk", e.target.value)}
            rows={5}
            className="neu-input w-full"
          />
        </div>
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-sm font-medium text-neu-muted mb-2">{t("videoUrl")}</label>
        <input
          value={form.videoUrl}
          onChange={(e) => update("videoUrl", e.target.value)}
          className="neu-input w-full"
          placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-neu-muted mb-2">{t("tags")}</label>
        <input
          value={form.tags.join(", ")}
          onChange={(e) =>
            update(
              "tags",
              e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
            )
          }
          className="neu-input w-full"
          placeholder="remote, ubuntu, gcloud"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-neu-dark/15">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="neu-btn-primary rounded-full px-6 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? t("saving") : t("saveChanges")}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={togglePublish}
          disabled={saving}
          className={`rounded-full px-6 py-2.5 text-sm font-medium shadow-neu-btn transition-all duration-200 ${
            form.status === "PUBLISHED"
              ? "text-amber-600"
              : "text-green-600"
          }`}
        >
          {form.status === "PUBLISHED" ? t("unpublish") : t("publish")}
        </motion.button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="neu-pill bg-green-100 text-green-600 text-sm"
          >
            {t("saved")}
          </motion.span>
        )}
      </div>
    </div>
  );
}
