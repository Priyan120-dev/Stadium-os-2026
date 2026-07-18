/**
 * AgentPipelineTimeline.tsx — Real-time Agent Event execution pipeline
 */
'use client';

import React from 'react';
import { Cpu, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { AgentEvent } from '../types';

interface AgentPipelineTimelineProps {
  events: AgentEvent[];
}

export const AgentPipelineTimeline: React.FC<AgentPipelineTimelineProps> = React.memo(function AgentPipelineTimeline({
  events
}) {
  const sortedEvents = [...events].sort((a, b) => b.lastUpdated - a.lastUpdated).slice(0, 10);

  return (
    <div className="bg-obsidian-card/45 border border-white/8 rounded-2xl p-4 flex flex-col gap-4 select-none backdrop-blur-xl h-full overflow-hidden shadow-lg">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 font-display font-extrabold text-xs text-slate-200 uppercase tracking-wider">
          <Cpu className="h-4 w-4 text-stadium-blue animate-pulse" />
          <span>Swarm Processing Pipeline</span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-stadium-blue/10 border border-stadium-blue/20 text-stadium-blue">
          Live Event Stream
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {sortedEvents.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 italic text-xs">
            <Clock className="h-6 w-6 text-slate-600 mb-2 animate-spin" />
            <span>Awaiting telemetry broadcast...</span>
          </div>
        ) : (
          sortedEvents.map((evt) => {
            const isCompleted = evt.status === 'completed';
            const isFailed = evt.status === 'aborted';
            const isProcessing = evt.status === 'processing';

            let statusColor = 'text-slate-400';
            let strokeColor = 'border-white/10';
            if (isCompleted) {
              statusColor = 'text-stadium-green';
              strokeColor = 'border-stadium-green/20';
            } else if (isFailed) {
              statusColor = 'text-stadium-red';
              strokeColor = 'border-stadium-red/20';
            } else if (isProcessing) {
              statusColor = 'text-stadium-gold';
              strokeColor = 'border-stadium-gold/30';
            }

            return (
              <div 
                key={evt.eventId} 
                className={`bg-white/3 border rounded-xl p-3 flex flex-col gap-2 transition-all duration-300 ${strokeColor}`}
              >
                {/* Event Header */}
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-bold text-slate-200">{evt.eventType}</span>
                  <span className="text-slate-500 font-semibold">{evt.eventId}</span>
                </div>

                {/* Routing info */}
                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-semibold">
                  <span className="px-1.5 py-0.5 bg-white/5 border border-white/8 rounded uppercase text-[8px] text-slate-300">
                    {evt.sourceAgent}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <span className="px-1.5 py-0.5 bg-white/5 border border-white/8 rounded uppercase text-[8px] text-slate-300">
                    {evt.targetAgent}
                  </span>
                </div>

                {/* Status and Progress Bar */}
                <div className="flex items-center justify-between text-[9px] font-bold mt-1">
                  <div className="flex items-center gap-1.5">
                    {isCompleted && <CheckCircle className="h-3.5 w-3.5 text-stadium-green" />}
                    {isFailed && <AlertTriangle className="h-3.5 w-3.5 text-stadium-red" />}
                    {isProcessing && <span className="h-2 w-2 rounded-full bg-stadium-gold animate-ping" />}
                    {evt.status === 'queued' && <span className="h-2 w-2 rounded-full bg-slate-500" />}
                    <span className={`uppercase font-mono ${statusColor}`}>{evt.status}</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">
                    CorrID: {evt.correlationId.substr(0, 12)}...
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-stadium-green' : isFailed ? 'bg-stadium-red' : isProcessing ? 'bg-stadium-gold' : 'bg-slate-600'
                    }`} 
                    style={{ 
                      width: isCompleted ? '100%' : isProcessing ? '60%' : evt.status === 'queued' ? '20%' : '100%' 
                    }} 
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
