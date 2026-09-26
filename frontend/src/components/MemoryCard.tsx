"use client";

import { useState } from "react";
import { MemoryNode } from "@/lib/types";
import { getMemoryDetail } from "@/lib/api";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const MONO = { fontFamily: "'JetBrains Mono', monospace" };

const TYPE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  preference: { color: "#38bdf8", bg: "rgba(56,189,248,0.06)",   border: "rgba(56,189,248,0.18)" },
  task:        { color: "#a78bfa", bg: "rgba(139,92,246,0.06)",  border: "rgba(139,92,246,0.18)" },
  decision:    { color: "#c4b5fd", bg: "rgba(196,181,253,0.06)", border: "rgba(196,181,253,0.18)" },
  reason:      { color: "#e9d5ff", bg: "rgba(233,213,255,0.04)", border: "rgba(233,213,255,0.12)" },
  outcome:     { color: "#34d399", bg: "rgba(52,211,153,0.06)",  border: "rgba(52,211,153,0.18)" },
  goal:        { color: "#fb7185", bg: "rgba(251,113,133,0.06)", border: "rgba(251,113,133,0.18)" },
  experience:  { color: "#fbbf24", bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.18)" },
  commitment:  { color: "#2dd4bf", bg: "rgba(45,212,191,0.06)",  border: "rgba(45,212,191,0.18)" },
};
const DEFAULT_STYLE = { color: "rgba(241,238,249,0.45)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" };

export default function MemoryCard({ memory }: { memory: MemoryNode }) {
  const [expanded, setExpanded] = useState(false);
  const [related, setRelated] = useState<{ node: MemoryNode; relType: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const typeKey = (memory.type ?? "general").toLowerCase();
  const s = TYPE_STYLES[typeKey] ?? DEFAULT_STYLE;
  const pct = Math.round((memory.confidence ?? 0) * 100);
  const pctColor = pct >= 80 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#f87171";

  async function toggle() {
    setExpanded(e => !e);
    if (!related && !expanded) {
      setLoading(true);
      try { const d = await getMemoryDetail(memory.id); setRelated(d.related); }
      finally { setLoading(false); }
    }
  }

  return (
    <div
      className="relative rounded-2xl border overflow-hidden press transition-all duration-200"
      style={{
        background: "rgba(10,9,15,0.85)",
        borderColor: s.border,
        backdropFilter: "blur(16px)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3)`,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3), 0 0 20px ${s.color}10`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3)`; }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${s.color}, transparent 60%)` }} />

      {/* Corner grid decoration */}
      <div
        className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none"
        style={{ opacity: 0.04 }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="rounded-md px-2 py-0.5"
            style={{ ...MONO, fontSize: 9, letterSpacing: "0.14em", color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
          >
            {(memory.type ?? "GENERAL").toUpperCase()}
          </span>
          <span
            className="rounded-full border px-2 py-0.5"
            style={{ ...MONO, fontSize: 9, letterSpacing: "0.08em", color: pctColor, borderColor: `${pctColor}40`, background: `${pctColor}10` }}
          >
            {pct}%
          </span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed" style={{ color: "rgba(241,238,249,0.85)" }}>{memory.content}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.08em", color: "rgba(241,238,249,0.22)" }}>
            {new Date(memory.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
          </span>
          <button
            onClick={toggle}
            className="flex items-center gap-1 press transition-all"
            style={{ ...MONO, fontSize: 9, letterSpacing: "0.1em", color: expanded ? s.color : "rgba(241,238,249,0.28)" }}
          >
            RELATED {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>

        {/* Related nodes */}
        {expanded && (
          <div className="mt-3 pt-3 space-y-1.5 border-t animate-fade-in" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {loading && (
              <div className="flex items-center gap-2" style={{ ...MONO, fontSize: 10, color: "rgba(241,238,249,0.3)" }}>
                <Loader2 size={11} className="animate-spin" /> LOADING...
              </div>
            )}
            {!loading && related && related.length === 0 && (
              <p style={{ ...MONO, fontSize: 10, color: "rgba(241,238,249,0.25)" }}>NO RELATED NODES</p>
            )}
            {!loading && related?.map((r) => {
              const rs = TYPE_STYLES[(r.node.type ?? "").toLowerCase()] ?? DEFAULT_STYLE;
              return (
                <div
                  key={r.node.id}
                  className="flex items-start gap-2 rounded-lg px-2.5 py-2 border"
                  style={{ background: rs.bg, borderColor: rs.border }}
                >
                  <span
                    className="rounded px-1.5 py-0.5 shrink-0 mt-0.5"
                    style={{ ...MONO, fontSize: 8, letterSpacing: "0.12em", color: rs.color, background: `${rs.color}15` }}
                  >
                    {r.relType.toUpperCase()}
                  </span>
                  <span className="text-xs leading-relaxed" style={{ color: "rgba(241,238,249,0.65)" }}>{r.node.content}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
