/**
 * CommandPalette.tsx — Ctrl+K Global Operations Command Search Overlay
 */
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Command, RefreshCw, AlertTriangle, FileText, ChevronRight, X } from 'lucide-react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { useRouter } from 'next/navigation';

export const CommandPalette: React.FC = React.memo(function CommandPalette() {
  const router = useRouter();
  const { resetDemo, showToast } = useStadiumOS();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette open / closed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Available commands
  const commands = useMemo(() => [
    { 
      id: 'reset', 
      title: 'Reset Simulator State', 
      desc: 'Clears storage context databases and resets active alerts.',
      icon: <RefreshCw className="h-4 w-4 text-stadium-blue animate-spin" />,
      action: () => {
        resetDemo();
        showToast('Stadium Operating System database reset successful.', 'success');
        setIsOpen(false);
      }
    },
    {
      id: 'alarm',
      title: 'Propose Stadium Alarm Action',
      desc: 'Triggers supervisor notification to activate metlife sirens.',
      icon: <AlertTriangle className="h-4 w-4 text-stadium-red animate-pulse" />,
      action: () => {
        router.push('/simulator');
        showToast('Proposed emergency override. Navigate to Command Approval Gate to authenticate.', 'warning');
        setIsOpen(false);
      }
    },
    {
      id: 'export',
      title: 'Export Operations CSV Logs',
      desc: 'Generates client-side CSV downloads of active incidents.',
      icon: <FileText className="h-4 w-4 text-stadium-green" />,
      action: () => {
        // Trigger simulated CSV download
        const csvContent = "data:text/csv;charset=utf-8,IncidentID,Location,Severity,Status\nINC-001,Gate A,critical,resolved\nINC-002,Concourse Sector 102,high,active\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "stadium_os_incident_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Incident CSV report exported successfully.', 'success');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-sandbox',
      title: 'Navigate to Simulator Sandbox',
      desc: 'Switch to the integrated operations multi-role screen.',
      icon: <ChevronRight className="h-4 w-4 text-slate-400" />,
      action: () => {
        router.push('/simulator');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-command',
      title: 'Navigate to Command Mission Control',
      desc: 'Open the full widescreen tournament operations center.',
      icon: <ChevronRight className="h-4 w-4 text-slate-400" />,
      action: () => {
        router.push('/command');
        setIsOpen(false);
      }
    }
  ], [resetDemo, showToast, router]);

  // Filter commands by search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const query = search.toLowerCase();
    return commands.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.desc.toLowerCase().includes(query)
    );
  }, [search, commands]);

  // Handle keyboard list navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  }, [selectedIndex, filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/75 backdrop-blur-md select-none animate-fade-in">
      <div 
        ref={modalRef}
        className="max-w-lg w-full bg-obsidian-card/95 border border-white/10 rounded-2xl p-4 shadow-neon flex flex-col gap-3 font-display"
        onKeyDown={handleKeyDown}
      >
        {/* Search header input */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent text-slate-200 outline-none text-xs"
            aria-label="Command search input"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px] font-mono text-slate-400">
            ESC
          </kbd>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-slate-500 italic">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((c, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={c.id}
                  onClick={c.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-stadium-blue/10 border-stadium-blue text-white shadow-neon-blue' 
                      : 'bg-white/3 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-stadium-blue/20' : 'bg-white/5'}`}>
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{c.title}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{c.desc}</div>
                  </div>
                  <Command className="h-3.5 w-3.5 opacity-40 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Info footer */}
        <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <div className="flex gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Stadium Command Console</span>
        </div>
      </div>
    </div>
  );
});
