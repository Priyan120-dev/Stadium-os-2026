/**
 * page.tsx — Dedicated Fan Mobile Companion App
 *
 * Provides a mobile frame view optimized for smartphones.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStadiumOS } from '../../context/StadiumOSContext';
import StadiumMap from '../../components/StadiumMap';
import { copilotEngine, ChatMessage } from '../../agents/copilotEngine';
import { t } from '../../utils/translations';
import {
  Ticket,
  Users,
  Compass,
  Send,
  Upload,
  Clock,
  Sparkles,
  PhoneCall,
  Activity,
  User as UserIcon,
  ChevronRight,
  Coffee,
  Bus
} from 'lucide-react';
import { OCCUPANCY_TEXT } from '../../mockData';

export default function FanCompanionPage() {
  const {
    tickets,
    incidents,
    volunteers,
    concessions,
    transit,
    alerts,
    densityMap,
    activeUser,
    stepFree,
    setStepFree,
    preferredLanguage,
    highlightedPath,
    setHighlightedPath,
    demoState,
    setDemoState,
    addEvent,
    addAgentLog,
    addAlert
  } = useStadiumOS();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'agent',
      text: preferredLanguage === 'es' 
        ? '¡Hola Mateo! Bienvenido a MetLife. Escanea tu ticket o escribe una pregunta.'
        : 'Hello Mateo! Welcome to MetLife Stadium. Scan your ticket or type a question.',
      timestamp: '12:00 PM',
      source: 'Command Orchestrator'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'map' | 'food' | 'transit'>('chat');

  // Scanning ticket simulator states
  const [scanLoading, setScanLoading] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  // Lost child photo simulation
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScanTicket = () => {
    if (scanLoading || scanDone) return;
    setScanLoading(true);
    const correlationId = `corr-fan-ocr-${Math.random().toString(36).substr(2, 9)}`;

    addAgentLog('Fan App', 'Vision Agent', 'Scanning fan ticket OCR [ARG vs FRA].', 'info', correlationId);

    setTimeout(() => {
      setScanLoading(false);
      setScanDone(true);

      const routeReport = navigationAgent.findRoute('Sec104', 'GateB', stepFree);
      setHighlightedPath(routeReport.path);

      const reply = preferredLanguage === 'es'
        ? "¡Ticket validado! Asiento: Sección 104, Fila G. Debido a la congestión crítica de la Puerta A (28 min), hemos modificado tu ruta por la Puerta B. Sigue la línea iluminada."
        : "Ticket validated! Seat: Section 104, Row G. Due to critical congestion at Gate A (28 min), we have rerouted you to Gate B. Follow the highlighted line.";

      setMessages(prev => [
        ...prev,
        { id: `msg-ocr-usr`, sender: 'user', text: '📷 [Scan Ticket: ARG vs FRA]', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: `msg-ocr-agent`, sender: 'agent', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), source: 'Vision Agent', correlationId }
      ]);
      setDemoState('ticket_scanned');
    }, 1500);
  };

  const handlePanicDistress = () => {
    const correlationId = `corr-fan-panic-${Math.random().toString(36).substr(2, 9)}`;
    addAgentLog('Fan App', 'Emergency Agent', 'Fan activated critical distress button from mobile App.', 'error', correlationId);

    addEvent('PANIC_PRESSED', { section: 'Sec104' }, 'Fan App', 'Emergency Agent', 'critical', correlationId);
    
    // Choose volunteer SC to dispatch
    addAgentLog('Emergency Agent', 'Volunteer Agent', `Auto Action: Alerting volunteer SC to proceed to Section 104.`, 'warning', correlationId);

    const reply = preferredLanguage === 'es'
      ? "🚨 AYUDA MÉDICA EN CAMINO. Un equipo de emergencia ha sido despachado a la Sección 104. El DEA 5 más cercano se encuentra a 30m en el baño R5. Quédate en tu lugar."
      : "🚨 MEDICAL TEAM EN ROUTE. Emergency responder dispatched to Section 104. Nearest AED 5 is located 30m away at Restroom R5. Please remain in place.";

    setMessages(prev => [
      ...prev,
      { id: `msg-panic-usr`, sender: 'user', text: '🚨 [EMERGENCY HELP PANIC]', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { id: `msg-panic-agent`, sender: 'agent', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), source: 'Emergency Agent', correlationId }
    ]);
    setDemoState('panic_active');
  };

  const handleUploadPhoto = () => {
    if (uploadLoading || uploadDone) return;
    setUploadLoading(true);
    const correlationId = `corr-fan-child-${Math.random().toString(36).substr(2, 9)}`;

    addAgentLog('Fan App', 'Vision Agent', 'Uploading missing child photo.', 'info', correlationId);

    setTimeout(() => {
      setUploadLoading(false);
      setUploadDone(true);

      addEvent('LOST_CHILD_UPLOAD', { estimatedAge: '8', shirtColor: 'Blue Shirt', details: 'curly hair' }, 'Vision Agent', 'Emergency Agent', 'high', correlationId);

      const reply = preferredLanguage === 'es'
        ? "¡Alerta Amber emitida! El Agente de Visión procesó la foto: varón, ~8 años, camisa azul. La voluntaria Sarah Chen ha sido despachada a buscar en tu sector."
        : "Amber Alert broadcasted! Vision Agent analyzed photo: male, ~8 years, blue shirt. Volunteer Sarah Chen is dispatched to search your sector.";

      setMessages(prev => [
        ...prev,
        { id: `msg-child-usr`, sender: 'user', text: '📷 [Uploaded photo of son]', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: `msg-child-agent`, sender: 'agent', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), source: 'Emergency Agent', correlationId }
      ]);
      setDemoState('lost_child_alert');
    }, 1500);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput;
    setUserInput('');
    setChatLoading(true);

    setMessages(prev => [
      ...prev,
      { id: `msg-${Date.now()}`, sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    const correlationId = `corr-fan-chat-${Math.random().toString(36).substr(2, 9)}`;

    await copilotEngine.getResponse(
      userText,
      messages,
      preferredLanguage,
      stepFree,
      correlationId,
      (reply, source) => {
        setMessages(prev => [
          ...prev,
          { id: `msg-reply-${Date.now()}`, sender: 'agent', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), source, correlationId }
        ]);
        setChatLoading(false);
      },
      (err) => {
        setChatLoading(false);
      }
    );
  };

  return (
    <div className="h-full w-full bg-obsidian-dark flex justify-center items-center p-4 overflow-hidden select-none">
      
      {/* Smartphone frame shell */}
      <div className="max-w-md w-full h-[640px] bg-obsidian-card border border-white/10 rounded-[36px] overflow-hidden flex flex-col shadow-neon-blue relative">
        
        {/* Device Top Speaker / Notch notch */}
        <div className="h-6 bg-obsidian-dark flex justify-center items-center select-none">
          <div className="w-24 h-4 bg-obsidian-card rounded-b-xl border-x border-b border-white/10" />
        </div>

        {/* Mobile Header Bar */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-stadium-blue" />
            <div>
              <div className="font-display font-extrabold text-xs text-white">{t('fan.title', preferredLanguage)}</div>
              <div className="text-[9px] text-slate-500 font-mono">Seat: Section 104-G</div>
            </div>
          </div>
          <button 
            onClick={handlePanicDistress}
            className="px-2.5 py-1 bg-stadium-red/20 border border-stadium-red/40 hover:bg-stadium-red hover:text-white rounded-lg text-[10px] text-stadium-red font-display font-extrabold uppercase transition-all select-none animate-pulse"
          >
            {t('fan.panic_btn', preferredLanguage).split(' ')[0].toUpperCase()}
          </button>
        </div>

        {/* Dynamic content panels */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Scan Ticket Overlay call to action */}
              {!scanDone && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 flex items-center justify-between select-none">
                  <div>
                    <div className="text-[10px] text-stadium-gold font-bold">{t('fan.ticket_pass', preferredLanguage)}</div>
                    <div className="font-display font-bold text-xs text-slate-200">Argentine vs France</div>
                  </div>
                  <button 
                    onClick={handleScanTicket}
                    className="px-3 py-1.5 bg-stadium-blue hover:bg-stadium-blue/80 text-obsidian-dark font-display font-extrabold text-[10px] uppercase rounded-lg shadow-sm transition-all"
                  >
                    {scanLoading ? 'VALIDATING...' : t('fan.scan_btn', preferredLanguage).toUpperCase()}
                  </button>
                </div>
              )}

              {/* Upload photo for lost child alert */}
              {demoState !== 'ready' && !uploadDone && (
                <div 
                  onClick={handleUploadPhoto}
                  className="bg-stadium-amber/15 border border-dashed border-stadium-amber/50 rounded-xl p-3 mb-3 flex items-center justify-between cursor-pointer hover:bg-stadium-amber/20 select-none"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-stadium-amber animate-bounce" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{t('fan.lost_child', preferredLanguage)}</div>
                      <div className="text-[9px] text-slate-400">{t('fan.lost_child_desc', preferredLanguage)}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stadium-amber" />
                </div>
              )}

              {/* Message loop */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 mb-3">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-stadium-blue/15 border border-stadium-blue/30 text-slate-100 self-end ml-auto rounded-tr-none' : 'bg-white/5 border border-white/10 text-slate-300 self-start mr-auto rounded-tl-none'}`}
                  >
                    {msg.source && (
                      <div className="flex items-center gap-1 text-[8px] font-bold text-stadium-gold uppercase tracking-wide mb-1 select-none">
                        <Sparkles className="h-2.5 w-2.5" />
                        {msg.source}
                      </div>
                    )}
                    <div>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-white/10 pt-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-stadium-blue"
                />
                <button type="submit" className="p-2 bg-stadium-blue/10 border border-stadium-blue/30 text-stadium-blue rounded-xl hover:bg-stadium-blue hover:text-obsidian-dark">
                  <Send className="h-4 w-4" />
                </button>
              </form>

            </div>
          )}

          {activeTab === 'map' && (
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              <div className="flex-1 bg-obsidian-dark border border-white/10 rounded-2xl flex items-center justify-center p-2 relative min-h-[220px]">
                <StadiumMap
                  highlightedPath={highlightedPath}
                  densityMap={densityMap}
                  incidentPins={incidents.map(i => ({ id: i.id, nodeId: i.nodeId, type: i.type }))}
                  volunteerMarkers={volunteers.map(v => ({ volunteerId: v.id, nodeId: v.nodeId, name: v.name, status: v.status, taskType: v.task ? 'lost-child' : null }))}
                  stepFree={stepFree}
                />
              </div>

              {/* Step free checkbox toggle */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-2">
                  <Compass className={`h-4 w-4 ${stepFree ? 'text-stadium-blue' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-bold text-slate-200">{t('fan.step_free', preferredLanguage)}</div>
                    <div className="text-[9px] text-slate-500">{t('fan.step_free_desc', preferredLanguage)}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={stepFree}
                  onChange={(e) => setStepFree(e.target.checked)}
                  className="h-4 w-4 text-stadium-blue border-white/20 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'food' && (
            <div className="flex-1 overflow-y-auto space-y-2 select-none">
              {Object.values(concessions).map(stand => (
                <div key={stand.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{stand.name}</span>
                    <span className="text-stadium-gold font-bold">{stand.waitMin} min wait</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Location: Court {stand.location}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'transit' && (
            <div className="flex-1 overflow-y-auto space-y-2 select-none">
              {Object.values(transit).map(item => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{item.route}</span>
                    <span className="text-stadium-green font-bold font-mono text-[9px]">{item.status}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>ETA: {item.eta}</span>
                    <span>{item.crowdLevel} density</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Smartphone Navigation Tabs (Fixed bottom footer) */}
        <div className="h-16 bg-white/5 border-t border-white/10 grid grid-cols-4 select-none">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col justify-center items-center text-[10px] transition-colors ${activeTab === 'chat' ? 'text-stadium-blue font-bold' : 'text-slate-500'}`}
          >
            <Sparkles className="h-5 w-5 mb-0.5" />
            {t('fan.copilot', preferredLanguage)}
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex flex-col justify-center items-center text-[10px] transition-colors ${activeTab === 'map' ? 'text-stadium-blue font-bold' : 'text-slate-500'}`}
          >
            <Compass className="h-5 w-5 mb-0.5" />
            {t('fan.route', preferredLanguage)}
          </button>
          <button 
            onClick={() => setActiveTab('food')}
            className={`flex flex-col justify-center items-center text-[10px] transition-colors ${activeTab === 'food' ? 'text-stadium-blue font-bold' : 'text-slate-500'}`}
          >
            <Coffee className="h-5 w-5 mb-0.5" />
            {t('fan.food', preferredLanguage)}
          </button>
          <button 
            onClick={() => setActiveTab('transit')}
            className={`flex flex-col justify-center items-center text-[10px] transition-colors ${activeTab === 'transit' ? 'text-stadium-blue font-bold' : 'text-slate-500'}`}
          >
            <Bus className="h-5 w-5 mb-0.5" />
            {t('fan.transit', preferredLanguage)}
          </button>
        </div>

      </div>
    </div>
  );
}

// Simulated navigation lookup bypass
const navigationAgent = {
  findRoute(start: string, end: string, stepFree: boolean) {
    const penaltyNodes = stepFree ? ['Sec101', 'GateB'] : ['Sec101', 'Sec102', 'Sec103', 'GateB'];
    return {
      path: ['GateB', ...penaltyNodes, 'Sec104'],
      instructions: []
    };
  }
};
