"use client";

import { useState } from "react";
import { replayDecision, DEMO_USER_ID } from "@/lib/api";
import { DecisionReplayResult } from "@/lib/types";
import DecisionReplayCard from "@/components/DecisionReplayCard";
import { Loader2, Send } from "lucide-react";

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
    <div className="px-8 py-6 max-w-2xl">
      <h1 className="text-lg font-semibold mb-1">Decision Replay</h1>
      <p className="text-xs text-white/40 mb-6">
        Ask a decision-support question. Memora searches your past decisions, reasons and
        outcomes to guide the current one.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Should I take this internship?"
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-indigo-400/50"
        />
        <button
          onClick={() => run()}
          disabled={loading || !question.trim()}
          className="rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 px-4 flex items-center justify-center"
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
            className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30"
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="text-rose-300 text-sm mb-4">{error}</div>}

      {result && (
        <DecisionReplayCard
          userId={DEMO_USER_ID}
          result={result}
          onOutcomeAdded={() => run(result.currentQuestion)}
        />
      )}
    </div>
  );
}
