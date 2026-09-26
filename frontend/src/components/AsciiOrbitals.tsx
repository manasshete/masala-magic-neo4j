"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Sparkles, GitCommit, Database } from "lucide-react";

interface AsciiOrbitalsProps {
  width?: number;
  height?: number;
  className?: string;
  onNodeClick?: (label: string) => void;
}

const ORBIT_CHARS = "··░▒▓*+◈oO0";

export default function AsciiOrbitals({
  width = 380,
  height = 320,
  className = "",
  onNodeClick,
}: AsciiOrbitalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string>("Decision Node");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // 3 orbital rings with 3D perspective tilt
    const rings = [
      { rx: width * 0.42, ry: height * 0.28, speed: 0.8, tilt: -0.22, charDensity: 52 },
      { rx: width * 0.32, ry: height * 0.20, speed: -1.1, tilt: -0.22, charDensity: 44 },
      { rx: width * 0.22, ry: height * 0.13, speed: 1.4, tilt: -0.22, charDensity: 36 },
    ];

    function render() {
      if (!ctx) return;
      time += 0.02;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.font = `600 9px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cx = width * 0.52;
      const cy = height * 0.46;

      // Draw faint center core glow
      const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, width * 0.35);
      grad.addColorStop(0, "rgba(168, 85, 247, 0.22)");
      grad.addColorStop(0.5, "rgba(139, 92, 246, 0.08)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw orbital rings
      rings.forEach((ring, rIdx) => {
        const totalPoints = ring.charDensity;
        const angleOffset = time * ring.speed;

        for (let i = 0; i < totalPoints; i++) {
          const theta = (i / totalPoints) * Math.PI * 2 + angleOffset;

          // Ellipse coordinate before tilt
          const x0 = Math.cos(theta) * ring.rx;
          const y0 = Math.sin(theta) * ring.ry;

          // Apply 2D rotation for the reference's tilted angle
          const cosT = Math.cos(ring.tilt);
          const sinT = Math.sin(ring.tilt);
          const x = cx + (x0 * cosT - y0 * sinT);
          const y = cy + (x0 * sinT + y0 * cosT);

          // Depth sorting (sin(theta) gives pseudo-depth along orbital plane)
          const depth = (Math.sin(theta) + 1) / 2; // 0 (far) to 1 (near)
          const alpha = 0.2 + depth * 0.75;
          const sizeBoost = 0.8 + depth * 0.4;

          // Highlight moving pulse packet along the ring
          const pulseDistance = Math.abs(((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
          const isPulse = pulseDistance < 0.4;

          // Pick character
          let char = "·";
          if (isPulse) {
            char = "█";
          } else if (depth > 0.7) {
            char = i % 3 === 0 ? "▓" : "▒";
          } else if (depth > 0.4) {
            char = i % 2 === 0 ? "░" : "·";
          } else {
            char = "·";
          }

          if (isPulse || depth > 0.85) {
            ctx.fillStyle = `rgba(245, 240, 255, ${alpha})`;
            ctx.shadowColor = "rgba(192, 132, 252, 0.8)";
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.75})`;
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          ctx.font = `600 ${Math.round(8 * sizeBoost)}px 'JetBrains Mono', monospace`;
          ctx.fillText(char, x, y);
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    }

    render();

    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  // Orbiting Node badges positioned like in the reference screenshot
  const NODES = [
    {
      id: "fact",
      label: "Fact Node",
      badge: "FACT",
      desc: "User prefers late start on Mon",
      icon: Database,
      top: "16%",
      left: "62%",
    },
    {
      id: "pref",
      label: "Preference",
      badge: "PREF",
      desc: "Deep focus morning session",
      icon: Sparkles,
      top: "46%",
      left: "22%",
    },
    {
      id: "decision",
      label: "Decision",
      badge: "DECISION",
      desc: "Scheduled presentation 10 AM",
      icon: GitCommit,
      top: "72%",
      left: "58%",
    },
  ];

  return (
    <div className={`relative overflow-hidden select-none ${className}`} style={{ width, height }}>
      {/* Background radial atmosphere */}
      <div
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4), rgba(88, 28, 135, 0.15), transparent 70%)",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Floating Node Badges with icons like the reference */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {NODES.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.label;
          return (
            <div
              key={node.id}
              style={{ top: node.top, left: node.left }}
              onClick={() => {
                setSelectedNode(node.label);
                onNodeClick?.(node.label);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group flex items-center gap-2 px-2.5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 shadow-md ${
                isSelected
                  ? "bg-[rgba(139,92,246,0.3)] border-[rgba(192,132,252,0.6)] shadow-[0_0_15px_rgba(139,92,246,0.35)] scale-105"
                  : "bg-[rgba(13,10,20,0.8)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(25,18,40,0.9)]"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[rgba(139,92,246,0.3)] border border-[rgba(168,85,247,0.4)] flex items-center justify-center text-[#d8b4fe]">
                <Icon size={10} />
              </div>
              <span
                className="text-[10px] font-semibold tracking-wider text-[rgba(245,240,255,0.9)]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {node.badge}
              </span>
            </div>
          );
        })}
      </div>

      {/* Monospace coordinate HUD overlay in bottom-left */}
      <div
        className="absolute bottom-3 left-4 z-10 pointer-events-none text-[9px] tracking-[0.12em] uppercase"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(192, 132, 252, 0.45)",
        }}
      >
        ORBITAL_RESONANCE // 3-AXIS CAUSAL LOOP
      </div>
    </div>
  );
}
