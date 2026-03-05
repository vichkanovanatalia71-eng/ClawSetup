"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TroubleshootNode {
  id: string;
  treeId: string;
  parentId: string | null;
  question: string;
  answer: string | null;
  isLeaf: boolean;
  order: number;
}

interface TroubleshootTree {
  id: string;
  title: string;
  nodes: TroubleshootNode[];
}

export default function TroubleshootWizard({ stepId }: { stepId: string }) {
  const [trees, setTrees] = useState<TroubleshootTree[]>([]);
  const [activeTree, setActiveTree] = useState<TroubleshootTree | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/troubleshoot?stepId=${stepId}`)
      .then((r) => r.json())
      .then((data) => setTrees(data.trees || []))
      .catch(() => {});
  }, [stepId]);

  if (trees.length === 0) return null;

  function startTree(tree: TroubleshootTree) {
    setActiveTree(tree);
    const root = tree.nodes.find((n) => !n.parentId);
    if (root) {
      setCurrentNodeId(root.id);
      setHistory([]);
    }
  }

  function selectOption(nodeId: string) {
    if (currentNodeId) {
      setHistory((h) => [...h, currentNodeId]);
    }
    setCurrentNodeId(nodeId);
  }

  function goBack() {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setCurrentNodeId(prev);
    }
  }

  function reset() {
    setActiveTree(null);
    setCurrentNodeId(null);
    setHistory([]);
  }

  const currentNode = activeTree?.nodes.find((n) => n.id === currentNodeId);
  const children = activeTree?.nodes.filter((n) => n.parentId === currentNodeId) || [];

  return (
    <div className="rounded-2xl shadow-neu-sm p-5 mb-6 border-l-4 border-purple-400 bg-neu-bg">
      <h3 className="font-semibold text-neu-text text-sm mb-3">Troubleshooting</h3>

      {!activeTree ? (
        <div className="space-y-2">
          {trees.map((tree) => (
            <button
              key={tree.id}
              onClick={() => startTree(tree)}
              className="block w-full text-left px-4 py-2.5 rounded-xl shadow-neu-xs text-sm text-neu-text hover:shadow-neu-flat transition-all"
            >
              {tree.title}
            </button>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNodeId}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {currentNode && (
              <>
                <p className="text-sm text-neu-text mb-3">{currentNode.question}</p>

                {currentNode.isLeaf && currentNode.answer ? (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 mb-3">
                    {currentNode.answer}
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => selectOption(child.id)}
                        className="block w-full text-left px-4 py-2 rounded-xl shadow-neu-xs text-sm text-neu-muted hover:text-neu-text hover:shadow-neu-flat transition-all"
                      >
                        {child.question}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={goBack}
                      className="text-xs text-neu-muted hover:text-neu-text transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="text-xs text-neu-muted hover:text-neu-text transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
