/**
 * SimulatorVolunteerPanel.tsx — Volunteer tablet mockup panel for simulator
 */
'use client';
import React from 'react';
import { Compass, Clock } from 'lucide-react';
import { Volunteer } from '../types';
import { t } from '../utils/translations';

interface SimulatorVolunteerPanelProps {
  activeSimulatorTab: 'fan' | 'volunteer' | 'command';
  preferredLanguage: string;
  volunteers: Volunteer[];
  activeVolunteerId: string;
  setActiveVolunteerId: (id: string) => void;
  addAgentLog: (from: string, to: string, action: string, severity?: 'info' | 'warning' | 'error' | 'critical') => void;
  resolveIncident: (incidentId: string, volunteerId: string) => void;
}

export const SimulatorVolunteerPanel: React.FC<SimulatorVolunteerPanelProps> = React.memo(function SimulatorVolunteerPanel({
  activeSimulatorTab,
  preferredLanguage,
  volunteers,
  activeVolunteerId,
  setActiveVolunteerId,
  addAgentLog,
  resolveIncident
}) {
  const activeVol = volunteers.find(v => v.id === activeVolunteerId);

  return (
    <section className={`min-h-[580px] lg:min-h-0 lg:col-span-3 bg-obsidian-card/45 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative select-none shadow-lg ${activeSimulatorTab === 'volunteer' ? 'flex' : 'hidden lg:flex'}`}>
      {/* Header */}
      <div className="h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-stadium-gold shadow-neon animate-pulse" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
            {t('vol.title', preferredLanguage)}
          </h3>
        </div>
        <span className="text-[9px] bg-stadium-gold/15 border border-stadium-gold/30 text-stadium-gold font-bold px-1.5 py-0.5 rounded uppercase">
          {t('vol.badge', preferredLanguage)}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col overflow-hidden select-none">
        {/* Roster list switcher */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {volunteers.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveVolunteerId(v.id)}
              className={`py-1.5 text-xs font-bold rounded border transition-all duration-150 ${activeVolunteerId === v.id ? 'bg-stadium-gold/20 border-stadium-gold text-stadium-gold shadow-neon-gold' : 'bg-white/5 border-white/10 text-slate-400'}`}
              aria-label={`Select volunteer ${v.name}`}
            >
              {v.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Profile Status */}
        {activeVol ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-stadium-gold/10 border border-stadium-gold/30 flex items-center justify-center text-stadium-gold font-display font-extrabold text-sm select-none">
                  {activeVol.initials}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-200">{activeVol.name}</div>
                  <div className="text-[10px] text-slate-500">Zone: Concourse {activeVol.zone.toUpperCase()}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${activeVol.status === 'available' ? 'bg-stadium-green/10 border border-stadium-green/30 text-stadium-green' : 'bg-stadium-red/10 border border-stadium-red/30 text-stadium-red'}`}>
                {activeVol.status}
              </span>
            </div>

            {/* Active Job Dispatches */}
            {activeVol.task ? (
              <div className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors select-none ${activeVol.task.description.includes('Amber') ? 'bg-stadium-amber/10 border-stadium-amber/50 shadow-neon-amber' : 'bg-stadium-red/10 border-stadium-red/50 shadow-neon-red'}`}>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className={activeVol.task.description.includes('Amber') ? 'text-stadium-amber' : 'text-stadium-red'}>{t('vol.dispatch', preferredLanguage)}</span>
                  <span className="text-slate-500">ID: {activeVol.task.id}</span>
                </div>

                <div className="text-xs text-slate-200 font-semibold leading-relaxed">
                  {activeVol.task.description}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5" />
                  {t('vol.location', preferredLanguage)}: Section {activeVol.task.nodeId.replace('Sec', '')}
                </div>

                {/* Side-by-Side Original-to-English Translation box */}
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 flex flex-col gap-1.5 select-none">
                  <div className="text-[8px] font-bold text-slate-500 uppercase">{t('vol.orig_msg', preferredLanguage)}</div>
                  <div className="text-xs text-slate-300 italic">"Me siento mal, me duele el pecho en la sección 104."</div>
                  <div className="text-[8px] font-bold text-stadium-gold uppercase border-t border-white/5 pt-1.5 mt-1">{t('vol.trans_msg', preferredLanguage)}</div>
                  <div className="text-xs text-stadium-gold font-semibold">"I feel sick, my chest hurts in Section 104."</div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => addAgentLog('Staff Tablet', 'Command Center', `${activeVol.name} accepted medical dispatch task.`, 'info')}
                    className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/15 text-slate-300 font-display font-extrabold text-xs uppercase rounded-lg transition-colors"
                  >
                    {t('vol.accept', preferredLanguage)}
                  </button>
                  <button 
                    onClick={() => resolveIncident(activeVol.task!.id, activeVol.id)}
                    className="flex-1 py-2 bg-stadium-gold text-obsidian-dark font-display font-extrabold text-xs uppercase rounded-lg transition-colors hover:bg-stadium-gold/80"
                  >
                    {t('vol.resolve', preferredLanguage)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl p-4">
                <Clock className="h-8 w-8 text-slate-600 animate-pulse" />
                <div className="text-xs">No active dispatch tasks. Monitoring Concourse {activeVol.zone.toUpperCase()} zone...</div>
              </div>
            )}

            {/* Certified Skills Roster */}
            <div className="mt-auto border-t border-white/5 pt-4">
              <div className="text-[9px] uppercase font-bold text-slate-500 mb-2">Certified Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {activeVol.skills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-slate-300 capitalize">
                    {skill.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center text-xs text-slate-500">
            Select a volunteer from the crew roster.
          </div>
        )}
      </div>
    </section>
  );
});
