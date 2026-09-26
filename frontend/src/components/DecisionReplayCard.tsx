"use client";

import { useState } from "react";
import { DecisionReplayResult } from "@/lib/types";
import { addOutcome } from "@/lib/api";
import { ThumbsUp, ThumbsDown, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

const MONO = { fontFamily: "'JetBrains Mono', monospace" };

export default function DecisionReplayCard({
  userId, result, onOutcomeAdded,
}: {
  userId: string;
  result: DecisionReplayResult;
  onOutcomeAdded?: () => void;
}) {
  const [outcomeText, setOutcomeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentiment, setSentiment] = useState<"positive" | "negative" | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const pct = Math.round(result.confidence * 100);
  const pctColor = pct >= 75 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#f87171";

  async function submitOutcome(s: "positive" | "negative") {
    if (!result.matchedDecision || !outcomeText.trim()) return;
    setSubmitting(true); setSentiment(s);
    try {
      await addOutcome(userId, result.matchedDecision.id, outcomeText.trim(), s);
      setSubmitted(true);
      onOutcomeAdded?.();
    } finally { setSubmitting(false); }
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(10,9,15,0.85)",
        borderColor: "rgba(196,181,253,0.2)",
        backdropFilter: "blur(16px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 30px rgba(0,0,0,0.4), 0 0 30px rgba(139,92,246,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="relative px-4 py-2.5 border-b flex items-center justify-between overflow-hidden"
        style={{ borderColor: "rgba(196,181,253,0.12)", background: "rgba(139,92,246,0.07)" }}
      >
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div className="relative flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd]" style={{ boxShadow: "0 0 5px #c4b5fd" }} />
          <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "#c4b5fd" }}>
            DECISION REPLAY
          </span>
        </div>
        <div className="relative flex items-center gap-2">
          <span
            className="rounded-full border px-2 py-0.5"
            style={{ ...MONO, fontSize: 9, letterSpacing: "0.1em", color: pctColor, borderColor: `${pctColor}40`, background: `${pctColor}10` }}
          >
            {pct}% MATCH
          </span>
          <button onClick={() => setCollapsed(c => !c)} style={{ color: "rgba(241,238,249,0.3)" }}>
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 space-y-4 animate-fade-in">
          <Field label="CURRENT DECISION" value={result.currentQuestion} color="#a78bfa" />

          {result.matchedDecision ? (
            <>
              <Field label="SIMILAR PAST DECISION" value={result.matchedDecision.content} color="#c4b5fd" />
              {result.matchedReasons.length > 0 && (
                <Field label="REASONING" value={result.matchedReasons.map(r => r.content).join(" · ")} color="#e9d5ff" />
              )}
              <Field
                label="PAST OUTCOME"
                value={result.matchedOutcomes.length > 0 ? result.matchedOutcomes.map(o => o.content).join(" · ") : "No outcome recorded yet"}
                color="#34d399"
                muted={result.matchedOutcomes.length === 0}
              />

              {/* Recommendation box */}
              <div
                className="relative rounded-xl border overflow-hidden"
                style={{ background: "rgba(139,92,246,0.08)", borderColor: "rgba(139,92,246,0.28)", boxShadow: "0 0 20px rgba(139,92,246,0.08)" }}
              >
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                    backgroundSize: "10px 10px",
                  }}
                />
                <div className="relative px-4 py-3">
                  <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.14em", color: "#a78bfa", display: "block", marginBottom: 6 }}>
                    RECOMMENDATION
                  </span>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(241,238,249,0.9)" }}>
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Outcome input */}
              {!submitted ? (
                <div className="pt-2 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <p style={{ ...MONO, fontSize: 9, letterSpacing: "0.1em", color: "rgba(241,238,249,0.3)" }}>
                    // RECORD OUTCOME TO IMPROVE FUTURE RECOMMENDATIONS
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={outcomeText}
                      onChange={(e) => setOutcomeText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && sentiment) submitOutcome(sentiment); }}
                      placeholder="e.g. The presentation went really well"
                      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(241,238,249,0.85)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                    />
                    <button
                      disabled={submitting || !outcomeText.trim()}
                      onClick={() => submitOutcome("positive")}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border press transition-all disabled:opacity-35"
                      style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", borderColor: "rgba(52,211,153,0.22)" }}
                    >
                      {submitting && sentiment === "positive" ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />}
                    </button>
                    <button
                      disabled={submitting || !outcomeText.trim()}
                      onClick={() => submitOutcome("negative")}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border press transition-all disabled:opacity-35"
                      style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", borderColor: "rgba(248,113,113,0.22)" }}
                    >
                      {submitting && sentiment === "negative" ? <Loader2 size={13} className="animate-spin" /> : <ThumbsDown size={13} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm pt-2 border-t animate-fade-in" style={{ borderColor: "rgba(255,255,255,0.05)", color: "#34d399" }}>
                  <CheckCircle2 size={13} />
                  <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.08em" }}>
                    OUTCOME RECORDED — ASK AGAIN FOR UPDATED RECOMMENDATION
                  </span>
                </div>
              )}
            </>
          ) : (
            <div
              className="relative rounded-xl border overflow-hidden"
              style={{ background: "rgba(139,92,246,0.08)", borderColor: "rgba(139,92,246,0.28)" }}
            >
              <div className="px-4 py-3">
                <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.14em", color: "#a78bfa", display: "block", marginBottom: 6 }}>
                  RECOMMENDATION
                </span>
                <p className="text-sm font-medium" style={{ color: "rgba(241,238,249,0.9)" }}>{result.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, color, muted }: { label: string; value: string; color: string; muted?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="w-0.5 h-3.5 rounded-full" style={{ background: color }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: "0.14em", color: "rgba(241,238,249,0.3)" }}>
          {label}
        </span>
      </div>
      <p className="text-sm leading-relaxed pl-2.5" style={{ color: muted ? "rgba(241,238,249,0.3)" : "rgba(241,238,249,0.82)", fontStyle: muted ? "italic" : "normal" }}>
        {value}
      </p>
    </div>
  );
}
