/**
 * layout.tsx — Next.js Root Layout
 *
 * Implements the global layout context, global top system status bar,
 * RTL support for Arabic, and accessibility-compliant visual details.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { StadiumOSProvider, useStadiumOS } from '../context/StadiumOSContext';
import { Activity, Clock, Users, ShieldAlert, Heart, Compass, Globe, Sparkles } from 'lucide-react';
import { t } from '../utils/translations';
import './globals.css';

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    incidents,
    preferredLanguage,
    setPreferredLanguage,
    stepFree,
    setStepFree,
    resetDemo
  } = useStadiumOS();

  // Clock state
  const [timeText, setTimeText] = useState('12:00:00 PM');
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeIncCount = incidents.filter(i => i.status === 'active').length;
  const isArabic = preferredLanguage === 'ar';

  return (
    <html lang={preferredLanguage} dir={isArabic ? 'rtl' : 'ltr'}>
      <body className="bg-obsidian-dark text-slate-100 font-sans min-h-screen md:h-screen w-full md:overflow-hidden flex flex-col select-none">
        
        {/* ── FIXED TOP STATUS BAR (WCAG compliant) ── */}
        <header className="h-14 bg-obsidian-card/90 border-b border-obsidian-border/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 z-50 select-none">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <img src="/stadium-os-logo.svg" alt="Stadium OS logo" aria-label="Stadium OS logo" className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <span className="font-display font-extrabold uppercase tracking-wide text-xs sm:text-md bg-gradient-to-r from-white to-stadium-green bg-clip-text text-transparent">
                {t('stadium.title', preferredLanguage)}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2.5 py-0.5 text-xs text-slate-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-stadium-green shadow-neon animate-pulse" />
              {t('stadium.subtitle', preferredLanguage)}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold select-none">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-slate-200">{timeText}</span>
            </div>

            {/* Stadium Occupancy */}
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <Users className="h-3.5 w-3.5 text-stadium-blue" />
              <span>{t('status.occupancy', preferredLanguage)}: <span className="font-mono text-slate-200 font-bold">76,422 / 80,000 (95.5%)</span></span>
              <span className="text-[9px] bg-stadium-blue/10 border border-stadium-blue/30 text-stadium-blue px-1 rounded uppercase tracking-wider">{t('status.demo_notice', preferredLanguage)}</span>
            </div>

            {/* System Health */}
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Heart className="h-3.5 w-3.5 text-stadium-green" />
              <span>{t('status.health', preferredLanguage)}: <span className="text-stadium-green">99.8%</span></span>
            </div>

            {/* Active Incidents */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <ShieldAlert className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeIncCount > 0 ? 'text-stadium-red animate-bounce' : 'text-slate-500'}`} />
              <span className="hidden sm:inline text-slate-400">{t('status.incidents', preferredLanguage)}: </span>
              <span className={`px-1 sm:px-1.5 py-0.5 rounded font-mono ${activeIncCount > 0 ? 'bg-stadium-red/20 border border-stadium-red/40 text-stadium-red' : 'bg-white/5 text-slate-400'}`}>
                {activeIncCount}
              </span>
            </div>

            {/* Step-Free Toggle Status */}
            <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-4">
              <Compass className={`h-4 w-4 ${stepFree ? 'text-stadium-blue' : 'text-slate-500'}`} />
              <span className="text-slate-400">{t('status.ramps', preferredLanguage)}:</span>
              <button 
                onClick={() => setStepFree(!stepFree)}
                className={`px-2 py-0.5 rounded border transition-colors ${stepFree ? 'bg-stadium-blue/20 border-stadium-blue text-stadium-blue' : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
              >
                {stepFree ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-2 sm:pl-4">
              <Globe className="h-3.5 w-3.5 text-stadium-gold hidden xs:inline" />
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="bg-obsidian-card border border-white/10 text-slate-200 rounded px-1 py-0.5 text-[10px] sm:text-xs outline-none cursor-pointer focus:border-stadium-gold"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="ar">AR</option>
                <option value="pt">PT</option>
                <option value="fr">FR</option>
              </select>
            </div>

            {/* Reset Simulation */}
            <button 
              onClick={resetDemo}
              className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:bg-stadium-red/20 hover:border-stadium-red hover:text-stadium-red transition-all duration-150 text-[10px] sm:text-xs"
            >
              {t('status.reset', preferredLanguage)}
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT WRAPPER ── */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>

      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <StadiumOSProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </StadiumOSProvider>
  );
}
