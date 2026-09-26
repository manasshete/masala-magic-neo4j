"use client";

import { useEffect, useRef } from "react";

const CHARS = "0101アイウエオカキクケコサシスセソタチツテト▓░▒╬⬡◈⟨⟩*+#%@";

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fontSize = 13;
    const cols = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: cols }, () => Math.floor(Math.random() * -50));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let lastTime = 0;
    function draw(time: number) {
      if (time - lastTime > 45) {
        lastTime = time;

        // Soft trail fade
        ctx!.fillStyle = "rgba(8, 7, 11, 0.08)";
        ctx!.fillRect(0, 0, width, height);

        ctx!.font = `${fontSize}px 'JetBrains Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          const y = drops[i] * fontSize;

          // Random alpha for subtle depth
          const isLead = Math.random() < 0.05;
          if (isLead) {
            ctx!.fillStyle = "rgba(230, 210, 255, 0.6)";
          } else {
            const alpha = 0.08 + Math.random() * 0.15;
            ctx!.fillStyle = `rgba(139, 92, 246, ${alpha})`;
          }

          ctx!.fillText(char, i * fontSize, y);

          if (y > height && Math.random() > 0.985) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
