"use client";

import { useEffect, useState } from "react";
import { getMemories, getInfluentialMemories, loadDemoData, DEMO_USER_ID } from "@/lib/api";
import { MemoryNode } from "@/lib/types";
import MemoryCard from "@/components/MemoryCard";
import { Loader2, RefreshCw, TrendingUp, Sparkles, Check } from "lucide-react";
import AsciiOrbitals from "@/components/AsciiOrbitals";

const MONO = { fontFamily: "'JetBrains Mono', monospace" };

const LABEL_COLORS: Record<string, string> = {
  Fact: "#c084fc",
  Preference: "#38bdf8",
  Task: "#a78bfa",
  Commitment: "#2dd4bf",
  Decision: "#c4b5fd",
  Goal: "#fb7185",
  Outcome: "#34d399",
  Experience: "#fbbf24",
};

const SECTIONS: { label: string; key: string; color: string }[] = [
  { label: "FACTS",       key: "Fact",        color: "#c084fc" },
  { label: "PREFERENCES", key: "Preference",  color: "#38bdf8" },
  { label: "TASKS",       key: "Task",        color: "#a78bfa" },
  { label: "COMMITMENTS", key: "Commitment",  color: "#2dd4bf" },
  { label: "DECISIONS",   key: "Decision",    color: "#c4b5fd" },
  { label: "GOALS",       key: "Goal",        color: "#fb7185" },
  { label: "OUTCOMES",    key: "Outcome",     color: "#34d399" },
  { label: "EXPERIENCES", key: "Experience",  color: "#fbbf24" },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryNode[] | null>(null);
  const [influential, setInfluential] = useState<(MemoryNode & { influence: number })[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const [r, i] = await Promise.all([
        getMemories(DEMO_USER_ID),
        getInfluentialMemories(DEMO_USER_ID),
      ]);
      setMemories(r.memories);
      setInfluential(i.nodes);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLoadDemo() {
    setDemoLoading(true);
    try {
      await loadDemoData();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDemoLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="tech-chip"
            style={{ borderColor: "rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.06)", color: "rgba(167,139,250,0.7)" }}
          >
            <span className="w-1 h-1 rounded-full bg-[#8b5cf6]" />
            NEO4J-NODES
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "rgba(241,238,249,0.9)" }}>Memory</h1>
            <p style={{ ...MONO, fontSize: 10, letterSpacing: "0.1em", color: "rgba(241,238,249,0.28)", marginTop: 2 }}>
              EVERYTHING MEMORA KNOWS ABOUT YOU
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {memories && (
            <span
              className="rounded-lg border px-3 py-1.5"
              style={{ ...MONO, fontSize: 10, letterSpacing: "0.1em", color: "rgba(241,238,249,0.35)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
            >
              {memories.length} NODES
            </span>
          )}
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 border press transition-all disabled:opacity-50"
            style={{ ...MONO, fontSize: 10, letterSpacing: "0.1em", color: "rgba(241,238,249,0.4)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border px-4 py-3 mb-6" style={{ borderColor: "rgba(248,113,113,0.22)", background: "rgba(248,113,113,0.06)", color: "#f87171", ...MONO, fontSize: 11, letterSpacing: "0.08em" }}>
          ERROR: {error}
        </div>
      )}

      {/* Loading */}
      {!memories && !error && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={24} className="animate-spin" style={{ color: "rgba(139,92,246,0.5)" }} />
          <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "rgba(241,238,249,0.25)" }}>
            LOADING MEMORY GRAPH...
          </span>
        </div>
      )}

      {/* Empty with ASCII Orbitals */}
      {memories && memories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-6 text-center animate-fade-in">
          <div className="relative rounded-3xl border border-[rgba(139,92,246,0.2)] bg-[rgba(15,12,22,0.8)] backdrop-blur-xl p-8 flex flex-col items-center shadow-[0_0_50px_rgba(139,92,246,0.15)] max-w-lg w-full">
            <AsciiOrbitals width={340} height={220} />
            <div className="mt-2 space-y-1.5">
              <h3 className="text-base font-semibold text-white">No Active Memory Nodes</h3>
              <p className="text-xs text-[rgba(241,238,249,0.5)] max-w-sm mx-auto leading-relaxed">
                Initialize your personal knowledge graph in Neo4j with facts, preferences, decisions, and causal outcome links.
              </p>
            </div>
            <button
              onClick={handleLoadDemo}
              disabled={demoLoading}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#9333ea] hover:to-[#6d28d9] shadow-[0_0_20px_rgba(139,92,246,0.4)] press transition-all disabled:opacity-50"
              style={MONO}
            >
              {demoLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{demoLoading ? "INITIALIZING GRAPH..." : "LOAD DEMO MEMORY"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Most influential panel */}
      {influential && influential.length > 0 && (
        <div
          className="mb-8 rounded-2xl border overflow-hidden"
          style={{ background: "rgba(10,9,15,0.8)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}
        >
          {/* Panel header */}
          <div
            className="relative px-4 py-2.5 border-b flex items-center justify-between overflow-hidden"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(139,92,246,0.05)" }}
          >
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
            <div className="relative flex items-center gap-2">
              <TrendingUp size={12} style={{ color: "#8b5cf6" }} />
              <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "rgba(167,139,250,0.7)" }}>
                MOST INFLUENTIAL
              </span>
            </div>
            <span className="relative" style={{ ...MONO, fontSize: 9, letterSpacing: "0.1em", color: "rgba(241,238,249,0.25)" }}>
              RANKED BY PAGERANK · NEO4J GRAPH CENTRALITY
            </span>
          </div>

          <div className="p-4 space-y-2">
            {influential.map((m, i) => {
              const color = LABEL_COLORS[m.label ?? ""] ?? "rgba(241,238,249,0.4)";
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <span style={{ ...MONO, fontSize: 10, color: "rgba(241,238,249,0.2)", width: 16 }}>{i + 1}</span>
                  <span
                    className="rounded px-1.5 py-0.5 shrink-0"
                    style={{ ...MONO, fontSize: 9, letterSpacing: "0.12em", color, background: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    {(m.label ?? "").toUpperCase()}
                  </span>
                  <span className="text-sm flex-1 truncate" style={{ color: "rgba(241,238,249,0.78)" }}>{m.content}</span>
                  <div className="w-20 h-1 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(m.influence * 100)}%`, background: "linear-gradient(90deg, #6d28d9, #a78bfa)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections */}
      {memories && memories.length > 0 && (
        <div className="space-y-10">
          {SECTIONS.map(({ label, key, color }) => {
            const items = memories.filter((m) => m.label === key);
            if (items.length === 0) return null;
            return (
              <div key={key} className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-0.5 h-4 rounded-full" style={{ background: color }} />
                  <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.16em", color }}>{label}</span>
                  <span
                    className="rounded-full border px-2 py-0.5"
                    style={{ ...MONO, fontSize: 9, letterSpacing: "0.1em", color: "rgba(241,238,249,0.28)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
                  >
                    {items.length}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((m) => <MemoryCard key={m.id} memory={m} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
