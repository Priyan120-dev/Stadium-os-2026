/**
 * page.tsx — Role Selector Page
 *
 * Renders the premium landing selection cards for Fan, Volunteer,
 * and Command views, highlighting real-time synchronized previews.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { User, Users, Activity, Sparkles, ChevronRight, Phone, Tablet, Compass } from 'lucide-react';
import { OCCUPANCY_TEXT } from '../mockData';
import { useStadiumOS } from '../context/StadiumOSContext';
import { t } from '../utils/translations';

export default function RoleSelectorPage() {
  const { preferredLanguage } = useStadiumOS();

  return (
    <div className="h-full w-full bg-obsidian-dark flex flex-col justify-center items-center px-6 relative select-none">
      
      {/* Background SVG nodes mesh grid (calm neon cyberpunk styling) */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="#00b0ff" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Animated node connections */}
          <path d="M 100 200 Q 300 150 500 300 T 800 250" fill="none" stroke="#00e676" strokeWidth="1" strokeDasharray="5,5" />
          <path d="M 200 450 Q 400 300 600 500 T 900 350" fill="none" stroke="#ffd700" strokeWidth="1" strokeDasharray="3,6" />
        </svg>
      </div>

      <div className="max-w-5xl w-full flex flex-col items-center z-10 text-center select-none">
        
        {/* Stadium OS Branding Hero */}
        <div className="flex items-center gap-2 mb-3 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-stadium-green">
          <Sparkles className="h-4 w-4 animate-pulse" />
          {t('landing.badge', preferredLanguage)}
        </div>

        <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-white mb-4">
          {t('landing.title', preferredLanguage)}
          <span className="block text-2xl md:text-3xl font-light text-slate-400 mt-2">
            {t('landing.subtitle', preferredLanguage)}
          </span>
        </h1>

        <p className="max-w-2xl text-sm md:text-base text-slate-400 mb-10 leading-relaxed">
          {t('landing.desc', preferredLanguage)}
        </p>

        {/* ── THREE ROLE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
          
          {/* Fan Companion */}
          <Link href="/fan" className="group text-left">
            <div className="h-64 bg-obsidian-card/45 border border-white/10 group-hover:border-stadium-blue/50 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 group-hover:shadow-neon-blue cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-stadium-blue/10 border border-stadium-blue/30 rounded-xl text-stadium-blue">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">MATEO GARCÍA</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-stadium-blue transition-colors">
                  {t('landing.fan_title', preferredLanguage)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('landing.fan_desc', preferredLanguage)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-stadium-blue font-bold">
                {t('landing.fan_btn', preferredLanguage)} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Volunteer Tablet */}
          <Link href="/volunteer" className="group text-left">
            <div className="h-64 bg-obsidian-card/45 border border-white/10 group-hover:border-stadium-gold/50 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 group-hover:shadow-neon-gold cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-stadium-gold/10 border border-stadium-gold/30 rounded-xl text-stadium-gold">
                    <Tablet className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">SARAH CHEN</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-stadium-gold transition-colors">
                  {t('landing.vol_title', preferredLanguage)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('landing.vol_desc', preferredLanguage)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-stadium-gold font-bold">
                {t('landing.vol_btn', preferredLanguage)} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Mission Control */}
          <Link href="/command" className="group text-left">
            <div className="h-64 bg-obsidian-card/45 border border-white/10 group-hover:border-stadium-green/50 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 group-hover:shadow-neon-green cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-stadium-green/10 border border-stadium-green/30 rounded-xl text-stadium-green">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">NASA COMMAND</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-stadium-green transition-colors">
                  {t('landing.cmd_title', preferredLanguage)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('landing.cmd_desc', preferredLanguage)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-stadium-green font-bold">
                {t('landing.cmd_btn', preferredLanguage)} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

        </div>

        {/* ── SANDBOX SIMULATOR CALL TO ACTION (PITCH HERO ACTION) ── */}
        <div className="flex flex-col items-center gap-4 bg-obsidian-card/60 border border-white/10 rounded-2xl p-6 max-w-2xl w-full backdrop-blur-md">
          <div className="text-xs text-slate-400 font-semibold select-none flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-stadium-blue shadow-neon animate-pulse" />
            {t('landing.sandbox_notice', preferredLanguage)}
          </div>
          <Link href="/simulator">
            <button className="px-8 py-3.5 bg-stadium-green hover:bg-stadium-green/80 text-obsidian-dark font-display font-extrabold uppercase rounded-xl flex items-center gap-2 shadow-neon transition-all duration-200 hover:scale-105 active:scale-95">
              {t('landing.sandbox_btn', preferredLanguage)}
              <ChevronRight className="h-5 w-5" />
            </button>
          </Link>
          <div className="text-[10px] text-slate-500 font-mono">
            Stated occupancy: {OCCUPANCY_TEXT} | Active Swarm Nodes: 12
          </div>
        </div>

      </div>
    </div>
  );
}
