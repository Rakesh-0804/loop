'use client';

import { useEffect, useRef } from 'react';

type Dot = {
  x: number;
  y: number;
  baseAlpha: number;
  phase: number;
};

export default function SettingsParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf = 0;

    const spacing = 45;
    const dots: Dot[] = [];

    function initDots() {
      dots.length = 0;
      for (let x = 20; x < width; x += spacing) {
        for (let y = 20; y < height; y += spacing) {
          dots.push({
            x,
            y,
            baseAlpha: Math.random() * 0.2 + 0.05,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    }

    function render(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const time = t / 1000;

      for (const d of dots) {
        const wave = Math.sin(time * 1.5 + (d.x + d.y) * 0.005 + d.phase);
        const alpha = Math.max(0.02, d.baseAlpha + wave * 0.15);

        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.5 + wave * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    initDots();
    raf = requestAnimationFrame(render);

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
