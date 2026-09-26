"use client";

import { useState } from "react";
import { DecisionReplayResult } from "@/lib/types";
import { addOutcome } from "@/lib/api";
import { GitBranch, ThumbsUp, ThumbsDown, Loader2, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Markdown from "@/components/Markdown";

export default function DecisionReplayCard({
  userId,
  result,
  onOutcomeAdded,
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

  const confidencePct = Math.round(result.confidence * 100);
  const confidenceColor =
    confidencePct >= 75 ? "#34d399" : confidencePct >= 50 ? "#fbbf24" : "#f87171";

  async function submitOutcome(s: "positive" | "negative") {
    if (!result.matchedDecision || !outcomeText.trim()) return;
    setSubmitting(true);
    setSentiment(s);
    try {
      await addOutcome(userId, result.matchedDecision.id, outcomeText.trim(), s);
      setSubmitted(true);
      onOutcomeAdded?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[rgba(167,139,250,0.25)] bg-gradient-to-b from-[rgba(167,139,250,0.07)] to-transparent overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[rgba(167,139,250,0.15)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[rgba(167,139,250,0.15)] flex items-center justify-center">
            <GitBranch size={13} className="text-[#a78bfa]" />
          </div>
          <span className="text-xs font-bold tracking-widest text-[#a78bfa] uppercase">Decision Replay</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Confidence badge */}
          <div
            className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
            style={{
              color: confidenceColor,
              borderColor: `${confidenceColor}40`,
              background: `${confidenceColor}10`,
            }}
          >
            {confidencePct}% match
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-[rgba(240,235,228,0.3)] hover:text-[rgba(240,235,228,0.7)] transition-colors"
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 space-y-4 animate-fade-in">
          <Field
            label="Current Decision"
            value={result.currentQuestion}
            accent="rgba(249,115,22,0.5)"
          />

          {result.matchedDecision ? (
            <>
              <Field
                label="Similar Past Decision"
                value={result.matchedDecision.content}
                accent="rgba(167,139,250,0.5)"
              />

              {result.matchedReasons.length > 0 && (
                <Field
                  label="Reasoning"
                  value={result.matchedReasons.map((r) => r.content).join(" · ")}
                  accent="rgba(196,181,253,0.5)"
                />
              )}

              <Field
                label="Past Outcome"
                value={
                  result.matchedOutcomes.length > 0
                    ? result.matchedOutcomes.map((o) => o.content).join(" · ")
                    : "No outcome recorded yet"
                }
                accent="rgba(52,211,153,0.5)"
                muted={result.matchedOutcomes.length === 0}
              />

              <div className="rounded-xl border border-[rgba(249,115,22,0.3)] bg-gradient-to-br from-[rgba(249,115,22,0.1)] to-transparent px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={11} className="text-[#fb923c]" />
                  <span className="text-[10px] font-bold tracking-widest text-[#fb923c] uppercase">Recommendation</span>
                </div>
                <div className="text-sm text-[rgba(240,235,228,0.9)] font-medium leading-relaxed">
                  <Markdown>{result.recommendation}</Markdown>
                </div>
              </div>

              {/* Outcome feedback */}
              {!submitted ? (
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 space-y-2">
                  <p className="text-[11px] text-[rgba(240,235,228,0.35)]">
                    Record an outcome so Memora learns from this decision
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={outcomeText}
                      onChange={(e) => setOutcomeText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && sentiment) submitOutcome(sentiment); }}
                      placeholder="e.g. The presentation went really well"
                      className="flex-1 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm outline-none focus:border-[rgba(249,115,22,0.35)] transition-all text-[rgba(240,235,228,0.9)] placeholder-[rgba(240,235,228,0.25)]"
                    />
                    <button
                      disabled={submitting || !outcomeText.trim()}
                      onClick={() => submitOutcome("positive")}
                      title="Positive outcome"
                      className="flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(52,211,153,0.1)] text-[#34d399] border border-[rgba(52,211,153,0.25)] hover:bg-[rgba(52,211,153,0.18)] disabled:opacity-35 transition-all"
                    >
                      {submitting && sentiment === "positive" ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />}
                    </button>
                    <button
                      disabled={submitting || !outcomeText.trim()}
                      onClick={() => submitOutcome("negative")}
                      title="Negative outcome"
                      className="flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(248,113,113,0.1)] text-[#f87171] border border-[rgba(248,113,113,0.25)] hover:bg-[rgba(248,113,113,0.18)] disabled:opacity-35 transition-all"
                    >
                      {submitting && sentiment === "negative" ? <Loader2 size={13} className="animate-spin" /> : <ThumbsDown size={13} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#34d399] border-t border-[rgba(255,255,255,0.06)] pt-3 animate-fade-in">
                  <CheckCircle2 size={14} />
                  <span>Outcome recorded — ask again to see the updated recommendation.</span>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-[rgba(249,115,22,0.3)] bg-gradient-to-br from-[rgba(249,115,22,0.1)] to-transparent px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={11} className="text-[#fb923c]" />
                <span className="text-[10px] font-bold tracking-widest text-[#fb923c] uppercase">Recommendation</span>
              </div>
              <div className="text-sm text-[rgba(240,235,228,0.9)] font-medium">
                <Markdown>{result.recommendation}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: string;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {accent && (
          <div className="w-1 h-3.5 rounded-full" style={{ background: accent }} />
        )}
        <span className="text-[10px] font-bold tracking-widest text-[rgba(240,235,228,0.35)] uppercase">{label}</span>
      </div>
      <p className={`text-sm leading-relaxed pl-2.5 ${muted ? "text-[rgba(240,235,228,0.35)] italic" : "text-[rgba(240,235,228,0.85)]"}`}>
        {value}
      </p>
    </div>
  );
}
