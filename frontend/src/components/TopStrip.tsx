"use client";

import { usePathname } from "next/navigation";

const ROUTE_META: Record<string, { section: string; label: string; index: string }> = {
  "/chat":      { section: "AGENT-MEMORY",   label: "CHAT",      index: "001" },
  "/memory":    { section: "NEO4J-NODES",    label: "MEMORY",    index: "002" },
  "/decisions": { section: "DECISION-GRAPH", label: "DECISIONS", index: "003" },
  "/timeline":  { section: "EVENT-LOG",      label: "TIMELINE",  index: "004" },
  "/graph":     { section: "LIVE-GRAPH",     label: "GRAPH",     index: "005" },
};

export default function TopStrip() {
  const pathname = usePathname();
  const meta = ROUTE_META[pathname] ?? { section: "MEMORA", label: "HOME", index: "000" };
  const date = new Date()
    .toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    .replace(" ", "'")
    .toUpperCase();

  return (
    <div
      className="h-9 shrink-0 flex items-center justify-between px-5 border-b"
      style={{
        background: "rgba(8,7,11,0.98)",
        borderColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Left — logo + brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* 2×2 grid logo mark */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1.5" fill="#8b5cf6" />
            <rect x="8" y="0.5" width="5.5" height="5.5" rx="1.5" fill="#a78bfa" opacity="0.55" />
            <rect x="0.5" y="8" width="5.5" height="5.5" rx="1.5" fill="#a78bfa" opacity="0.55" />
            <rect x="8" y="8" width="5.5" height="5.5" rx="1.5" fill="#8b5cf6" opacity="0.3" />
          </svg>
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(241,238,249,0.8)" }}
          >
            MEMORA
          </span>
        </div>

        <div className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" style={{ boxShadow: "0 0 5px #8b5cf6" }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "rgba(139,92,246,0.75)",
            }}
          >
            {meta.section}
          </span>
        </div>
      </div>

      {/* Center — faint description */}
      <div
        className="hidden md:block"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "rgba(241,238,249,0.18)",
        }}
      >
        NEO4J-BACKED · DECISION MEMORY · AI AGENT
      </div>

      {/* Right — status + breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 4px #4ade80" }} />
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "rgba(74,222,128,0.65)" }}
          >
            ONLINE
          </span>
        </div>

        <div className="h-3 w-px bg-[rgba(255,255,255,0.07)]" />

        <span
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.13em", color: "rgba(241,238,249,0.25)" }}
        >
          /S: {meta.label}
        </span>

        <div className="h-3 w-px bg-[rgba(255,255,255,0.07)]" />

        <span
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "rgba(241,238,249,0.18)" }}
        >
          /D: {date}
        </span>
      </div>
    </div>
  );
}
