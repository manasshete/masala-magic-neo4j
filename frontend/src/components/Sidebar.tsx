"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Brain, GitBranch, Calendar, Network, Sparkles } from "lucide-react";

const NAV = [
  { href: "/chat",      label: "Chat",      icon: MessageSquare, code: "01" },
  { href: "/overview",  label: "Showcase",  icon: Sparkles,      code: "02" },
  { href: "/memory",    label: "Memory",    icon: Brain,         code: "03" },
  { href: "/decisions", label: "Decisions", icon: GitBranch,     code: "04" },
  { href: "/timeline",  label: "Calendar",  icon: Calendar,      code: "05" },
  { href: "/graph",     label: "Graph",     icon: Network,       code: "06" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 flex flex-col border-r"
      style={{
        background: "rgba(8,7,11,0.9)",
        borderColor: "rgba(255,255,255,0.06)",
        height: "calc(100vh - 36px)",
      }}
    >
      {/* Nav items */}
      <nav className="flex-1 px-2 pt-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, code }) => {
          const active = pathname === href || (href === "/chat" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: active ? "rgba(139,92,246,0.1)" : "transparent",
                border: `1px solid ${active ? "rgba(139,92,246,0.22)" : "transparent"}`,
              }}
            >
              {/* Active left rule */}
              {active && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "linear-gradient(to bottom, #a78bfa, #6d28d9)" }}
                />
              )}

              {/* Icon box */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  background: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <Icon
                  size={13}
                  style={{ color: active ? "#a78bfa" : "rgba(241,238,249,0.35)" }}
                />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-medium leading-tight"
                  style={{ color: active ? "#e9d5ff" : "rgba(241,238,249,0.45)" }}
                >
                  {label}
                </div>
              </div>

              {/* Code number */}
              <span
                className="text-[9px] tracking-[0.1em]"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: active ? "rgba(167,139,250,0.5)" : "rgba(241,238,249,0.15)",
                }}
              >
                {code}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div
          className="rounded-xl px-3 py-2.5 border"
          style={{
            background: "rgba(139,92,246,0.05)",
            borderColor: "rgba(139,92,246,0.15)",
          }}
        >
          {/* Grid pattern decoration */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] tracking-[0.14em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(167,139,250,0.5)" }}
            >
              SYS STATUS
            </span>
            <span
              className="text-[9px]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(241,238,249,0.15)" }}
            >
              v2.0
            </span>
          </div>
          <div className="space-y-1.5">
            <StatusRow label="NEO4J DB" status="ONLINE" ok />
            <StatusRow label="AI ENGINE" status="READY" ok />
            <StatusRow label="GRAPH IDX" status="SYNCED" ok />
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatusRow({ label, status, ok }: { label: string; status: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[9px] tracking-[0.1em]"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(241,238,249,0.25)" }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span
          className="w-1 h-1 rounded-full"
          style={{ background: ok ? "#4ade80" : "#f87171", boxShadow: ok ? "0 0 4px #4ade80" : "0 0 4px #f87171" }}
        />
        <span
          className="text-[9px] tracking-[0.1em]"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: ok ? "rgba(74,222,128,0.6)" : "rgba(248,113,113,0.6)" }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
