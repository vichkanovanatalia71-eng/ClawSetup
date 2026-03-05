"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScenarioActions() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description }),
    });

    setShowForm(false);
    setName("");
    setSlug("");
    setDescription("");
    setLoading(false);
    router.refresh();
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700"
      >
        Add Scenario
      </button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 space-y-3 w-80">
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
        }}
        placeholder="Scenario name"
        required
        className="w-full px-3 py-2 border rounded text-sm"
      />
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="slug"
        required
        className="w-full px-3 py-2 border rounded text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full px-3 py-2 border rounded text-sm"
        rows={2}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-brand-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">
          Create
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
