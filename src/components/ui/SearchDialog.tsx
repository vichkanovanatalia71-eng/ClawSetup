"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  goal: string | null;
  snippet?: string;
  query?: string;
  moduleName: string;
  scenarioName: string;
  url: string;
}

const RECENT_SEARCHES_KEY = "clawsetup-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-neu-text rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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
      setRecentSearches(getRecentSearches());
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const navigateTo = useCallback((url: string) => {
    if (query.length >= 2) saveRecentSearch(query);
    setOpen(false);
    router.push(url);
  }, [query, router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigateTo(results[selectedIndex].url);
    }
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
                onKeyDown={handleKeyDown}
                placeholder="Search steps..."
                aria-label="Search steps"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-activedescendant={results[selectedIndex] ? `search-result-${results[selectedIndex].id}` : undefined}
                className="neu-input w-full text-base"
              />
            </div>

            {/* Recent searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="px-4 pb-3">
                <p className="text-xs text-neu-muted mb-2">Recent searches</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1 rounded-full text-xs shadow-neu-xs text-neu-muted hover:text-neu-text transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="px-4 pb-3 text-sm text-neu-muted">Searching...</div>
            )}
            {results.length > 0 && (
              <div id="search-results" role="listbox" className="max-h-80 overflow-y-auto px-4 pb-4 space-y-1">
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    id={`search-result-${r.id}`}
                    role="option"
                    aria-selected={i === selectedIndex}
                    onClick={() => navigateTo(r.url)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      i === selectedIndex ? "shadow-neu-flat bg-white/40" : "hover:shadow-neu-flat"
                    }`}
                  >
                    <p className="text-sm font-medium text-neu-text">
                      <HighlightMatch text={r.title} query={query} />
                    </p>
                    {r.snippet && (
                      <p className="text-xs text-neu-muted mt-1 line-clamp-2">
                        <HighlightMatch text={r.snippet} query={query} />
                      </p>
                    )}
                    <p className="text-xs text-neu-muted mt-0.5">
                      {r.scenarioName} &rsaquo; {r.moduleName}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {query.length >= 2 && !loading && results.length === 0 && (
              <div aria-live="polite" className="px-4 pb-4 text-sm text-neu-muted text-center">No results found</div>
            )}
            <div className="px-4 py-2 border-t border-neu-dark/10 text-xs text-neu-muted flex justify-between">
              <span>Use arrows to navigate</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
