/**
 * CrowdIntelPanel.tsx — Professional crowd intelligence dashboard
 */
'use client';
import React, { useMemo } from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { initialGateUtilization, initialHourlyArrivals } from '../mockData';
import { Users, TrendingUp, TrendingDown, Minus, Activity, AlertTriangle } from 'lucide-react';

const densityColor = {
  low:      { bg: 'bg-stadium-green/15', text: 'text-stadium-green', bar: '#00e676', pct: 25 },
  medium:   { bg: 'bg-stadium-gold/15',  text: 'text-stadium-gold',  bar: '#ffd700', pct: 55 },
  high:     { bg: 'bg-stadium-amber/15', text: 'text-stadium-amber', bar: '#ff6d00', pct: 80 },
  critical: { bg: 'bg-stadium-red/15',   text: 'text-stadium-red',   bar: '#ff1744', pct: 98 },
};

const trendIcon = (t: string) =>
  t === 'rising' ? <TrendingUp className="h-3 w-3 text-stadium-red" /> :
  t === 'falling' ? <TrendingDown className="h-3 w-3 text-stadium-green" /> :
  <Minus className="h-3 w-3 text-slate-500" />;

export const CrowdIntelPanel = React.memo(function CrowdIntelPanel() {
  const { densityMap, incidents } = useStadiumOS();

  const crowdStats = useMemo(() => {
    const vals = Object.values(densityMap);
    return {
      critical: vals.filter(v => v === 'critical').length,
      high:     vals.filter(v => v === 'high').length,
      medium:   vals.filter(v => v === 'medium').length,
      low:      vals.filter(v => v === 'low').length,
    };
  }, [densityMap]);

  const maxArrival = Math.max(...initialHourlyArrivals.map(h => h.count));

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Summary KPI strip */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {[
          { label: 'Critical Zones', val: crowdStats.critical, color: 'text-stadium-red', bg: 'bg-stadium-red/10 border-stadium-red/20' },
          { label: 'High Density',   val: crowdStats.high,     color: 'text-stadium-amber', bg: 'bg-stadium-amber/10 border-stadium-amber/20' },
          { label: 'Moderate',       val: crowdStats.medium,   color: 'text-stadium-gold', bg: 'bg-stadium-gold/10 border-stadium-gold/20' },
          { label: 'Low Density',    val: crowdStats.low,      color: 'text-stadium-green', bg: 'bg-stadium-green/10 border-stadium-green/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-2.5 text-center ${s.bg}`}>
            <div className={`font-display font-extrabold text-xl ${s.color}`}>{s.val}</div>
            <div className="text-[9px] text-slate-500 uppercase font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gate Utilization */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-stadium-blue" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gate Utilization</h3>
        </div>
        <div className="space-y-3">
          {initialGateUtilization.map(gate => (
            <div key={gate.gateId}>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-semibold text-slate-300">{gate.label}</span>
                <div className="flex items-center gap-2">
                  {trendIcon(gate.trend)}
                  <span className={`font-bold ${gate.utilization >= 90 ? 'text-stadium-red' : gate.utilization >= 65 ? 'text-stadium-amber' : 'text-stadium-green'}`}>
                    {gate.utilization}%
                  </span>
                  <span className="text-slate-600">{gate.throughputPerHour.toLocaleString()}/hr</span>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${gate.utilization}%`,
                    backgroundColor: gate.utilization >= 90 ? '#ff1744' : gate.utilization >= 65 ? '#ff6d00' : '#00e676',
                    boxShadow: `0 0 8px ${gate.utilization >= 90 ? '#ff174460' : gate.utilization >= 65 ? '#ff6d0060' : '#00e67660'}`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Arrival Forecast */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-stadium-gold" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Arrival Forecast</h3>
          <span className="ml-auto text-[9px] text-slate-600 font-mono">Fans / Hour</span>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {initialHourlyArrivals.map((h, i) => {
            const pct = (h.count / maxArrival) * 100;
            const isNow = i === 3; // 18:00 peak
            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[8px] font-mono text-slate-600">{Math.round(h.count / 100) / 10}k</span>
                <div
                  className={`w-full rounded-t transition-all duration-700 ${isNow ? 'animate-pulse' : ''}`}
                  style={{
                    height: `${pct}%`,
                    background: isNow
                      ? 'linear-gradient(to top, #ff1744, #ff6d00)'
                      : `linear-gradient(to top, #00e67640, #00e676)`,
                    minHeight: 4,
                    boxShadow: isNow ? '0 0 12px #ff174460' : '0 0 6px #00e67640'
                  }}
                />
                <span className="text-[8px] text-slate-600">{h.hour.split(':')[0]}h</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Crowd Incidents */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-stadium-amber" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Crowd Incidents</h3>
        </div>
        {incidents.filter(i => i.status === 'active').length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">No active crowd incidents.</p>
        ) : (
          <div className="space-y-2">
            {incidents.filter(i => i.status === 'active').map(inc => (
              <div key={inc.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${
                inc.severity === 'high' || inc.severity === 'critical'
                  ? 'bg-stadium-red/5 border-stadium-red/20'
                  : 'bg-white/3 border-white/8'
              }`}>
                <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${inc.severity === 'critical' || inc.severity === 'high' ? 'text-stadium-red' : 'text-stadium-gold'}`} />
                <div>
                  <div className="font-bold text-slate-200">{inc.location}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{inc.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
