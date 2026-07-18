/**
 * page.tsx — Operations Command Mission Control (5-Tab Cockpit)
 *
 * Tabs: Map | Agents | Events | Crowd | Analytics | Sustainability | Emergency
 */

'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useStadiumOS } from '../../context/StadiumOSContext';
import StadiumMap from '../../components/StadiumMap';
import { AgentMonitorPanel } from '../../components/AgentMonitorPanel';
import { AgentPipelineTimeline } from '../../components/AgentPipelineTimeline';
import { EventBusPanel } from '../../components/EventBusPanel';
import { CrowdIntelPanel } from '../../components/CrowdIntelPanel';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import { SustainabilityDashboard } from '../../components/SustainabilityDashboard';
import { EmergencyPanel } from '../../components/EmergencyPanel';
import { navigationAgent } from '../../agents/navigationAgent';
import { t } from '../../utils/translations';
import {
  Map, Bot, Radio, Users, BarChart3, Leaf, ShieldAlert,
  Monitor, AlertTriangle, Clock, Flame, Zap, ChevronRight, Activity
} from 'lucide-react';
import { OCCUPANCY_TEXT } from '../../mockData';

type CommandTab = 'map' | 'agents' | 'events' | 'crowd' | 'analytics' | 'sustainability' | 'emergency';

const TABS: { id: CommandTab; label: string; icon: React.ReactNode; alertOn?: boolean }[] = [
  { id: 'map',            label: 'Map',            icon: <Map className="h-3.5 w-3.5" /> },
  { id: 'agents',         label: 'Agents',         icon: <Bot className="h-3.5 w-3.5" /> },
  { id: 'events',         label: 'Events',         icon: <Radio className="h-3.5 w-3.5" /> },
  { id: 'crowd',          label: 'Crowd Intel',    icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'analytics',      label: 'Analytics',      icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: 'sustainability', label: 'Sustainability',  icon: <Leaf className="h-3.5 w-3.5" /> },
  { id: 'emergency',      label: 'Emergency',      icon: <ShieldAlert className="h-3.5 w-3.5" />, alertOn: true },
];

