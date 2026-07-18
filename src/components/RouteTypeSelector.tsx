/**
 * RouteTypeSelector.tsx — 7-mode navigation route type selector
 */
'use client';
import React from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { NavigationMode } from '../mockData';
import { Zap, Wind, Accessibility, Crown, Siren, Users, LogOut } from 'lucide-react';

const modes: { mode: NavigationMode; label: string; icon: React.ReactNode; color: string; border: string; bg: string }[] = [
  { mode: 'fastest',      label: 'Fastest',      icon: <Zap className="h-3.5 w-3.5" />,        color: 'text-stadium-green', border: 'border-stadium-green/40', bg: 'bg-stadium-green/10' },
  { mode: 'least-crowded',label: 'Quiet',         icon: <Wind className="h-3.5 w-3.5" />,        color: 'text-stadium-blue',  border: 'border-stadium-blue/40',  bg: 'bg-stadium-blue/10' },
  { mode: 'wheelchair',   label: 'Step-Free',     icon: <Accessibility className="h-3.5 w-3.5" />,  color: 'text-stadium-blue',  border: 'border-stadium-blue/40',  bg: 'bg-stadium-blue/10' },
  { mode: 'vip',          label: 'VIP',           icon: <Crown className="h-3.5 w-3.5" />,       color: 'text-stadium-gold',  border: 'border-stadium-gold/40',  bg: 'bg-stadium-gold/10' },
  { mode: 'emergency',    label: 'Emergency',     icon: <Siren className="h-3.5 w-3.5" />,       color: 'text-stadium-red',   border: 'border-stadium-red/40',   bg: 'bg-stadium-red/10' },
  { mode: 'volunteer',    label: 'Staff',         icon: <Users className="h-3.5 w-3.5" />,       color: 'text-stadium-amber', border: 'border-stadium-amber/40', bg: 'bg-stadium-amber/10' },
  { mode: 'exit',         label: 'Exit',          icon: <LogOut className="h-3.5 w-3.5" />,      color: 'text-slate-400',     border: 'border-white/20',         bg: 'bg-white/5' },
];

interface RouteTypeSelectorProps {
  compact?: boolean;
}

export const RouteTypeSelector = React.memo(function RouteTypeSelector({ compact = false }: RouteTypeSelectorProps) {
  const { navigationMode, setNavigationMode, setStepFree } = useStadiumOS();

  const handleSelect = (mode: NavigationMode) => {
    setNavigationMode(mode);
    // Sync step-free toggle with wheelchair mode
    setStepFree(mode === 'wheelchair');
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {modes.map(({ mode, label, icon, color, border, bg }) => {
        const isActive = navigationMode === mode;
        return (
          <button
            key={mode}
            onClick={() => handleSelect(mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all duration-200 ${
              isActive
                ? `${bg} ${border} ${color} shadow-lg scale-105`
                : 'bg-white/3 border-white/8 text-slate-500 hover:bg-white/8 hover:text-slate-300'
            }`}
          >
            <span className={isActive ? color : 'opacity-50'}>{icon}</span>
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
});
