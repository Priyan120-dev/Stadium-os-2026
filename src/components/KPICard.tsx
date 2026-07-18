/**
 * KPICard.tsx — Reusable premium metric card
 */
'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;        // positive = good, negative = bad
  deltaLabel?: string;
  color?: 'green' | 'blue' | 'gold' | 'red' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  green: { text: 'text-stadium-green', border: 'border-stadium-green/25', bg: 'bg-stadium-green/8', glow: 'shadow-neon' },
  blue:  { text: 'text-stadium-blue',  border: 'border-stadium-blue/25',  bg: 'bg-stadium-blue/8',  glow: 'shadow-neon-blue' },
  gold:  { text: 'text-stadium-gold',  border: 'border-stadium-gold/25',  bg: 'bg-stadium-gold/8',  glow: 'shadow-neon-gold' },
  red:   { text: 'text-stadium-red',   border: 'border-stadium-red/25',   bg: 'bg-stadium-red/8',   glow: 'shadow-neon-red' },
  amber: { text: 'text-stadium-amber', border: 'border-stadium-amber/25', bg: 'bg-stadium-amber/8', glow: 'shadow-neon-amber' },
};

export const KPICard = React.memo(function KPICard({
  icon, label, value, unit, delta, deltaLabel, color = 'green', size = 'md'
}: KPICardProps) {
  const c = colorMap[color];
  const isPositive = delta === undefined ? null : delta >= 0;

  return (
    <div className={`
      bg-obsidian-card/50 border ${c.border} rounded-2xl p-4
      backdrop-blur-xl transition-all duration-300
      hover:${c.glow} hover:scale-[1.02] hover:border-opacity-60
      flex flex-col gap-3 select-none
    `}>
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border} ${c.text}`}>
          {icon}
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-stadium-green/10 text-stadium-green border border-stadium-green/20'
              : 'bg-stadium-red/10 text-stadium-red border border-stadium-red/20'
          }`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{delta}{deltaLabel || '%'}
          </div>
        )}
      </div>

      <div>
        <div className={`font-display font-extrabold ${c.text} ${size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-3xl'} leading-none`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
        </div>
        <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
});
