/**
 * page.tsx — Dedicated Volunteer Staff Tablet
 *
 * Renders the touch-optimized task dispatch dashboard for volunteer personnel.
 */

'use client';

import React, { useState } from 'react';
import { useStadiumOS } from '../../context/StadiumOSContext';
import { t } from '../../utils/translations';
import {
  Tablet,
  Users,
  Compass,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function VolunteerTabletPage() {
  const {
    volunteers,
    incidents,
    resolveIncident,
    addAgentLog,
    preferredLanguage
  } = useStadiumOS();

  const [activeVolId, setActiveVolId] = useState('VOL-001');

  const activeVol = volunteers.find(v => v.id === activeVolId);

  const handleAcceptTask = (taskName: string) => {
    addAgentLog(
      activeVol?.name || 'Staff Member',
      'Command Center',
      `Accepted dispatch assignment: "${taskName}"`,
      'info'
    );
  };

  return (
    <div className="h-full w-full bg-obsidian-dark flex justify-center items-center p-0 sm:p-6 md:overflow-hidden select-none">
      
      {/* Tablet Shell */}
      <div className="max-w-2xl w-full h-full sm:h-[600px] bg-obsidian-card border-0 sm:border border-white/10 rounded-none sm:rounded-[28px] overflow-hidden flex flex-col shadow-none sm:shadow-neon-gold relative">
        
        {/* Tablet Header */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tablet className="h-5 w-5 text-stadium-gold" />
            <div>
              <h1 className="font-display font-extrabold text-sm text-slate-200">
                {t('vol.tablet_title', preferredLanguage)}
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">FIFA 2026 Operations Node</p>
            </div>
          </div>
          <span className="text-[10px] bg-stadium-gold/15 border border-stadium-gold/30 text-stadium-gold font-bold px-2 py-0.5 rounded uppercase">
            {t('vol.badge', preferredLanguage)}
          </span>
        </div>

        <div className="flex-1 p-4 sm:p-6 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden">
          
          {/* Left: Crew Selector */}
          <div className="w-full md:w-1/3 flex flex-col gap-3 shrink-0">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase">{t('vol.crew_roster', preferredLanguage)}</h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {volunteers.map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveVolId(v.id)}
                  className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1 transition-all duration-150 ${activeVolId === v.id ? 'bg-stadium-gold/15 border-stadium-gold text-white shadow-neon-gold' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{v.name}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${v.status === 'available' ? 'bg-stadium-green' : 'bg-stadium-red animate-pulse'}`} />
                  </div>
                  <span className="text-[9px] text-slate-500">Zone: Concourse {v.zone.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Dispatch Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeVol ? (
              <div className="flex-1 flex flex-col">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 select-none">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-stadium-gold/10 border border-stadium-gold/30 flex items-center justify-center text-stadium-gold font-display font-extrabold text-sm">
                        {activeVol.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-200">{activeVol.name}</h3>
                        <p className="text-[10px] text-slate-500">Zone: Concourse {activeVol.zone.toUpperCase()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${activeVol.status === 'available' ? 'bg-stadium-green/10 border border-stadium-green/30 text-stadium-green' : 'bg-stadium-red/10 border border-stadium-red/30 text-stadium-red'}`}>
                      {activeVol.status}
                    </span>
                  </div>
                </div>

                {/* Job Cards */}
                {activeVol.task ? (
                  <div className={`flex-1 border rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto select-none ${activeVol.task.description.includes('Amber') ? 'bg-stadium-amber/10 border-stadium-amber/40 shadow-neon-amber' : 'bg-stadium-red/10 border-stadium-red/40 shadow-neon-red'}`}>
                    
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className={activeVol.task.description.includes('Amber') ? 'text-stadium-amber' : 'text-stadium-red'}>
                        {t('vol.dispatch', preferredLanguage)}
                      </span>
                      <span className="text-slate-500 font-mono">TASK ID: {activeVol.task.id}</span>
                    </div>

                    <p className="text-sm text-slate-100 font-semibold leading-relaxed">
                      {activeVol.task.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Compass className="h-4 w-4 text-stadium-blue" />
                      <span>{t('vol.location', preferredLanguage)}: <span className="font-bold text-slate-200">Section {activeVol.task.nodeId.replace('Sec', '')}</span></span>
                    </div>

                    {/* Dual translation block */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
                      <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase">{t('vol.orig_msg', preferredLanguage)}</div>
                        <div className="text-xs text-slate-300 italic">"Me siento mal, me duele el pecho en la sección 104."</div>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="text-[8px] font-bold text-stadium-gold uppercase">{t('vol.trans_msg', preferredLanguage)}</div>
                        <div className="text-xs text-stadium-gold font-bold">"I feel sick, my chest hurts in Section 104."</div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => handleAcceptTask(activeVol.task!.description)}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-display font-extrabold text-xs uppercase text-slate-300 transition-colors"
                      >
                        {t('vol.accept', preferredLanguage)}
                      </button>
                      <button
                        onClick={() => resolveIncident(activeVol.task!.id, activeVol.id)}
                        className="flex-1 py-2.5 bg-stadium-gold hover:bg-stadium-gold/80 text-obsidian-dark font-display font-extrabold text-xs uppercase rounded-xl transition-all shadow-neon-gold"
                      >
                        {t('vol.resolve', preferredLanguage)}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-2xl p-6 select-none">
                    <ShieldCheck className="h-10 w-10 text-slate-600 animate-pulse" />
                    <div className="text-xs font-bold text-slate-400">{t('vol.ready', preferredLanguage)}</div>
                    <div className="text-[10px] text-slate-500">{t('vol.monitoring', preferredLanguage)}</div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center text-xs text-slate-500 select-none">
                Select a volunteer from the crew roster.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
