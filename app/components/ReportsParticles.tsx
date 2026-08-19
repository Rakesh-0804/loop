'use client';

import { useEffect, useRef } from 'react';

type Diamond = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  vRot: number;
  vy: number;
  alpha: number;
  hue: number;
};

export default function ReportsParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf = 0;

    const count = Math.min(45, Math.floor((width * height) / 18000));
    const diamonds: Diamond[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 12 + 6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.4 + 0.2,
      hue: Math.random() > 0.5 ? 45 : 270, // Gold & Purple
    }));

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const d of diamonds) {
        d.y += d.vy;
        d.rotation += d.vRot;

        if (d.y + d.size < 0) {
          d.y = height + d.size;
          d.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);

        ctx.beginPath();
        ctx.moveTo(0, -d.size);
        ctx.lineTo(d.size * 0.7, 0);
        ctx.lineTo(0, d.size);
        ctx.lineTo(-d.size * 0.7, 0);
        ctx.closePath();

        ctx.strokeStyle = `hsla(${d.hue}, 85%, 65%, ${d.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = `hsla(${d.hue}, 85%, 65%, ${d.alpha * 0.2})`;
        ctx.fill();

        ctx.restore();
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
