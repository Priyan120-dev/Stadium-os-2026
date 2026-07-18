/**
 * EmergencyPanel.tsx — FIFA-grade Emergency Operations Center
 */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { ShieldAlert, Flame, Heart, Baby, Volume2, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { IncidentTimeline } from './IncidentTimeline';

const APPROVAL_TIMEOUT_S = 15;

export const EmergencyPanel = React.memo(function EmergencyPanel() {
  const {
    incidents, volunteers, agentLogs, alerts, agentEvents,
    addEvent, addAgentLog, approveCriticalAction, rejectCriticalAction, preferredLanguage
  } = useStadiumOS();

  const [approvalCountdown, setApprovalCountdown] = useState<number | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Countdown timer for pending approval
  useEffect(() => {
    if (approvalCountdown === null) return;
    if (approvalCountdown <= 0) {
      // Auto-reject on timeout
      if (pendingActionId) rejectCriticalAction(pendingActionId);
      setPendingActionId(null);
      setApprovalCountdown(null);
      return;
    }
    const t = setTimeout(() => setApprovalCountdown(c => (c ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [approvalCountdown, pendingActionId, rejectCriticalAction]);

  const pendingApprovalEvent = agentEvents.find(
    e => e.eventType === 'PROPOSE_CRITICAL_ACTION' && e.status === 'completed' && e.result?.requiresApproval
  );

  const handlePanic = useCallback(() => {
    const cid = `corr-panic-${Date.now()}`;
    addEvent('PANIC_PRESSED', { section: 'Sec104' }, 'Emergency Panel', 'Emergency Agent', 'critical', cid);
    addAgentLog('Emergency Panel', 'Emergency Agent', 'PANIC BUTTON pressed. Medical emergency initiated at Sec 104.', 'critical', cid);
  }, [addEvent, addAgentLog]);

  const handleAlarm = useCallback(() => {
    const cid = `corr-alarm-${Date.now()}`;
    const evtId = addEvent('PROPOSE_CRITICAL_ACTION', { actionType: 'STADIUM_ALARM', description: 'Stadium-wide audio/visual alarm' }, 'Emergency Panel', 'Emergency Agent', 'critical', cid);
    addAgentLog('Emergency Panel', 'Emergency Agent', 'Stadium Alarm proposed. Awaiting supervisor approval.', 'critical', cid);
    setPendingActionId(evtId);
    setApprovalCountdown(APPROVAL_TIMEOUT_S);
  }, [addEvent, addAgentLog]);

  const handleApprove = useCallback(() => {
    if (!pendingActionId) return;
    approveCriticalAction(pendingActionId);
    setPendingActionId(null);
    setApprovalCountdown(null);
  }, [pendingActionId, approveCriticalAction]);

  const handleReject = useCallback(() => {
    if (!pendingActionId) return;
    rejectCriticalAction(pendingActionId);
    setPendingActionId(null);
    setApprovalCountdown(null);
  }, [pendingActionId, rejectCriticalAction]);

  const activeInc = incidents.filter(i => i.status === 'active');

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">

      {/* Human Approval Gate */}
      {approvalCountdown !== null && (
        <div className="shrink-0 bg-stadium-red/10 border-2 border-stadium-red/50 rounded-2xl p-4 animate-pulse-border">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-stadium-red animate-bounce" />
            <span className="font-display font-extrabold text-stadium-red text-sm">HUMAN AUTHORIZATION REQUIRED</span>
            <span className="ml-auto font-mono font-extrabold text-2xl text-stadium-red">{approvalCountdown}s</span>
          </div>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            A Stadium-Wide Alarm has been proposed by the Emergency Agent. This action requires explicit supervisor authorization. Auto-reject in {approvalCountdown}s.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-stadium-red hover:bg-red-600 text-white font-display font-extrabold text-sm rounded-xl transition-all duration-150 shadow-neon-red"
            >
              <CheckCircle className="h-4 w-4" />
              APPROVE ALARM
            </button>
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-display font-bold text-sm rounded-xl transition-all duration-150 border border-white/15"
            >
              <XCircle className="h-4 w-4" />
              REJECT
            </button>
          </div>
        </div>
      )}

      {/* Emergency Action Buttons */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
          <Zap className="h-3 w-3" /> Emergency Controls
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handlePanic}
            className="flex flex-col items-center gap-2 py-4 bg-stadium-red/10 hover:bg-stadium-red hover:text-white border border-stadium-red/30 text-stadium-red font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-200 hover:shadow-neon-red hover:scale-105"
          >
            <Heart className="h-5 w-5" />
            Medical Panic
          </button>
          <button
            onClick={handleAlarm}
            className={`flex flex-col items-center gap-2 py-4 bg-stadium-amber/10 border border-stadium-amber/30 text-stadium-amber font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-200 hover:shadow-neon-amber hover:scale-105 ${approvalCountdown !== null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stadium-amber hover:text-obsidian-dark'}`}
            disabled={approvalCountdown !== null}
          >
            <Volume2 className="h-5 w-5" />
            Stadium Alarm
          </button>
          <button
            onClick={() => {
              const cid = `corr-fire-${Date.now()}`;
              addEvent('PANIC_PRESSED', { section: 'Sec112', type: 'fire' }, 'Emergency Panel', 'Emergency Agent', 'critical', cid);
              addAgentLog('Emergency Panel', 'Emergency Agent', 'Fire alert raised at Sec 112. Emergency Agent dispatched.', 'critical', cid);
            }}
            className="flex flex-col items-center gap-2 py-4 bg-stadium-amber/10 hover:bg-stadium-amber hover:text-obsidian-dark border border-stadium-amber/30 text-stadium-amber font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-200 hover:shadow-neon-amber hover:scale-105"
          >
            <Flame className="h-5 w-5" />
            Fire Alert
          </button>
          <button
            onClick={() => {
              const cid = `corr-amber-${Date.now()}`;
              addEvent('LOST_CHILD_UPLOAD', { estimatedAge: '8', shirtColor: 'Red Shirt', details: 'Brown hair, holding a toy' }, 'Emergency Panel', 'Vision Agent', 'high', cid);
              addAgentLog('Emergency Panel', 'Vision Agent', 'Lost child report submitted. Amber Alert initiated.', 'warning', cid);
            }}
            className="flex flex-col items-center gap-2 py-4 bg-stadium-blue/10 hover:bg-stadium-blue hover:text-white border border-stadium-blue/30 text-stadium-blue font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-200 hover:shadow-neon-blue hover:scale-105"
          >
            <Baby className="h-5 w-5" />
            Lost Child
          </button>
        </div>
      </div>

      {/* Active Incidents */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" /> Active Incidents
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeInc.length > 0 ? 'bg-stadium-red/15 text-stadium-red border border-stadium-red/30' : 'bg-stadium-green/10 text-stadium-green border border-stadium-green/20'}`}>
            {activeInc.length} Active
          </span>
        </div>
        {activeInc.length === 0 ? (
          <div className="flex items-center gap-2 text-stadium-green text-xs py-2">
            <CheckCircle className="h-4 w-4" />
            All clear — no active incidents.
          </div>
        ) : (
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {activeInc.map(inc => (
              <div key={inc.id} className="flex items-start gap-2.5 p-2.5 bg-stadium-red/5 border border-stadium-red/20 rounded-xl text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-stadium-red shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">{inc.location}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{inc.description}</div>
                </div>
                <span className="ml-auto text-[8px] font-bold text-stadium-red bg-stadium-red/10 border border-stadium-red/20 px-1.5 py-0.5 rounded uppercase">{inc.severity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Timeline */}
      <div className="flex-1 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4 overflow-hidden">
        <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Incident Timeline
        </div>
        <div className="overflow-y-auto h-full">
          <IncidentTimeline incidents={incidents} logs={agentLogs} maxItems={12} />
        </div>
      </div>
    </div>
  );
});
