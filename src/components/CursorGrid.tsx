import { useEffect, useRef } from "react";

/**
 * reactbits-style Cursor Grid: cells near the pointer light up, hold,
 * then fade; clicks emit an expanding pulse ring.
 */
export default function CursorGrid({
  color = "#E8551E",
  cellSize = 46,
  radius = 150,
  holdTime = 420,
  fadeDuration = 850,
  pulseSpeed = 620,
}: {
  color?: string;
  cellSize?: number;
  radius?: number;
  holdTime?: number;
  fadeDuration?: number;
  pulseSpeed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lit = new Map<number, number>(); // index -> lastLit timestamp
    const pulses: { x: number; y: number; t0: number }[] = [];
    let mouse = { x: -9999, y: -9999 };
    let raf = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cols = Math.ceil(w / cellSize);
      rows = Math.ceil(h / cellSize);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const lightNear = (x: number, y: number, r: number, now: number) => {
      const c0 = Math.max(0, Math.floor((x - r) / cellSize));
      const c1 = Math.min(cols - 1, Math.floor((x + r) / cellSize));
      const r0 = Math.max(0, Math.floor((y - r) / cellSize));
      const r1 = Math.min(rows - 1, Math.floor((y + r) / cellSize));
      for (let c = c0; c <= c1; c++) {
        for (let rr = r0; rr <= r1; rr++) {
          const cx = c * cellSize + cellSize / 2;
          const cy = rr * cellSize + cellSize / 2;
          const d = Math.hypot(cx - x, cy - y);
          if (d <= r) lit.set(rr * cols + c, now);
        }
      }
    };

    const lightRing = (x: number, y: number, r: number, now: number) => {
      const thick = cellSize * 1.1;
      const r0 = Math.max(0, r - thick);
      const c0 = Math.max(0, Math.floor((x - r) / cellSize));
      const c1 = Math.min(cols - 1, Math.floor((x + r) / cellSize));
      const q0 = Math.max(0, Math.floor((y - r) / cellSize));
      const q1 = Math.min(rows - 1, Math.floor((y + r) / cellSize));
      for (let c = c0; c <= c1; c++) {
        for (let rr = q0; rr <= q1; rr++) {
          const cx = c * cellSize + cellSize / 2;
          const cy = rr * cellSize + cellSize / 2;
          const d = Math.hypot(cx - x, cy - y);
          if (d <= r && d >= r0) lit.set(rr * cols + c, now);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    const onClick = (e: PointerEvent) => {
      pulses.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
      if (pulses.length > 6) pulses.shift();
    };

    const frame = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, w, h);

      if (mouse.x > -999) lightNear(mouse.x, mouse.y, radius, now);

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const pr = ((now - p.t0) / 1000) * pulseSpeed;
        if (pr > Math.max(w, h)) {
          pulses.splice(i, 1);
          continue;
        }
        lightRing(p.x, p.y, pr, now - 1); // ring shell lights fresh
      }

      lit.forEach((t, idx) => {
        const elapsed = now - t;
        const a =
          elapsed <= holdTime ? 1 : Math.max(0, 1 - (elapsed - holdTime) / fadeDuration);
        if (a <= 0) {
          lit.delete(idx);
          return;
        }
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        const x = c * cellSize;
        const y = r * cellSize;
        ctx.globalAlpha = a * 0.16;
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        ctx.globalAlpha = a * 0.55;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onClick);
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [color, cellSize, radius, holdTime, fadeDuration, pulseSpeed]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ mixBlendMode: "multiply", opacity: 0.5 }}
    />
  );
}
