"use client";

import { useEffect, useRef } from "react";

/**
 * Procedural halftone/dot-matrix illustration of a hooded figure holding a
 * glowing memory orb — evokes the reference's dot-matrix character without
 * reusing its artwork. Silhouette is rasterized offscreen, then re-drawn as
 * a grid of variable-radius dots (classic halftone technique).
 */
export default function DotMatrixFigure({
  width = 340,
  height = 420,
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 1. Rasterize the silhouette offscreen (white shapes on black).
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const octx = off.getContext("2d")!;
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, width, height);
    octx.fillStyle = "#fff";

    const cx = width / 2;

    // Hood (pointed arc over the head).
    octx.beginPath();
    octx.moveTo(cx - 70, height * 0.42);
    octx.quadraticCurveTo(cx, height * 0.06, cx + 70, height * 0.42);
    octx.quadraticCurveTo(cx + 46, height * 0.3, cx, height * 0.22);
    octx.quadraticCurveTo(cx - 46, height * 0.3, cx - 70, height * 0.42);
    octx.closePath();
    octx.fill();

    // Face shadow gap (subtract a darker ellipse to suggest a hollow hood).
    octx.fillStyle = "#000";
    octx.beginPath();
    octx.ellipse(cx, height * 0.36, 34, 44, 0, 0, Math.PI * 2);
    octx.fill();
    octx.fillStyle = "#fff";

    // Shoulders / robe (trapezoid widening downward).
    octx.beginPath();
    octx.moveTo(cx - 58, height * 0.4);
    octx.lineTo(cx + 58, height * 0.4);
    octx.lineTo(cx + 118, height * 0.98);
    octx.lineTo(cx - 118, height * 0.98);
    octx.closePath();
    octx.fill();

    // Robe fold lines (subtract thin dark slivers for texture).
    octx.fillStyle = "rgba(0,0,0,0.55)";
    for (let i = -2; i <= 2; i++) {
      octx.beginPath();
      const topX = cx + i * 20;
      const botX = cx + i * 42;
      octx.moveTo(topX - 4, height * 0.45);
      octx.lineTo(topX + 4, height * 0.45);
      octx.lineTo(botX + 6, height * 0.97);
      octx.lineTo(botX - 6, height * 0.97);
      octx.closePath();
      octx.fill();
    }
    octx.fillStyle = "#fff";

    // Raised arm (left) reaching toward an orb.
    octx.beginPath();
    octx.moveTo(cx - 60, height * 0.5);
    octx.quadraticCurveTo(cx - 118, height * 0.5, cx - 128, height * 0.34);
    octx.quadraticCurveTo(cx - 130, height * 0.28, cx - 112, height * 0.3);
    octx.quadraticCurveTo(cx - 100, height * 0.46, cx - 62, height * 0.58);
    octx.closePath();
    octx.fill();

    // Floating memory orb above the hand.
    octx.beginPath();
    octx.arc(cx - 118, height * 0.22, 16, 0, Math.PI * 2);
    octx.fill();

    // 2. Halftone sampling: read the offscreen bitmap, draw dots sized by coverage.
    const imgData = octx.getImageData(0, 0, width, height).data;
    const cell = 7;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        // Average alpha/brightness in this cell.
        let sum = 0;
        let count = 0;
        for (let sy = 0; sy < cell && y + sy < height; sy += 2) {
          for (let sx = 0; sx < cell && x + sx < width; sx += 2) {
            const idx = ((y + sy) * width + (x + sx)) * 4;
            sum += imgData[idx];
            count++;
          }
        }
        const brightness = count ? sum / count / 255 : 0;
        if (brightness < 0.08) continue;

        const jitterX = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const jitterY = (Math.sin(x * 93.989 + y * 47.233) * 12543.123) % 1;
        const px = x + cell / 2 + jitterX * 1.4;
        const py = y + cell / 2 + jitterY * 1.4;

        const radius = brightness * (cell / 2) * 0.95;
        const t = y / height;
        // Gradient: near-white near the top, violet toward the bottom.
        const r = Math.round(196 + (139 - 196) * t);
        const g = Math.round(181 + (92 - 181) * t);
        const b = Math.round(253 + (246 - 253) * t);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.55 + brightness * 0.45})`;
        ctx.arc(px, py, Math.max(radius, 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [width, height]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle at 50% 35%, rgba(139,92,246,0.5), transparent 60%)" }}
      />
      <canvas ref={canvasRef} className="relative" />
    </div>
  );
}
