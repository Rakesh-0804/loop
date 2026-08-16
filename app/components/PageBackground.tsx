'use client';

import { usePathname } from 'next/navigation';
import ParticleBackground from './ParticleBackground';
import LoginParticles from './LoginParticles';
import DashboardParticles from './DashboardParticles';

export default function PageBackground() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/signup') {
    return <LoginParticles />;
  }
  if (pathname === '/dashboard') {
    return <DashboardParticles />;
  }
  return <ParticleBackground />;
}