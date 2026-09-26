"use client";

import { useEffect, useState } from "react";
import { getMemories, DEMO_USER_ID } from "@/lib/api";
import { MemoryNode } from "@/lib/types";
import { Loader2 } from "lucide-react";

const DOT_COLORS: Record<string, string> = {
  Decision: "bg-indigo-400",
  Outcome: "bg-emerald-400",
  Experience: "bg-orange-400",
  Task: "bg-amber-400",
  Preference: "bg-sky-400",
  Goal: "bg-pink-400",
  Commitment: "bg-teal-400",
  Reason: "bg-violet-400",
};

export default function TimelinePage() {
  const [memories, setMemories] = useState<MemoryNode[] | null>(null);

  useEffect(() => {
    getMemories(DEMO_USER_ID).then((r) =>
      setMemories(
        [...r.memories].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )
    );
  }, []);

  return (
    <div className="px-8 py-6 max-w-2xl">
      <h1 className="text-lg font-semibold mb-1">Timeline</h1>
      <p className="text-xs text-white/40 mb-6">
        A chronological view of everything Memora has learned and observed.
      </p>

      {!memories && (
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      )}

      {memories && memories.length === 0 && (
        <div className="text-white/40 text-sm">Nothing recorded yet.</div>
      )}

      <div className="relative pl-5">
        {memories && memories.length > 0 && (
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
        )}
        <div className="space-y-5">
          {memories?.map((m) => (
            <div key={m.id} className="relative">
              <div
                className={`absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full ${
                  DOT_COLORS[m.label ?? ""] ?? "bg-white/40"
                }`}
              />
              <div className="text-[10px] uppercase tracking-wide text-white/40">
                {m.label} · {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className="text-sm text-white/85 mt-0.5">{m.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
