/**
 * Toast.tsx — Premium toast notification alert
 */
'use client';
import React, { useEffect } from 'react';
import { X, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const typeMap = {
  info: { icon: <Info className="h-4 w-4" />, border: 'border-stadium-blue/35', bg: 'bg-obsidian-card/90', text: 'text-slate-200', iconColor: 'text-stadium-blue' },
  success: { icon: <CheckCircle2 className="h-4 w-4" />, border: 'border-stadium-green/35', bg: 'bg-obsidian-card/90', text: 'text-slate-200', iconColor: 'text-stadium-green' },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, border: 'border-stadium-gold/35', bg: 'bg-obsidian-card/90', text: 'text-slate-200', iconColor: 'text-stadium-gold' },
  critical: { icon: <ShieldAlert className="h-4 w-4" />, border: 'border-stadium-red/35', bg: 'bg-obsidian-card/90', text: 'text-slate-200', iconColor: 'text-stadium-red' },
};

export const Toast: React.FC<ToastProps> = React.memo(function Toast({ toast, onClose }) {
  const t = typeMap[toast.type];

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div className={`
      flex items-center justify-between gap-3 p-4 rounded-xl border ${t.border} ${t.bg} ${t.text}
      backdrop-blur-xl shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in select-none max-w-sm w-full
    `}>
      <div className="flex items-center gap-2.5">
        <span className={t.iconColor}>{t.icon}</span>
        <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
      </div>
      <button 
        onClick={() => onClose(toast.id)} 
        className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Dismiss Alert"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});
