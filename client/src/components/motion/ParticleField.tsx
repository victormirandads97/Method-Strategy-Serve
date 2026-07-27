import { useEffect, useRef, useState } from "react";
import { B, alpha, rgbOf } from "@/lib/brand";
import { useMotionTier } from "@/hooks/use-motion-tier";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface ParticleFieldProps {
  /** Accent used for both the dots and the links between them. */
  colour?: string;
  /** Extra styles for the absolutely positioned wrapper. */
  style?: React.CSSProperties;
}

const DRIFT = 0.13;
/** Distance the cursor pushes particles away from itself. */
const REPEL_RADIUS = 120;

/**
 * A slow-drifting constellation: dots that wander, linking to neighbours with
 * thin lines that form and break as the distance between them changes. The
 * cursor gently repels anything nearby.
 *
 * Degrades in three steps:
 *  - reduced motion or a failed 2D context -> the static gradient only
 *  - touch or narrow screens -> far fewer particles, no cursor repulsion
 *  - desktop -> the full field
 *
 * The loop parks itself when the section scrolls out of view or the tab is
 * hidden, so it costs nothing while the visitor is further down the page.
 */
export default function ParticleField({
  colour = B.blueBright,
  style,
}: ParticleFieldProps) {
  const { reduced, lite, ready } = useMotionTier();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextFailed, setContextFailed] = useState(false);

  const running = ready && !reduced && !contextFailed;

  useEffect(() => {
    if (!running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }
    if (!ctx) {
      setContextFailed(true);
      return;
    }
    const paint = ctx;

    const { r, g, b } = rgbOf(colour);
    const linkDistance = lite ? 92 : 134;
    const repelsToCursor = !lite;

    let width = 1;
    let height = 1;
    let particles: Particle[] = [];
    let frame = 0;
    let onScreen = true;
    const pointer = { x: -9999, y: -9999, live: false };

    const seed = () => {
      const area = width * height;
      const target = Math.round(
        Math.min(lite ? 26 : 80, Math.max(12, area / (lite ? 24000 : 13500))),
      );
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * DRIFT * 2,
        vy: (Math.random() - 0.5) * DRIFT * 2,
      }));
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      paint.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const step = () => {
      frame = requestAnimationFrame(step);
      if (!onScreen) return;

      paint.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around the edges so the field never thins out.
        if (p.x < -24) p.x = width + 24;
        else if (p.x > width + 24) p.x = -24;
        if (p.y < -24) p.y = height + 24;
        else if (p.y > height + 24) p.y = -24;

        if (pointer.live) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const push = (1 - dist / REPEL_RADIUS) * 1.1;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }
        }
      }

      paint.lineWidth = 1;
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const c = particles[j];
          const dx = a.x - c.x;
          const dy = a.y - c.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > linkDistance * linkDistance) continue;
          const fade = (1 - Math.sqrt(distSq) / linkDistance) * 0.32;
          paint.strokeStyle = `rgba(${r}, ${g}, ${b}, ${fade.toFixed(3)})`;
          paint.beginPath();
          paint.moveTo(a.x, a.y);
          paint.lineTo(c.x, c.y);
          paint.stroke();
        }
      }

      paint.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
      for (const p of particles) {
        paint.beginPath();
        paint.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        paint.fill();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.live = true;
    };
    const onPointerLeave = () => {
      pointer.live = false;
    };
    const onVisibility = () => {
      onScreen = !document.hidden;
    };

    resize();
    frame = requestAnimationFrame(step);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0 },
    );
    viewObserver.observe(host);

    if (repelsToCursor) {
      host.addEventListener("pointermove", onPointerMove);
      host.addEventListener("pointerleave", onPointerLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      if (repelsToCursor) {
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerleave", onPointerLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [running, lite, colour]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      {/* Static gradient. Always painted, and the only layer when motion is off. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha(colour, 0.06)} 0%, transparent 70%)`,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: running ? "block" : "none",
        }}
      />
    </div>
  );
}
