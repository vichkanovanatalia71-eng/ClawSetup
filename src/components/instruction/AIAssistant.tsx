"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

function formatCitations(text: string): string {
  return text.replace(
    /\[Source: ([^\]]+)\]/g,
    '`📎 $1`'
  ).replace(
    /\[General advice\]/g,
    '`⚠️ General advice`'
  );
}

function parseSuggestions(text: string): { content: string; suggestions: string[] } {
  const match = text.match(/\[SUGGESTIONS:\s*([^\]]+)\]/);
  if (!match) return { content: text, suggestions: [] };
  const suggestions = match[1].split("|").map((s) => s.trim()).filter(Boolean);
  const content = text.replace(/\[SUGGESTIONS:\s*[^\]]+\]/, "").trim();
  return { content, suggestions };
}

interface AIAssistantProps {
  stepId: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { id: "explain_simpler", label: "Explain simpler" },
  { id: "check_missed", label: "What did I miss?" },
  { id: "alternative", label: "Alternative way" },
  { id: "generate_command", label: "Give me commands" },
  { id: "whats_next", label: "What's next?" },
  { id: "explain_error", label: "Fix my error" },
  { id: "check_output", label: "Check output" },
  { id: "security_tip", label: "Security tips" },
];

export default function AIAssistant({ stepId }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history on mount
  useEffect(() => {
    fetch(`/api/ai/history?stepId=${stepId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: new Date(),
            }))
          );
        }
      })
      .catch(() => {});
  }, [stepId]);

  // Save conversation when messages change
  useEffect(() => {
    if (messages.length === 0) return;
    const toSave = messages.map((m) => ({ role: m.role, content: m.content }));
    fetch("/api/ai/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, messages: toSave }),
    }).catch(() => {});
  }, [messages, stepId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function sendMessage(message: string, quickAction?: string) {
    if (!message.trim() && !quickAction) return;

    setError("");
    setLoading(true);
    setStreamingContent("");

    const userMsg: ChatMessage = {
      role: "user",
      content: quickAction
        ? `[${quickActions.find((a) => a.id === quickAction)?.label}]`
        : message,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    const conversationHistory = updatedMessages
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          message: quickAction ? "" : message,
          quickAction,
          imageBase64,
          imageMimeType,
          conversationHistory: conversationHistory.slice(0, -1),
          stream: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to get response");
        if (data.remaining !== undefined) setRemaining(data.remaining);
        setLoading(false);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && res.body) {
        const remainingHeader = res.headers.get("X-Daily-Remaining");
        if (remainingHeader) setRemaining(parseInt(remainingHeader));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullContent += parsed.text;
                  setStreamingContent(fullContent);
                }
                if (parsed.error) {
                  setError(parsed.error);
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }

        if (fullContent) {
          const { content: cleanContent, suggestions: newSuggestions } = parseSuggestions(fullContent);
          setSuggestions(newSuggestions);
          const aiMsg: ChatMessage = {
            role: "assistant",
            content: cleanContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setStreamingContent("");
        }
      } else {
        const data = await res.json();
        if (data.remaining !== undefined) setRemaining(data.remaining);

        const { content: cleanContent, suggestions: newSuggestions } = parseSuggestions(data.answer);
        setSuggestions(newSuggestions);
        const aiMsg: ChatMessage = {
          role: "assistant",
          content: cleanContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }

      setImagePreview(null);
      setImageBase64(null);
      setImageMimeType(null);
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
      setImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-neu-bg m-2 rounded-2xl shadow-neu-sm">
      <div className="p-4 border-b border-neu-dark/15">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neu-text text-sm">AI Assistant</h3>
          <div className="flex items-center gap-2">
            {remaining !== null && (
              <span className="text-xs text-neu-muted">{remaining} left</span>
            )}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setSuggestions([]);
                  fetch(`/api/ai/history?stepId=${stepId}`, { method: "DELETE" }).catch(() => {});
                }}
                className="text-xs text-neu-muted hover:text-red-500 transition-colors"
                title="Clear conversation"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-neu-muted mt-1">
          Ask about this step or upload a screenshot of an error
        </p>
      </div>

      {/* Quick actions */}
      <div role="toolbar" aria-label="Quick actions" className="p-3 border-b border-neu-dark/10 flex flex-wrap gap-1.5">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage("", action.id)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full text-xs font-medium shadow-neu-xs text-brand-600 hover:shadow-neu-inset-sm transition-all duration-200 disabled:opacity-50"
          >
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="text-center text-neu-muted text-sm mt-8">
            <div className="w-12 h-12 rounded-2xl shadow-neu-sm mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p>Paste an error message or upload a screenshot to get help with this step.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === "user" ? "ml-4" : "mr-4"}
          >
            <div
              className={`rounded-2xl p-3.5 text-sm ${
                msg.role === "user"
                  ? "shadow-neu-sm bg-blue-50/50"
                  : "shadow-neu-inset-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {formatCitations(msg.content)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-neu-text">{msg.content}</p>
              )}
            </div>
            {msg.role === "assistant" && (
              <div className="flex items-center gap-1 mt-1 ml-1">
                <button
                  onClick={() => {
                    setRatings((prev) => ({ ...prev, [i]: 1 }));
                    fetch("/api/ai/rating", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ticketId: `msg-${i}`, rating: 1 }),
                    }).catch(() => {});
                  }}
                  className={`p-1 rounded text-xs transition-colors ${ratings[i] === 1 ? "text-green-600" : "text-neu-muted hover:text-green-500"}`}
                  title="Helpful"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setRatings((prev) => ({ ...prev, [i]: -1 }));
                    fetch("/api/ai/rating", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ticketId: `msg-${i}`, rating: -1 }),
                    }).catch(() => {});
                  }}
                  className={`p-1 rounded text-xs transition-colors ${ratings[i] === -1 ? "text-red-600" : "text-neu-muted hover:text-red-500"}`}
                  title="Not helpful"
                >
                  <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Streaming content */}
        {streamingContent && (
          <div className="mr-4">
            <div className="rounded-2xl p-3.5 text-sm shadow-neu-inset-sm">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formatCitations(streamingContent)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {loading && !streamingContent && (
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-neu-muted text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-neu-dark border-t-brand-500 rounded-full" aria-hidden="true" />
            Analyzing...
          </div>
        )}
        {/* Escalation: show after 3+ assistant messages */}
        {messages.filter((m) => m.role === "assistant").length >= 3 && !loading && (
          <div className="rounded-xl shadow-neu-xs p-3 text-center">
            <p className="text-xs text-neu-muted mb-2">Still stuck?</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const snapshot = messages.map((m) => ({ role: m.role, content: m.content.slice(0, 500) }));
                const subject = `Help with step (AI couldn't resolve)`;
                fetch("/api/support", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ stepId, subject, message: "AI assistant could not resolve my issue. Please see conversation history.", aiSnapshot: snapshot }),
                }).then(() => {
                  setError("");
                  const infoMsg: ChatMessage = { role: "assistant", content: "Support ticket created! Our team will review your issue and the AI conversation context.", timestamp: new Date() };
                  setMessages((prev) => [...prev, infoMsg]);
                }).catch(() => setError("Failed to create support ticket"));
              }}
              className="px-4 py-1.5 rounded-full text-xs font-medium shadow-neu-xs text-amber-600 hover:shadow-neu-inset-sm transition-all"
            >
              Create Support Ticket
            </motion.button>
          </div>
        )}

        {/* Suggested follow-up questions */}
        {suggestions.length > 0 && !loading && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSuggestions([]);
                  sendMessage(s);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium shadow-neu-xs text-brand-500 hover:shadow-neu-inset-sm transition-all duration-200"
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-red-500 text-xs rounded-xl shadow-neu-inset-sm mx-3 mb-2">
          {error}
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-neu-dark/10">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="h-16 rounded-xl shadow-neu-xs"
            />
            <button
              onClick={() => {
                setImagePreview(null);
                setImageBase64(null);
                setImageMimeType(null);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-neu-dark/15">
        <div className="flex gap-2 items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-xl shadow-neu-xs flex items-center justify-center text-neu-muted hover:text-brand-500 transition-colors flex-shrink-0"
            title="Upload screenshot"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Describe your error..."
            disabled={loading}
            className="neu-input flex-1 !py-2.5 text-sm disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage(input)}
            disabled={loading || (!input.trim() && !imageBase64)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-brand-600 text-white flex items-center justify-center shadow-neu-xs disabled:opacity-50 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
