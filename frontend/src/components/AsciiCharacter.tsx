"use client";

import { useEffect, useRef, useState } from "react";

interface AsciiCharacterProps {
  width?: number;
  height?: number;
  className?: string;
  imageSrc?: string;
}

// Density ramp from darkest (empty) to brightest (heavy)
const DENSITY_CHARS = "  ..··::--==++**##%%@@WW88";
const GLITCH_CHARS = "01XZ░▒▓◈⟨⟩λΨΩπ#*+";

export default function AsciiCharacter({
  width = 360,
  height = 440,
  className = "",
  imageSrc = "/ascii_character.jpg",
}: AsciiCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -100, y: -100, active: false });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Grid configuration for ASCII resolution — high density for crisp anime silhouette
    const charWidth = 5.5;
    const charHeight = 8.6;
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charHeight);

    // Offscreen canvas for raster sampling
    const offCanvas = document.createElement("canvas");
    offCanvas.width = cols;
    offCanvas.height = rows;
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    // Buffer to hold sampled brightness values (0 to 1)
    let brightnessGrid: Float32Array = new Float32Array(cols * rows);
    let hasLoadedImage = false;

    // Fallback procedural silhouette of anime girl assistant
    function drawProceduralSilhouette(octx: CanvasRenderingContext2D, c: number, r: number) {
      octx.fillStyle = "#000000";
      octx.fillRect(0, 0, c, r);

      const cx = c * 0.52;
      const cy = r * 0.42;

      octx.fillStyle = "#ffffff";

      // Head & face
      octx.beginPath();
      octx.ellipse(cx, cy, c * 0.16, r * 0.18, 0, 0, Math.PI * 2);
      octx.fill();

      // Hair silhouette with bangs
      octx.beginPath();
      octx.moveTo(cx - c * 0.22, cy + r * 0.1);
      octx.quadraticCurveTo(cx - c * 0.26, cy - r * 0.22, cx, cy - r * 0.24);
      octx.quadraticCurveTo(cx + c * 0.26, cy - r * 0.22, cx + c * 0.22, cy + r * 0.1);
      octx.quadraticCurveTo(cx + c * 0.18, cy + r * 0.02, cx + c * 0.08, cy - r * 0.02);
      octx.quadraticCurveTo(cx, cy + r * 0.04, cx - c * 0.08, cy - r * 0.02);
      octx.closePath();
      octx.fill();

      // Neck
      octx.fillRect(cx - c * 0.05, cy + r * 0.14, c * 0.1, r * 0.08);

      // Cyber shoulders and body
      octx.beginPath();
      octx.moveTo(cx - c * 0.12, cy + r * 0.2);
      octx.lineTo(cx + c * 0.14, cy + r * 0.2);
      octx.lineTo(cx + c * 0.26, r * 0.98);
      octx.lineTo(cx - c * 0.24, r * 0.98);
      octx.closePath();
      octx.fill();

      // Raised pointing right arm & finger (gesture like reference)
      octx.beginPath();
      octx.moveTo(cx + c * 0.14, cy + r * 0.22);
      octx.quadraticCurveTo(cx + c * 0.32, cy + r * 0.1, cx + c * 0.35, cy - r * 0.08);
      octx.lineTo(cx + c * 0.38, cy - r * 0.18);
      octx.lineTo(cx + c * 0.34, cy - r * 0.18);
      octx.quadraticCurveTo(cx + c * 0.3, cy - r * 0.04, cx + c * 0.22, cy + r * 0.26);
      octx.closePath();
      octx.fill();

      // Face shadow cutout
      octx.fillStyle = "#000000";
      octx.beginPath();
      octx.ellipse(cx - c * 0.02, cy + r * 0.04, c * 0.09, r * 0.08, 0, 0, Math.PI * 2);
      octx.fill();
    }

    // Sample pixels from offscreen canvas into brightness grid
    function sampleGrid() {
      const imgData = offCtx!.getImageData(0, 0, cols, rows).data;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          // Luminosity
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          brightnessGrid[y * cols + x] = lum;
        }
      }
    }

    // Draw initial procedural silhouette immediately
    drawProceduralSilhouette(offCtx, cols, rows);
    sampleGrid();

    // Load actual reference image with cache buster
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${imageSrc}?t=${Date.now()}`;
    img.onload = () => {
      offCtx.clearRect(0, 0, cols, rows);
      // Cover fit maintaining aspect ratio centered
      const imgAspect = img.width / img.height;
      const targetAspect = cols / rows;
      let drawW = cols;
      let drawH = rows;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > targetAspect) {
        drawW = rows * imgAspect;
        offsetX = -(drawW - cols) / 2;
      } else {
        drawH = cols / imgAspect;
        offsetY = -(drawH - rows) / 2;
      }

      offCtx.fillStyle = "#000000";
      offCtx.fillRect(0, 0, cols, rows);
      offCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
      sampleGrid();
      hasLoadedImage = true;
    };

    // Device Pixel Ratio scaling for ultra-crisp fonts
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Main animation loop
    function render() {
      if (!ctx) return;
      time += 0.04;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.font = `600 ${charHeight * 0.92}px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const mouse = mouseRef.current;
      const mouseCol = mouse.active ? mouse.x / charWidth : -999;
      const mouseRow = mouse.active ? mouse.y / charHeight : -999;

      // Scanline beam wave
      const scanlineY = ((time * 0.4) % 1) * rows;

      for (let y = 0; y < rows; y++) {
        const rowOffset = y * cols;
        const scanDist = Math.abs(y - scanlineY);
        const scanGlow = Math.max(0, 1 - scanDist / 4) * 0.35;

        // Gentle horizontal wave
        const wave = Math.sin(y * 0.12 - time * 2) * 0.12;

        for (let x = 0; x < cols; x++) {
          const rawLum = brightnessGrid[rowOffset + x];
          if (rawLum < 0.08) continue; // Skip empty background

          // Mouse proximity boost
          const dx = x - mouseCol;
          const dy = y - mouseRow;
          const distSq = dx * dx + dy * dy;
          const mouseBoost = distSq < 49 ? (1 - Math.sqrt(distSq) / 7) * 0.45 : 0;

          // Modulate brightness
          let lum = Math.min(1, rawLum + wave + scanGlow + mouseBoost);

          // Subtle breathing pulse
          lum *= 0.88 + 0.12 * Math.sin(time + y * 0.05);

          // Character index selection
          const charIdx = Math.floor(lum * (DENSITY_CHARS.length - 1));
          let char = DENSITY_CHARS[Math.max(0, Math.min(charIdx, DENSITY_CHARS.length - 1))];

          // Holographic glitch stream effect for active feel
          const isGlitch = (Math.sin(x * 12.3 + y * 45.6 + time * 3) > 0.94) || mouseBoost > 0.2;
          if (isGlitch) {
            const gIdx = Math.abs(Math.floor(Math.sin(x + y + time * 5) * GLITCH_CHARS.length)) % GLITCH_CHARS.length;
            char = GLITCH_CHARS[gIdx];
          }

          const px = x * charWidth + charWidth / 2;
          const py = y * charHeight + charHeight / 2;

          // Color calculation: Lavender-white highlight -> vibrant violet -> deep purple
          const t = y / rows;
          const alpha = Math.min(1, Math.max(0.2, lum * 1.1));

          if (lum > 0.75 || mouseBoost > 0.2) {
            // Bright white-lavender core
            ctx.fillStyle = `rgba(245, 240, 255, ${alpha})`;
            ctx.shadowColor = "rgba(192, 132, 252, 0.9)";
            ctx.shadowBlur = 8;
          } else if (lum > 0.4) {
            // Radiant violet
            const r = Math.round(192 - t * 40);
            const g = Math.round(132 - t * 40);
            const b = 252;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.shadowColor = "rgba(139, 92, 246, 0.6)";
            ctx.shadowBlur = 4;
          } else {
            // Subtle deep purple
            ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.75})`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(char, px, py);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, imageSrc]);

  // Handle mouse move for interactive holo-glow
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
    setIsHovered(false);
  };

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width, height }}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* Background ethereal radial aura */}
      <div
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(168, 85, 247, 0.35), rgba(126, 34, 206, 0.15) 50%, transparent 70%)",
          opacity: isHovered ? 0.9 : 0.6,
        }}
      />

      {/* Decorative scanning line animation */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden opacity-20"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168,85,247,0.15) 2px, rgba(168,85,247,0.15) 4px)",
        }}
      />

      {/* Monospace live status watermark */}
      <div
        className="absolute bottom-2 right-3 pointer-events-none text-[9px] tracking-[0.14em] uppercase"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(192, 132, 252, 0.4)",
        }}
      >
        [AGENT // RECOGNITION ACTIVE]
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 cursor-crosshair"
      />
    </div>
  );
}
