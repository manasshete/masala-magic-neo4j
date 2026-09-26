"use client";

import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { section: string; label: string; index: string }> = {
  "/":          { section: "AI INTERFACE",     label: "CHAT",      index: "001" },
  "/memory":    { section: "KNOWLEDGE BASE",   label: "MEMORY",    index: "002" },
  "/decisions": { section: "DECISION ENGINE",  label: "DECISIONS", index: "003" },
  "/timeline":  { section: "EVENT STREAM",     label: "TIMELINE",  index: "004" },
  "/graph":     { section: "GRAPH NETWORK",    label: "GRAPH",     index: "005" },
};

export default function TopBar() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? PAGE_META["/"];

  return (
    <div
      className="shrink-0 h-9 flex items-center justify-between px-5 border-b"
      style={{
        background: "rgba(8, 7, 11, 0.95)",
        borderColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Left — brand + section */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#8b5cf6" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#a78bfa" opacity="0.6" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#a78bfa" opacity="0.6" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#8b5cf6" opacity="0.35" />
          </svg>
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(241,238,249,0.85)" }}
          >
            MEMORA
          </span>
        </div>

        <div className="h-3 w-px bg-[rgba(255,255,255,0.1)]" />

        {/* Section breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] shadow-[0_0_5px_#8b5cf6]" />
          <span
            className="text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(139,92,246,0.8)" }}
          >
            {meta.section}
          </span>
        </div>
      </div>

      {/* Right — page index + status */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          {/* Neo4j status */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_#4ade80]" />
            <span
              className="text-[10px] tracking-[0.12em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(74,222,128,0.7)" }}
            >
              NEO4J CONNECTED
            </span>
          </div>

          <div className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />

          {/* Page label */}
          <span
            className="text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(241,238,249,0.25)" }}
          >
            /S: {meta.label}
          </span>

          <div className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />

          {/* Page index */}
          <span
            className="text-[10px] tracking-[0.12em]"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(241,238,249,0.2)" }}
          >
            /D: {meta.index}
          </span>
        </div>
      </div>
    </div>
  );
}
