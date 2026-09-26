"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { getGraph, getMemoryDetail, DEMO_USER_ID } from "@/lib/api";
import { GraphData, MemoryNode } from "@/lib/types";
import { Loader2, X } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type GraphNode = MemoryNode & { label: string };

const LABEL_COLORS: Record<string, string> = {
  User: "#f5f5f5",
  Preference: "#38bdf8",
  Task: "#fbbf24",
  Decision: "#818cf8",
  Reason: "#a78bfa",
  Outcome: "#34d399",
  Goal: "#f472b6",
  Experience: "#fb923c",
  Commitment: "#2dd4bf",
  Fact: "#c084fc",
};

export default function GraphPage() {
  return (
    <Suspense fallback={null}>
      <GraphPageInner />
    </Suspense>
  );
}

function GraphPageInner() {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    node: GraphNode;
    related: { node: MemoryNode; relType: string; direction: string }[];
  } | null>(null);
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  useEffect(() => {
    getGraph(DEMO_USER_ID)
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const openNode = useCallback(async (id: string) => {
    const detail = await getMemoryDetail(id);
    setSelected({ node: detail.memory as GraphNode, related: detail.related });
  }, []);

  useEffect(() => {
    if (!focusId || !data) return;
    void Promise.resolve().then(() => openNode(focusId));
  }, [focusId, data, openNode]);

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4">
        <h1 className="text-lg font-semibold">Memory Graph</h1>
        <p className="text-xs text-white/40">
          Live from Neo4j. Click a node to inspect its details and relationships.
        </p>
      </header>

      <div className="relative flex-1">
        {error && <div className="p-6 text-rose-300 text-sm">{error}</div>}
        {!data && !error && (
          <div className="p-6 flex items-center gap-2 text-white/40 text-sm">
            <Loader2 size={14} className="animate-spin" /> Loading graph…
          </div>
        )}
        {data && data.nodes.length === 0 && (
          <div className="p-6 text-white/40 text-sm">
            No graph data yet. Load demo memory or chat with Memora first.
          </div>
        )}
        {data && data.nodes.length > 0 && (
          <ForceGraph2D
            graphData={{
              nodes: data.nodes.map((n) => ({ ...n })),
              links: data.links.map((l) => ({ ...l })),
            }}
            backgroundColor="#0a0a0f"
            nodeLabel={(n: object) => {
              const node = n as GraphNode;
              return `${node.label}: ${node.content ?? node.id}`;
            }}
            nodeColor={(n: object) => {
              const node = n as GraphNode;
              return node.id === focusId ? "#ffffff" : LABEL_COLORS[node.label] ?? "#94a3b8";
            }}
            nodeVal={(n: object) => {
              const node = n as GraphNode;
              return 1 + (node.influence ?? 0) * 8;
            }}
            nodeRelSize={5}
            linkColor={() => "rgba(255,255,255,0.15)"}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            linkLabel={(l: object) => (l as { type: string }).type}
            onNodeClick={(n: object) => openNode((n as GraphNode).id)}
          />
        )}

        {selected && (
          <div className="absolute top-4 right-4 w-80 rounded-xl border border-white/10 bg-[#0f0f17] p-4 shadow-xl">
            <div className="flex items-start justify-between mb-2">
              <span
                className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-white/10"
                style={{ color: LABEL_COLORS[selected.node.label] ?? "#94a3b8" }}
              >
                {selected.node.label ?? "Memory"}
              </span>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="text-sm text-white/90 mb-3">{selected.node.content}</div>
            {typeof selected.node.confidence === "number" && (
              <div className="text-xs text-white/40 mb-1">
                Confidence: {Math.round(selected.node.confidence * 100)}%
              </div>
            )}
            {typeof selected.node.influence === "number" && (
              <div className="text-xs text-white/40 mb-3">
                Influence: {Math.round(selected.node.influence * 100)}%
              </div>
            )}
            <div className="text-[11px] uppercase tracking-wide text-white/40 mb-1">
              Relationships
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {selected.related.length === 0 && (
                <div className="text-xs text-white/30">No connections.</div>
              )}
              {selected.related.map((r) => (
                <button
                  key={r.node.id}
                  onClick={() => openNode(r.node.id)}
                  className="block w-full text-left text-xs text-white/60 hover:text-white"
                >
                  <span className="text-white/30">
                    {r.direction === "out" ? "→" : "←"} {r.relType}
                  </span>{" "}
                  {r.node.content}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
