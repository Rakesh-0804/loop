'use client';

import { usePathname } from 'next/navigation';
import ParticleBackground from './ParticleBackground';
import LoginParticles from './LoginParticles';
import DashboardParticles from './DashboardParticles';
import InboxParticles from './InboxParticles';
import AnalyticsParticles from './AnalyticsParticles';
import ThemesParticles from './ThemesParticles';
import ReportsParticles from './ReportsParticles';
import SettingsParticles from './SettingsParticles';

export default function PageBackground() {
  const pathname = usePathname() || '';

  if (pathname === '/login' || pathname === '/signup') {
    return <LoginParticles />;
  }
  if (pathname === '/dashboard') {
    return <DashboardParticles />;
  }
  if (pathname === '/inbox') {
    return <InboxParticles />;
  }
  if (pathname === '/analysis') {
    return <AnalyticsParticles />;
  }
  if (pathname === '/themes') {
    return <ThemesParticles />;
  }
  if (pathname === '/reports') {
    return <ReportsParticles />;
  }
  if (pathname.startsWith('/settings')) {
    return <SettingsParticles />;
  }

  return <ParticleBackground />;
}