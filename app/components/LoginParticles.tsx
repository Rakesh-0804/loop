'use client';

import { useEffect, useRef } from 'react';

type AuroraBlob = {
  x: number;
  y: number;
  radius: number;
  hue: number;
  speed: number;
  phase: number;
};

type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
};

export default function LoginParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const el = canvas;
    const gc = ctx;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let blobs: AuroraBlob[] = [];
    let dust: Dust[] = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = width * DPR;
      el.height = height * DPR;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      gc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const base = Math.min(width, height);
      blobs = [
        { x: 0.2, y: 0.3, radius: base * 0.35, hue: 235, speed: 0.05, phase: 0 },
        { x: 0.8, y: 0.2, radius: base * 0.3, hue: 190, speed: 0.04, phase: 2 },
        { x: 0.5, y: 0.78, radius: base * 0.38, hue: 275, speed: 0.03, phase: 4 },
        { x: 0.1, y: 0.7, radius: base * 0.25, hue: 265, speed: 0.06, phase: 1 },
        { x: 0.9, y: 0.6, radius: base * 0.22, hue: 170, speed: 0.05, phase: 3 },
      ];

      const dustCount = Math.min(120, Math.max(60, Math.floor((width * height) / 16000)));
      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 0.8 + Math.random() * 1.8,
        alpha: 0.15 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function tick(t: number) {
      const time = t / 1000;
      gc.clearRect(0, 0, width, height);
      gc.globalCompositeOperation = 'lighter';

      for (const b of blobs) {
        const bx = (b.x + Math.sin(time * b.speed + b.phase) * 0.12) * width;
        const by = (b.y + Math.cos(time * b.speed * 0.8 + b.phase) * 0.1) * height;
        const rad = b.radius * (1 + Math.sin(time * 0.1 + b.phase) * 0.06);
        const grad = gc.createRadialGradient(bx, by, 0, bx, by, rad);
        grad.addColorStop(0, `hsla(${b.hue}, 80%, 60%, 0.16)`);
        grad.addColorStop(1, `hsla(${b.hue}, 80%, 60%, 0)`);
        gc.fillStyle = grad;
        gc.fillRect(0, 0, width, height);
      }

      for (const d of dust) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -10) d.x = width + 10;
        if (d.x > width + 10) d.x = -10;
        if (d.y < -10) d.y = height + 10;
        if (d.y > height + 10) d.y = -10;

        const twinkle = 0.5 + 0.5 * Math.sin(time * 1.2 + d.phase);
        const hue = 210 + ((d.phase * 20) % 100);
        gc.globalAlpha = d.alpha * (0.4 + 0.6 * twinkle);
        gc.fillStyle = `hsla(${hue}, 85%, 65%, 1)`;
        gc.beginPath();
        gc.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        gc.fill();
      }

      gc.globalCompositeOperation = 'source-over';
      gc.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduced) {
      tick(1000);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}