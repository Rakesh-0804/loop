'use client';

import { useEffect, useRef } from 'react';

type Stream = {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  hue: number;
};

export default function AnalyticsParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf = 0;

    const count = Math.min(60, Math.floor((width * height) / 15000));
    const streams: Stream[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 1.5 + 0.5,
      length: Math.random() * 40 + 20,
      opacity: Math.random() * 0.4 + 0.2,
      hue: Math.random() > 0.4 ? 160 : 190, // Emerald & Cyan
    }));

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const s of streams) {
        s.y -= s.speed;
        if (s.y + s.length < 0) {
          s.y = height + s.length;
          s.x = Math.random() * width;
        }

        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length);
        grad.addColorStop(0, `hsla(${s.hue}, 90%, 60%, ${s.opacity})`);
        grad.addColorStop(1, `hsla(${s.hue}, 90%, 60%, 0)`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sparkle head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 75%, ${s.opacity + 0.3})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    render();

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
