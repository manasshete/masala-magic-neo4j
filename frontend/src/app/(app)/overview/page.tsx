"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActLabsShowcase from "@/components/ActLabsShowcase";
import { loadDemoData } from "@/lib/api";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export default function OverviewPage() {
  const router = useRouter();
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleLoadDemo() {
    setDemoLoading(true);
    try {
      await loadDemoData();
      setDemoLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(false);
    }
  }

  function handleSelectPrompt(prompt: string) {
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <div className="min-h-full py-8 px-6">
      {/* Top Banner / Call to Action */}
      <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between p-4 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.06)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.35)] flex items-center justify-center text-[#c084fc]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">System Architecture & Feature Overview</div>
            <div className="text-[11px] text-[rgba(240,235,248,0.5)]">
              Explore the graph-native memory engine, causal weighting, and multi-agent coordination.
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#9333ea] hover:to-[#6d28d9] shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all press"
        >
          <MessageSquare size={13} />
          <span>Open Chat UI</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* The Full 3-Card ACT Labs Showcase */}
      <ActLabsShowcase
        onSelectPrompt={handleSelectPrompt}
        onLoadDemo={handleLoadDemo}
        demoLoaded={demoLoaded}
        demoLoading={demoLoading}
      />
    </div>
  );
}
