/**
 * StadiumMap.tsx — Interactive SVG Floor Map Digital Twin
 *
 * Renders the FIFA World Cup MetLife Stadium floor map, path networks,
 * live crowd density overlays, incident pins, and volunteer markers.
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { stadiumNodes, stadiumGraph } from '../mockData';

export interface IncidentPin {
  id: string;
  nodeId: string;
  type: string;
}

export interface VolunteerMarker {
  volunteerId: string;
  nodeId: string;
  name: string;
  status: 'available' | 'busy' | 'off-duty';
  taskType: string | null;
}

interface StadiumMapProps {
  highlightedPath?: string[];
  densityMap?: Record<string, 'low' | 'medium' | 'high' | 'critical'>;
  incidentPins?: IncidentPin[];
  volunteerMarkers?: VolunteerMarker[];
  onNodeClick?: (nodeId: string) => void;
  stepFree?: boolean;
}

export default function StadiumMap({
  highlightedPath = [],
  densityMap = {},
  incidentPins = [],
  volunteerMarkers = [],
  onNodeClick = () => {},
  stepFree = false
}: StadiumMapProps) {
  // Center of canvas
  const cx = 400;
  const cy = 285;

  // Zoom & Pan states
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer toggling
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    volunteers: true,
    incidents: true,
    shuttles: true
  });

  // Tooltip state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Shuttle rotation animation
  const [shuttleAngle, setShuttleAngle] = useState<number>(0);
  useEffect(() => {
    if (!activeLayers.shuttles) return;
    const interval = setInterval(() => {
      setShuttleAngle(prev => (prev + 1) % 360);
    }, 60);
    return () => clearInterval(interval);
  }, [activeLayers.shuttles]);

  // Shuttle coordinates on outer ellipse (rx: 380, ry: 270)
  const shuttleX = useMemo(() => cx + 372 * Math.cos((shuttleAngle * Math.PI) / 180), [shuttleAngle]);
  const shuttleY = useMemo(() => cy + 262 * Math.sin((shuttleAngle * Math.PI) / 180), [shuttleAngle]);

  // Drag handlers for pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Render edges of graph as thin background path lines
  const renderedEdges = useMemo(() => {
    const edges: React.ReactNode[] = [];
    const processedEdges = new Set<string>();

    Object.entries(stadiumGraph).forEach(([nodeId, neighbors]) => {
      Object.keys(neighbors).forEach(neighborId => {
        const edgeKey = [nodeId, neighborId].sort().join('-');
        if (!processedEdges.has(edgeKey)) {
          processedEdges.add(edgeKey);
          const nodeA = stadiumNodes[nodeId];
          const nodeB = stadiumNodes[neighborId];
          if (nodeA && nodeB) {
            edges.push(
              <line
                key={edgeKey}
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                className="map-path-link"
              />
            );
          }
        }
      });
    });
    return edges;
  }, []);

  // Render active highlighted path line segments
  const activePathSegments = useMemo(() => {
    const segments: React.ReactNode[] = [];
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      const nodeA = stadiumNodes[highlightedPath[i]];
      const nodeB = stadiumNodes[highlightedPath[i + 1]];
      if (nodeA && nodeB) {
        segments.push(
          <line
            key={`active-${i}`}
            x1={nodeA.x}
            y1={nodeA.y}
            x2={nodeB.x}
            y2={nodeB.y}
            className={`map-active-route ${stepFree ? 'step-free' : ''}`}
            style={{
              strokeDasharray: '6, 4',
              strokeDashoffset: 100,
              animation: 'animate-dash 2s linear infinite',
              animationDelay: `${i * 0.15}s`
            }}
          />
        );
      }
    }
    return segments;
  }, [highlightedPath, stepFree]);

  // Get color fill class based on density status
  const getDensityClass = useCallback((nodeId: string) => {
    if (!activeLayers.heatmap) return 'density-low';
    const density = densityMap[nodeId] || 'low';
    return `density-${density}`;
  }, [activeLayers.heatmap, densityMap]);

  // Get stroke or design properties for node dots
  const getNodeColor = useCallback((node: any) => {
    if (node.type === 'gate') return '#ffffff';
    if (node.type === 'food') return '#ffd700'; // Stadium gold
    if (node.type === 'restroom') return '#00b0ff'; // Stadium blue
    if (node.type === 'medical') return '#ff1744'; // Stadium red
    if (node.type === 'aed') return '#ff6d00'; // Stadium amber
    if (node.type === 'exit') return '#00e676'; // Stadium green
    return '#1f2937'; // Seating section default
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden bg-obsidian-dark rounded-xl">
      {/* ── Layer Toggles ── */}
      <div className="absolute top-2 left-2 z-10 bg-obsidian-card/90 border border-white/10 rounded-xl p-2.5 flex flex-wrap gap-3 text-[9px] font-bold text-slate-300 backdrop-blur-md">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.heatmap}
            onChange={() => setActiveLayers(prev => ({ ...prev, heatmap: !prev.heatmap }))}
            className="rounded border-white/20 bg-white/5 text-stadium-green focus:ring-0 h-3 w-3"
          />
          <span>HEATMAP</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.volunteers}
            onChange={() => setActiveLayers(prev => ({ ...prev, volunteers: !prev.volunteers }))}
            className="rounded border-white/20 bg-white/5 text-stadium-gold focus:ring-0 h-3 w-3"
          />
          <span>STAFF</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.incidents}
            onChange={() => setActiveLayers(prev => ({ ...prev, incidents: !prev.incidents }))}
            className="rounded border-white/20 bg-white/5 text-stadium-red focus:ring-0 h-3 w-3"
          />
          <span>ALERTS</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.shuttles}
            onChange={() => setActiveLayers(prev => ({ ...prev, shuttles: !prev.shuttles }))}
            className="rounded border-white/20 bg-white/5 text-stadium-blue focus:ring-0 h-3 w-3"
          />
          <span>SHUTTLES</span>
        </label>
      </div>

      {/* ── Zoom Controls ── */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.25, 3.0))}
          className="h-7 w-7 bg-obsidian-card/90 border border-white/10 text-slate-200 rounded-lg hover:bg-white/10 active:scale-95 flex items-center justify-center font-bold text-sm backdrop-blur-md"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
          className="h-7 w-7 bg-obsidian-card/90 border border-white/10 text-slate-200 rounded-lg hover:bg-white/10 active:scale-95 flex items-center justify-center font-bold text-sm backdrop-blur-md"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="h-7 w-7 bg-obsidian-card/90 border border-white/10 text-slate-200 rounded-lg hover:bg-white/10 active:scale-95 flex items-center justify-center font-bold text-[8px] uppercase tracking-wider backdrop-blur-md"
          aria-label="Reset zoom"
        >
          Rst
        </button>
      </div>

      {/* ── Hover Node Tooltip ── */}
      {hoveredNode && stadiumNodes[hoveredNode] && (
        <div className="absolute top-14 left-2 z-10 bg-obsidian-card/95 border border-white/10 rounded-xl p-2 flex flex-col gap-0.5 text-[9px] text-slate-200 backdrop-blur-md shadow-lg pointer-events-none min-w-[120px] font-mono border-l-2" style={{ borderLeftColor: getNodeColor(stadiumNodes[hoveredNode]) }}>
          <div className="font-bold text-slate-100 uppercase tracking-wide border-b border-white/5 pb-0.5 mb-0.5">
            {stadiumNodes[hoveredNode].label}
          </div>
          <div>Node Type: <span className="uppercase text-slate-400">{stadiumNodes[hoveredNode].type}</span></div>
          {stadiumNodes[hoveredNode].type === 'section' && (
            <div>Live Load: <span className="text-stadium-blue uppercase font-bold">{densityMap[hoveredNode] || 'low'}</span></div>
          )}
        </div>
      )}

      {/* ── Map Canvas Area ── */}
      <div
        className="flex-1 cursor-grab active:cursor-grabbing overflow-hidden relative w-full h-full flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 800 570"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          {/* ── Outer Track & Stadium Ring ── */}
          <ellipse cx={cx} cy={cy} rx="380" ry="270" className="map-outline" />
          <ellipse cx={cx} cy={cy} rx="350" ry="240" stroke="#050811" strokeWidth="20" fill="none" />
          <ellipse cx={cx} cy={cy} rx="260" ry="170" stroke="#1f2937" strokeWidth="2" fill="none" />

          {/* ── Inner Field (Football/Soccer Pitch) ── */}
          <rect x="290" y="200" width="220" height="170" rx="4" className="map-field" />
          <line x1={cx} y1="200" x2={cx} y2="370" stroke="#164e37" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="35" stroke="#164e37" strokeWidth="1.5" fill="none" />
          <rect x="290" y="245" width="30" height="80" stroke="#164e37" strokeWidth="1.5" fill="none" />
          <rect x="480" y="245" width="30" height="80" stroke="#164e37" strokeWidth="1.5" fill="none" />

          {/* ── Graph Network (Adjacency Links) ── */}
          <g>{renderedEdges}</g>

          {/* ── Seating Wedges / Sections Heatmap ── */}
          <g>
            {Object.entries(stadiumNodes).map(([id, node]) => {
              if (node.type !== 'section') return null;
              const inaccessible = ['Sec102', 'Sec106', 'Sec114', 'Sec118'].includes(id);

              return (
                <g 
                  key={id} 
                  onClick={(e) => { e.stopPropagation(); onNodeClick(id); }}
                  onMouseEnter={() => setHoveredNode(id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="14"
                    className={`map-section ${getDensityClass(id)}`}
                    style={{
                      stroke: highlightedPath.includes(id) ? '#ffd700' : '#1e293b',
                      strokeWidth: highlightedPath.includes(id) ? 2.5 : 1
                    }}
                  />
                  {inaccessible && (
                    <text x={node.x} y={node.y - 12} fill="#ff1744" fontSize="10px" fontWeight="bold" textAnchor="middle">
                      ♿🚫
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* ── Active Traveled Path Highlight ── */}
          <g>{activePathSegments}</g>

          {/* ── Other Map Nodes (Gates, Restrooms, Food Courts, AEDs) ── */}
          <g>
            {Object.entries(stadiumNodes).map(([id, node]) => {
              if (node.type === 'section') return null;
              const isHighlighted = highlightedPath.includes(id);

              return (
                <g 
                  key={id} 
                  onClick={(e) => { e.stopPropagation(); onNodeClick(id); }}
                  onMouseEnter={() => setHoveredNode(id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === 'gate' ? 12 : 9}
                    fill={getNodeColor(node)}
                    className="map-node-dot"
                    style={{
                      stroke: isHighlighted ? '#ffd700' : '#050811',
                      strokeWidth: isHighlighted ? 2.5 : 1
                    }}
                  />
                  {node.type === 'gate' && (
                    <text x={node.x} y={node.y + 3} fill="#050811" fontSize="8px" fontWeight="bold" textAnchor="middle">
                      {id.replace('Gate', '')}
                    </text>
                  )}
                  {node.type === 'medical' && (
                    <text x={node.x} y={node.y + 3} fill="#ffffff" fontSize="8px" fontWeight="bold" textAnchor="middle">
                      +
                    </text>
                  )}
                  {node.type === 'aed' && (
                    <text x={node.x} y={node.y + 3} fill="#ffffff" fontSize="7px" fontWeight="bold" textAnchor="middle">
                      ⚡
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* ── Node Labels ── */}
          <g>
            {Object.entries(stadiumNodes).map(([id, node]) => {
              if (node.type === 'section') {
                const labelText = node.label.replace('§', '');
                return (
                  <text key={`label-${id}`} x={node.x} y={node.y + 3} className="map-node-label" fill="#ffffff" pointerEvents="none">
                    {labelText}
                  </text>
                );
              }
              let yOffset = 18;
              if (node.y < 100) yOffset = -14;
              return (
                <text
                  key={`label-${id}`}
                  x={node.x}
                  y={node.y + yOffset}
                  fill={highlightedPath.includes(id) ? '#ffd700' : '#94a3b8'}
                  fontSize="9px"
                  fontWeight="600"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {node.label}
                </text>
              );
            })}
          </g>

          {/* ── Animating Shuttle Transit Bus ── */}
          {activeLayers.shuttles && (
            <g className="map-transit-shuttle">
              <circle cx={shuttleX} cy={shuttleY} r="8" fill="#00b0ff" stroke="#ffffff" strokeWidth="1.5" />
              <text x={shuttleX} y={shuttleY + 2.5} fill="#ffffff" fontSize="8px" fontWeight="extrabold" textAnchor="middle">
                🚌
              </text>
            </g>
          )}

          {/* ── Live Volunteer Markers ── */}
          {activeLayers.volunteers && (
            <g>
              {volunteerMarkers.map(marker => {
                const node = stadiumNodes[marker.nodeId];
                if (!node) return null;

                const isBusy = marker.status === 'busy';
                const isAmber = marker.taskType === 'lost-child';

                let markerColor = '#00e676'; // Stadium green
                let markerBgColor = '#061a12';
                let markerTextColor = '#00e676';

                if (isAmber) {
                  markerColor = '#ff6d00'; // Stadium amber
                  markerBgColor = '#1d0e00';
                  markerTextColor = '#ff6d00';
                } else if (isBusy) {
                  markerColor = '#ff1744'; // Stadium red
                  markerBgColor = '#1a0408';
                  markerTextColor = '#ff1744';
                }

                return (
                  <g key={`vol-${marker.volunteerId}`} className="map-marker-volunteer">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="18"
                      fill="none"
                      stroke={markerColor}
                      strokeWidth="1.5"
                      opacity="0.6"
                    >
                      <animate attributeName="r" values="10;22;10" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="10"
                      fill={markerBgColor}
                      stroke={markerColor}
                      strokeWidth="1.5"
                    />
                    <text
                      x={node.x}
                      y={node.y + 3}
                      fill={markerTextColor}
                      fontSize="7px"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {marker.volunteerId === 'VOL-001' ? 'SC' : marker.volunteerId === 'VOL-002' ? 'AA' : 'EV'}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ── Incident Alarm Pins ── */}
          {activeLayers.incidents && (
            <g>
              {incidentPins.map(pin => {
                const node = stadiumNodes[pin.nodeId];
                if (!node) return null;

                const isLostChild = pin.type === 'lost-child';
                const isMedical = pin.type === 'medical';
                const pinColor = isLostChild ? '#ff6d00' : isMedical ? '#ff1744' : '#ffd700';

                return (
                  <g key={`pin-${pin.id}`} className="map-marker-pin animate-bounce" transform={`translate(${node.x - 12}, ${node.y - 24})`}>
                    <path
                      d="M12 2L2 22h20L12 2z"
                      fill={pinColor}
                      stroke="#050811"
                      strokeWidth="2"
                    />
                    <text x="12" y="18" fill="#ffffff" fontSize="12px" fontWeight="bold" textAnchor="middle">
                      !
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
