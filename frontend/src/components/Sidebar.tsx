"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Brain, GitBranch, Clock, Network, Zap } from "lucide-react";

const NAV = [
  { href: "/", label: "Chat", icon: MessageSquare, desc: "Ask anything" },
  { href: "/memory", label: "Memory", icon: Brain, desc: "Memory nodes" },
  { href: "/decisions", label: "Decisions", icon: GitBranch, desc: "Decision history" },
  { href: "/timeline", label: "Timeline", icon: Clock, desc: "Event timeline" },
  { href: "/graph", label: "Graph", icon: Network, desc: "Visual graph" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0 border-r border-[rgba(255,255,255,0.06)] bg-[#0e0b08]">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316] to-transparent opacity-30" />

      {/* Logo */}
      <div className="px-5 pt-7 pb-5 flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.4)]">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] opacity-20 blur-sm -z-10" />
        </div>
        <div>
          <div className="text-base font-bold tracking-wider text-white">MEMORA</div>
          <div className="text-[10px] text-[rgba(240,235,228,0.35)] font-medium tracking-wide">Decision Graph AI</div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 pt-1">
        {NAV.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? "bg-[rgba(249,115,22,0.12)] text-[#fb923c] border border-[rgba(249,115,22,0.25)]"
                  : "text-[rgba(240,235,228,0.45)] hover:text-[rgba(240,235,228,0.9)] hover:bg-[rgba(255,255,255,0.04)] border border-transparent"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-[#fb923c] to-[#ea580c] rounded-r-full" />
              )}
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-[rgba(249,115,22,0.2)]"
                  : "bg-[rgba(255,255,255,0.04)] group-hover:bg-[rgba(249,115,22,0.08)]"
              }`}>
                <Icon size={15} className={active ? "text-[#fb923c]" : ""} />
              </div>
              <div>
                <div className="font-medium leading-tight">{label}</div>
                <div className="text-[10px] opacity-50 leading-tight mt-0.5">{desc}</div>
              </div>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f97316] shadow-[0_0_6px_#f97316]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[rgba(249,115,22,0.06)] border border-[rgba(249,115,22,0.12)]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
          <div className="text-[11px] text-[rgba(240,235,228,0.45)]">
            <span className="text-[rgba(240,235,228,0.7)] font-medium">Neo4j</span> connected
          </div>
        </div>
        <div className="text-[10px] text-[rgba(240,235,228,0.2)] mt-3 px-1 text-center">
          Memora v2.0 · Decision Memory AI
        </div>
      </div>
    </aside>
  );
}
