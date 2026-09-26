"use client";

import { useState } from "react";
import { replayDecision, DEMO_USER_ID } from "@/lib/api";
import { DecisionReplayResult } from "@/lib/types";
import DecisionReplayCard from "@/components/DecisionReplayCard";
import { Loader2, Send, GitBranch } from "lucide-react";

export default function DecisionsPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<DecisionReplayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(q?: string) {
    const query = (q ?? question).trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const r = await replayDecision(DEMO_USER_ID, query);
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-8 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(167,139,250,0.2)] to-[rgba(124,58,237,0.1)] border border-[rgba(167,139,250,0.2)] flex items-center justify-center">
          <GitBranch size={18} className="text-[#a78bfa]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Decision Replay</h1>
            <span className="tech-chip">/ decision-graph</span>
          </div>
          <p className="text-xs text-[rgba(240,235,228,0.35)] mt-0.5">
            Ask a decision-support question — Memora searches past decisions, reasons and outcomes
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-3 mt-6">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Should I take this internship?"
          className="flex-1 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm outline-none text-[rgba(240,235,228,0.9)] placeholder-[rgba(240,235,228,0.25)] focus:border-[rgba(167,139,250,0.4)] focus:bg-[rgba(167,139,250,0.04)] transition-all duration-300"
        />
        <button
          onClick={() => run()}
          disabled={loading || !question.trim()}
          className="rounded-2xl px-4 flex items-center justify-center text-white press disabled:opacity-35"
          style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", boxShadow: "0 4px 15px rgba(167,139,250,0.35)" }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "Should I take this internship?",
          "I have another presentation next Wednesday. Should I start Monday or Tuesday?",
        ].map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              run(s);
            }}
            className="text-xs px-3 py-1.5 rounded-full border border-[rgba(167,139,250,0.18)] text-[rgba(240,235,228,0.45)] hover:text-[#a78bfa] hover:border-[rgba(167,139,250,0.4)] hover:bg-[rgba(167,139,250,0.06)] press"
          >
            {s}
          </button>
        ))}
      </div>

      {loading && !result && (
        <div className="flex items-center gap-2 text-sm text-[rgba(240,235,228,0.4)] mb-4 animate-fade-in">
          <Loader2 size={14} className="animate-spin text-[#a78bfa]" /> Searching your memory graph…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.07)] px-4 py-3 text-sm text-[#f87171] mb-4 animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-spring-in">
          <DecisionReplayCard
            userId={DEMO_USER_ID}
            result={result}
            onOutcomeAdded={() => run(result.currentQuestion)}
          />
        </div>
      )}
    </div>
  );
}
