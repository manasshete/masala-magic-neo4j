"use client";

import { useState } from "react";
import { WhyEvidence } from "@/lib/types";
import { useRouter } from "next/navigation";
import { X, ExternalLink } from "lucide-react";

const MONO = { fontFamily: "'JetBrains Mono', monospace" };

const LABEL_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Preference: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)",   border: "rgba(56,189,248,0.22)" },
  Task:       { color: "#a78bfa", bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.22)" },
  Decision:   { color: "#c4b5fd", bg: "rgba(196,181,253,0.08)",  border: "rgba(196,181,253,0.22)" },
  Reason:     { color: "#e9d5ff", bg: "rgba(233,213,255,0.06)",  border: "rgba(233,213,255,0.18)" },
  Outcome:    { color: "#34d399", bg: "rgba(52,211,153,0.08)",   border: "rgba(52,211,153,0.22)" },
  Goal:       { color: "#fb7185", bg: "rgba(251,113,133,0.08)",  border: "rgba(251,113,133,0.22)" },
  Experience: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",   border: "rgba(251,191,36,0.22)" },
  Commitment: { color: "#2dd4bf", bg: "rgba(45,212,191,0.08)",   border: "rgba(45,212,191,0.22)" },
};
const DEFAULT = { color: "rgba(241,238,249,0.5)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" };

function truncate(text: string, n: number) {
  return text.length > n ? text.slice(0, n) + "…" : text;
}

export default function WhyChips({ why }: { why: WhyEvidence[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const router = useRouter();
  if (!why || why.length === 0) return null;

  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.14em", color: "rgba(241,238,249,0.3)" }}>
          // WHY THIS ANSWER
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {why.map((w) => {
          const c = LABEL_COLORS[w.label] ?? DEFAULT;
          const isOpen = open === w.memoryId;
          return (
            <div key={w.memoryId} className="relative">
              <button
                onClick={() => setOpen(isOpen ? null : w.memoryId)}
                className="flex items-center gap-1.5 rounded-lg border press transition-all"
                style={{
                  ...MONO,
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  padding: "3px 10px",
                  background: c.bg,
                  color: c.color,
                  borderColor: c.border,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                {w.label}: {truncate(w.content, 26)}
              </button>

              {isOpen && (
                <div className="absolute z-30 mt-2 w-80 animate-spring-in" style={{ top: "100%" }}>
                  <div
                    className="rounded-2xl border overflow-hidden"
                    style={{
                      background: "rgba(13,12,18,0.95)",
                      borderColor: c.border,
                      boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3), 0 0 30px ${c.color}18`,
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Card header with grid texture */}
                    <div
                      className="relative px-4 pt-3 pb-2.5 border-b overflow-hidden"
                      style={{ background: c.bg, borderColor: "rgba(255,255,255,0.06)" }}
                    >
                      {/* Grid decoration */}
                      <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                          backgroundSize: "10px 10px",
                        }}
                      />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                          <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: c.color }}>
                            {w.label.toUpperCase()}
                          </span>
                        </div>
                        <button onClick={() => setOpen(null)} style={{ color: "rgba(241,238,249,0.3)" }}>
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="px-4 py-3 space-y-2">
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(241,238,249,0.85)" }}>{w.content}</p>
                      {w.explanation && (
                        <p className="text-xs leading-relaxed pt-2" style={{ color: "rgba(241,238,249,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          {w.explanation}
                        </p>
                      )}
                      <button
                        onClick={() => router.push(`/graph?focus=${w.memoryId}`)}
                        className="flex items-center gap-1.5 text-xs mt-1 press"
                        style={{ ...MONO, color: c.color, fontSize: 10, letterSpacing: "0.08em" }}
                      >
                        <ExternalLink size={10} /> EXPLORE IN GRAPH →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
