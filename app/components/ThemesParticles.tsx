'use client';

import { useEffect, useRef } from 'react';

type HexNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  angle: number;
  orbitRadius: number;
  pulsePhase: number;
  label: string;
};

const THEME_LABELS = ['Performance', 'UI/UX Usability', 'Billing', 'Integrations', 'Security', 'Analytics'];
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

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

    const count = Math.min(25, Math.floor((width * height) / 30000));
    const nodes: HexNode[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 8 + 6,
      color: COLORS[i % COLORS.length],
      angle: Math.random() * Math.PI * 2,
      orbitRadius: Math.random() * 30 + 15,
      pulsePhase: Math.random() * Math.PI * 2,
      label: THEME_LABELS[i % THEME_LABELS.length],
    }));

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function drawHexagon(x: number, y: number, r: number, color: string, alpha: number) {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const hx = x + r * Math.cos(a);
        const hy = y + r * Math.sin(a);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * 1.5;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    function render(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const time = t / 1000;

      // Draw connecting energy lines between nearby theme nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const alpha = (1 - dist / 180) * 0.25;
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, nodes[i].color);
            grad.addColorStop(1, nodes[j].color);
            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Update & render theme nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        n.angle += 0.01;
        const currentR = n.radius + Math.sin(time * 2.5 + n.pulsePhase) * 2;
        const orbitX = n.x + Math.cos(n.angle) * n.orbitRadius;
        const orbitY = n.y + Math.sin(n.angle) * n.orbitRadius;

        // Draw central Hexagon node
        drawHexagon(n.x, n.y, currentR * 1.5, n.color, 0.2);

        // Draw orbiting satellite point
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 3, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Draw outer aura ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentR * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
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
