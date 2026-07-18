/**
 * SimulatorFanPanel.tsx — Smartphone mockup fan panel for simulator
 */
'use client';
import React, { useRef, useEffect } from 'react';
import { Ticket as TicketIcon, ShieldAlert, Clock, Upload, Send, Sparkles } from 'lucide-react';
import { Concession, Transit, ChatMessage } from '../types';
import { t } from '../utils/translations';

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className={`min-h-[580px] lg:min-h-0 lg:col-span-3 bg-obsidian-card/45 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl relative select-none shadow-lg ${activeSimulatorTab === 'fan' ? 'flex' : 'hidden lg:flex'}`}>
      {/* Header */}
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
          <TicketIcon className="h-6 w-6 text-stadium-gold shadow-neon" />
        </div>

        {/* Quick Demo Walkthrough triggers */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button 
            onClick={handleScanTicketOcr}
            className={`py-2 rounded-lg font-display font-extrabold text-xs uppercase border transition-all duration-150 flex items-center justify-center gap-1 ${ticketOcrDone ? 'bg-stadium-green/10 border-stadium-green text-stadium-green' : 'bg-stadium-blue/10 border-stadium-blue/30 text-stadium-blue hover:bg-stadium-blue hover:text-obsidian-dark'}`}
            aria-label="Scan Match Ticket"
          >
            <TicketIcon className="h-3.5 w-3.5" />
            {ticketOcrLoading ? 'Scanning...' : ticketOcrDone ? 'Ticket OK' : t('fan.scan_btn', preferredLanguage)}
          </button>

          <button 
            onClick={handlePanicDistress}
            className={`py-2 rounded-lg font-display font-extrabold text-xs uppercase border transition-all duration-150 flex items-center justify-center gap-1 ${demoState === 'panic_active' ? 'bg-stadium-red/25 border-stadium-red text-stadium-red animate-pulse' : 'bg-stadium-red/10 border-stadium-red/30 text-stadium-red hover:bg-stadium-red hover:text-white'}`}
            aria-label="Trigger Medical Panic"
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
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLostChildUpload(); }}
            aria-label="Upload photo of lost child"
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
        <div className="flex gap-2 border-b border-white/10 pb-2 mb-3 text-xs" role="tablist">
          <button 
            role="tab"
            aria-selected={activeFanTab === 'chat'}
            onClick={() => setActiveFanTab('chat')} 
            className={`px-3 py-1 rounded transition-colors ${activeFanTab === 'chat' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Copilot
          </button>
          <button 
            role="tab"
            aria-selected={activeFanTab === 'food'}
            onClick={() => setActiveFanTab('food')} 
            className={`px-3 py-1 rounded transition-colors ${activeFanTab === 'food' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Food
          </button>
          <button 
            role="tab"
            aria-selected={activeFanTab === 'transport'}
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-stadium-blue focus:ring-1 focus:ring-stadium-blue"
                aria-label="Ask Copilot"
              />
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
  );
});
