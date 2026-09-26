"use client";

import { WhyEvidence } from "@/lib/types";
import { ArrowDown } from "lucide-react";
import Markdown from "./Markdown";

const MONO = { fontFamily: "'JetBrains Mono', monospace" };

const ORDER: WhyEvidence["label"][] = ["Preference", "Experience", "Goal", "Task", "Reason", "Decision", "Outcome"];

const STEP_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Preference: { color: "#38bdf8", bg: "rgba(56,189,248,0.05)",   border: "rgba(56,189,248,0.18)" },
  Experience: { color: "#fbbf24", bg: "rgba(251,191,36,0.05)",   border: "rgba(251,191,36,0.18)" },
  Goal:       { color: "#fb7185", bg: "rgba(251,113,133,0.05)",  border: "rgba(251,113,133,0.18)" },
  Task:       { color: "#a78bfa", bg: "rgba(139,92,246,0.05)",   border: "rgba(139,92,246,0.18)" },
  Reason:     { color: "#c4b5fd", bg: "rgba(196,181,253,0.05)",  border: "rgba(196,181,253,0.15)" },
  Decision:   { color: "#e9d5ff", bg: "rgba(233,213,255,0.04)",  border: "rgba(233,213,255,0.12)" },
  Outcome:    { color: "#34d399", bg: "rgba(52,211,153,0.05)",   border: "rgba(52,211,153,0.18)" },
};

export default function MemoryTrail({ why, recommendation }: { why: WhyEvidence[]; recommendation: string }) {
  if (!why || why.length === 0) return null;

  const grouped = ORDER.map((label) => ({
    label,
    items: why.filter((w) => w.label === label),
  })).filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(10,9,15,0.8)",
        borderColor: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 30px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        className="relative px-4 py-2.5 border-b flex items-center justify-between overflow-hidden"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(139,92,246,0.05)" }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div className="relative flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" style={{ boxShadow: "0 0 5px #8b5cf6" }} />
          <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "rgba(167,139,250,0.7)" }}>
            MEMORY TRAIL
          </span>
        </div>
        <span
          className="relative rounded-full border px-2 py-0.5"
          style={{ ...MONO, fontSize: 9, letterSpacing: "0.1em", color: "rgba(241,238,249,0.3)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
        >
          {grouped.length} NODES
        </span>
      </div>

      <div className="p-4 space-y-1">
        {grouped.map((g, i) => {
          const s = STEP_STYLES[g.label] ?? { color: "rgba(241,238,249,0.5)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" };
          return (
            <div key={g.label} className="animate-trail-in" style={{ animationDelay: `${i * 55}ms` }}>
              <div
                className="relative rounded-xl border overflow-hidden"
                style={{ background: s.bg, borderColor: s.border }}
              >
                {/* Subtle inner grid */}
                <div
                  className="absolute inset-0 opacity-[0.025]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                    backgroundSize: "8px 8px",
                  }}
                />
                <div className="relative px-3.5 py-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.14em", color: s.color }}>
                      {g.label.toUpperCase()}
                    </span>
                  </div>
                  <ul className="space-y-0.5 pl-3.5">
                    {g.items.map((it) => (
                      <li key={it.memoryId} className="text-sm leading-relaxed" style={{ color: "rgba(241,238,249,0.8)" }}>
                        {it.content}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {i < grouped.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={12} style={{ color: "rgba(139,92,246,0.35)" }} />
                </div>
              )}
            </div>
          );
        })}

        {/* Connector */}
        <div className="flex justify-center py-1">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-px h-3" style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.3), rgba(139,92,246,0.7))" }} />
            <ArrowDown size={12} style={{ color: "#a78bfa" }} />
          </div>
        </div>

        {/* Recommendation — ACT Labs "featured card" style */}
        <div
          className="relative rounded-xl border overflow-hidden"
          style={{
            background: "rgba(139,92,246,0.08)",
            borderColor: "rgba(139,92,246,0.3)",
            boxShadow: "0 0 24px rgba(139,92,246,0.1)",
          }}
        >
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="relative px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" style={{ boxShadow: "0 0 6px #8b5cf6" }} />
              <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.14em", color: "#a78bfa" }}>
                RECOMMENDATION
              </span>
            </div>
            <Markdown>{recommendation}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
