/**
 * AnalyticsDashboard.tsx — Executive KPI analytics dashboard
 */
'use client';
import React, { useMemo } from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { initialKPIs } from '../mockData';
import { KPICard } from './KPICard';
import {
  Zap, ShieldAlert, Users, Heart, DoorOpen, Train, Clock, Navigation,
  BarChart3, Activity
} from 'lucide-react';

export const AnalyticsDashboard = React.memo(function AnalyticsDashboard() {
  const { incidents, volunteers, agentEvents, agentLogs } = useStadiumOS();

  const live = useMemo(() => {
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const active   = incidents.filter(i => i.status === 'active').length;
    const busyVols = volunteers.filter(v => v.status === 'busy').length;
    const volUtil  = volunteers.length > 0 ? Math.round((busyVols / volunteers.length) * 100) : 0;
    const completedEvents = agentEvents.filter(e => e.status === 'completed');
    const avgResponse = completedEvents.length > 0
      ? Math.round(completedEvents.reduce((s, e) => s + (e.completedAt ?? e.createdAt) - e.createdAt, 0) / completedEvents.length)
      : initialKPIs.aiResponseMs;
    return { resolved, active, volUtil, avgResponse: Math.min(avgResponse, 9999) };
  }, [incidents, volunteers, agentEvents]);

  // Sparkline data (simulated historic)
  const sparkData = [62, 71, 68, 80, 74, 91, 88, 94, 87, 92];
  const responseHistory = [120, 88, 65, 44, 55, 38, 44, 50, 42, live.avgResponse];

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">

      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2 bg-stadium-gold/10 border border-stadium-gold/20 rounded-xl">
          <BarChart3 className="h-5 w-5 text-stadium-gold" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-sm">Executive Analytics Dashboard</h2>
          <p className="text-[10px] text-slate-500">Live KPIs — FIFA World Cup 2026 · MetLife Stadium</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-stadium-green/10 border border-stadium-green/20 rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-stadium-green animate-pulse" />
          <span className="text-[10px] font-bold text-stadium-green">LIVE</span>
        </div>
      </div>

      {/* Primary KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <KPICard
          icon={<Zap className="h-4 w-4" />}
          label="AI Response Time"
          value={live.avgResponse}
          unit="ms"
          delta={-12}
          deltaLabel="ms"
          color="green"
        />
        <KPICard
          icon={<ShieldAlert className="h-4 w-4" />}
          label="Incidents Resolved"
          value={live.resolved}
          delta={8}
          color="blue"
        />
        <KPICard
          icon={<Users className="h-4 w-4" />}
          label="Volunteer Utilization"
          value={live.volUtil}
          unit="%"
          delta={live.volUtil > 50 ? -5 : 5}
          color={live.volUtil > 80 ? 'red' : 'gold'}
        />
        <KPICard
          icon={<Heart className="h-4 w-4" />}
          label="Fan Satisfaction"
          value={initialKPIs.fanSatisfaction}
          unit="%"
          delta={2}
          color="green"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <KPICard
          icon={<DoorOpen className="h-4 w-4" />}
          label="Gate Throughput"
          value={initialKPIs.gateThroughput.toLocaleString()}
          unit="/hr"
          delta={3}
          color="blue"
        />
        <KPICard
          icon={<Train className="h-4 w-4" />}
          label="Transport On-Time"
          value={initialKPIs.transportOnTime}
          unit="%"
          delta={-2}
          color="amber"
        />
        <KPICard
          icon={<Clock className="h-4 w-4" />}
          label="Avg Walk Time"
          value={initialKPIs.avgWalkTimeMin}
          unit="min"
          delta={-0.4}
          color="green"
        />
        <KPICard
          icon={<Activity className="h-4 w-4" />}
          label="Active Incidents"
          value={live.active}
          color={live.active > 3 ? 'red' : 'green'}
        />
      </div>

      {/* Sparkline row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
        {/* Fan satisfaction trend */}
        <div className="bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Fan Satisfaction Trend</span>
            <span className="text-lg font-display font-extrabold text-stadium-green">{initialKPIs.fanSatisfaction}%</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {sparkData.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-500"
                style={{
                  height: `${v}%`,
                  background: 'linear-gradient(to top, #00e67640, #00e676)',
                  minHeight: 3,
                  opacity: 0.4 + (i / sparkData.length) * 0.6
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 mt-1 font-mono">
            <span>-10 events</span><span>Now</span>
          </div>
        </div>

        {/* AI Response time trend */}
        <div className="bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase">AI Response Trend</span>
            <span className="text-lg font-display font-extrabold text-stadium-blue">{live.avgResponse}ms</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {responseHistory.map((v, i) => {
              const maxV = Math.max(...responseHistory);
              const pct = (v / maxV) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-500"
                  style={{
                    height: `${pct}%`,
                    background: 'linear-gradient(to top, #00b0ff40, #00b0ff)',
                    minHeight: 3,
                    opacity: 0.4 + (i / responseHistory.length) * 0.6
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 mt-1 font-mono">
            <span>-10 events</span><span>Now</span>
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-4 w-4 text-stadium-blue" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Agent Response Leaderboard</h3>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Navigation Agent',    ms: 7,   events: 5644, rate: 100 },
            { name: 'Translation Agent',   ms: 14,  events: 2241, rate: 100 },
            { name: 'Volunteer Agent',     ms: 32,  events: 318,  rate: 96 },
            { name: 'Command Orchestrator',ms: 44,  events: 3821, rate: 99 },
            { name: 'Emergency Agent',     ms: 58,  events: 62,   rate: 97 },
          ].map((row, i) => (
            <div key={row.name} className="flex items-center gap-3 text-[10px]">
              <span className="text-slate-600 font-mono w-4">#{i+1}</span>
              <span className="text-slate-300 font-semibold flex-1">{row.name}</span>
              <span className="text-stadium-green font-mono font-bold">{row.ms}ms</span>
              <span className="text-slate-500 font-mono">{row.events.toLocaleString()}</span>
              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-stadium-blue rounded-full" style={{ width: `${row.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
