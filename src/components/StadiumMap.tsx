/**
 * StadiumMap.tsx — Interactive SVG Floor Map Digital Twin
 *
 * Renders the FIFA World Cup MetLife Stadium floor map, path networks,
 * live crowd density overlays, incident pins, and volunteer markers.
 */

'use client';

import React from 'react';
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

  // Render edges of graph as thin background path lines
  const renderedEdges: React.ReactNode[] = [];
  const processedEdges = new Set<string>();

  Object.entries(stadiumGraph).forEach(([nodeId, neighbors]) => {
    Object.keys(neighbors).forEach(neighborId => {
      const edgeKey = [nodeId, neighborId].sort().join('-');
      if (!processedEdges.has(edgeKey)) {
        processedEdges.add(edgeKey);
        const nodeA = stadiumNodes[nodeId];
        const nodeB = stadiumNodes[neighborId];
        if (nodeA && nodeB) {
          renderedEdges.push(
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

  // Render active highlighted path line segments
  const activePathSegments: React.ReactNode[] = [];
  for (let i = 0; i < highlightedPath.length - 1; i++) {
    const nodeA = stadiumNodes[highlightedPath[i]];
    const nodeB = stadiumNodes[highlightedPath[i + 1]];
    if (nodeA && nodeB) {
      const length = Math.sqrt(Math.pow(nodeB.x - nodeA.x, 2) + Math.pow(nodeB.y - nodeA.y, 2));
      activePathSegments.push(
        <line
          key={`active-${i}`}
          x1={nodeA.x}
          y1={nodeA.y}
          x2={nodeB.x}
          y2={nodeB.y}
          className={`map-active-route ${stepFree ? 'step-free' : ''}`}
          style={{
            strokeDasharray: stepFree ? undefined : length,
            strokeDashoffset: stepFree ? undefined : length,
            animationDelay: `${i * 0.2}s`
          }}
        />
      );
    }
  }

  // Get color fill class based on density status
  const getDensityClass = (nodeId: string) => {
    const density = densityMap[nodeId] || 'low';
    return `density-${density}`;
  };

  // Get stroke or design properties for node dots
  const getNodeColor = (node: any) => {
    if (node.type === 'gate') return '#ffffff';
    if (node.type === 'food') return '#ffd700'; // Stadium gold
    if (node.type === 'restroom') return '#00b0ff'; // Stadium blue
    if (node.type === 'medical') return '#ff1744'; // Stadium red
    if (node.type === 'aed') return '#ff6d00'; // Stadium amber
    if (node.type === 'exit') return '#00e676'; // Stadium green
    return '#1f2937'; // Seating section default
  };

  return (
    <svg
      viewBox="0 0 800 570"
      className="svg-stadium-map w-full h-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Outer Track & Stadium Ring ── */}
      <ellipse cx={cx} cy={cy} rx="380" ry="270" className="map-outline" />
      <ellipse cx={cx} cy={cy} rx="350" ry="240" stroke="#050811" strokeWidth="20" fill="none" />
      <ellipse cx={cx} cy={cy} rx="260" ry="170" stroke="#1f2937" strokeWidth="2" fill="none" />
      
      {/* ── Inner Field (Football/Soccer Pitch) ── */}
      <rect x="290" y="200" width="220" height="170" rx="4" className="map-field" />
      {/* Pitch Lines */}
      <line x1={cx} y1="200" x2={cx} y2="370" stroke="#164e37" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="35" stroke="#164e37" strokeWidth="1.5" fill="none" />
      <rect x="290" y="245" width="30" height="80" stroke="#164e37" strokeWidth="1.5" fill="none" />
      <rect x="480" y="245" width="30" height="80" stroke="#164e37" strokeWidth="1.5" fill="none" />

      {/* ── Graph Network (Adjacency Links) ── */}
      <g>{renderedEdges}</g>

      {/* ── Seating Wedges / Sections Heatmap (Drawn as custom circles for interactive clicks) ── */}
      <g>
        {Object.entries(stadiumNodes).map(([id, node]) => {
          if (node.type !== 'section') return null;
          const inaccessible = ['Sec102', 'Sec106', 'Sec114', 'Sec118'].includes(id);

          return (
            <g key={id} onClick={() => onNodeClick(id)} style={{ cursor: 'pointer' }}>
              <circle
                cx={node.x}
                cy={node.y}
                r="14"
                className={`map-section ${getDensityClass(id)}`}
                style={{
                  stroke: highlightedPath.includes(id) ? '#ffd700' : '#1e293b',
                  strokeWidth: highlightedPath.includes(id) ? 2 : 1
                }}
              />
              {/* WCAG Accessibility Warning: Red sections have a wheelchair block icon directly overlaying them */}
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
            <g key={id} onClick={() => onNodeClick(id)} style={{ cursor: 'pointer' }}>
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
              {/* Type Indicators for visual support */}
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

      {/* ── Node Labels (Offset slightly to prevent overlap) ── */}
      <g>
        {Object.entries(stadiumNodes).map(([id, node]) => {
          if (node.type === 'section') {
            const labelText = node.label.replace('§', '');
            return (
              <text key={`label-${id}`} x={node.x} y={node.y + 3} className="map-node-label" fill="#ffffff">
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
            >
              {node.label}
            </text>
          );
        })}
      </g>

      {/* ── Live Volunteer Markers (Pulsing nodes with initials) ── */}
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

      {/* ── Incident Alarm Pins (Warning Signs overlaying nodes) ── */}
      <g>
        {incidentPins.map(pin => {
          const node = stadiumNodes[pin.nodeId];
          if (!node) return null;

          const isLostChild = pin.type === 'lost-child';
          const isMedical = pin.type === 'medical';
          const pinColor = isLostChild ? '#ff6d00' : isMedical ? '#ff1744' : '#ffd700';

          return (
            <g key={`pin-${pin.id}`} className="map-marker-pin" transform={`translate(${node.x - 12}, ${node.y - 24})`}>
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
    </svg>
  );
}
