"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Loader2, AlertTriangle, Mic, RotateCcw, Copy, Check } from "lucide-react";
import { sendChatMessage, loadDemoData, DEMO_USER_ID } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import Markdown from "@/components/Markdown";
import WhyChips from "@/components/WhyChips";
import MemoryTrail from "@/components/MemoryTrail";
import DecisionReplayCard from "@/components/DecisionReplayCard";

const SUGGESTIONS = [
  "Plan my week.",
  "Why did you schedule presentation work on Monday?",
  "I have a presentation next Wednesday. Start Monday or Tuesday?",
  "The presentation went really well.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm **Memora** — your AI-powered decision graph. Click **Load Demo Memory** to populate a sample graph, then ask me something like *\"Plan my week.\"*",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const response = await sendChatMessage(DEMO_USER_ID, content);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: response.answer, response },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `**Error:** ${(err as Error).message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadDemo() {
    setDemoLoading(true);
    try {
      await loadDemoData();
      setDemoLoaded(true);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "✅ **Demo memory loaded!** A sample user profile with preferences, tasks, decisions, experiences, and outcomes is now in Neo4j. Try asking **\"Plan my week.\"**",
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `**Failed to load demo:** ${(err as Error).message}`,
        },
      ]);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.05)] px-6 py-4 flex items-center justify-between bg-[rgba(12,10,8,0.8)] backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-white">Chat</h1>
            <p className="text-[11px] text-[rgba(240,235,228,0.35)]">Ask Memora about your plans & decisions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={() => setMessages([messages[0]])}
              className="flex items-center gap-1.5 rounded-lg text-[rgba(240,235,228,0.4)] text-xs px-3 py-2 hover:text-[rgba(240,235,228,0.7)] hover:bg-[rgba(255,255,255,0.05)] border border-transparent hover:border-[rgba(255,255,255,0.08)] transition-all"
            >
              <RotateCcw size={12} />
              Clear
            </button>
          )}
          <button
            onClick={handleLoadDemo}
            disabled={demoLoading || demoLoaded}
            className={`flex items-center gap-2 rounded-xl text-sm px-4 py-2 transition-all duration-200 font-medium ${
              demoLoaded
                ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                : "bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.25)] text-[#fb923c] hover:bg-[rgba(249,115,22,0.18)] hover:border-[rgba(249,115,22,0.4)]"
            } disabled:opacity-60`}
          >
            {demoLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : demoLoaded ? (
              <Check size={13} />
            ) : (
              <Sparkles size={13} />
            )}
            {demoLoaded ? "Demo Loaded" : "Load Demo Memory"}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 max-w-3xl w-full mx-auto">
        {messages.map((m, i) => (
          <div
            key={m.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i === messages.length - 1 ? 0 : 0}ms` }}
          >
            <MessageBubble message={m} />
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center gap-3 glass rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white">
                <Sparkles size={10} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[rgba(255,255,255,0.05)] px-6 py-4 bg-[rgba(12,10,8,0.6)] backdrop-blur-md">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-[rgba(249,115,22,0.18)] text-[rgba(240,235,228,0.45)] hover:text-[#fb923c] hover:border-[rgba(249,115,22,0.4)] hover:bg-[rgba(249,115,22,0.06)] transition-all duration-150 disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Tell Memora something, or ask for a plan… (Enter to send)"
                rows={1}
                className="w-full rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm outline-none resize-none text-[rgba(240,235,228,0.9)] placeholder-[rgba(240,235,228,0.25)] focus:border-[rgba(249,115,22,0.4)] focus:bg-[rgba(249,115,22,0.04)] transition-all duration-200 leading-relaxed"
                style={{ minHeight: 48 }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn-orange rounded-2xl px-4 h-12 flex items-center justify-center text-white disabled:opacity-35 disabled:shadow-none"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-[rgba(240,235,228,0.2)] text-center">
            Shift+Enter for new line · Powered by Neo4j + AI
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="group relative max-w-[78%]">
          <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm bg-gradient-to-br from-[rgba(249,115,22,0.22)] to-[rgba(234,88,12,0.15)] border border-[rgba(249,115,22,0.28)] text-[rgba(240,235,228,0.95)] shadow-[0_4px_20px_rgba(249,115,22,0.12)]">
            {message.content}
          </div>
          <button
            onClick={copyToClipboard}
            className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 text-[rgba(240,235,228,0.3)] hover:text-[rgba(240,235,228,0.7)] transition-all"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>
    );
  }

  const r = message.response;

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] w-full space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center shadow-[0_2px_12px_rgba(249,115,22,0.35)] mt-0.5">
            <Sparkles size={13} className="text-white" />
          </div>

          <div className="flex-1 space-y-3">
            {/* Main response bubble */}
            <div className="group relative rounded-2xl rounded-tl-sm glass px-4 py-3 border border-[rgba(255,255,255,0.07)] hover:border-[rgba(249,115,22,0.15)] transition-all duration-200">
              {r?.insufficientEvidence && (
                <div className="flex items-center gap-2 text-amber-400 text-xs mb-2 pb-2 border-b border-[rgba(245,158,11,0.15)]">
                  <AlertTriangle size={12} />
                  <span>Limited memory available — answer may be less accurate</span>
                </div>
              )}
              <Markdown>{message.content}</Markdown>
              {r?.why && r.why.length > 0 && <WhyChips why={r.why} />}

              {/* Copy button */}
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[rgba(240,235,228,0.3)] hover:text-[rgba(240,235,228,0.7)] transition-all"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>

            {/* Memory Trail */}
            {r?.why && r.why.length > 0 && (r.intent === "planning_request" || r.intent === "question") && (
              <MemoryTrail why={r.why} recommendation={r.answer} />
            )}

            {/* Decision Replay */}
            {r?.decisionReplay && (
              <DecisionReplayCard userId={DEMO_USER_ID} result={r.decisionReplay} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
