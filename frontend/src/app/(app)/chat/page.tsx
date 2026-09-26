"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Sparkles,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Calendar,
  HelpCircle,
  Clock,
  TrendingUp,
  Activity,
  Cpu,
  Layers,
} from "lucide-react";
import { sendChatMessage, loadDemoData, DEMO_USER_ID } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import Markdown from "@/components/Markdown";
import WhyChips from "@/components/WhyChips";
import MemoryTrail from "@/components/MemoryTrail";
import DecisionReplayCard from "@/components/DecisionReplayCard";
import AsciiCharacter from "@/components/AsciiCharacter";

const SUGGESTIONS = [
  "Plan my week.",
  "Why did you schedule presentation work on Monday?",
  "I have a presentation next Wednesday. Start Monday or Tuesday?",
  "The presentation went really well.",
];

const STARTER_CARDS = [
  {
    icon: Calendar,
    title: "Plan My Week",
    desc: "Synthesize tasks, deep focus slots, and presentation deadlines",
    prompt: "Plan my week.",
    tag: "PLANNING",
  },
  {
    icon: HelpCircle,
    title: "Causal Explanation",
    desc: "Inspect graph paths: Why was presentation work placed on Monday?",
    prompt: "Why did you schedule presentation work on Monday?",
    tag: "REASONING",
  },
  {
    icon: Clock,
    title: "Trade-Off Analysis",
    desc: "Evaluate start day dilemma with past energy & outcome weights",
    prompt: "I have a presentation next Wednesday. Start Monday or Tuesday?",
    tag: "DECISION",
  },
  {
    icon: TrendingUp,
    title: "Log Real-World Outcome",
    desc: "Provide feedback to strengthen positive causal pathways in Neo4j",
    prompt: "The presentation went really well.",
    tag: "OUTCOME",
  },
];

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-[rgba(240,235,248,0.4)]">INITIALIZING CHAT WORKSPACE...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm **Memora** — your AI-powered decision graph companion. Ask me to plan your schedule, explain past reasoning, or record decision outcomes in Neo4j.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showHolo, setShowHolo] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-fill prompt from URL if present (e.g. from Showcase page)
  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) {
      handleSend(p);
    }
  }, [searchParams]);

  useEffect(() => {
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
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
            "✅ **Demo memory graph loaded!** Populated user profile, tasks, decision records, and outcome nodes in Neo4j. Try asking **\"Plan my week.\"**",
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
    <div className="flex flex-col h-full overflow-hidden bg-[#08070b]">
      {/* Top Application Header */}
      <header className="shrink-0 border-b border-[rgba(255,255,255,0.06)] px-6 py-3.5 flex items-center justify-between bg-[rgba(10,9,16,0.85)] backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">Memora Cognitive Chat</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] text-[#c084fc] font-mono">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-[rgba(240,235,248,0.4)] font-mono tracking-wider">
                NEO4J DECISION GRAPH // ONLINE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Agent Holo Panel */}
          <button
            onClick={() => setShowHolo(!showHolo)}
            className={`hidden lg:flex items-center gap-1.5 rounded-xl text-xs px-3 py-2 border transition-all press font-mono ${
              showHolo
                ? "bg-[rgba(139,92,246,0.15)] border-[rgba(168,85,247,0.4)] text-[#e9d5ff] shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[rgba(240,235,228,0.45)] hover:text-white"
            }`}
            title="Toggle Live ASCII Holo-Agent companion"
          >
            {showHolo ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
            <span>{showHolo ? "HOLO VISUALIZER ON" : "SHOW HOLO"}</span>
          </button>

          {messages.length > 1 && (
            <button
              onClick={() => setMessages([messages[0]])}
              className="flex items-center gap-1.5 rounded-xl text-xs px-3 py-2 text-[rgba(240,235,228,0.4)] hover:text-[rgba(240,235,228,0.8)] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)] transition-all font-mono"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={handleLoadDemo}
            disabled={demoLoading || demoLoaded}
            className={`flex items-center gap-2 rounded-xl text-xs px-3.5 py-2 press font-mono font-medium transition-all ${
              demoLoaded
                ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                : "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:from-[#9333ea] hover:to-[#6d28d9]"
            } disabled:opacity-60`}
          >
            {demoLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : demoLoaded ? (
              <Check size={12} />
            ) : (
              <Sparkles size={12} />
            )}
            <span>{demoLoaded ? "Demo Loaded" : "Load Demo Graph"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Left Chat Stream + Right Holo-Companion */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Column: Chat Conversation */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 max-w-4xl w-full mx-auto">
            {/* When Chat has only the initial welcome message, show Focused Action Starters */}
            {messages.length <= 1 && (
              <div className="py-6 space-y-6 animate-fade-in">
                {/* Cyber Assistant Greeting Header */}
                <div className="text-center space-y-2.5 max-w-xl mx-auto pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)] text-[#c084fc] text-[11px] font-mono tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
                    <span>MEMORA COGNITIVE AGENT READY</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-white">
                    What decision would you like to explore?
                  </h2>
                  <p className="text-xs text-[rgba(240,235,248,0.5)] leading-relaxed">
                    Backed by Neo4j graph relationships, causal trade-offs, and historical outcome feedback.
                  </p>
                </div>

                {/* 4 Focused Action Starter Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {STARTER_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.title}
                        onClick={() => handleSend(card.prompt)}
                        className="group cursor-pointer rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(14,12,22,0.65)] hover:bg-[rgba(22,18,36,0.85)] hover:border-[rgba(168,85,247,0.35)] p-4 transition-all duration-200 backdrop-blur-md shadow-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.12)] flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#c084fc] group-hover:text-white group-hover:bg-[#8b5cf6] transition-all shrink-0">
                            <Icon size={15} />
                          </div>
                          <span
                            className="text-[9px] px-2 py-0.5 rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[rgba(240,235,248,0.35)] group-hover:text-[#c084fc] group-hover:border-[rgba(139,92,246,0.25)] transition-all font-mono"
                          >
                            {card.tag}
                          </span>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-sm font-medium text-white group-hover:text-[#e9d5ff] transition-all">
                            {card.title}
                          </h3>
                          <p className="text-[11px] text-[rgba(240,235,248,0.45)] mt-1 leading-relaxed">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((m) => (
              <div key={m.id} className="animate-fade-in-up">
                <MessageBubble message={m} />
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm px-4 py-3 border border-[rgba(139,92,246,0.3)] bg-[rgba(16,13,26,0.85)] backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white">
                    <Sparkles size={12} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                    <div className="text-[9px] font-mono tracking-wider text-[#c084fc] uppercase">
                      Traversing causal graph pathways...
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Bottom Fixed Input Dock */}
          <div className="shrink-0 border-t border-[rgba(255,255,255,0.06)] px-4 md:px-8 py-3.5 bg-[rgba(10,9,16,0.85)] backdrop-blur-xl">
            <div className="max-w-4xl mx-auto space-y-2.5">
              {/* Quick suggestion prompt chips */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] text-[rgba(240,235,248,0.55)] hover:text-[#e9d5ff] hover:border-[rgba(168,85,247,0.45)] hover:bg-[rgba(139,92,246,0.15)] press transition-all disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Text Input Row */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      autoResize();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Tell Memora a decision or ask for schedule reasoning… (Enter to send)"
                    rows={1}
                    className="w-full rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm outline-none resize-none text-[rgba(245,240,255,0.92)] placeholder-[rgba(240,235,248,0.3)] focus:border-[rgba(168,85,247,0.5)] focus:bg-[rgba(139,92,246,0.06)] transition-all duration-200 leading-relaxed shadow-inner"
                    style={{ minHeight: 48 }}
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="btn-primary rounded-2xl px-4 h-12 flex items-center justify-center text-white disabled:opacity-35 disabled:shadow-none transition-all"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[rgba(240,235,248,0.25)] font-mono">
                <span>SHIFT + ENTER FOR NEW LINE</span>
                <span>CYPHER GRAPH · AI CAUSAL REASONING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dedicated Live Holographic ASCII Companion */}
        {showHolo && (
          <aside className="w-80 shrink-0 border-l border-[rgba(255,255,255,0.06)] bg-[rgba(11,9,18,0.7)] backdrop-blur-xl flex flex-col hidden lg:flex select-none">
            {/* Visualizer Header */}
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-[rgba(139,92,246,0.04)]">
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-[#a855f7]" />
                <span className="text-[11px] font-mono font-medium tracking-wider text-[rgba(245,240,255,0.85)]">
                  AGENT VISUALIZER
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                <span className="text-[9px] font-mono tracking-wider text-[rgba(240,235,248,0.4)]">
                  {loading ? "PROCESSING" : "LIVE"}
                </span>
              </div>
            </div>

            {/* The Moving ASCII Hologram Character */}
            <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <div className="scale-90 origin-center">
                <AsciiCharacter width={280} height={340} />
              </div>

              {/* Status HUD readout below character */}
              <div className="w-full mt-1 space-y-2 p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,12,24,0.7)]">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[rgba(240,235,248,0.4)]">COGNITIVE STATE</span>
                  <span className={`font-semibold ${loading ? "text-amber-300 animate-pulse" : "text-[#c084fc]"}`}>
                    {loading ? "TRAVERSING GRAPH" : "AWAITING INPUT"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[rgba(240,235,248,0.4)]">ACTIVE NODES</span>
                  <span className="text-[rgba(245,240,255,0.7)]">14 GRAPH PATHS</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[rgba(240,235,248,0.4)]">PAGERANK CENTRALITY</span>
                  <span className="text-emerald-400">0.92 STABLE</span>
                </div>

                {/* Subtle telemetry waveform */}
                <div className="pt-1.5 border-t border-[rgba(255,255,255,0.05)] text-[9px] font-mono text-[rgba(168,85,247,0.6)] truncate">
                  {loading ? ">>> [CYPHER] MATCH (u)-[r]->(d) RETURN r" : "// MEMORA v2.4 HOLO FEED STABLE"}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ─── Message Bubble ─────────────────────────────────────────────────────── */
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
        <div className="group relative max-w-[80%]">
          <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm bg-gradient-to-br from-[rgba(139,92,246,0.25)] to-[rgba(109,40,217,0.18)] border border-[rgba(139,92,246,0.35)] text-[rgba(245,240,255,0.95)] shadow-[0_4px_20px_rgba(139,92,246,0.15)] leading-relaxed">
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
      <div className="max-w-[92%] w-full space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center shadow-[0_2px_12px_rgba(139,92,246,0.4)] mt-0.5 text-white">
            <Sparkles size={13} />
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            {/* Main response card */}
            <div className="group relative rounded-2xl rounded-tl-sm border border-[rgba(255,255,255,0.07)] bg-[rgba(14,12,22,0.75)] backdrop-blur-xl px-5 py-4 hover:border-[rgba(139,92,246,0.25)] transition-all shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              {/* Corner grid texture decoration */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-tr-2xl overflow-hidden pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />

              {r?.insufficientEvidence && (
                <div className="flex items-center gap-2 text-amber-400 text-xs mb-2.5 pb-2 border-b border-[rgba(245,158,11,0.15)] font-mono">
                  <AlertTriangle size={12} />
                  <span>Limited memory available — answer may be approximate</span>
                </div>
              )}

              <Markdown>{message.content}</Markdown>
              {r?.why && r.why.length > 0 && <WhyChips why={r.why} />}

              {/* Copy button */}
              <button
                onClick={copyToClipboard}
                className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 text-[rgba(240,235,228,0.3)] hover:text-[rgba(240,235,228,0.7)] transition-all"
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
