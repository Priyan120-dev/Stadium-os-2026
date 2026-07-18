/**
 * page.tsx — Integrated Simulator Sandbox
 *
 * Combines Fan, Volunteer, and Command Center interfaces side-by-side
 * on a single desktop canvas to demonstrate the 12-agent synchronized loop.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStadiumOS } from '../../context/StadiumOSContext';
import StadiumMap from '../../components/StadiumMap';
import { copilotEngine, ChatMessage } from '../../agents/copilotEngine';
import { navigationAgent } from '../../agents/navigationAgent';
import { t } from '../../utils/translations';
import {
  User,
  Users,
  ShieldAlert,
  AlertTriangle,
  Upload,
  Send,
  Ticket,
  Coffee,
  Bus,
  CheckCircle2,
  Sparkles,
  Clock,
  Compass,
  FileSearch,
  Activity,
  Heart,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { OCCUPANCY_TEXT } from '../../mockData';

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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

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
        
        {/* ═════════════════════════════════════════════════════════════════════════
            PANEL 1: FAN COMPANION (Mobile Shell) - lg:col-span-3
            ═════════════════════════════════════════════════════════════════════════ */}
        <section className={`min-h-[580px] lg:min-h-0 lg:col-span-3 bg-obsidian-card/45 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative select-none shadow-lg ${activeSimulatorTab === 'fan' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-stadium-blue shadow-neon animate-pulse" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
                {t('fan.title', preferredLanguage)}
              </h3>
            </div>
            <span className="text-[9px] bg-stadium-blue/15 border border-stadium-blue/30 text-stadium-blue font-bold px-1.5 py-0.5 rounded uppercase">
              {t('fan.badge', preferredLanguage)}
            </span>
          </div>

          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            {/* Ticket Preview Widget */}
            <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-3 mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{t('fan.ticket_title', preferredLanguage)}</div>
                <div className="font-display font-bold text-sm text-slate-200">ARG vs FRA (Sec 104)</div>
              </div>
              <Ticket className="h-6 w-6 text-stadium-gold shadow-neon" />
            </div>

            {/* Quick Demo Walkthrough triggers */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button 
                onClick={handleScanTicketOcr}
                className={`py-2 rounded-lg font-display font-extrabold text-xs uppercase border transition-all duration-150 flex items-center justify-center gap-1 ${ticketOcrDone ? 'bg-stadium-green/10 border-stadium-green text-stadium-green' : 'bg-stadium-blue/10 border-stadium-blue/30 text-stadium-blue hover:bg-stadium-blue hover:text-obsidian-dark'}`}
              >
                <Ticket className="h-3.5 w-3.5" />
                {ticketOcrLoading ? 'Scanning...' : ticketOcrDone ? 'Ticket OK' : t('fan.scan_btn', preferredLanguage)}
              </button>

              <button 
                onClick={handlePanicDistress}
                className={`py-2 rounded-lg font-display font-extrabold text-xs uppercase border transition-all duration-150 flex items-center justify-center gap-1 ${demoState === 'panic_active' ? 'bg-stadium-red/25 border-stadium-red text-stadium-red animate-pulse' : 'bg-stadium-red/10 border-stadium-red/30 text-stadium-red hover:bg-stadium-red hover:text-white'}`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                {t('fan.panic_btn', preferredLanguage)}
              </button>
            </div>

            {/* Amber Alert Image upload area */}
            {demoState !== 'ready' && (
              <div 
                onClick={handleLostChildUpload}
                className={`border-2 border-dashed rounded-xl p-3 mb-3 flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${childUploadDone ? 'bg-stadium-amber/10 border-stadium-amber' : 'border-white/10 hover:border-stadium-amber/50 hover:bg-white/5'}`}
              >
                {childUploadLoading ? (
                  <Clock className="h-5 w-5 text-stadium-amber animate-spin" />
                ) : (
                  <Upload className={`h-5 w-5 ${childUploadDone ? 'text-stadium-amber' : 'text-slate-400'}`} />
                )}
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-200">{t('fan.lost_child', preferredLanguage)}</div>
                  <div className="text-[10px] text-slate-500">{t('fan.lost_child_desc', preferredLanguage)}</div>
                </div>
                {childImageSrc && (
                  <span className="text-[9px] bg-stadium-amber/20 border border-stadium-amber/40 text-stadium-amber px-1.5 rounded uppercase">Secure Preview</span>
                )}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2 mb-3 text-xs">
              <button 
                onClick={() => setActiveFanTab('chat')} 
                className={`px-3 py-1 rounded transition-colors ${activeFanTab === 'chat' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Copilot
              </button>
              <button 
                onClick={() => setActiveFanTab('food')} 
                className={`px-3 py-1 rounded transition-colors ${activeFanTab === 'food' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Food
              </button>
              <button 
                onClick={() => setActiveFanTab('transport')} 
                className={`px-3 py-1 rounded transition-colors ${activeFanTab === 'transport' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Transit
              </button>
            </div>

            {/* Chat Companion Display */}
            {activeFanTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
                  {messages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-stadium-blue/15 border border-stadium-blue/30 text-slate-100 self-end ml-auto rounded-tr-none' : 'bg-white/5 border border-white/10 text-slate-300 self-start mr-auto rounded-tl-none'}`}
                    >
                      {msg.source && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-stadium-gold uppercase tracking-wide mb-1 select-none">
                          <Sparkles className="h-3 w-3" />
                          Source: {msg.source}
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/10 pt-2">
                  <input
                    type="text"
                    placeholder="Ask Copilot (Spanish/English)..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-stadium-blue"
                  />
                  <button type="submit" className="p-2 bg-stadium-blue/10 border border-stadium-blue/30 text-stadium-blue hover:bg-stadium-blue hover:text-obsidian-dark rounded-xl transition-all duration-150">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Food Tab */}
            {activeFanTab === 'food' && (
              <div className="flex-1 overflow-y-auto space-y-2">
                {Object.values(concessions).map((stand) => (
                  <div key={stand.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-200">{stand.name}</span>
                      <span className="text-stadium-gold font-bold">{stand.waitMin} min wait</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mb-2">Location: Concourse {stand.location}</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 bg-stadium-green/10 border border-stadium-green/30 text-stadium-green rounded text-[9px] uppercase font-bold">Peanut-Free</span>
                      <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-400 rounded text-[9px]">Hot Dog</span>
                      <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-400 rounded text-[9px]">Burgers</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Transit Tab */}
            {activeFanTab === 'transport' && (
              <div className="flex-1 overflow-y-auto space-y-2">
                {Object.values(transit).map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-200">{item.route}</span>
                      <span className="px-1.5 py-0.5 bg-stadium-green/10 border border-stadium-green/30 text-stadium-green rounded text-[9px] uppercase font-bold font-mono">{item.status}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Next ETA: {item.eta}</span>
                      <span className={item.crowdLevel === 'high' ? 'text-stadium-red font-bold' : 'text-slate-400'}>
                        {item.crowdLevel} crowd
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            PANEL 2: VOLUNTEER TABLET (Sarah Chen) - lg:col-span-3
            ═════════════════════════════════════════════════════════════════════════ */}
        <section className={`min-h-[580px] lg:min-h-0 lg:col-span-3 bg-obsidian-card/45 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative select-none shadow-lg ${activeSimulatorTab === 'volunteer' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-stadium-gold shadow-neon animate-pulse" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
                {t('vol.title', preferredLanguage)}
              </h3>
            </div>
            <span className="text-[9px] bg-stadium-gold/15 border border-stadium-gold/30 text-stadium-gold font-bold px-1.5 py-0.5 rounded uppercase">
              {t('vol.badge', preferredLanguage)}
            </span>
          </div>

          <div className="flex-1 p-4 flex flex-col overflow-hidden select-none">
            {/* Roster list switcher */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {volunteers.map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveVolunteerId(v.id)}
                  className={`py-1.5 text-xs font-bold rounded border transition-all duration-150 ${activeVolunteerId === v.id ? 'bg-stadium-gold/20 border-stadium-gold text-stadium-gold shadow-neon-gold' : 'bg-white/5 border-white/10 text-slate-400'}`}
                >
                  {v.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Profile Status */}
            {(() => {
              const activeVol = volunteers.find(v => v.id === activeVolunteerId);
              if (!activeVol) return null;

              return (
                <div className="flex-1 flex flex-col">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-stadium-gold/10 border border-stadium-gold/30 flex items-center justify-center text-stadium-gold font-display font-extrabold text-sm select-none">
                        {activeVol.initials}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-200">{activeVol.name}</div>
                        <div className="text-[10px] text-slate-500">Zone: Concourse {activeVol.zone.toUpperCase()}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${activeVol.status === 'available' ? 'bg-stadium-green/10 border border-stadium-green/30 text-stadium-green' : 'bg-stadium-red/10 border border-stadium-red/30 text-stadium-red'}`}>
                      {activeVol.status}
                    </span>
                  </div>

                  {/* Active Job Dispatches */}
                  {activeVol.task ? (
                    <div className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors select-none ${activeVol.task.description.includes('Amber') ? 'bg-stadium-amber/10 border-stadium-amber/50 shadow-neon-amber' : 'bg-stadium-red/10 border-stadium-red/50 shadow-neon-red'}`}>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={activeVol.task.description.includes('Amber') ? 'text-stadium-amber' : 'text-stadium-red'}>{t('vol.dispatch', preferredLanguage)}</span>
                        <span className="text-slate-500">ID: {activeVol.task.id}</span>
                      </div>

                      <div className="text-xs text-slate-200 font-semibold leading-relaxed">
                        {activeVol.task.description}
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5" />
                        {t('vol.location', preferredLanguage)}: Section {activeVol.task.nodeId.replace('Sec', '')}
                      </div>

                      {/* Side-by-Side Original-to-English Translation box */}
                      <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 flex flex-col gap-1.5 select-none">
                        <div className="text-[8px] font-bold text-slate-500 uppercase">{t('vol.orig_msg', preferredLanguage)}</div>
                        <div className="text-xs text-slate-300 italic">"Me siento mal, me duele el pecho en la sección 104."</div>
                        <div className="text-[8px] font-bold text-stadium-gold uppercase border-t border-white/5 pt-1.5 mt-1">{t('vol.trans_msg', preferredLanguage)}</div>
                        <div className="text-xs text-stadium-gold font-semibold">"I feel sick, my chest hurts in Section 104."</div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => addAgentLog('Staff Tablet', 'Command Center', `${activeVol.name} accepted medical dispatch task.`, 'info')}
                          className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/15 text-slate-300 font-display font-extrabold text-xs uppercase rounded-lg transition-colors"
                        >
                          {t('vol.accept', preferredLanguage)}
                        </button>
                        <button 
                          onClick={() => resolveIncident(activeVol.task!.id, activeVol.id)}
                          className="flex-1 py-2 bg-stadium-gold text-obsidian-dark font-display font-extrabold text-xs uppercase rounded-lg transition-colors hover:bg-stadium-gold/80"
                        >
                          {t('vol.resolve', preferredLanguage)}
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl p-4">
                      <Clock className="h-8 w-8 text-slate-600 animate-pulse" />
                      <div className="text-xs">No active dispatch tasks. Monitoring Concourse {activeVol.zone.toUpperCase()} zone...</div>
                    </div>
                  )}

                  {/* Certified Skills Roster */}
                  <div className="mt-auto border-t border-white/5 pt-4">
                    <div className="text-[9px] uppercase font-bold text-slate-500 mb-2">Certified Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeVol.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-slate-300 capitalize">
                          {skill.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            PANEL 3: OPERATIONS MISSION CONTROL (NASA) - lg:col-span-6
            ═════════════════════════════════════════════════════════════════════════ */}
        <section className={`min-h-[580px] lg:min-h-0 lg:col-span-6 bg-obsidian-card/45 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative select-none shadow-lg ${activeSimulatorTab === 'command' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-stadium-green shadow-neon animate-pulse" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
                Operations Mission Control
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-stadium-green/15 border border-stadium-green/30 text-stadium-green font-bold px-1.5 py-0.5 rounded uppercase">
                MetLife Twin
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden">
            
            {/* Upper: SVG Digital Twin & Active Alerts Side */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Stadium SVG Map */}
              <div className="md:col-span-8 bg-obsidian-dark border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[260px] relative">
                <StadiumMap
                  highlightedPath={highlightedPath}
                  densityMap={densityMap}
                  incidentPins={incidents.map(i => ({ id: i.id, nodeId: i.nodeId, type: i.type }))}
                  volunteerMarkers={volunteers.map(v => ({ volunteerId: v.id, nodeId: v.nodeId, name: v.name, status: v.status, taskType: v.task ? (v.task.description.includes('Amber') ? 'lost-child' : 'medical') : null }))}
                  stepFree={stepFree}
                  onNodeClick={(nodeId) => {
                    const route = navigationAgent.findRoute(nodeId, 'Sec104', stepFree);
                    setHighlightedPath(route.path);
                    addAgentLog('Command Center', 'Navigation Agent', `Plotted manual route from ${nodeId} to Section 104.`, 'info');
                  }}
                />
                
                {/* Visual accessibility notice (WCAG compliant, color alone warning alternative) */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-obsidian-card/80 border border-white/10 rounded px-2 py-0.5 text-[9px] text-slate-400">
                  <span>♿🚫</span>
                  <span>Section not step-free accessible</span>
                </div>
              </div>

              {/* Active alerts & Emergency Control Deck */}
              <div className="md:col-span-4 flex flex-col gap-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Emergency Control Deck</div>
                
                <button 
                  onClick={handleSoundAlarmTrigger}
                  className="py-2.5 bg-stadium-red/10 border border-stadium-red/30 text-stadium-red hover:bg-stadium-red hover:text-white font-display font-extrabold text-xs uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Sound Stadium Alarm
                </button>

                {/* Exits Status Grid */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 select-none">
                  <div className="text-[9px] uppercase font-bold text-slate-500">Emergency Exits status</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                      <span className="text-slate-400">E1 (North)</span>
                      <span className="text-stadium-green">●</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                      <span className="text-slate-400">E2 (East)</span>
                      <span className="text-stadium-green">●</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                      <span className="text-slate-400">E3 (South)</span>
                      <span className="text-stadium-green">●</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                      <span className="text-slate-400">E4 (West)</span>
                      <span className="text-stadium-green">●</span>
                    </div>
                  </div>
                </div>

                {/* Active Alerts List */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 overflow-y-auto space-y-2">
                  <div className="text-[9px] uppercase font-bold text-slate-500">Active Alert Feeds</div>
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-2 bg-white/5 rounded border border-white/10 flex items-start gap-1.5 text-xs">
                      <span className={alert.priority === 'critical' ? 'text-stadium-red' : 'text-stadium-amber'}>⚠️</span>
                      <div>
                        <div className="font-bold text-slate-200">{alert.title}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{alert.message}</div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Bottom: Multi-Agent Audit Log Terminal */}
            <div className="border border-white/10 rounded-xl p-4 bg-obsidian-dark flex flex-col gap-2 min-h-[160px] max-h-[220px]">
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-stadium-green shadow-neon animate-pulse" />
                  {t('cmd.audit_terminal', preferredLanguage)}
                </div>
                <span className="text-[9px] bg-stadium-green/10 border border-stadium-green/30 text-stadium-green px-1.5 rounded uppercase tracking-wider font-mono select-none">Demo Live Data</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-[11px] leading-relaxed select-text">
                {agentLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`border-l-2 pl-3 py-1 bg-white/5 ${log.severity === 'critical' ? 'border-stadium-red bg-stadium-red/5' : log.severity === 'warning' ? 'border-stadium-amber' : 'border-stadium-green'}`}
                  >
                    <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                      <span>[{log.fromAgent}] ➔ [{log.toAgent}]</span>
                      <span>{isMounted ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}</span>
                    </div>
                    {/* Show side-by-side translation if selected language is non-English */}
                    {preferredLanguage !== 'en' && log.localizedAction ? (
                      <div className="text-slate-300">
                        <span className="text-slate-500 select-none mr-1">[{preferredLanguage.toUpperCase()}]</span>
                        {log.localizedAction}
                      </div>
                    ) : (
                      <div className="text-slate-300">{log.action}</div>
                    )}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Lower: KPI analytics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
                <div className="text-[9px] text-slate-500 uppercase font-bold">{t('status.occupancy', preferredLanguage)}</div>
                <div className="font-display font-extrabold text-sm text-slate-200 mt-1">{OCCUPANCY_TEXT}</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
                <div className="text-[9px] text-slate-500 uppercase font-bold">{t('cmd.response_speed', preferredLanguage)}</div>
                <div className="font-display font-extrabold text-sm text-stadium-green mt-1">2.4 min</div>
                <div className="text-[8px] text-slate-500">Benchmark target: 4.5m</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
                <div className="text-[9px] text-slate-500 uppercase font-bold">{t('cmd.active_incidents', preferredLanguage)}</div>
                <div className="font-display font-extrabold text-sm text-stadium-red mt-1">{incidents.length} {t('cmd.active_incidents_suffix', preferredLanguage) || 'incidents'}</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 select-none">
                <div className="text-[9px] text-slate-500 uppercase font-bold">{t('cmd.green_score', preferredLanguage)}</div>
                <div className="font-display font-extrabold text-sm text-stadium-gold mt-1">{sustainability.greenScore} / 100</div>
              </div>

            </div>

          </div>
        </section>

      </div>

      {/* ── HUMAN APPROVAL DIALOG OVERLAY (GATED POLICY MATRIX) ── */}
      {activeApprovalEvent && (
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

              {/* Countdown escalation warnings (Rigor check) */}
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
      )}

    </div>
  );
}
