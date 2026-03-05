"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  goal: string | null;
  moduleName: string;
  scenarioName: string;
  url: string;
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function navigateTo(url: string) {
    setOpen(false);
    router.push(url);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/30 flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl shadow-neu bg-neu-bg overflow-hidden"
          >
            <div className="p-4">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search steps..."
                className="neu-input w-full text-base"
              />
            </div>
            {loading && (
              <div className="px-4 pb-3 text-sm text-neu-muted">Searching...</div>
            )}
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto px-4 pb-4 space-y-1">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigateTo(r.url)}
                    className="w-full text-left px-4 py-3 rounded-xl hover:shadow-neu-flat transition-all duration-200"
                  >
                    <p className="text-sm font-medium text-neu-text">{r.title}</p>
                    <p className="text-xs text-neu-muted mt-0.5">
                      {r.scenarioName} &rsaquo; {r.moduleName}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {query.length >= 2 && !loading && results.length === 0 && (
              <div className="px-4 pb-4 text-sm text-neu-muted text-center">No results found</div>
            )}
            <div className="px-4 py-2 border-t border-neu-dark/10 text-xs text-neu-muted flex justify-between">
              <span>Type to search</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
