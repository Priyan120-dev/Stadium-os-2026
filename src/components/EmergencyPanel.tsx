/**
 * EmergencyPanel.tsx — FIFA-grade Emergency Operations Center with stepped scenario simulators.
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { 
  ShieldAlert, Flame, Heart, Baby, Volume2, AlertTriangle, CheckCircle, 
  XCircle, Clock, Zap, Play, Pause, RotateCcw, Compass, Users 
} from 'lucide-react';
import { IncidentTimeline } from './IncidentTimeline';
import { navigationAgent } from '../agents/navigationAgent';

const APPROVAL_TIMEOUT_S = 15;

export const EmergencyPanel: React.FC = React.memo(function EmergencyPanel() {
  const {
    incidents, volunteers, agentLogs, alerts, agentEvents,
    addEvent, addAgentLog, approveCriticalAction, rejectCriticalAction, preferredLanguage
  } = useStadiumOS();

  const [approvalCountdown, setApprovalCountdown] = useState<number | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Stepped Simulator States
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [scenarioStep, setScenarioStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  // Clear timeout timers on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  // Countdown timer for pending approval
  useEffect(() => {
    if (approvalCountdown === null) return;
    if (approvalCountdown <= 0) {
      if (pendingActionId) rejectCriticalAction(pendingActionId);
      setPendingActionId(null);
      setApprovalCountdown(null);
      return;
    }
    const t = setTimeout(() => setApprovalCountdown(c => (c ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [approvalCountdown, pendingActionId, rejectCriticalAction]);

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

  // Stepped Scenario Simulation Flow
  const stopSimulation = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    setActiveScenario(null);
    setScenarioStep(0);
    setIsPaused(false);
  }, []);

  const runScenario = useCallback((scenarioType: string) => {
    stopSimulation();
    setActiveScenario(scenarioType);
    setScenarioStep(1);

    const cid = `corr-scen-${scenarioType}-${Math.random().toString(36).substr(2, 9)}`;

    if (scenarioType === 'medical') {
      addAgentLog('Command Orchestrator', 'Emergency Agent', 'Stepped Simulation: Medical Panic alarm triggered at Sector 104.', 'critical', cid);
      
      const t1 = setTimeout(() => {
        setScenarioStep(2);
        addEvent('PANIC_PRESSED', { section: 'Sec104' }, 'Emergency Panel', 'Emergency Agent', 'critical', cid);
        addAgentLog('Emergency Agent', 'Command Orchestrator', 'Incident report created. Location Section 104.', 'warning', cid);
      }, 1500);

      const t2 = setTimeout(() => {
        setScenarioStep(3);
        const route = navigationAgent.findRoute('GateA', 'Sec104', false);
        addAgentLog('Navigation Agent', 'Volunteer Agent', `Optimal route computed: ${route.path.join(' -> ')}`, 'info', cid);
      }, 3000);

      const t3 = setTimeout(() => {
        setScenarioStep(4);
        addAgentLog('Volunteer Agent', 'Staff Sarah Chen', 'Volunteer dispatched with AED kit to Sector 104 concourse.', 'info', cid);
        stopSimulation();
      }, 4500);

      timeoutRefs.current = [t1, t2, t3];
    } else if (scenarioType === 'lost_child') {
      addAgentLog('Command Orchestrator', 'Vision Agent', 'Stepped Simulation: Lost child profile photo submitted.', 'warning', cid);

      const t1 = setTimeout(() => {
        setScenarioStep(2);
        addEvent('LOST_CHILD_UPLOAD', { estimatedAge: '8', shirtColor: 'Red Shirt', details: 'Blue cap' }, 'Emergency Panel', 'Vision Agent', 'high', cid);
        addAgentLog('Vision Agent', 'Command Orchestrator', 'Amber alert message broadcasted to local concourse sections.', 'warning', cid);
      }, 1500);

      const t2 = setTimeout(() => {
        setScenarioStep(3);
        addAgentLog('Volunteer Agent', 'Command Orchestrator', 'Search party teams deployed to Gate B and Concourse exits.', 'info', cid);
        stopSimulation();
      }, 3000);

      timeoutRefs.current = [t1, t2];
    } else if (scenarioType === 'rain') {
      addAgentLog('Command Orchestrator', 'Weather Agent', 'Stepped Simulation: Sensor alerts heavy storm front approaching.', 'warning', cid);

      const t1 = setTimeout(() => {
        setScenarioStep(2);
        addAgentLog('Weather Agent', 'Command Orchestrator', 'Weather warning broadcast: slippery steps in Sector 102/106.', 'warning', cid);
      }, 1500);

      const t2 = setTimeout(() => {
        setScenarioStep(3);
        addAgentLog('Navigation Agent', 'Command Orchestrator', 'Elevators prioritize step-free routes for safety egress.', 'info', cid);
        stopSimulation();
      }, 3000);

      timeoutRefs.current = [t1, t2];
    } else if (scenarioType === 'gate_closed') {
      addAgentLog('Command Orchestrator', 'Crowd Intelligence Agent', 'Stepped Simulation: Gate A congestion limit exceeded.', 'warning', cid);

      const t1 = setTimeout(() => {
        setScenarioStep(2);
        addAgentLog('Crowd Intelligence Agent', 'Navigation Agent', 'Gate A weights scaled up. Automatic reroute suggestions initiated.', 'info', cid);
      }, 1500);

      const t2 = setTimeout(() => {
        setScenarioStep(3);
        addAgentLog('Navigation Agent', 'Command Orchestrator', 'Crowd redirection active: recommend Gate B for arrival.', 'info', cid);
        stopSimulation();
      }, 3000);

      timeoutRefs.current = [t1, t2];
    } else {
      addAgentLog('Command Orchestrator', 'Operations Command', `Stepped Simulation: Initiated ${scenarioType} scenario workflow.`, 'info', cid);
      const t1 = setTimeout(() => {
        setScenarioStep(2);
        addAgentLog('Command Orchestrator', 'Operations Command', 'Swarm consensus: dispatched security sweeps.', 'info', cid);
        stopSimulation();
      }, 1500);
      timeoutRefs.current = [t1];
    }
  }, [addEvent, addAgentLog, stopSimulation]);

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

      {/* Stepped Scenario Simulator Controls */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-stadium-gold" /> Swarm Scenario Cockpit</span>
          {activeScenario && (
            <span className="text-[9px] text-stadium-gold font-mono uppercase">
              Step {scenarioStep} {isPaused ? '(PAUSED)' : '(ACTIVE)'}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => runScenario('medical')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
              activeScenario === 'medical' ? 'bg-stadium-red/20 border-stadium-red text-stadium-red shadow-neon-red' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
            }`}
          >
            Medical Alarm
          </button>
          <button
            onClick={() => runScenario('lost_child')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
              activeScenario === 'lost_child' ? 'bg-stadium-blue/20 border-stadium-blue text-stadium-blue shadow-neon-blue' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
            }`}
          >
            Lost Child
          </button>
          <button
            onClick={() => runScenario('rain')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
              activeScenario === 'rain' ? 'bg-stadium-gold/20 border-stadium-gold text-stadium-gold shadow-neon-gold' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
            }`}
          >
            Heavy Rain
          </button>
          <button
            onClick={() => runScenario('gate_closed')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
              activeScenario === 'gate_closed' ? 'bg-stadium-amber/20 border-stadium-amber text-stadium-amber' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
            }`}
          >
            Gate Closed
          </button>
        </div>

        {/* Playback playback deck */}
        {activeScenario && (
          <div className="flex items-center gap-2 border-t border-white/5 pt-3 mt-1 justify-between select-none">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/8 rounded text-slate-300 hover:text-slate-100 transition-colors"
                aria-label={isPaused ? "Play scenario" : "Pause scenario"}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </button>
              <button 
                onClick={stopSimulation}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/8 rounded text-slate-300 hover:text-slate-100 transition-colors"
                aria-label="Reset scenario"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden ml-3 max-w-[120px]">
              <div 
                className="h-full bg-stadium-gold transition-all duration-500" 
                style={{ width: `${(scenarioStep / 4) * 100}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Manual Emergency Action Buttons */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5" /> Emergency Controls
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handlePanic}
            className="flex flex-col items-center gap-2 py-3 bg-stadium-red/10 hover:bg-stadium-red hover:text-white border border-stadium-red/30 text-stadium-red font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-200 hover:shadow-neon-red hover:scale-105"
          >
            <Heart className="h-4.5 w-4.5" />
            Medical Panic
          </button>
          <button
            onClick={handleAlarm}
            className={`flex flex-col items-center gap-2 py-3 bg-stadium-amber/10 border border-stadium-amber/30 text-stadium-amber font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-200 hover:shadow-neon-amber hover:scale-105 ${approvalCountdown !== null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stadium-amber hover:text-obsidian-dark'}`}
            disabled={approvalCountdown !== null}
          >
            <Volume2 className="h-4.5 w-4.5" />
            Stadium Alarm
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
