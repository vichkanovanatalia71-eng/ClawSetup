"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
];

export default function AIAssistant({ stepId }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function sendMessage(message: string, quickAction?: string) {
    if (!message.trim() && !quickAction) return;

    setError("");
    setLoading(true);

    const userMsg: ChatMessage = {
      role: "user",
      content: quickAction
        ? `[${quickActions.find((a) => a.id === quickAction)?.label}]`
        : message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to get response");
        setLoading(false);
        return;
      }

      const aiMsg: ChatMessage = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Clear image after sending
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
    <div className="w-80 flex-shrink-0 border-l border-gray-200 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">AI Assistant</h3>
        <p className="text-xs text-gray-500 mt-1">
          Ask about this step or upload a screenshot of an error
        </p>
      </div>

      {/* Quick actions */}
      <div className="p-3 border-b border-gray-100 flex flex-wrap gap-1.5">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => sendMessage("", action.id)}
            disabled={loading}
            className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium hover:bg-brand-100 transition disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>Paste an error message or upload a screenshot to get help with this step.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${
              msg.role === "user" ? "ml-4" : "mr-4"
            }`}
          >
            <div
              className={`rounded-lg p-3 text-sm ${
                msg.role === "user"
                  ? "bg-brand-50 text-brand-900"
                  : "bg-gray-50 text-gray-800"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-brand-500 rounded-full" />
            Analyzing...
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="h-16 rounded border"
            />
            <button
              onClick={() => {
                setImagePreview(null);
                setImageBase64(null);
                setImageMimeType(null);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            title="Upload screenshot"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
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
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || (!input.trim() && !imageBase64)}
            className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
