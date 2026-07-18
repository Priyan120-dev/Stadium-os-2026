/**
 * SustainabilityDashboard.tsx — Green Stadium environmental metrics
 */
'use client';
import React, { useMemo } from 'react';
import { useStadiumOS } from '../context/StadiumOSContext';
import { Leaf, Zap, Droplets, Trash2, Recycle, TrendingDown, Award } from 'lucide-react';

function CircularGauge({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Outfit">
          {value.toLocaleString()}
        </text>
        <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter">
          {unit}
        </text>
      </svg>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export const SustainabilityDashboard = React.memo(function SustainabilityDashboard() {
  const { sustainability } = useStadiumOS();

  const greenScore = sustainability.greenScore;
  const scoreColor = greenScore >= 85 ? '#00e676' : greenScore >= 65 ? '#ffd700' : '#ff1744';

  const metrics = useMemo(() => [
    { icon: <Zap className="h-4 w-4" />, label: 'Energy Used',  value: sustainability.electricityKw, unit: 'kWh', max: 2000, color: '#ffd700', target: '1,500 kWh', onTrack: sustainability.electricityKw <= 1500 },
    { icon: <Droplets className="h-4 w-4" />, label: 'Water Used', value: sustainability.waterLitres, unit: 'L', max: 8000, color: '#00b0ff', target: '5,000 L', onTrack: sustainability.waterLitres <= 5000 },
    { icon: <Leaf className="h-4 w-4" />, label: 'Carbon Emitted', value: sustainability.carbonKg, unit: 'kg CO₂', max: 5000, color: '#00e676', target: '3,000 kg', onTrack: sustainability.carbonKg <= 3000 },
    { icon: <Trash2 className="h-4 w-4" />, label: 'Waste Generated', value: sustainability.wasteKg, unit: 'kg', max: 600, color: '#ff6d00', target: '400 kg', onTrack: sustainability.wasteKg <= 400 },
  ], [sustainability]);

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2 bg-stadium-green/10 border border-stadium-green/20 rounded-xl">
          <Leaf className="h-5 w-5 text-stadium-green" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-sm">Green Stadium Dashboard</h2>
          <p className="text-[10px] text-slate-500">FIFA Sustainability Initiative · Match-Day Monitoring</p>
        </div>
      </div>

      {/* Green Score Hero */}
      <div className="shrink-0 bg-obsidian-card/45 border border-stadium-green/20 rounded-2xl p-5 flex items-center gap-6">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 * (1 - greenScore / 100)}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 10px ${scoreColor}80)` }}
            />
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="26" fontWeight="800" fontFamily="Outfit">{greenScore}</text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter">/ 100</text>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-5 w-5 text-stadium-gold" />
            <span className="font-display font-bold text-white text-lg">
              {greenScore >= 90 ? 'Platinum Rated' : greenScore >= 75 ? 'Gold Rated' : 'Silver Rated'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Stadium OS environmental monitoring is running in real-time. Solar panels cover 38% of electrical load. All food waste is composted on-site.
          </p>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-stadium-green" />
            <span className="text-xs text-stadium-green font-bold">12% below FIFA carbon target</span>
          </div>
        </div>
      </div>

      {/* Circular Gauges */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Live Resource Consumption</h3>
        <div className="grid grid-cols-4 gap-2">
          <CircularGauge value={sustainability.electricityKw} max={2000} color="#ffd700" label="Energy" unit="kWh" />
          <CircularGauge value={sustainability.waterLitres}   max={8000} color="#00b0ff" label="Water"  unit="L" />
          <CircularGauge value={sustainability.carbonKg}      max={5000} color="#00e676" label="Carbon" unit="kg" />
          <CircularGauge value={sustainability.wasteKg}       max={600}  color="#ff6d00" label="Waste"  unit="kg" />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        {metrics.map(m => (
          <div key={m.label} className={`bg-obsidian-card/45 border rounded-2xl p-4 ${m.onTrack ? 'border-white/8' : 'border-stadium-amber/25'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: m.color }}>{m.icon}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{m.label}</span>
            </div>
            <div className="font-display font-extrabold text-2xl text-white">
              {m.value.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1">{m.unit}</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%`, backgroundColor: m.color }}
              />
            </div>
            <div className={`text-[9px] mt-1.5 font-semibold ${m.onTrack ? 'text-stadium-green' : 'text-stadium-amber'}`}>
              Target: {m.target} · {m.onTrack ? '✓ On Track' : '⚠ Over Budget'}
            </div>
          </div>
        ))}
      </div>

      {/* Recycling */}
      <div className="shrink-0 bg-obsidian-card/45 border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Recycle className="h-4 w-4 text-stadium-green" />
          <h3 className="text-xs font-bold text-white uppercase">Waste Diversion</h3>
          <span className="ml-auto font-display font-bold text-stadium-green text-lg">73%</span>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Recycled', pct: 45, color: '#00e676' },
            { label: 'Composted', pct: 28, color: '#ffd700' },
            { label: 'Landfill', pct: 27, color: '#ff6d00' },
          ].map(b => (
            <div key={b.label} className="flex-1 text-center">
              <div className="h-16 bg-white/5 rounded-t-md relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700 rounded-t-md"
                  style={{ height: `${b.pct}%`, backgroundColor: b.color, boxShadow: `0 0 8px ${b.color}40` }}
                />
              </div>
              <div className="text-[9px] font-bold mt-1" style={{ color: b.color }}>{b.pct}%</div>
              <div className="text-[8px] text-slate-600">{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
