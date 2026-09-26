"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

interface AsciiLightningProps {
  width?: number;
  height?: number;
  className?: string;
  onPromptSelect?: (prompt: string) => void;
}

const LIGHTNING_CHARS = "⚡*+%#@8▓▒░><~=";
const STREAM_CHARS = "010101XY#*+";

export default function AsciiLightning({
  width = 380,
  height = 320,
  className = "",
  onPromptSelect,
}: AsciiLightningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeBubble, setActiveBubble] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const charW = 7;
    const charH = 10;
    const cols = Math.floor(width / charW);
    const rows = Math.floor(height / charH);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Define lightning bolt path segments: points in normalized (0..1) space
    const segments = [
      { x1: 0.62, y1: 0.08, x2: 0.50, y2: 0.42 }, // top diagonal down-left
      { x1: 0.50, y1: 0.42, x2: 0.68, y2: 0.45 }, // middle step horizontal-right
      { x1: 0.68, y1: 0.45, x2: 0.42, y2: 0.88 }, // bottom diagonal down-left
    ];

    function render() {
      if (!ctx) return;
      time += 0.05;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.font = `700 ${charH * 0.9}px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Energy pulse position along the bolt (0 to 1)
      const pulseProgress = (time * 0.45) % 1;

      // Draw lightning matrix
      for (let r = 0; r < rows; r++) {
        const ny = r / rows;

        // Find matching segment
        let targetX = 0.5;
        let segmentWidth = 0.09;

        if (ny <= 0.42) {
          const t = ny / 0.42;
          targetX = 0.62 + (0.50 - 0.62) * t;
          segmentWidth = 0.08 + (1 - t) * 0.04;
        } else if (ny <= 0.46) {
          targetX = 0.50 + ((ny - 0.42) / 0.04) * (0.68 - 0.50);
          segmentWidth = 0.12;
        } else {
          const t = (ny - 0.46) / (0.88 - 0.46);
          targetX = 0.68 + (0.42 - 0.68) * t;
          segmentWidth = Math.max(0.02, 0.09 * (1 - t * 0.8)); // tapering to point
        }

        const centerCol = targetX * cols;
        const halfSpan = (segmentWidth * cols) / 2;

        for (let c = 0; c < cols; c++) {
          const dist = Math.abs(c - centerCol);
          if (dist > halfSpan + 0.8) continue;

          const normDist = dist / (halfSpan + 0.8);
          let intensity = 1 - normDist;

          // Pulse glow modulation
          const distFromPulse = Math.abs(ny - pulseProgress);
          if (distFromPulse < 0.18) {
            intensity += (1 - distFromPulse / 0.18) * 0.7;
          }

          // Shimmer noise
          const noise = Math.sin(c * 17.1 + r * 31.7 + time * 6);
          intensity += noise * 0.15;
          intensity = Math.max(0, Math.min(1.2, intensity));

          if (intensity < 0.12) continue;

          // Character selection
          let char = LIGHTNING_CHARS[Math.floor(Math.random() * 3)];
          if (intensity > 0.8) {
            char = "█";
          } else if (intensity > 0.6) {
            char = "▓";
          } else if (intensity > 0.4) {
            char = "▒";
          } else {
            char = "░";
          }

          if (Math.random() < 0.05) {
            char = STREAM_CHARS[Math.floor(Math.random() * STREAM_CHARS.length)];
          }

          const px = c * charW + charW / 2;
          const py = r * charH + charH / 2;

          if (intensity > 0.85) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.shadowColor = "rgba(192, 132, 252, 0.9)";
            ctx.shadowBlur = 10;
          } else if (intensity > 0.5) {
            ctx.fillStyle = "rgba(216, 180, 254, 0.85)";
            ctx.shadowColor = "rgba(168, 85, 247, 0.7)";
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = "rgba(139, 92, 246, 0.45)";
            ctx.shadowBlur = 0;
          }

          ctx.fillText(char, px, py);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    }

    render();

    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  // Floating prompt bubbles like in the reference screenshot
  const BUBBLES = [
    {
      id: 0,
      icon: "⚡",
      text: "Hey Memora, optimize my weekly schedule",
      sub: "Graph reasoning trigger",
      top: "22%",
      left: "14%",
    },
    {
      id: 1,
      icon: "◈",
      text: "Analyzing 14 causal graph pathways...",
      sub: "Neo4j Cypher query active",
      top: "48%",
      left: "8%",
    },
    {
      id: 2,
      icon: "✦",
      text: "AI confidence: 96% · Schedule set",
      sub: "Monday morning deep focus preserved",
      top: "74%",
      left: "20%",
    },
  ];

  return (
    <div className={`relative overflow-hidden select-none ${className}`} style={{ width, height }}>
      {/* Background glow radial */}
      <div
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle at 55% 50%, rgba(147, 51, 234, 0.4), rgba(79, 70, 229, 0.15), transparent 70%)",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Floating interactive chips directly over the lightning */}
      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between pointer-events-auto">
        {BUBBLES.map((b, i) => (
          <div
            key={b.id}
            onClick={() => {
              setActiveBubble(b.id);
              onPromptSelect?.(b.text);
            }}
            className={`group cursor-pointer rounded-xl px-3.5 py-2.5 backdrop-blur-md transition-all duration-300 border flex items-center gap-2.5 max-w-[88%] shadow-lg ${
              activeBubble === b.id
                ? "bg-[rgba(139,92,246,0.22)] border-[rgba(192,132,252,0.5)] shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-[1.02]"
                : "bg-[rgba(15,12,22,0.75)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(25,20,38,0.85)] hover:border-[rgba(168,85,247,0.35)]"
            }`}
            style={{
              transform: `translateX(${i === 0 ? "12px" : i === 1 ? "4px" : "20px"})`,
            }}
          >
            <div className="w-6 h-6 rounded-lg bg-[rgba(139,92,246,0.25)] border border-[rgba(139,92,246,0.4)] flex items-center justify-center shrink-0 text-xs text-[#d8b4fe]">
              {b.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-[rgba(245,240,255,0.92)] truncate">
                {b.text}
              </div>
              <div
                className="text-[9px] tracking-[0.08em] uppercase text-[rgba(192,132,252,0.6)]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {b.sub}
              </div>
            </div>
            <ArrowRight
              size={12}
              className="text-[rgba(192,132,252,0.4)] group-hover:text-[#c084fc] group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
