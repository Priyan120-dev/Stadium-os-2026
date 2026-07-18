/**
 * AgentCard.tsx — Per-agent status/health/confidence monitoring card
 */
'use client';
import React, { useMemo } from 'react';
import { AgentMetric } from '../mockData';
import { Cpu, Activity, Clock, CheckCircle, XCircle, Loader, AlertCircle, Zap } from 'lucide-react';

const statusConfig = {
  online: { label: 'ONLINE',  dot: 'bg-stadium-green animate-pulse', text: 'text-stadium-green', badge: 'bg-stadium-green/10 border-stadium-green/30 text-stadium-green' },
  busy:   { label: 'BUSY',    dot: 'bg-stadium-gold animate-pulse',  text: 'text-stadium-gold',  badge: 'bg-stadium-gold/10 border-stadium-gold/30 text-stadium-gold' },
  idle:   { label: 'IDLE',    dot: 'bg-slate-500',                   text: 'text-slate-400',     badge: 'bg-white/5 border-white/10 text-slate-400' },
  error:  { label: 'ERROR',   dot: 'bg-stadium-red animate-bounce',  text: 'text-stadium-red',   badge: 'bg-stadium-red/10 border-stadium-red/30 text-stadium-red' },
  offline:{ label: 'OFFLINE', dot: 'bg-slate-600',                   text: 'text-slate-600',     badge: 'bg-slate-900 border-slate-700 text-slate-600' },
};

interface AgentCardProps {
  metric: AgentMetric;
}

export const AgentCard = React.memo(function AgentCard({ metric }: AgentCardProps) {
  const s = statusConfig[metric.status];
  const healthColor = metric.health >= 90 ? '#00e676' : metric.health >= 70 ? '#ffd700' : '#ff1744';
  const confidencePct = Math.round(metric.confidenceScore * 100);

  const timeSinceActive = useMemo(() => {
    const diff = Date.now() - metric.lastActiveAt;
    if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    return `${Math.round(diff / 3600000)}h ago`;
  }, [metric.lastActiveAt]);

  return (
    <div
      className="group bg-obsidian-card/45 border border-white/8 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:scale-[1.01]"
      style={{ '--agent-color': metric.color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-2 w-2 rounded-full shrink-0 ${s.dot}`} />
          <span className="font-display font-bold text-xs text-white truncate">{metric.name}</span>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${s.badge}`}>
          {s.label}
        </span>
      </div>

      {/* Health Bar */}
      <div>
        <div className="flex justify-between text-[9px] font-semibold mb-1">
          <span className="text-slate-500 uppercase">Health</span>
          <span style={{ color: healthColor }}>{metric.health}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${metric.health}%`, backgroundColor: healthColor, boxShadow: `0 0 8px ${healthColor}60` }}
          />
        </div>
      </div>

      {/* Confidence + Processing Time */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 border border-white/8 rounded-lg px-2 py-1">
          <div className="text-[7px] text-slate-500 font-semibold uppercase">Confidence</div>
          <div className="text-xs font-bold text-stadium-blue">{confidencePct}%</div>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-lg px-2 py-1">
          <div className="text-[7px] text-slate-500 font-semibold uppercase">Avg Response</div>
          <div className="text-xs font-bold text-stadium-green">{metric.performance.avgResponseMs}ms</div>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-lg px-2 py-1">
          <div className="text-[7px] text-slate-500 font-semibold uppercase">Throughput</div>
          <div className="text-xs font-bold text-stadium-gold">{metric.performance.eventsLast5Min}/5m</div>
        </div>
      </div>

      {/* Simulated Hardware Telemetry (CPU & Memory) */}
      <div className="grid grid-cols-2 gap-2 text-[9px] bg-white/3 border border-white/8 rounded-lg p-2 font-mono">
        <div className="flex justify-between items-center text-slate-400">
          <span>CPU Usage:</span>
          <span className="font-bold text-slate-200">
            {metric.status === 'busy' ? '74%' : metric.status === 'idle' ? '2%' : '21%'}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Memory:</span>
          <span className="font-bold text-slate-200">
            {metric.status === 'busy' ? '176 MB' : '124 MB'}
          </span>
        </div>
      </div>

      {/* Queue Depth Sparkline (SVG) */}
      <div className="bg-white/3 border border-white/8 rounded-lg p-2 flex items-center justify-between">
        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Queue Depth</span>
        <svg className="w-24 h-6 shrink-0 overflow-visible" viewBox="0 0 100 20" aria-label="Queue depth history sparkline">
          <path
            d={metric.status === 'busy' ? "M0,15 L20,10 L40,18 L60,5 L80,12 L100,2" : "M0,18 L20,18 L40,15 L60,18 L80,15 L100,18"}
            fill="none"
            stroke={metric.color}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
        </svg>
      </div>

      {/* Current Task */}
      <div className="text-[10px] text-slate-400 bg-white/3 border border-white/8 rounded-lg px-2.5 py-2 min-h-[32px] flex items-center gap-2">
        <Cpu className="h-3 w-3 shrink-0 text-slate-600" />
        <span className="line-clamp-2 leading-tight">
          {metric.currentTask || <span className="text-slate-600 italic">No active task</span>}
        </span>
      </div>

      {/* Capability Tags */}
      <div className="flex flex-wrap gap-1">
        {metric.capabilities.slice(0, 3).map(cap => (
          <span key={cap} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-slate-500 uppercase tracking-wider">
            {cap}
          </span>
        ))}
        {metric.capabilities.length > 3 && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-slate-600">
            +{metric.capabilities.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[9px] text-slate-600 border-t border-white/5 pt-2">
        <span className="flex items-center gap-1">
          <Activity className="h-2.5 w-2.5" />
          {metric.performance.totalEventsProcessed.toLocaleString()} total
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {timeSinceActive}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="h-2.5 w-2.5 text-stadium-green" />
          {Math.round(metric.performance.successRate * 100)}%
        </span>
      </div>
    </div>
  );
});
