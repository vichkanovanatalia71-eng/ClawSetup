"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StepData {
  id: string;
  title: string;
  slug: string;
  goal: string;
  prerequisites: string;
  contentMd: string;
  expectedResult: string;
  commonErrors: string;
  status: string;
  tags: string[];
}

export default function StepEditor({ step }: { step: StepData }) {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
        <textarea
          value={form.goal}
          onChange={(e) => update("goal", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Prerequisites */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
        <textarea
          value={form.prerequisites}
          onChange={(e) => update("prerequisites", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Content (markdown) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content (Markdown)
        </label>
        <textarea
          value={form.contentMd}
          onChange={(e) => update("contentMd", e.target.value)}
          rows={20}
          className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
          placeholder="Step content in markdown..."
        />
      </div>

      {/* Expected Result */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Result</label>
        <textarea
          value={form.expectedResult}
          onChange={(e) => update("expectedResult", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Common Errors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Common Errors</label>
        <textarea
          value={form.commonErrors}
          onChange={(e) => update("commonErrors", e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          value={form.tags.join(", ")}
          onChange={(e) =>
            update(
              "tags",
              e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
            )
          }
          className="w-full px-3 py-2 border rounded-lg text-sm"
          placeholder="remote, ubuntu, gcloud"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={togglePublish}
          disabled={saving}
          className={`px-6 py-2 rounded-lg text-sm font-medium border ${
            form.status === "PUBLISHED"
              ? "border-amber-300 text-amber-700 hover:bg-amber-50"
              : "border-green-300 text-green-700 hover:bg-green-50"
          }`}
        >
          {form.status === "PUBLISHED" ? "Unpublish" : "Publish"}
        </button>
        {saved && <span className="text-green-600 text-sm">Saved!</span>}
      </div>
    </div>
  );
}
