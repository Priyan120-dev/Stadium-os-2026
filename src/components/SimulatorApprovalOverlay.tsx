/**
 * SimulatorApprovalOverlay.tsx — Gated human approval policy matrix overlay
 */
'use client';
import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import { AgentEvent } from '../types';
import { t } from '../utils/translations';

interface SimulatorApprovalOverlayProps {
  activeApprovalEvent: AgentEvent | null;
  preferredLanguage: string;
  approvalCountdown: number;
  rejectCriticalAction: (eventId: string) => void;
  approveCriticalAction: (eventId: string) => void;
}

export const SimulatorApprovalOverlay: React.FC<SimulatorApprovalOverlayProps> = React.memo(function SimulatorApprovalOverlay({
  activeApprovalEvent,
  preferredLanguage,
  approvalCountdown,
  rejectCriticalAction,
  approveCriticalAction
}) {
  if (!activeApprovalEvent) return null;

  return (
    <div className="fixed inset-0 bg-obsidian-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="max-w-md w-full bg-obsidian-card border border-stadium-red/50 rounded-2xl p-6 shadow-neon-red flex flex-col gap-4">
        
        <div className="flex items-center gap-2 text-stadium-red border-b border-white/10 pb-3">
          <ShieldAlert className="h-6 w-6 animate-bounce" />
          <h2 className="font-display font-extrabold text-lg uppercase tracking-wide">
            {t('cmd.approval_title', preferredLanguage)}
          </h2>
        </div>

        <div className="text-xs space-y-3">
          <div>
            <span className="text-slate-500 uppercase font-bold">{t('cmd.approval_proposed_action', preferredLanguage) || "Proposed Action"}:</span>
            <div className="font-bold text-slate-200 text-sm mt-0.5">{activeApprovalEvent.payload.actionType}</div>
          </div>
          
          <div>
            <span className="text-slate-500 uppercase font-bold">{t('cmd.approval_summary', preferredLanguage) || "Incident Summary"}:</span>
            <div className="text-slate-300 mt-0.5">{activeApprovalEvent.payload.description}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 uppercase font-bold">{t('cmd.approval_confidence', preferredLanguage) || "AI Confidence"}:</span>
              <div className="text-stadium-green font-bold mt-0.5">98.4%</div>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold">{t('cmd.approval_impact', preferredLanguage) || "Expected Impact"}:</span>
              <div className="text-stadium-blue font-bold mt-0.5">Contain Sector, Safe egress</div>
            </div>
          </div>

          {/* Countdown escalation warnings */}
          <div className="p-3 bg-stadium-red/10 border border-stadium-red/30 rounded-xl text-stadium-red flex flex-col gap-1 select-none">
            <div className="font-bold flex items-center gap-1">
              <Clock className="h-4 w-4 animate-spin" />
              {t('cmd.approval_countdown', preferredLanguage)}
            </div>
            <div className="text-[10px] leading-tight text-slate-300 font-semibold">
              {t('cmd.approval_desc', preferredLanguage).replace('{s}', approvalCountdown.toString())}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/5 pt-4">
          <button 
            onClick={() => rejectCriticalAction(activeApprovalEvent.eventId)}
            className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-display font-extrabold text-xs uppercase rounded-xl transition-colors"
          >
            {t('cmd.approval_abort', preferredLanguage)}
          </button>
          <button 
            onClick={() => approveCriticalAction(activeApprovalEvent.eventId)}
            className="flex-1 py-2.5 bg-stadium-red hover:bg-stadium-red/80 text-white font-display font-extrabold text-xs uppercase rounded-xl transition-all shadow-neon-red"
          >
            {t('cmd.approval_approve', preferredLanguage)}
          </button>
        </div>

      </div>
    </div>
  );
});
