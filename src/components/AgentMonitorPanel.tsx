/**
 * AgentMonitorPanel.tsx — Grid of all 12 agent monitoring cards
 */
'use client';
import React, { useMemo } from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { AgentCard } from './AgentCard';
import { Bot, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export const AgentMonitorPanel = React.memo(function AgentMonitorPanel() {
  const { agentMetrics } = useStadiumOS();
  const agents = useMemo(() => Object.values(agentMetrics), [agentMetrics]);

  const stats = useMemo(() => ({
    online:  agents.filter(a => a.status === 'online' || a.status === 'busy').length,
    errors:  agents.filter(a => a.status === 'error' || a.status === 'offline').length,
    avgHealth: Math.round(agents.reduce((s, a) => s + a.health, 0) / agents.length),
    totalEvents: agents.reduce((s, a) => s + a.performance.totalEventsProcessed, 0),
  }), [agents]);

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Summary bar */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2 bg-obsidian-card/60 border border-white/8 rounded-xl px-3 py-2">
          <Bot className="h-4 w-4 text-stadium-green" />
          <span className="text-xs font-bold text-white">{agents.length} Agents</span>
        </div>
        <div className="flex items-center gap-2 bg-stadium-green/10 border border-stadium-green/20 rounded-xl px-3 py-2">
          <CheckCircle className="h-3.5 w-3.5 text-stadium-green" />
          <span className="text-xs font-bold text-stadium-green">{stats.online} Active</span>
        </div>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${stats.errors > 0 ? 'bg-stadium-red/10 border border-stadium-red/20' : 'bg-white/5 border border-white/8'}`}>
          <AlertCircle className={`h-3.5 w-3.5 ${stats.errors > 0 ? 'text-stadium-red' : 'text-slate-600'}`} />
          <span className={`text-xs font-bold ${stats.errors > 0 ? 'text-stadium-red' : 'text-slate-500'}`}>{stats.errors} Errors</span>
        </div>
        <div className="flex items-center gap-2 bg-obsidian-card/60 border border-white/8 rounded-xl px-3 py-2 ml-auto">
          <Activity className="h-3.5 w-3.5 text-stadium-blue" />
          <span className="text-[11px] text-slate-400">Avg Health: <span className="text-stadium-green font-bold">{stats.avgHealth}%</span></span>
        </div>
        <div className="flex items-center gap-2 bg-obsidian-card/60 border border-white/8 rounded-xl px-3 py-2">
          <span className="text-[11px] text-slate-400">Total Events: <span className="text-stadium-gold font-bold">{stats.totalEvents.toLocaleString()}</span></span>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {agents.map(metric => (
            <AgentCard key={metric.name} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  );
});
