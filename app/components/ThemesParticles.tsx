'use client';

import { useEffect, useRef } from 'react';

type Bubble = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  pulsePhase: number;
};

export default function ThemesParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf = 0;

    const count = Math.min(35, Math.floor((width * height) / 25000));
    const bubbles: Bubble[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 18 + 8,
      hue: (i * 360) / count,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function render(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const time = t / 1000;

      for (const b of bubbles) {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 0 || b.x > width) b.vx *= -1;
        if (b.y < 0 || b.y > height) b.vy *= -1;

        const currentHue = (b.hue + time * 10) % 360;
        const currentRadius = b.radius + Math.sin(time * 2 + b.pulsePhase) * 3;

        // Draw outer glow ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${currentHue}, 80%, 65%, 0.15)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw bubble body
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(b.x - currentRadius * 0.3, b.y - currentRadius * 0.3, 0, b.x, b.y, currentRadius);
        grad.addColorStop(0, `hsla(${currentHue}, 90%, 75%, 0.3)`);
        grad.addColorStop(1, `hsla(${currentHue}, 80%, 50%, 0.05)`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = `hsla(${currentHue}, 85%, 65%, 0.4)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
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
