/**
 * IncidentTimeline.tsx — Vertical incident event timeline
 */
'use client';
import React, { useMemo } from 'react';
import { Incident, AgentLog } from '../mockData';
import { ShieldAlert, Clock, CheckCircle, AlertTriangle, User, Flame, Baby } from 'lucide-react';

const incidentIcon = (type: Incident['type']) => {
  switch(type) {
    case 'medical':    return <ShieldAlert className="h-3.5 w-3.5" />;
    case 'fire':       return <Flame className="h-3.5 w-3.5" />;
    case 'lost-child': return <Baby className="h-3.5 w-3.5" />;
    default:           return <AlertTriangle className="h-3.5 w-3.5" />;
  }
};

const severityColor = (s: string) => ({
  critical: 'text-stadium-red border-stadium-red bg-stadium-red/10',
  high:     'text-stadium-amber border-stadium-amber bg-stadium-amber/10',
  medium:   'text-stadium-gold border-stadium-gold bg-stadium-gold/10',
  low:      'text-slate-400 border-white/15 bg-white/5',
}[s] || 'text-slate-400 border-white/15 bg-white/5');

interface IncidentTimelineProps {
  incidents: Incident[];
  logs: AgentLog[];
  maxItems?: number;
}

export const IncidentTimeline = React.memo(function IncidentTimeline({ incidents, logs, maxItems = 10 }: IncidentTimelineProps) {
  const items = useMemo(() => {
    const incItems = incidents.map(i => ({
      id: i.id,
      ts: i.timestamp,
      type: 'incident' as const,
      label: i.description,
      detail: `${i.type.toUpperCase()} @ ${i.location}`,
      severity: i.severity,
      status: i.status,
      incType: i.type,
    }));
    const logItems = logs.slice(-15).map(l => ({
      id: l.id,
      ts: l.timestamp,
      type: 'log' as const,
      label: l.action,
      detail: `${l.fromAgent} → ${l.toAgent}`,
      severity: l.severity,
      status: null as null,
      incType: null as null,
    }));
    return [...incItems, ...logItems]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, maxItems);
  }, [incidents, logs, maxItems]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-600 text-xs">
        No incidents recorded yet.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-4 bottom-0 w-px bg-white/8" />

      <div className="space-y-3">
        {items.map((item, idx) => {
          const color = severityColor(item.severity);
          return (
            <div key={item.id} className="flex gap-3 relative">
              {/* Dot */}
              <div className={`h-7 w-7 rounded-full border flex items-center justify-center shrink-0 relative z-10 ${color}`}>
                {item.type === 'incident' && item.incType
                  ? incidentIcon(item.incType)
                  : <User className="h-3 w-3" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-3">
                <div className="text-[10px] font-bold text-slate-400 mb-0.5">{item.detail}</div>
                <div className="text-xs text-slate-200 leading-tight line-clamp-2">{item.label}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-600 font-mono">
                    {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {item.status && (
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      item.status === 'resolved' ? 'bg-stadium-green/10 text-stadium-green' :
                      item.status === 'en-route' ? 'bg-stadium-blue/10 text-stadium-blue' :
                      'bg-stadium-red/10 text-stadium-red'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
