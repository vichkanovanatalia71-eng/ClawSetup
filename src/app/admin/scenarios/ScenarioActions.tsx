"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowForm(true)}
        className="neu-btn-primary rounded-full px-5 py-2.5 text-sm"
      >
        Add Scenario
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleCreate}
        className="rounded-2xl shadow-neu p-5 space-y-3 w-80 bg-neu-bg"
      >
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
          }}
          placeholder="Scenario name"
          required
          className="neu-input w-full"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug"
          required
          className="neu-input w-full"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="neu-input w-full"
          rows={2}
        />
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="neu-btn-primary rounded-full px-5 py-2 text-sm disabled:opacity-50"
          >
            Create
          </motion.button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-neu-muted text-sm hover:text-neu-text transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}
