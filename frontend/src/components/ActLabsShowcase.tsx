"use client";

import { useState } from "react";
import AsciiCharacter from "./AsciiCharacter";
import AsciiLightning from "./AsciiLightning";
import AsciiOrbitals from "./AsciiOrbitals";
import { Layers, Radio, Target, Sparkles, ArrowRight, Check } from "lucide-react";

interface ActLabsShowcaseProps {
  onSelectPrompt?: (prompt: string) => void;
  onLoadDemo?: () => void;
  demoLoaded?: boolean;
  demoLoading?: boolean;
}

export default function ActLabsShowcase({
  onSelectPrompt,
  onLoadDemo,
  demoLoaded = false,
  demoLoading = false,
}: ActLabsShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState<string>("collaboration");

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 select-none animate-fade-in">
      {/* Header section matching reference */}
      <div className="text-center mb-8 space-y-3">
        {/* Key Features Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.06)] text-[#c084fc] text-[11px] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
          <span>Key Features</span>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[rgba(250,245,255,0.95)]">
          Memora: Empowering Smarter Decisions
        </h2>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-[rgba(240,235,248,0.45)] max-w-2xl mx-auto leading-relaxed">
          Leverage AI-driven graph memory and causal reasoning with Memora to optimize daily choices, trace outcomes, and maintain cognitive continuity across all platforms.
        </p>
      </div>

      {/* Grid of 3 Feature Cards */}
      <div className="space-y-4">
        {/* Card 1: Large Top Card with Moving ASCII Character */}
        <div
          className="relative rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,10,18,0.7)] backdrop-blur-xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.1)] hover:border-[rgba(168,85,247,0.3)] transition-all duration-300 group"
          style={{
            backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.12), transparent 60%)",
          }}
        >
          {/* Subtle corner grid texture decoration */}
          <div
            className="absolute top-0 right-0 w-36 h-36 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />

          <div className="flex flex-col lg:flex-row items-center justify-between p-6 md:p-8 gap-6">
            {/* Left Content */}
            <div className="flex-1 space-y-5 z-10 max-w-xl">
              <div>
                <span
                  className="text-[10px] tracking-[0.14em] uppercase text-[#a855f7] font-semibold"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  // FEATURE 01
                </span>
                <h3 className="text-xl md:text-2xl font-medium text-white mt-1">
                  Agent-to-Agent Collaboration
                </h3>
              </div>

              <p className="text-xs md:text-sm text-[rgba(240,235,248,0.55)] leading-relaxed">
                Discover how specialized memory agents work together to complete complex tasks efficiently. Our platform intelligently segments tasks, assigns graph weights, and ensures seamless multi-hop collaboration. By leveraging distributed graph intelligence, agents learn and adapt continuously.
              </p>

              {/* 3 Pills from reference */}
              <div className="space-y-2 pt-2">
                <FeaturePill
                  icon={<Layers size={13} />}
                  label="Task Segmentation and Distribution"
                  desc="Partition complex goals into interconnected graph sub-tasks"
                />
                <FeaturePill
                  icon={<Radio size={13} />}
                  label="Real-Time Graph Communication"
                  desc="Bi-directional Cypher synchronization across agent clusters"
                />
                <FeaturePill
                  icon={<Target size={13} />}
                  label="Outcome & Decision Optimization"
                  desc="Reinforce positive decision paths via historical PageRank"
                />
              </div>

              {/* Quick Action Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onSelectPrompt?.("Plan my week based on my past presentation outcomes.")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#9333ea] hover:to-[#6d28d9] shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all press"
                >
                  <Sparkles size={13} />
                  <span>Ask Assistant</span>
                  <ArrowRight size={13} />
                </button>

                {onLoadDemo && (
                  <button
                    onClick={onLoadDemo}
                    disabled={demoLoading || demoLoaded}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[rgba(245,240,255,0.7)] hover:text-white hover:border-[rgba(168,85,247,0.35)] transition-all press disabled:opacity-50"
                  >
                    {demoLoaded ? <Check size={12} className="text-emerald-400" /> : <Sparkles size={12} />}
                    <span>{demoLoaded ? "Demo Loaded" : "Load Sample Graph"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: The Moving ASCII Anime Character */}
            <div className="relative shrink-0 flex items-center justify-center">
              <AsciiCharacter width={340} height={400} />
            </div>
          </div>
        </div>

        {/* Bottom Row: 2 Cards side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 2: Dynamic Causal Content (Lightning) */}
          <div
            className="relative rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,10,18,0.7)] backdrop-blur-xl overflow-hidden p-6 shadow-[0_0_40px_rgba(139,92,246,0.08)] hover:border-[rgba(168,85,247,0.3)] transition-all duration-300 flex flex-col justify-between group"
            style={{
              backgroundImage: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.09), transparent 70%)",
            }}
          >
            <div>
              <span
                className="text-[10px] tracking-[0.14em] uppercase text-[#a855f7] font-semibold"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                // FEATURE 02
              </span>
              <h3 className="text-lg font-medium text-white mt-1">
                Dynamic Causal Content
              </h3>
              <p className="text-xs text-[rgba(240,235,248,0.5)] mt-1.5 leading-relaxed">
                Automatically synthesize multi-factor trade-offs with cutting-edge AI reasoning tools for rapid, confident decision making.
              </p>
            </div>

            {/* Moving ASCII Lightning Bolt with interactive chips */}
            <div className="mt-4 flex items-center justify-center">
              <AsciiLightning
                width={360}
                height={280}
                onPromptSelect={(p) => onSelectPrompt?.(p)}
              />
            </div>
          </div>

          {/* Card 3: AI-Powered Graph Orbitals */}
          <div
            className="relative rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,10,18,0.7)] backdrop-blur-xl overflow-hidden p-6 shadow-[0_0_40px_rgba(139,92,246,0.08)] hover:border-[rgba(168,85,247,0.3)] transition-all duration-300 flex flex-col justify-between group"
            style={{
              backgroundImage: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.09), transparent 70%)",
            }}
          >
            <div>
              <span
                className="text-[10px] tracking-[0.14em] uppercase text-[#a855f7] font-semibold"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                // FEATURE 03
              </span>
              <h3 className="text-lg font-medium text-white mt-1">
                AI-Powered Memory Orbitals
              </h3>
              <p className="text-xs text-[rgba(240,235,248,0.5)] mt-1.5 leading-relaxed">
                Seamlessly traverse interconnected personal knowledge rings and causal outcomes with Memora&apos;s multi-hop neural graph engine.
              </p>
            </div>

            {/* Moving ASCII Planetary Orbitals */}
            <div className="mt-4 flex items-center justify-center">
              <AsciiOrbitals
                width={360}
                height={280}
                onNodeClick={(label) => onSelectPrompt?.(`Explain how "${label}" influences my planning.`)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <div className="group/pill flex items-start gap-3 p-2.5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(139,92,246,0.08)] hover:border-[rgba(139,92,246,0.25)] transition-all duration-200">
      <div className="w-6 h-6 rounded-lg bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#c084fc] shrink-0 mt-0.5 group-hover/pill:text-white group-hover/pill:bg-[#8b5cf6] transition-all">
        {icon}
      </div>
      <div>
        <div className="text-xs font-medium text-[rgba(245,240,255,0.9)] leading-tight">
          {label}
        </div>
        <div className="text-[10px] text-[rgba(240,235,248,0.4)] mt-0.5 leading-tight">
          {desc}
        </div>
      </div>
    </div>
  );
}
