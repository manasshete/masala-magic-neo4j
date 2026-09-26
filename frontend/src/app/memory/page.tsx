"use client";

import { useEffect, useState } from "react";
import { getMemories, getInfluentialMemories, DEMO_USER_ID } from "@/lib/api";
import { MemoryNode } from "@/lib/types";
import MemoryCard from "@/components/MemoryCard";
import { Loader2, Brain, RefreshCw, Sparkles } from "lucide-react";

const LABEL_COLORS: Record<string, string> = {
  Fact: "#c084fc",
  Preference: "#38bdf8",
  Task: "#fb923c",
  Commitment: "#2dd4bf",
  Decision: "#a78bfa",
  Goal: "#fb7185",
  Outcome: "#34d399",
  Experience: "#fbbf24",
};

const SECTIONS: { label: string; key: string; color: string }[] = [
  { label: "Facts", key: "Fact", color: "#c084fc" },
  { label: "Preferences", key: "Preference", color: "#38bdf8" },
  { label: "Tasks",       key: "Task",        color: "#fb923c" },
  { label: "Commitments", key: "Commitment",  color: "#2dd4bf" },
  { label: "Decisions",   key: "Decision",    color: "#a78bfa" },
  { label: "Goals",       key: "Goal",        color: "#fb7185" },
  { label: "Outcomes",    key: "Outcome",     color: "#34d399" },
  { label: "Experiences", key: "Experience",  color: "#fbbf24" },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryNode[] | null>(null);
  const [influential, setInfluential] = useState<(MemoryNode & { influence: number })[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { load(); }, []);

  const totalCount = memories?.length ?? 0;

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(249,115,22,0.2)] to-[rgba(234,88,12,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center">
            <Brain size={18} className="text-[#fb923c]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Memory</h1>
            <p className="text-xs text-[rgba(240,235,228,0.35)] mt-0.5">
              Everything Memora knows about you
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {memories && (
            <div className="text-xs text-[rgba(240,235,228,0.35)] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-lg">
              {totalCount} memories
            </div>
          )}
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[rgba(240,235,228,0.45)] hover:text-[rgba(240,235,228,0.8)] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-lg hover:border-[rgba(249,115,22,0.25)] transition-all"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* States */}
      {error && (
        <div className="rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.07)] px-4 py-3 text-sm text-[#f87171] mb-6">
          {error}
        </div>
      )}

      {!memories && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={28} className="animate-spin text-[#fb923c] opacity-60" />
          <p className="text-sm text-[rgba(240,235,228,0.35)]">Loading memories…</p>
        </div>
      )}

      {memories && memories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(249,115,22,0.08)] border border-[rgba(249,115,22,0.15)] flex items-center justify-center">
            <Brain size={28} className="text-[rgba(249,115,22,0.4)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[rgba(240,235,228,0.6)]">No memories yet</p>
            <p className="text-xs text-[rgba(240,235,228,0.3)] mt-1 max-w-xs">
              Go to Chat and click &ldquo;Load Demo Memory&rdquo;, or tell Memora about a preference, task, or decision.
            </p>
          </div>
        </div>
      )}

      {/* Most influential */}
      {influential && influential.length > 0 && (
        <div className="mb-8 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-[#fb923c]" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgba(240,235,228,0.6)]">
              Most influential
            </h2>
            <span className="text-[10px] text-[rgba(240,235,228,0.25)]">
              ranked by graph centrality (PageRank)
            </span>
          </div>
          <div className="space-y-2">
            {influential.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-xs text-[rgba(240,235,228,0.25)] w-4">{i + 1}</span>
                <span
                  className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-white/10 shrink-0"
                  style={{ color: LABEL_COLORS[m.label ?? ""] ?? "#94a3b8" }}
                >
                  {m.label}
                </span>
                <span className="text-sm text-[rgba(240,235,228,0.8)] truncate flex-1">
                  {m.content}
                </span>
                <div className="w-20 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c]"
                    style={{ width: `${Math.round(m.influence * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {memories && memories.length > 0 && (
        <div className="space-y-8">
          {SECTIONS.map(({ label, key, color }) => {
            const items = memories.filter((m) => m.label === key);
            if (items.length === 0) return null;
            return (
              <div key={key} className="animate-fade-in-up">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-5 rounded-full" style={{ background: color }} />
                  <h2 className="text-sm font-semibold" style={{ color }}>
                    {label}
                  </h2>
                  <span className="text-xs text-[rgba(240,235,228,0.25)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.06)]">
                    {items.length}
                  </span>
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.05)]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((m) => (
                    <MemoryCard key={m.id} memory={m} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