export default function CommandMissionControlPage() {
  const {
    incidents,
    volunteers,
    concessions,
    transit,
    alerts,
    agentLogs,
    agentEvents,
    sustainability,
    densityMap,
    preferredLanguage,
    highlightedPath,
    setHighlightedPath,
    addEvent,
    addAgentLog
  } = useStadiumOS();

  const [activeTab, setActiveTab] = useState<CommandTab>('map');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

  const activeIncCount = useMemo(() => incidents.filter(i => i.status === 'active').length, [incidents]);
  const pendingEvents  = useMemo(() => agentEvents.filter(e => e.status === 'queued' || e.status === 'processing').length, [agentEvents]);

  const handleManualAlarm = useCallback(() => {
    const correlationId = `corr-cmd-alarm-${Math.random().toString(36).substr(2, 9)}`;
    addAgentLog('Operations Command', 'Emergency Agent', 'Manual override: Stadium Audio/Visual Alarms proposed by administrator.', 'critical', correlationId);
    addEvent('PROPOSE_CRITICAL_ACTION', { actionType: 'STADIUM_ALARM', description: 'Stadium-wide audio/visual alert' }, 'Operations Command', 'Emergency Agent', 'critical', correlationId);
  }, [addEvent, addAgentLog]);

  return (
    <div className="h-full w-full bg-obsidian-dark flex flex-col overflow-hidden select-none">

      {/* ── TAB NAVIGATION BAR ── */}
      <div className="shrink-0 flex items-center gap-1 px-4 pt-3 pb-0 border-b border-white/8 bg-obsidian-card/30 backdrop-blur-md overflow-x-auto">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const hasAlert = tab.alertOn && activeIncCount > 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider
                transition-all duration-200 border-b-2 whitespace-nowrap
                ${isActive
                  ? 'border-stadium-green text-stadium-green bg-stadium-green/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/3'}
              `}
            >
              <span className={isActive ? 'text-stadium-green' : ''}>{tab.icon}</span>
              {tab.label}
              {tab.id === 'events' && pendingEvents > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-stadium-blue rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {pendingEvents}
                </span>
              )}
              {hasAlert && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-stadium-red rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
                  {activeIncCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Live indicator */}
        <div className="ml-auto mr-2 flex items-center gap-1.5 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-stadium-green animate-pulse" />
          <span className="text-[9px] font-bold text-stadium-green">LIVE</span>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-hidden p-4 sm:p-5">

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div className="h-full flex flex-col gap-4 lg:flex-row lg:gap-5 overflow-y-auto lg:overflow-hidden">
            {/* Main map */}
            <div className="flex-1 flex flex-col gap-4 lg:overflow-hidden">
              {/* Digital Twin */}
              <div className="flex-1 min-h-[360px] bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col backdrop-blur-xl relative">
                <div className="flex justify-between items-center mb-3 shrink-0">
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

              {/* Concessions Wait-Time Bar Chart */}
              <div className="shrink-0 h-44 bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col backdrop-blur-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">{t('cmd.wait_times', preferredLanguage)}</div>
                <div className="flex-1 flex items-end gap-2 sm:gap-6 px-1 sm:px-4 overflow-x-auto">
                  {Object.values(concessions).map(stand => {
                    const maxWait = 20;
                    const heightPct = Math.min((stand.waitMin / maxWait) * 100, 100);
                    const isHigh = stand.waitMin >= 12;
                    return (
                      <div key={stand.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-[50px]">
                        <span className={`text-[10px] font-mono font-bold ${isHigh ? 'text-stadium-red' : 'text-stadium-green'}`}>
                          {stand.waitMin}m
                        </span>
                        <div className="w-full bg-white/5 rounded-t-md h-20 relative overflow-hidden">
                          <div
                            className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 ${isHigh ? 'bg-gradient-to-t from-stadium-red/20 to-stadium-red shadow-neon-red' : 'bg-gradient-to-t from-stadium-green/20 to-stadium-green shadow-neon'}`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 truncate max-w-[70px] font-semibold">{stand.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="lg:w-72 xl:w-80 flex flex-col gap-4 lg:overflow-y-auto shrink-0">
              {/* Emergency controls */}
              <div className="bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-xl">
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

              {/* Alerts Deck */}
              <div className="flex-1 bg-obsidian-card/45 border border-white/10 rounded-2xl p-4 flex flex-col backdrop-blur-xl">
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
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="h-full flex flex-col lg:flex-row gap-4 lg:overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="shrink-0 mb-3">
                <h2 className="font-display font-bold text-white text-sm">AI Agent Swarm Monitor</h2>
                <p className="text-[10px] text-slate-500">Real-time status of all 12 specialized agents</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <AgentMonitorPanel />
              </div>
            </div>
            <div className="lg:w-80 shrink-0 flex flex-col overflow-hidden h-full">
              <AgentPipelineTimeline events={agentEvents} />
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="shrink-0 mb-4">
              <h2 className="font-display font-bold text-white text-sm">Enterprise Event Bus</h2>
              <p className="text-[10px] text-slate-500">Live event stream · DLQ · Retry Queue · Correlation IDs</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <EventBusPanel />
            </div>
          </div>
        )}

        {/* CROWD INTEL TAB */}
        {activeTab === 'crowd' && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="shrink-0 mb-4">
              <h2 className="font-display font-bold text-white text-sm">Crowd Intelligence Dashboard</h2>
              <p className="text-[10px] text-slate-500">Density heatmap · Gate utilization · Arrival forecast</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CrowdIntelPanel />
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="h-full overflow-hidden">
            <AnalyticsDashboard />
          </div>
        )}

        {/* SUSTAINABILITY TAB */}
        {activeTab === 'sustainability' && (
          <div className="h-full overflow-hidden">
            <SustainabilityDashboard />
          </div>
        )}

        {/* EMERGENCY TAB */}
        {activeTab === 'emergency' && (
          <div className="h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <EmergencyPanel />
            </div>
            {/* Audit Terminal */}
            <div className="lg:w-80 xl:w-96 border border-white/10 rounded-2xl p-4 bg-obsidian-dark flex flex-col gap-2 overflow-hidden shrink-0">
              <div className="flex justify-between items-center shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-stadium-green shadow-neon animate-pulse" />
                  {t('cmd.audit_terminal', preferredLanguage)}
                </div>
                <span className="text-[9px] bg-stadium-green/10 border border-stadium-green/30 text-stadium-green px-1.5 rounded uppercase font-mono font-bold">Live</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px] leading-relaxed">
                {agentLogs.map(log => (
                  <div
                    key={log.id}
                    className={`border-l-2 pl-3 py-0.5 bg-white/5 ${log.severity === 'critical' ? 'border-stadium-red bg-stadium-red/5' : log.severity === 'warning' ? 'border-stadium-amber' : 'border-stadium-green'}`}
                  >
                    <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                      <span>[{log.fromAgent}] ➔ [{log.toAgent}]</span>
                      <span>{isMounted ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                    </div>
                    <div className="text-slate-300">{preferredLanguage !== 'en' && log.localizedAction ? log.localizedAction : log.action}</div>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM AUDIT STRIP (map tab only) ── */}
      {activeTab === 'map' && (
        <div className="shrink-0 h-36 border-t border-white/8 px-4 sm:px-5 py-3 bg-obsidian-dark flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-stadium-green shadow-neon animate-pulse" />
              {t('cmd.audit_terminal', preferredLanguage)}
            </div>
            <span className="text-[9px] bg-stadium-green/10 border border-stadium-green/30 text-stadium-green px-1.5 rounded uppercase font-mono font-bold">Demo Live Log</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 font-mono text-[10px] leading-relaxed">
            {agentLogs.map(log => (
              <div
                key={log.id}
                className={`border-l-2 pl-3 py-0.5 bg-white/5 ${log.severity === 'critical' ? 'border-stadium-red bg-stadium-red/5' : log.severity === 'warning' ? 'border-stadium-amber' : 'border-stadium-green'}`}
              >
                <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                  <span>[{log.fromAgent}] ➔ [{log.toAgent}] | ID: {log.correlationId}</span>
                  <span>{isMounted ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                </div>
                <div className="text-slate-300">{preferredLanguage !== 'en' && log.localizedAction ? log.localizedAction : log.action}</div>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
