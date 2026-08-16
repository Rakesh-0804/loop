'use client';

import { useEffect, useRef } from 'react';

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  phase: number;
};

export default function DashboardParticles() {
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
    let nodes: Node[] = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = width * DPR;
      el.height = height * DPR;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      gc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = Math.min(110, Math.max(50, Math.floor((width * height) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: 1 + Math.random() * 2,
        hue: 190 + Math.random() * 80,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function tick(t: number) {
      const time = t / 1000;
      gc.clearRect(0, 0, width, height);
      gc.globalCompositeOperation = 'lighter';

      const linkDist = Math.min(width, height) * 0.18;

      gc.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / linkDist) * 0.22;
            gc.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 80%, 65%, ${alpha})`;
            gc.beginPath();
            gc.moveTo(a.x, a.y);
            gc.lineTo(b.x, b.y);
            gc.stroke();
          }
        }
      }

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) n.x = width + 10;
        if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        if (n.y > height + 10) n.y = -10;

        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + n.phase);
        const size = n.size * (0.7 + pulse * 0.6);
        gc.globalAlpha = 0.3 + pulse * 0.5;
        gc.fillStyle = `hsla(${n.hue}, 85%, 62%, 1)`;
        gc.beginPath();
        gc.arc(n.x, n.y, size, 0, Math.PI * 2);
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