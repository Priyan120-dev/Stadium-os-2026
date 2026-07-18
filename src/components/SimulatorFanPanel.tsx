/**
 * SimulatorFanPanel.tsx — Smartphone mockup fan panel for simulator with Voice Speech,
 * Suggested Prompts, and Streaming text simulations.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Ticket as TicketIcon, ShieldAlert, Clock, Upload, Send, Sparkles, Mic, Volume2, MicOff } from 'lucide-react';
import { Concession, Transit, ChatMessage } from '../types';
import { t } from '../utils/translations';
import { useStadiumOS } from '../context/StadiumOSContext';

interface SimulatorFanPanelProps {
  activeSimulatorTab: 'fan' | 'volunteer' | 'command';
  preferredLanguage: string;
  demoState: string;
  ticketOcrLoading: boolean;
  ticketOcrDone: boolean;
  childUploadLoading: boolean;
  childUploadDone: boolean;
  childImageSrc: string | null;
  activeFanTab: 'chat' | 'food' | 'transport';
  setActiveFanTab: (tab: 'chat' | 'food' | 'transport') => void;
  messages: ChatMessage[];
  userInput: string;
  setUserInput: (val: string) => void;
  chatLoading: boolean;
  handleScanTicketOcr: () => void;
  handlePanicDistress: () => void;
  handleLostChildUpload: () => void;
  handleSendMessage: (e: React.FormEvent) => void;
  concessions: Record<string, Concession>;
  transit: Record<string, Transit>;
}

const SUGGESTED_CHIPS = [
  { label: 'Peanut-Free Concessions', query: 'List food concessions offering peanut-free items' },
  { label: 'ADA Step-Free Ramp', query: 'Show me the closest step-free route to Gate B' },
  { label: 'Concourse Concessions Wait', query: 'Which burger concession has the shortest queue wait?' }
];

export const SimulatorFanPanel: React.FC<SimulatorFanPanelProps> = React.memo(function SimulatorFanPanel({
  activeSimulatorTab,
  preferredLanguage,
  demoState,
  ticketOcrLoading,
  ticketOcrDone,
  childUploadLoading,
  childUploadDone,
  childImageSrc,
  activeFanTab,
  setActiveFanTab,
  messages,
  userInput,
  setUserInput,
  chatLoading,
  handleScanTicketOcr,
  handlePanicDistress,
  handleLostChildUpload,
  handleSendMessage,
  concessions,
  transit
}) {
  const { updateDecisionExplainability } = useStadiumOS();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Streaming text animation hook
  const [streamIndex, setStreamIndex] = useState<number>(0);
  const [lastMsgId, setLastMsgId] = useState<string>('');

  const lastMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages[messages.length - 1];
  }, [messages]);

  useEffect(() => {
    if (lastMessage && lastMessage.sender === 'agent' && lastMessage.id !== lastMsgId) {
      setLastMsgId(lastMessage.id);
      setStreamIndex(0);
    }
  }, [lastMessage, lastMsgId]);

  useEffect(() => {
    if (lastMessage && lastMessage.sender === 'agent' && streamIndex < lastMessage.text.length) {
      const timer = setTimeout(() => {
        // Stream 4 characters at a time for smooth rendering
        setStreamIndex(prev => Math.min(prev + 4, lastMessage.text.length));
      }, 25);
      return () => clearTimeout(timer);
    }
  }, [lastMessage, streamIndex]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamIndex]);

  // Speech Recognition input
  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback if not supported
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setUserInput(preferredLanguage === 'es' ? 'Mostrar ruta accesible a la puerta B' : 'Show accessible route to Gate B');
      }, 1500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = preferredLanguage === 'es' ? 'es-ES' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setUserInput(speechToText);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  }, [preferredLanguage, setUserInput]);

  // Speech Synthesis output
  const handleVoiceOutput = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speakings
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferredLanguage === 'es' ? 'es-ES' : 'en-US';
    window.speechSynthesis.speak(utterance);
  }, [preferredLanguage]);

  return (
    <section className={`min-h-[580px] lg:min-h-0 lg:col-span-3 bg-obsidian-card/45 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative select-none shadow-lg ${activeSimulatorTab === 'fan' ? 'flex' : 'hidden lg:flex'}`}>
      {/* Header */}
      <div className="h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-stadium-blue shadow-neon animate-pulse" />
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
            {t('fan.title', preferredLanguage)}
          </h2>
        </div>
        <button
          onClick={handlePanicDistress}
          className="px-2.5 py-1 bg-stadium-red/20 hover:bg-stadium-red text-stadium-red hover:text-white border border-stadium-red/40 rounded-lg text-[9px] font-extrabold uppercase transition-all duration-150 flex items-center gap-1 shadow-neon-red animate-pulse"
        >
          <ShieldAlert className="h-3 w-3" />
          {t('fan.distress', preferredLanguage)}
        </button>
      </div>

      {/* Fan Companion Navigation Tabs */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex bg-white/3 border border-white/8 rounded-xl p-1 mb-3 shrink-0 text-[10px] font-bold">
          <button 
            role="tab"
            aria-selected={activeFanTab === 'chat'}
            onClick={() => setActiveFanTab('chat')} 
            className={`flex-1 py-1 rounded transition-colors ${activeFanTab === 'chat' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Copilot
          </button>
          <button 
            role="tab"
            aria-selected={activeFanTab === 'food'}
            onClick={() => setActiveFanTab('food')} 
            className={`flex-1 py-1 rounded transition-colors ${activeFanTab === 'food' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Food
          </button>
          <button 
            role="tab"
            aria-selected={activeFanTab === 'transport'}
            onClick={() => setActiveFanTab('transport')} 
            className={`flex-1 py-1 rounded transition-colors ${activeFanTab === 'transport' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Transit
          </button>
        </div>

        {/* Chat Companion Display */}
        {activeFanTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
              {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                const displayText = (isLast && msg.sender === 'agent') ? msg.text.slice(0, streamIndex) : msg.text;

                return (
                  <div 
                    key={index}
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed transition-all duration-300 ${
                      msg.sender === 'user' 
                        ? 'bg-stadium-blue/15 border border-stadium-blue/30 text-slate-100 self-end ml-auto rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-slate-300 self-start mr-auto rounded-tl-none'
                    }`}
                  >
                    {msg.source && (
                      <div className="flex items-center justify-between text-[9px] font-bold text-stadium-gold uppercase tracking-wide mb-1.5 select-none border-b border-white/5 pb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Source: {msg.source}
                        </span>
                        {msg.sender === 'agent' && (
                          <button 
                            onClick={() => handleVoiceOutput(msg.text)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-slate-200"
                            aria-label="Speak text"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <div>{displayText}</div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="self-start mr-auto bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2 select-none">
                  <span className="h-1.5 w-1.5 bg-stadium-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 bg-stadium-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 bg-stadium-blue rounded-full animate-bounce" />
                  <span>AI Thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick-reply Suggestion Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0 select-none">
              {SUGGESTED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserInput(chip.query)}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] text-slate-400 hover:text-slate-200 rounded-lg whitespace-nowrap font-medium transition-all duration-150 active:scale-95 shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-1.5 border-t border-white/10 pt-2 shrink-0">
              <input
                type="text"
                placeholder="Ask Copilot (Spanish/English)..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-stadium-blue focus:ring-1 focus:ring-stadium-blue"
                aria-label="Ask Copilot"
              />
              <button 
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 border rounded-xl transition-all duration-150 ${
                  isRecording 
                    ? 'bg-stadium-red/25 border-stadium-red text-stadium-red animate-pulse' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
                aria-label="Voice Input"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button 
                type="submit" 
                className="p-2 bg-stadium-blue/10 border border-stadium-blue/30 text-stadium-blue hover:bg-stadium-blue hover:text-obsidian-dark rounded-xl transition-all duration-150"
                aria-label="Send query"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Food Tab */}
        {activeFanTab === 'food' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
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
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-none">
            {Object.values(transit).map((line) => (
              <div key={line.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-stadium-blue shadow-neon" />
                    {line.route}
                  </div>
                  <span className="font-mono text-slate-400 font-bold">{line.eta}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-semibold">
                  <span>Load: {line.crowdLevel}</span>
                  <span className={`uppercase font-bold ${
                    line.status === 'on time' ? 'text-stadium-green' : 'text-stadium-amber'
                  }`}>{line.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket OCR Scan Bar */}
      <div className="h-20 bg-white/5 border-t border-white/10 p-3 flex gap-3 select-none shrink-0">
        <button
          onClick={handleScanTicketOcr}
          disabled={ticketOcrLoading}
          className={`flex-1 flex flex-col items-center justify-center border rounded-xl transition-all duration-150 ${
            ticketOcrDone 
              ? 'bg-stadium-green/10 border-stadium-green/30 text-stadium-green' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
          }`}
        >
          <TicketIcon className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] font-extrabold uppercase tracking-wide">
            {ticketOcrLoading ? 'Scanning...' : ticketOcrDone ? 'OCR Completed' : 'Scan Match Ticket'}
          </span>
        </button>

        <button
          onClick={handleLostChildUpload}
          disabled={childUploadLoading}
          className={`flex-1 flex flex-col items-center justify-center border rounded-xl overflow-hidden relative transition-all duration-150 ${
            childUploadDone 
              ? 'bg-stadium-amber/10 border-stadium-amber/30 text-stadium-amber' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
          }`}
        >
          {childImageSrc ? (
            <img src={childImageSrc} alt="Lost Child Profile" className="h-full w-full object-cover opacity-60" />
          ) : (
            <Upload className="h-5 w-5 mb-0.5" />
          )}
          <span className="absolute text-[8px] font-extrabold uppercase tracking-wide bg-obsidian-dark/75 px-1 py-0.5 rounded">
            {childUploadLoading ? 'Processing...' : childUploadDone ? 'Photo Synced' : 'Report Lost Child'}
          </span>
        </button>
      </div>
    </section>
  );
});
