/**
 * EventBusPanel.tsx — Animated enterprise event bus visualization
 */
'use client';
import React, { useMemo } from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { Radio, AlertTriangle, CheckCircle, Loader, XCircle, Clock, Repeat, SkipForward } from 'lucide-react';

const priorityConfig = {
  critical: { badge: 'bg-stadium-red/15 border-stadium-red/40 text-stadium-red', dot: 'bg-stadium-red' },
  high:     { badge: 'bg-stadium-amber/15 border-stadium-amber/40 text-stadium-amber', dot: 'bg-stadium-amber' },
  medium:   { badge: 'bg-stadium-blue/15 border-stadium-blue/40 text-stadium-blue', dot: 'bg-stadium-blue' },
  low:      { badge: 'bg-white/5 border-white/10 text-slate-500', dot: 'bg-slate-600' },
};

const statusIcon = {
  queued:     <Clock className="h-3.5 w-3.5 text-slate-500" />,
  processing: <Loader className="h-3.5 w-3.5 text-stadium-blue animate-spin" />,
  completed:  <CheckCircle className="h-3.5 w-3.5 text-stadium-green" />,
  failed:     <XCircle className="h-3.5 w-3.5 text-stadium-red" />,
  aborted:    <XCircle className="h-3.5 w-3.5 text-stadium-amber" />,
};

export const EventBusPanel = React.memo(function EventBusPanel() {
  const { agentEvents } = useStadiumOS();

  const sorted = useMemo(() =>
    [...agentEvents].sort((a, b) => b.createdAt - a.createdAt),
    [agentEvents]
  );

  const dlq = useMemo(() => sorted.filter(e => e.status === 'failed'), [sorted]);
  const active = useMemo(() => sorted.filter(e => e.status !== 'failed'), [sorted]);

  const stats = useMemo(() => ({
    queued:     sorted.filter(e => e.status === 'queued').length,
    processing: sorted.filter(e => e.status === 'processing').length,
    completed:  sorted.filter(e => e.status === 'completed').length,
    failed:     sorted.filter(e => e.status === 'failed').length,
  }), [sorted]);

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Stats bar */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-1.5 bg-stadium-blue/10 border border-stadium-blue/20 rounded-xl px-3 py-1.5">
          <Clock className="h-3 w-3 text-stadium-blue" />
          <span className="text-[11px] font-bold text-stadium-blue">{stats.queued} Queued</span>
        </div>
        <div className="flex items-center gap-1.5 bg-stadium-gold/10 border border-stadium-gold/20 rounded-xl px-3 py-1.5">
          <Loader className="h-3 w-3 text-stadium-gold" />
          <span className="text-[11px] font-bold text-stadium-gold">{stats.processing} Processing</span>
        </div>
        <div className="flex items-center gap-1.5 bg-stadium-green/10 border border-stadium-green/20 rounded-xl px-3 py-1.5">
          <CheckCircle className="h-3 w-3 text-stadium-green" />
          <span className="text-[11px] font-bold text-stadium-green">{stats.completed} Done</span>
        </div>
        {stats.failed > 0 && (
          <div className="flex items-center gap-1.5 bg-stadium-red/10 border border-stadium-red/20 rounded-xl px-3 py-1.5 animate-pulse">
            <XCircle className="h-3 w-3 text-stadium-red" />
            <span className="text-[11px] font-bold text-stadium-red">{stats.failed} DLQ</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5 bg-obsidian-card/60 border border-white/8 rounded-xl px-3 py-1.5">
          <Radio className="h-3 w-3 text-stadium-green animate-pulse" />
          <span className="text-[11px] text-slate-400">Total: <span className="text-white font-bold">{sorted.length}</span></span>
        </div>
      </div>

      {/* DLQ Warning */}
      {dlq.length > 0 && (
        <div className="shrink-0 bg-stadium-red/8 border border-stadium-red/25 rounded-xl p-3">
          <div className="flex items-center gap-2 text-stadium-red font-bold text-xs mb-2">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            Dead Letter Queue — {dlq.length} Failed Events
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {dlq.map(e => (
              <div key={e.eventId} className="text-[10px] bg-stadium-red/5 border border-stadium-red/15 rounded-lg px-2.5 py-1.5 font-mono">
                <span className="text-stadium-red font-bold">[DLQ]</span>{' '}
                <span className="text-slate-300">{e.eventType}</span>{' '}
                <span className="text-slate-500">— Retry #{e.retryCount}/{e.maxRetries} | {e.errorMessage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {active.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600">
            <Radio className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-xs">No events in queue. Trigger an action to see event flow.</p>
          </div>
        ) : (
          active.map(event => {
            const p = priorityConfig[event.priority];
            return (
              <div
                key={event.eventId}
                className="bg-obsidian-card/50 border border-white/8 rounded-xl p-3 flex flex-col gap-2 animate-slide-in-left hover:border-white/15 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {statusIcon[event.status]}
                    <span className="font-mono text-xs font-bold text-white truncate">{event.eventType}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${p.badge}`}>
                      {event.priority}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[9px] text-slate-500 font-mono">
                  <span className="text-slate-400">{event.sourceAgent}</span>
                  <span>→</span>
                  <span className="text-slate-400">{event.targetAgent}</span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-600">
                  <span className="font-mono">ID: {event.eventId}</span>
                  {event.retryCount > 0 && (
                    <span className="flex items-center gap-1 text-stadium-amber">
                      <Repeat className="h-2.5 w-2.5" />
                      Retry #{event.retryCount}
                    </span>
                  )}
                  <span>{formatTime(event.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
