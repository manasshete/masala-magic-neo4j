"use client";

import { useState } from "react";
import { MemoryNode } from "@/lib/types";
import { getMemoryDetail } from "@/lib/api";
import { ChevronDown, ChevronUp, Link2, Loader2 } from "lucide-react";

const TYPE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  preference: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" },
  task:        { color: "#fb923c", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.2)" },
  decision:    { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  reason:      { color: "#c4b5fd", bg: "rgba(196,181,253,0.08)", border: "rgba(196,181,253,0.2)" },
  outcome:     { color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)" },
  goal:        { color: "#fb7185", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.2)" },
  experience:  { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)" },
  commitment:  { color: "#2dd4bf", bg: "rgba(45,212,191,0.08)",  border: "rgba(45,212,191,0.2)" },
};

const DEFAULT_STYLE = { color: "rgba(240,235,228,0.5)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" };

export default function MemoryCard({ memory }: { memory: MemoryNode }) {
  const [expanded, setExpanded] = useState(false);
  const [related, setRelated] = useState<{ node: MemoryNode; relType: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const typeKey = (memory.type ?? "general").toLowerCase();
  const style = TYPE_STYLES[typeKey] ?? DEFAULT_STYLE;
  const confidencePct = Math.round((memory.confidence ?? 0) * 100);
  const confidenceColor =
    confidencePct >= 80 ? "#34d399" : confidencePct >= 50 ? "#fbbf24" : "#f87171";

  async function toggle() {
    setExpanded((e) => !e);
    if (!related && !expanded) {
      setLoading(true);
      try {
        const detail = await getMemoryDetail(memory.id);
        setRelated(detail.related);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div
      className="group rounded-2xl border transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden"
      style={{ borderColor: style.border, background: style.bg }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${style.color}, transparent)` }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
            style={{ color: style.color, background: `${style.color}15` }}
          >
            {memory.type ?? "general"}
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{ color: confidenceColor, borderColor: `${confidenceColor}40`, background: `${confidenceColor}10` }}
          >
            {confidencePct}%
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-[rgba(240,235,228,0.85)] leading-relaxed">{memory.content}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-[rgba(240,235,228,0.25)]">
            {new Date(memory.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button
            onClick={toggle}
            className="flex items-center gap-1 text-[11px] transition-all duration-150"
            style={{ color: expanded ? style.color : "rgba(240,235,228,0.35)" }}
          >
            <Link2 size={11} />
            Related
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {/* Related nodes */}
        {expanded && (
          <div className="mt-3 space-y-1.5 border-t pt-3 animate-fade-in" style={{ borderColor: `${style.border}` }}>
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[rgba(240,235,228,0.3)]">
                <Loader2 size={11} className="animate-spin" />
                Loading related memories…
              </div>
            )}
            {!loading && related && related.length === 0 && (
              <div className="text-xs text-[rgba(240,235,228,0.3)] italic">No related memories yet.</div>
            )}
            {!loading &&
              related?.map((r) => {
                const rStyle = TYPE_STYLES[(r.node.type ?? "").toLowerCase()] ?? DEFAULT_STYLE;
                return (
                  <div
                    key={r.node.id}
                    className="flex items-start gap-2 rounded-lg px-2.5 py-2 border"
                    style={{ background: rStyle.bg, borderColor: rStyle.border }}
                  >
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                      style={{ color: rStyle.color, background: `${rStyle.color}15` }}
                    >
                      {r.relType}
                    </span>
                    <span className="text-xs text-[rgba(240,235,228,0.7)] leading-relaxed">{r.node.content}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
