/**
 * SimulatorCommandPanel.tsx — Command Mission Control mockup panel for simulator
 */
'use client';
import React, { useRef, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import StadiumMap from './StadiumMap';
import { navigationAgent } from '../agents/navigationAgent';
import { Volunteer, Incident, Alert, AgentLog, SustainabilityMetrics } from '../types';
import { t } from '../utils/translations';
import { OCCUPANCY_TEXT } from '../mockData';

interface SimulatorCommandPanelProps {
  activeSimulatorTab: 'fan' | 'volunteer' | 'command';
  preferredLanguage: string;
  highlightedPath: string[];
  setHighlightedPath: (path: string[]) => void;
  densityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'>;
  incidents: Incident[];
  volunteers: Volunteer[];
  stepFree: boolean;
  addAgentLog: (from: string, to: string, action: string, severity?: 'info' | 'warning' | 'error' | 'critical') => void;
  handleSoundAlarmTrigger: () => void;
  alerts: Alert[];
  agentLogs: AgentLog[];
  sustainability: SustainabilityMetrics;
}

export const SimulatorCommandPanel: React.FC<SimulatorCommandPanelProps> = React.memo(function SimulatorCommandPanel({
  activeSimulatorTab,
  preferredLanguage,
  highlightedPath,
  setHighlightedPath,
  densityMap,
  incidents,
  volunteers,
  stepFree,
  addAgentLog,
  handleSoundAlarmTrigger,
  alerts,
  agentLogs,
  sustainability
}) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

  return (
    <section className={`min-h-[580px] lg:min-h-0 lg:col-span-6 bg-obsidian-card/45 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative select-none shadow-lg ${activeSimulatorTab === 'command' ? 'flex' : 'hidden lg:flex'}`}>
      <div className="h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-stadium-green shadow-neon animate-pulse" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
            Operations Mission Control
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-stadium-green/15 border border-stadium-green/30 text-stadium-green font-bold px-1.5 py-0.5 rounded uppercase">
            MetLife Twin
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden">
        
        {/* Upper: SVG Digital Twin & Active Alerts Side */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Stadium SVG Map */}
          <div className="md:col-span-8 bg-obsidian-dark border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[260px] relative">
            <StadiumMap
              highlightedPath={highlightedPath}
              densityMap={densityMap}
              incidentPins={incidents.map(i => ({ id: i.id, nodeId: i.nodeId, type: i.type }))}
              volunteerMarkers={volunteers.map(v => ({ volunteerId: v.id, nodeId: v.nodeId, name: v.name, status: v.status, taskType: v.task ? (v.task.description.includes('Amber') ? 'lost-child' : 'medical') : null }))}
              stepFree={stepFree}
              onNodeClick={(nodeId) => {
                const route = navigationAgent.findRoute(nodeId, 'Sec104', stepFree);
                setHighlightedPath(route.path);
                addAgentLog('Command Center', 'Navigation Agent', `Plotted manual route from ${nodeId} to Section 104.`, 'info');
              }}
            />
            
            {/* Visual accessibility notice (WCAG compliant, color alone warning alternative) */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-obsidian-card/80 border border-white/10 rounded px-2 py-0.5 text-[9px] text-slate-400">
              <span>♿🚫</span>
              <span>Section not step-free accessible</span>
            </div>
          </div>

          {/* Active alerts & Emergency Control Deck */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Emergency Control Deck</div>
            
            <button 
              onClick={handleSoundAlarmTrigger}
              className="py-2.5 bg-stadium-red/10 border border-stadium-red/30 text-stadium-red hover:bg-stadium-red hover:text-white font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              aria-label="Sound Stadium-wide Siren Alarm"
            >
              <ShieldAlert className="h-4 w-4" />
              Sound Stadium Alarm
            </button>

            {/* Exits Status Grid */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 select-none">
              <div className="text-[9px] uppercase font-bold text-slate-500">Emergency Exits status</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                  <span className="text-slate-400">E1 (North)</span>
                  <span className="text-stadium-green">●</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                  <span className="text-slate-400">E2 (East)</span>
                  <span className="text-stadium-green">●</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                  <span className="text-slate-400">E3 (South)</span>
                  <span className="text-stadium-green">●</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                  <span className="text-slate-400">E4 (West)</span>
                  <span className="text-stadium-green">●</span>
                </div>
              </div>
            </div>

            {/* Active Alerts List */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 overflow-y-auto space-y-2">
              <div className="text-[9px] uppercase font-bold text-slate-500">Active Alert Feeds</div>
              {alerts.map(alert => (
                <div key={alert.id} className="p-2 bg-white/5 rounded border border-white/10 flex items-start gap-1.5 text-xs">
                  <span className={alert.priority === 'critical' ? 'text-stadium-red' : 'text-stadium-amber'}>⚠️</span>
                  <div>
                    <div className="font-bold text-slate-200">{alert.title}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Bottom: Multi-Agent Audit Log Terminal */}
        <div className="border border-white/10 rounded-xl p-4 bg-obsidian-dark flex flex-col gap-2 min-h-[160px] max-h-[220px]">
          <div className="flex justify-between items-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-stadium-green shadow-neon animate-pulse" />
              {t('cmd.audit_terminal', preferredLanguage)}
            </div>
            <span className="text-[9px] bg-stadium-green/10 border border-stadium-green/30 text-stadium-green px-1.5 rounded uppercase tracking-wider font-mono select-none">Demo Live Data</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-[11px] leading-relaxed select-text">
            {agentLogs.map((log) => (
              <div 
                key={log.id} 
                className={`border-l-2 pl-3 py-1 bg-white/5 ${log.severity === 'critical' ? 'border-stadium-red bg-stadium-red/5' : log.severity === 'warning' ? 'border-stadium-amber' : 'border-stadium-green'}`}
              >
                <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                  <span>[{log.fromAgent}] ➔ [{log.toAgent}]</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                {/* Show side-by-side translation if selected language is non-English */}
                {preferredLanguage !== 'en' && log.localizedAction ? (
                  <div className="text-slate-300">
                    <span className="text-slate-500 select-none mr-1">[{preferredLanguage.toUpperCase()}]</span>
                    {log.localizedAction}
                  </div>
                ) : (
                  <div className="text-slate-300">{log.action}</div>
                )}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Lower: KPI analytics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
            <div className="text-[9px] text-slate-500 uppercase font-bold">{t('status.occupancy', preferredLanguage)}</div>
            <div className="font-display font-extrabold text-sm text-slate-200 mt-1">{OCCUPANCY_TEXT}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
            <div className="text-[9px] text-slate-500 uppercase font-bold">{t('cmd.response_speed', preferredLanguage)}</div>
            <div className="font-display font-extrabold text-sm text-stadium-green mt-1">2.4 min</div>
            <div className="text-[8px] text-slate-500">Benchmark target: 4.5m</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
            <div className="text-[9px] text-slate-500 uppercase font-bold">{t('cmd.active_incidents', preferredLanguage)}</div>
            <div className="font-display font-extrabold text-sm text-stadium-red mt-1">{incidents.length} {t('cmd.active_incidents_suffix', preferredLanguage) || 'incidents'}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
            <div className="text-[9px] text-slate-500 uppercase font-bold">{t('cmd.green_score', preferredLanguage)}</div>
            <div className="font-display font-extrabold text-sm text-stadium-gold mt-1">{sustainability.greenScore} / 100</div>
          </div>

        </div>

      </div>
    </section>
  );
});
