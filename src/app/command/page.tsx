/**
 * page.tsx — Dedicated Operations Command Mission Control
 *
 * Renders the widescreen command cockpit for stadium supervisors.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStadiumOS } from '../../context/StadiumOSContext';
import StadiumMap from '../../components/StadiumMap';
import { navigationAgent } from '../../agents/navigationAgent';
import { t } from '../../utils/translations';
import {
  Activity,
  ShieldAlert,
  Clock,
  Users,
  Compass,
  Heart,
  ChevronRight,
  Monitor,
  Zap,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { OCCUPANCY_TEXT } from '../../mockData';

export default function CommandMissionControlPage() {
  const {
    incidents,
    volunteers,
    concessions,
    transit,
    alerts,
    agentLogs,
    sustainability,
    densityMap,
    preferredLanguage,
    highlightedPath,
    setHighlightedPath,
    addEvent,
    addAgentLog
  } = useStadiumOS();

  const [activeTab, setActiveTab] = useState<'map' | 'transit' | 'alerts'>('map');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

  const activeIncCount = incidents.filter(i => i.status === 'active').length;

  const handleManualAlarm = () => {
    const correlationId = `corr-cmd-alarm-${Math.random().toString(36).substr(2, 9)}`;
    addAgentLog(
      'Operations Command',
      'Emergency Agent',
      'Manual override: Stadium Audio/Visual Alarms proposed by administrator.',
      'critical',
      correlationId
    );

    addEvent(
      'PROPOSE_CRITICAL_ACTION',
      { actionType: 'STADIUM_ALARM', description: 'Stadium-wide audio/visual alert' },
      'Operations Command',
      'Emergency Agent',
      'critical',
      correlationId
    );
  };

  return (
    <div className="h-full w-full bg-obsidian-dark flex flex-col p-6 overflow-hidden select-none">
      
      {/* Upper Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden mb-4">
        
        {/* Left 8 Columns: Map Cockpit & Concessions Graph */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          
          {/* Main SVG Map Twin */}
          <div className="flex-1 bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden relative backdrop-blur-xl">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-stadium-green" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
                  {t('cmd.widescreen', preferredLanguage)}
                </h3>
              </div>
              <span className="text-[9px] bg-stadium-green/15 border border-stadium-green/30 text-stadium-green font-bold px-1.5 py-0.5 rounded uppercase">
                {t('cmd.badge', preferredLanguage)}
              </span>
            </div>

            <div className="flex-1 bg-obsidian-dark border border-white/5 rounded-xl flex items-center justify-center p-2 relative min-h-[300px]">
              <StadiumMap
                highlightedPath={highlightedPath}
                densityMap={densityMap}
                incidentPins={incidents.map(i => ({ id: i.id, nodeId: i.nodeId, type: i.type }))}
                volunteerMarkers={volunteers.map(v => ({ volunteerId: v.id, nodeId: v.nodeId, name: v.name, status: v.status, taskType: v.task ? 'lost-child' : null }))}
                onNodeClick={(nodeId) => {
                  const route = navigationAgent.findRoute(nodeId, 'Sec104', false);
                  setHighlightedPath(route.path);
                }}
              />
              
              <div className="absolute bottom-3 left-3 bg-obsidian-card/85 border border-white/10 px-3 py-1 rounded-lg text-[9px] text-slate-400 select-none">
                ♿🚫 Stairs Warning: Nodes Sec102, Sec106, Sec114 are not step-free.
              </div>
            </div>
          </div>

          {/* HTML5 Concessions queue wait-time bar chart */}
          <div className="h-44 bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col backdrop-blur-xl select-none">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">{t('cmd.wait_times', preferredLanguage)}</div>
            <div className="flex-1 flex items-end gap-6 px-4">
              {Object.values(concessions).map(stand => {
                const maxWait = 20;
                const heightPct = Math.min((stand.waitMin / maxWait) * 100, 100);
                const isHigh = stand.waitMin >= 12;

                return (
                  <div key={stand.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className={`text-[10px] font-mono font-bold ${isHigh ? 'text-stadium-red' : 'text-stadium-green'}`}>
                      {stand.waitMin}m
                    </span>
                    <div className="w-full bg-white/5 rounded-t-md h-20 relative overflow-hidden">
                      <div 
                        className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 ${isHigh ? 'bg-gradient-to-t from-stadium-red/20 to-stadium-red shadow-neon-red' : 'bg-gradient-to-t from-stadium-green/20 to-stadium-green shadow-neon'}`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 truncate max-w-[65px] font-semibold">
                      {stand.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 4 Columns: Control deck, alerts, and system health */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          
          {/* Emergency dispatch override card */}
          <div className="bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-xl select-none">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase">{t('cmd.control_deck', preferredLanguage)}</h3>
            
            <button 
              onClick={handleManualAlarm}
              className="w-full py-3 bg-stadium-red/10 hover:bg-stadium-red hover:text-white border border-stadium-red/30 text-stadium-red font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-neon-red animate-pulse"
            >
              <Flame className="h-4 w-4" />
              {t('cmd.alarm_propose', preferredLanguage)}
            </button>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-500">Live Infrastructure Node</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Audio/Visual sirens</span>
                <span className="text-stadium-green font-bold">READY</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Broadband exit arrows</span>
                <span className="text-stadium-green font-bold">STEADY</span>
              </div>
            </div>
          </div>

          {/* Broadcast Alerts Deck */}
          <div className="flex-1 bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden backdrop-blur-xl select-none">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">{t('cmd.alert_feeds', preferredLanguage)}</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.priority === 'critical' ? 'text-stadium-red' : 'text-stadium-amber'}`} />
                  <div>
                    <div className="font-bold text-slate-200">{alert.title}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Row: scrolling audit logs terminal */}
      <div className="h-44 border border-white/10 rounded-2xl p-4 bg-obsidian-dark flex flex-col gap-2 relative">
        <div className="flex justify-between items-center select-none">
          <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-stadium-green shadow-neon animate-pulse" />
            {t('cmd.audit_terminal', preferredLanguage)}
          </div>
          <span className="text-[9px] bg-stadium-green/10 border border-stadium-green/30 text-stadium-green px-1.5 rounded uppercase font-mono font-bold">Demo Live Log</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 font-mono text-[10px] leading-relaxed select-text">
          {agentLogs.map(log => (
            <div 
              key={log.id} 
              className={`border-l-2 pl-3 py-0.5 bg-white/5 ${log.severity === 'critical' ? 'border-stadium-red bg-stadium-red/5' : log.severity === 'warning' ? 'border-stadium-amber' : 'border-stadium-green'}`}
            >
              <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                <span>[{log.fromAgent}] ➔ [{log.toAgent}] | ID: {log.correlationId}</span>
                <span>{isMounted ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
              </div>
              <div className="text-slate-300">
                {preferredLanguage !== 'en' && log.localizedAction ? log.localizedAction : log.action}
              </div>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>

    </div>
  );
}
