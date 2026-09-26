"use client";

import { WhyEvidence } from "@/lib/types";
import { ArrowDown, Sparkles, Layers } from "lucide-react";
import Markdown from "@/components/Markdown";

const ORDER: WhyEvidence["label"][] = [
  "Fact",
  "Preference",
  "Experience",
  "Goal",
  "Task",
  "Reason",
  "Decision",
  "Outcome",
];

const STEP_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Fact:       { color: "#c084fc", bg: "rgba(192,132,252,0.06)", border: "rgba(192,132,252,0.2)" },
  Preference: { color: "#38bdf8", bg: "rgba(56,189,248,0.06)", border: "rgba(56,189,248,0.2)" },
  Experience: { color: "#fbbf24", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)" },
  Goal:       { color: "#fb7185", bg: "rgba(251,113,133,0.06)", border: "rgba(251,113,133,0.2)" },
  Task:       { color: "#fb923c", bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.2)" },
  Reason:     { color: "#c4b5fd", bg: "rgba(196,181,253,0.06)", border: "rgba(196,181,253,0.2)" },
  Decision:   { color: "#a78bfa", bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.2)" },
  Outcome:    { color: "#34d399", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.2)" },
};

export default function MemoryTrail({
  why,
  recommendation,
}: {
  why: WhyEvidence[];
  recommendation: string;
}) {
  if (!why || why.length === 0) return null;

  const grouped = ORDER.map((label) => ({
    label,
    items: why.filter((w) => w.label === label),
  })).filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,10,8,0.7)] overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[rgba(249,115,22,0.12)] flex items-center justify-center">
          <Layers size={12} className="text-[#fb923c]" />
        </div>
        <span className="text-xs font-semibold tracking-widest text-[rgba(240,235,228,0.4)]">MEMORY TRAIL</span>
        <div className="ml-auto text-[10px] text-[rgba(240,235,228,0.25)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.06)]">
          {grouped.length} steps
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-1">
        {grouped.map((g, i) => {
          const style = STEP_STYLES[g.label] ?? {
            color: "rgba(240,235,228,0.6)",
            bg: "rgba(255,255,255,0.03)",
            border: "rgba(255,255,255,0.1)",
          };
          return (
            <div key={g.label} className="animate-trail-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div
                className="rounded-xl px-3.5 py-2.5 border"
                style={{ background: style.bg, borderColor: style.border }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                    style={{ color: style.color, background: `${style.bg}` }}
                  >
                    {g.label}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {g.items.map((it) => (
                    <li key={it.memoryId} className="text-sm text-[rgba(240,235,228,0.8)] leading-relaxed">
                      {it.content}
                    </li>
                  ))}
                </ul>
              </div>

              {i < grouped.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={12} className="text-[rgba(249,115,22,0.3)]" />
                </div>
              )}
            </div>
          );
        })}

        {/* Connector to recommendation */}
        <div className="flex justify-center py-1">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-px h-3 bg-gradient-to-b from-[rgba(249,115,22,0.3)] to-[rgba(249,115,22,0.6)]" />
            <ArrowDown size={12} className="text-[#fb923c]" />
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-xl border border-[rgba(249,115,22,0.3)] bg-gradient-to-br from-[rgba(249,115,22,0.1)] to-[rgba(234,88,12,0.06)] px-4 py-3 shadow-[0_0_20px_rgba(249,115,22,0.08)]">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={11} className="text-[#fb923c]" />
            <span className="text-[10px] font-bold tracking-widest text-[#fb923c] uppercase">Recommendation</span>
          </div>
          <div className="text-sm text-[rgba(240,235,228,0.9)] leading-relaxed font-medium">
            <Markdown>{recommendation}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
