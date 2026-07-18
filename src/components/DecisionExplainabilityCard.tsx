/**
 * DecisionExplainabilityCard.tsx — High-fidelity AI explainability panel
 */
'use client';

import React from 'react';
import { ShieldCheck, Info, ChevronRight, AlertCircle, TrendingDown } from 'lucide-react';
import { ConfidenceBreakdown, AlternativeRoute, DecisionImpact } from '../types';

interface DecisionExplainabilityCardProps {
  version: string;
  trustScore: number;
  confidenceBreakdown: ConfidenceBreakdown;
  alternatives: AlternativeRoute[];
  impact: DecisionImpact;
  rationale: string;
  agentColor?: string;
}

export const DecisionExplainabilityCard: React.FC<DecisionExplainabilityCardProps> = React.memo(function DecisionExplainabilityCard({
  version,
  trustScore,
  confidenceBreakdown,
  alternatives,
  impact,
  rationale,
  agentColor = '#00b0ff'
}) {
  return (
    <div 
      className="bg-obsidian-card/95 border rounded-2xl p-4 flex flex-col gap-4 select-none animate-slide-in-up text-xs backdrop-blur-xl shadow-lg mt-3"
      style={{ borderColor: `${agentColor}30` }}
    >
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 font-display font-bold text-slate-200">
          <ShieldCheck className="h-4 w-4" style={{ color: agentColor }} />
          <span>Explainable AI (XAI) Report</span>
        </div>
        <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">
          {version}
        </span>
      </div>

      {/* Rationale Text */}
      <div className="text-slate-300 leading-relaxed bg-white/3 border border-white/5 rounded-xl p-3 flex gap-2">
        <Info className="h-4 w-4 shrink-0 text-stadium-blue mt-0.5" />
        <div>
          <span className="font-bold text-slate-200 uppercase text-[9px] tracking-wider block mb-1">Recommendation Reasoning</span>
          {rationale}
        </div>
      </div>

      {/* Sub-Confidence Breakdowns */}
      <div>
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
          <span>Confidence Score Breakdown</span>
          <span style={{ color: agentColor }}>Trust Index: {trustScore}%</span>
        </div>
        <div className="grid grid-cols-2 gap-3 bg-white/3 border border-white/5 rounded-xl p-3">
          {[
            { label: 'Navigation', val: confidenceBreakdown.navigation },
            { label: 'Crowd Flow', val: confidenceBreakdown.crowd },
            { label: 'Accessibility', val: confidenceBreakdown.accessibility },
            { label: 'Emergency Proximity', val: confidenceBreakdown.emergency }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>{item.label}</span>
                <span className="font-mono text-slate-200">{item.val}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${item.val}%`, backgroundColor: agentColor }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives Analysis */}
      {alternatives.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Rejected Alternatives Analysis</div>
          <div className="flex flex-col gap-2">
            {alternatives.map((alt, idx) => (
              <div key={idx} className="bg-stadium-red/5 border border-stadium-red/20 rounded-xl p-2.5 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-stadium-red shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{alt.name}</span>
                    <span className="text-[8px] font-semibold text-stadium-red bg-stadium-red/10 border border-stadium-red/20 px-1 py-0.5 rounded uppercase">REJECTED</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {alt.rejectionReason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Impact Indices */}
      <div className="border-t border-white/5 pt-3 flex gap-2">
        <div className="flex-1 bg-white/3 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">ETA Savings</span>
            <span className="text-sm font-extrabold text-stadium-green">-{impact.etaSavedMin} min</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </div>
        <div className="flex-1 bg-white/3 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Concourse Relief</span>
            <span className="text-sm font-extrabold text-stadium-blue">+{impact.congestionReductionPct}%</span>
          </div>
          <TrendingDown className="h-4 w-4 text-stadium-blue" />
        </div>
      </div>
    </div>
  );
});
