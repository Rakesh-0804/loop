'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  ux: number;
  uy: number;
  uz: number;
  hue: number;
  radius: number;
  phase: number;
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const el = canvas;
    const gc = ctx;

    let width = 0;
    let height = 0;
    let raf = 0;
    let particles: Particle[] = [];
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let sprite: HTMLCanvasElement | null = null;

    function buildSprite() {
      sprite = document.createElement('canvas');
      sprite.width = 64;
      sprite.height = 64;
      const sctx = sprite.getContext('2d');
      if (!sctx) return;
      const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.25, 'rgba(255,255,255,0.6)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 64, 64);
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = width * DPR;
      el.height = height * DPR;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      gc.setTransform(DPR, 0, 0, DPR, 0, 0);

      let target = Math.min(240, Math.max(90, Math.floor((width * height) / 9000)));
      if (reducedMotion) target = Math.min(120, target);
      const golden = Math.PI * (3 - Math.sqrt(5));
      const baseRadius = Math.min(width, height) * 0.38;

      particles = Array.from({ length: target }, (_, i) => {
        const y = 1 - (i / Math.max(target - 1, 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        return {
          ux: Math.cos(theta) * r,
          uy: y,
          uz: Math.sin(theta) * r,
          hue: 210 + ((i / target) * 120) % 120,
          radius: baseRadius * (0.82 + Math.random() * 0.35),
          phase: Math.random() * Math.PI * 2,
        };
      });
    }

    function tick(t: number) {
      const time = t / 1000;
      gc.clearRect(0, 0, width, height);
      gc.globalCompositeOperation = 'lighter';

      const rotY = time * 0.12;
      const rotX = reducedMotion ? 0.2 : Math.sin(time * 0.08) * 0.35;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 700;
      const sorted = particles;

      for (const p of sorted) {
        const breathe = 1 + Math.sin(time * 0.5 + p.phase) * 0.14;
        const r = p.radius * breathe;

        const x = p.ux;
        const z = p.uz;
        const rx = x * cosY + z * sinY;
        const rz = -x * sinY + z * cosY;
        const ry = p.uy * cosX - rz * sinX;
        const rzz = p.uy * sinX + rz * cosX;

        const scale = fov / (fov + rzz * r * 0.5 + 0.001);
        const sx = cx + rx * r * scale;
        const sy = cy + ry * r * scale;

        if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) continue;

        const depth = (rzz + 1) / 2;
        const hue = (p.hue + time * 6) % 360;
        const size = (3 + depth * 6) * scale;

        gc.save();
        gc.globalAlpha = 0.18 + depth * 0.34;
        gc.fillStyle = `hsla(${hue}, 85%, 60%, 1)`;
        gc.translate(sx, sy);
        gc.scale(size / 32, size / 32);
        if (sprite) gc.drawImage(sprite, -32, -32, 64, 64);
        gc.restore();
      }

      gc.globalCompositeOperation = 'source-over';

      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      }
    }

    buildSprite();
    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
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