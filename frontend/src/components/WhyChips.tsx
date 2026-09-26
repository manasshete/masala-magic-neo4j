"use client";

import { useState } from "react";
import { WhyEvidence } from "@/lib/types";
import { useRouter } from "next/navigation";
import { HelpCircle, X, ExternalLink, Cpu } from "lucide-react";

const LABEL_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Preference: { bg: "rgba(56,189,248,0.08)", text: "#38bdf8", border: "rgba(56,189,248,0.25)", dot: "#38bdf8" },
  Task:       { bg: "rgba(249,115,22,0.08)", text: "#fb923c", border: "rgba(249,115,22,0.25)", dot: "#f97316" },
  Decision:   { bg: "rgba(167,139,250,0.08)", text: "#a78bfa", border: "rgba(167,139,250,0.25)", dot: "#a78bfa" },
  Reason:     { bg: "rgba(196,181,253,0.08)", text: "#c4b5fd", border: "rgba(196,181,253,0.25)", dot: "#c4b5fd" },
  Outcome:    { bg: "rgba(52,211,153,0.08)", text: "#34d399", border: "rgba(52,211,153,0.25)", dot: "#34d399" },
  Goal:       { bg: "rgba(251,113,133,0.08)", text: "#fb7185", border: "rgba(251,113,133,0.25)", dot: "#fb7185" },
  Experience: { bg: "rgba(251,191,36,0.08)", text: "#fbbf24", border: "rgba(251,191,36,0.25)", dot: "#fbbf24" },
  Commitment: { bg: "rgba(45,212,191,0.08)", text: "#2dd4bf", border: "rgba(45,212,191,0.25)", dot: "#2dd4bf" },
  Fact:       { bg: "rgba(192,132,252,0.08)", text: "#c084fc", border: "rgba(192,132,252,0.25)", dot: "#c084fc" },
};

const DEFAULT_COLOR = { bg: "rgba(255,255,255,0.05)", text: "rgba(240,235,228,0.6)", border: "rgba(255,255,255,0.12)", dot: "rgba(240,235,228,0.4)" };

function truncate(text: string, n: number) {
  return text.length > n ? text.slice(0, n) + "…" : text;
}

export default function WhyChips({ why }: { why: WhyEvidence[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const router = useRouter();

  if (!why || why.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-1.5 text-[11px] text-[rgba(240,235,228,0.35)] mb-2">
        <HelpCircle size={11} />
        <span className="tracking-wide">WHY THIS ANSWER</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {why.map((w) => {
          const c = LABEL_COLORS[w.label] ?? DEFAULT_COLOR;
          const isOpen = open === w.memoryId;
          return (
            <div key={w.memoryId} className="relative">
              <button
                onClick={() => setOpen(isOpen ? null : w.memoryId)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150 hover:opacity-90"
                style={{
                  background: c.bg,
                  color: c.text,
                  borderColor: c.border,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
                <span className="font-medium">{w.label}:</span>
                <span className="opacity-80">{truncate(w.content, 28)}</span>
              </button>

              {isOpen && (
                <div className="absolute z-30 mt-2 w-80 animate-fade-in-up"
                  style={{ bottom: "auto", top: "100%" }}
                >
                  <div className="rounded-2xl border bg-[#131008] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(249,115,22,0.1)] overflow-hidden"
                    style={{ borderColor: c.border }}
                  >
                    {/* Header */}
                    <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)]"
                      style={{ background: c.bg }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                        <span className="text-xs font-semibold" style={{ color: c.text }}>{w.label}</span>
                      </div>
                      <button onClick={() => setOpen(null)} className="text-[rgba(240,235,228,0.3)] hover:text-[rgba(240,235,228,0.7)] transition-colors">
                        <X size={12} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-sm text-[rgba(240,235,228,0.85)] leading-relaxed">{w.content}</p>
                      {w.explanation && (
                        <p className="text-xs text-[rgba(240,235,228,0.4)] leading-relaxed border-t border-[rgba(255,255,255,0.05)] pt-2">
                          {w.explanation}
                        </p>
                      )}
                      <button
                        onClick={() => router.push(`/graph?focus=${w.memoryId}`)}
                        className="flex items-center gap-1.5 text-xs font-medium mt-1 transition-colors"
                        style={{ color: c.text }}
                      >
                        <ExternalLink size={11} />
                        Explore in Graph
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
