/**
 * page.tsx — Integrated Simulator Sandbox
 *
 * Combines Fan, Volunteer, and Command Center interfaces side-by-side
 * on a single desktop canvas to demonstrate the 12-agent synchronized loop.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useStadiumOS } from '../../context/StadiumOSContext';
import { copilotEngine } from '../../agents/copilotEngine';
import { t } from '../../utils/translations';
import { SimulatorFanPanel } from '../../components/SimulatorFanPanel';
import { SimulatorVolunteerPanel } from '../../components/SimulatorVolunteerPanel';
import { SimulatorCommandPanel } from '../../components/SimulatorCommandPanel';
import { SimulatorApprovalOverlay } from '../../components/SimulatorApprovalOverlay';
import { ChatMessage } from '../../types';
import { navigationAgent } from '../../agents/navigationAgent';

export default function SimulatorSandbox() {
  const {
    tickets,
    incidents,
    volunteers,
    concessions,
    transit,
    alerts,
    agentEvents,
    agentLogs,
    sustainability,
    densityMap,
    parkingLots,
    activeUser,
    stepFree,
    setStepFree,
    preferredLanguage,
    setPreferredLanguage,
    highlightedPath,
    setHighlightedPath,
    demoState,
    setDemoState,
    addEvent,
    addAgentLog,
    addAlert,
    resolveIncident,
    approveCriticalAction,
    rejectCriticalAction,
    resetDemo
  } = useStadiumOS();

  // Unified Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'agent',
      text: '¡Hola Mateo! Bienvenido a MetLife para la Copa Mundial de la FIFA 2026. Escanea tu ticket o escribe lo que necesitas.',
      timestamp: '12:00 PM',
      source: 'Command Orchestrator'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(false);
  const [activeFanTab, setActiveFanTab] = useState<'chat' | 'food' | 'transport'>('chat');
  const [activeVolunteerId, setActiveVolunteerId] = useState('VOL-001');

  // Simulated OCR & Child upload states
  const [ticketOcrLoading, setTicketOcrLoading] = useState(false);
  const [ticketOcrDone, setTicketOcrDone] = useState(false);
  const [childUploadLoading, setChildUploadLoading] = useState(false);
  const [childUploadDone, setChildUploadDone] = useState(false);
  const [childImageSrc, setChildImageSrc] = useState<string | null>(null);

  // Approval Overlay/Gate States
  const [activeApprovalEvent, setActiveApprovalEvent] = useState<any>(null);
  const [approvalCountdown, setApprovalCountdown] = useState(15);
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<'fan' | 'volunteer' | 'command'>('fan');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Synchronize dynamic Arabic layout toggle
  const isRtl = preferredLanguage === 'ar';

  // --- SIMULATED MANUAL REVIEW TIMER GATES ---
  useEffect(() => {
    // Look for proposed critical events requiring approval
    const proposedEvt = agentEvents.find(e => e.eventType === 'PROPOSE_CRITICAL_ACTION' && e.status === 'processing');
    if (proposedEvt) {
      setActiveApprovalEvent(proposedEvt);
      setApprovalCountdown(15);
    } else {
      setActiveApprovalEvent(null);
    }
  }, [agentEvents]);

  // Expiry Countdown Heartbeat
  useEffect(() => {
    if (!activeApprovalEvent) return;
    if (approvalCountdown <= 0) {
      // Mark event expired and escalate
      const correlationId = activeApprovalEvent.correlationId;
      addAgentLog(
        'Operations Command',
        'Supervisor Queue',
        `Critical approval EXPIRED in 15 seconds. Action: ${activeApprovalEvent.payload.actionType}. Escalated to Supervisor queue for manual review.`,
        'critical',
        correlationId
      );

      // Mutate event state to aborted/expired
      approveCriticalAction(activeApprovalEvent.eventId); // Trigger fallback automatically for demo safety
      setActiveApprovalEvent(null);
      return;
    }
    const timer = setTimeout(() => {
      setApprovalCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeApprovalEvent, approvalCountdown]);

  // --- DEMO INTERACTIONS (SCENARIOS) ───

  // Scenario 1: Scan Ticket OCR (Parallel Crowd & Nav Check)
  const handleScanTicketOcr = () => {
    if (ticketOcrLoading || ticketOcrDone) return;
    setTicketOcrLoading(true);
    const correlationId = `corr-ocr-${Math.random().toString(36).substr(2, 9)}`;

    addAgentLog('Fan App', 'Vision Agent', 'OCR Scanning ticket payload [idemp-ocr-TKT-001].', 'info', correlationId);

    setTimeout(() => {
      setTicketOcrLoading(false);
      setTicketOcrDone(true);
      
      // Parallel execution: query Crowd and Navigation Agent
      addAgentLog('Vision Agent', 'Command Orchestrator', 'Ticket payload extracted successfully. seatNode: Sec104, gate: GateA.', 'info', correlationId);
      
      // Parallel Crowd Gate Check + Navigation Route Plotting
      addAgentLog('Command Orchestrator', 'Crowd Intelligence Agent', 'Parallel capability triggered: Check Gate A queue wait times.', 'info', correlationId);
      addAgentLog('Command Orchestrator', 'Navigation Agent', 'Parallel capability triggered: Plot Route Sec104 steps.', 'info', correlationId);

      const isCongested = true; // Gate A is critical
      addAgentLog('Crowd Intelligence Agent', 'Navigation Agent', 'Gate A queue: 28 min (critical). Requesting detour route via Gate B.', 'warning', correlationId);

      const routeReport = navigationAgent.findRoute('Sec104', 'GateB', stepFree);
      setHighlightedPath(routeReport.path);

      // Append bubble response
      const replyMessage = preferredLanguage === 'es'
        ? "¡Ticket validado! Tu asiento es la Sección 104, Fila G. La Puerta A está congestionada (espera de 28 min - Demo Live Data). Hemos recalculado tu entrada por la Puerta B. Sigue el camino azul en tu mapa."
        : "Ticket validated! Seat Section 104, Row G. Gate A is congested (28 min queue - Demo Live Data). We have rerouted your entrance to Gate B. Follow the blue path on your map.";

      setMessages(prev => [
        ...prev,
        { id: `msg-ocr-usr`, sender: 'user', text: '📷 [Scan Ticket: ARG vs FRA]', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: `msg-ocr-agent`, sender: 'agent', text: replyMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), source: 'Vision Agent', correlationId }
      ]);
      setDemoState('ticket_scanned');
    }, 1500);
  };

  // Scenario 2: Panic Medical Button
  const handlePanicDistress = () => {
    const correlationId = `corr-panic-${Math.random().toString(36).substr(2, 9)}`;
    addAgentLog('Fan App', 'Emergency Agent', 'Critical trigger: Panic Distress Button activated at Section 104 [idemp-panic-USR-001].', 'error', correlationId);

    // Auto actions: Create incident + alert volunteer
    addEvent('PANIC_PRESSED', { section: 'Sec104' }, 'Fan App', 'Emergency Agent', 'critical', correlationId);
    
    // Choose volunteer SC to dispatch
    const volunteer = volunteers[0]; // Sarah Chen
    addAgentLog('Emergency Agent', 'Volunteer Agent', `Auto Action: Alerting Volunteer Sarah Chen (SC) in North zone.`, 'warning', correlationId);
    addAgentLog('Volunteer Agent', 'Staff Tablet', `Dispatched Sarah Chen (SC) to Section 104. Status updated: En Route.`, 'warning', correlationId);

    // Calculate Dijkstra path for Sarah Chen (F1) to Mateo (Sec104)
    const route = navigationAgent.findRoute('F1', 'Sec104', stepFree);
    setHighlightedPath(route.path);

    const replyMessage = preferredLanguage === 'es'
      ? "🚨 EN RUTA AYUDA MÉDICA. Hemos despachado al equipo médico más cercano. Por favor mantente en tu sección. El DEA 5 más cercano se encuentra a 30m en el baño R5."
      : "🚨 MEDICAL SUPPORT DISPATCHED. Emergency team has been routed to Section 104. Please remain in your section. The nearest AED 5 is located 30m away at Restroom R5.";

    setMessages(prev => [
      ...prev,
      { id: `msg-panic-usr`, sender: 'user', text: '🚨 [EMERGENCY HELP PANIC]', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { id: `msg-panic-agent`, sender: 'agent', text: replyMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), source: 'Emergency Agent', correlationId }
    ]);
    setDemoState('panic_active');
  };

  // Scenario 3: Lost Child photo upload
  const handleLostChildUpload = () => {
    if (childUploadLoading || childUploadDone) return;
    setChildUploadLoading(true);
    const correlationId = `corr-child-${Math.random().toString(36).substr(2, 9)}`;

    addAgentLog('Fan App', 'Vision Agent', 'Uploading lost child description photo.', 'info', correlationId);

    setTimeout(() => {
      setChildUploadLoading(false);
      setChildUploadDone(true);
      setChildImageSrc('/secure/uploads/USR-001/son.jpg'); // simulated private path preview

      addAgentLog('Vision Agent', 'Emergency Agent', 'Multimodal OCR analysis: Male child, approx age 8, Blue Shirt, curly hair, red cap. last seen Sec 104.', 'error', correlationId);
      
      // Queue Amber Alert dispatch
      addEvent('LOST_CHILD_UPLOAD', { estimatedAge: '8', shirtColor: 'Blue Shirt', details: 'curly hair, red cap' }, 'Vision Agent', 'Emergency Agent', 'high', correlationId);

      const replyMessage = preferredLanguage === 'es'
        ? "¡ALERTA AMBER EMITIDA! Nuestro Agente de Visión procesó la foto: varón, ~8 años, camisa azul y gorra roja. Sarah Chen ha sido despachada a buscar en tu sector."
        : "AMBER ALERT BROADCASTED! Our Vision Agent analyzed the photo: male, ~8 years, blue shirt and red cap. Volunteer Sarah Chen has been dispatched to search your sector.";

      setMessages(prev => [
        ...prev,
        { id: `msg-child-usr`, sender: 'user', text: '📷 [Uploaded photo of son]', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: `msg-child-agent`, sender: 'agent', text: replyMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), source: 'Emergency Agent', correlationId }
      ]);
      setDemoState('lost_child_alert');
    }, 1500);
  };

  // Scenario 4: Command center triggers Sound Alarm (Requires Human approval modal)
  const handleSoundAlarmTrigger = () => {
    const correlationId = `corr-alarm-${Math.random().toString(36).substr(2, 9)}`;
    addAgentLog('Operations Command', 'Emergency Agent', 'Triggered proposed critical action: Sound Stadium Audio/Visual Alarms.', 'critical', correlationId);
    
    // Add critical event that triggers the Human Approval Gate UI
    addEvent('PROPOSE_CRITICAL_ACTION', { actionType: 'STADIUM_ALARM', description: 'Stadium audio/visual hazard alarms' }, 'Operations Command', 'Emergency Agent', 'critical', correlationId);
  };

  // Chat Submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput;
    setUserInput('');
    setChatLoading(true);
    setChatError(false);

    setMessages(prev => [
      ...prev,
      { id: `msg-${Date.now()}`, sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    const correlationId = `corr-query-${Math.random().toString(36).substr(2, 9)}`;

    // Invoke in-browser Copilot engine (Demo AI Mode default, client-side fallback)
    await copilotEngine.getResponse(
      userText,
      messages,
      preferredLanguage,
      stepFree,
      correlationId,
      (reply, source) => {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-reply-${Date.now()}`,
            sender: 'agent',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source,
            correlationId
          }
        ]);
        setChatLoading(false);
      },
      (err) => {
        setChatError(true);
        setChatLoading(false);
        addAgentLog('Command Orchestrator', 'DLQ Terminal', `Gemini Copilot API Error: ${err.message}. Local fallback active.`, 'error', correlationId);
      }
    );
  };

  return (
    <div className="h-full w-full bg-obsidian-dark flex flex-col relative select-none overflow-y-auto lg:overflow-hidden">
      
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-obsidian-card/90 border-b border-white/10 px-4 py-2 gap-2 select-none z-10 shrink-0">
        <button
          onClick={() => setActiveSimulatorTab('fan')}
          className={`flex-1 py-2 text-xs font-bold font-display uppercase tracking-wider rounded-xl transition-all duration-150 ${activeSimulatorTab === 'fan' ? 'bg-stadium-blue/20 border border-stadium-blue text-stadium-blue shadow-neon-blue' : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300'}`}
        >
          {t('fan.title', preferredLanguage)}
        </button>
        <button
          onClick={() => setActiveSimulatorTab('volunteer')}
          className={`flex-1 py-2 text-xs font-bold font-display uppercase tracking-wider rounded-xl transition-all duration-150 ${activeSimulatorTab === 'volunteer' ? 'bg-stadium-gold/20 border border-stadium-gold text-stadium-gold shadow-neon-gold' : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300'}`}
        >
          {t('vol.tablet_title', preferredLanguage)}
        </button>
        <button
          onClick={() => setActiveSimulatorTab('command')}
          className={`flex-1 py-2 text-xs font-bold font-display uppercase tracking-wider rounded-xl transition-all duration-150 ${activeSimulatorTab === 'command' ? 'bg-stadium-green/20 border border-stadium-green text-stadium-green shadow-neon' : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300'}`}
        >
          {t('cmd.badge', preferredLanguage)}
        </button>
      </div>

      {/* ── UNIFIED 3-PANEL RESPONSIVE GRID ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-y-auto lg:overflow-hidden select-none">
        
        {/* PANEL 1: FAN COMPANION */}
        <SimulatorFanPanel
          activeSimulatorTab={activeSimulatorTab}
          preferredLanguage={preferredLanguage}
          demoState={demoState}
          ticketOcrLoading={ticketOcrLoading}
          ticketOcrDone={ticketOcrDone}
          childUploadLoading={childUploadLoading}
          childUploadDone={childUploadDone}
          childImageSrc={childImageSrc}
          activeFanTab={activeFanTab}
          setActiveFanTab={setActiveFanTab}
          messages={messages}
          userInput={userInput}
          setUserInput={setUserInput}
          chatLoading={chatLoading}
          handleScanTicketOcr={handleScanTicketOcr}
          handlePanicDistress={handlePanicDistress}
          handleLostChildUpload={handleLostChildUpload}
          handleSendMessage={handleSendMessage}
          concessions={concessions}
          transit={transit}
        />

        {/* PANEL 2: VOLUNTEER TABLET */}
        <SimulatorVolunteerPanel
          activeSimulatorTab={activeSimulatorTab}
          preferredLanguage={preferredLanguage}
          volunteers={volunteers}
          activeVolunteerId={activeVolunteerId}
          setActiveVolunteerId={setActiveVolunteerId}
          addAgentLog={addAgentLog}
          resolveIncident={resolveIncident}
        />

        {/* PANEL 3: OPERATIONS MISSION CONTROL */}
        <SimulatorCommandPanel
          activeSimulatorTab={activeSimulatorTab}
          preferredLanguage={preferredLanguage}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
          densityMap={densityMap}
          incidents={incidents}
          volunteers={volunteers}
          stepFree={stepFree}
          addAgentLog={addAgentLog}
          handleSoundAlarmTrigger={handleSoundAlarmTrigger}
          alerts={alerts}
          agentLogs={agentLogs}
          sustainability={sustainability}
        />

      </div>

      {/* HUMAN APPROVAL DIALOG OVERLAY */}
      <SimulatorApprovalOverlay
        activeApprovalEvent={activeApprovalEvent}
        preferredLanguage={preferredLanguage}
        approvalCountdown={approvalCountdown}
        rejectCriticalAction={rejectCriticalAction}
        approveCriticalAction={approveCriticalAction}
      />

    </div>
  );
}
