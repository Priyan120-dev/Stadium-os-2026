/**
 * agentRegistry.ts — 12-Agent Swarm Registry & Capability Definitions
 *
 * Defines the capability registry for all agents in the Stadium OS swarm.
 * The Command Orchestrator uses this registry to resolve incoming query
 * intent to the correct specialist agent.
 */

import { Capability } from '../constants/capabilities';

/** Describes an agent in the Stadium OS swarm. */
export interface AgentInfo {
  /** Unique agent identifier (matches event `targetAgent` field). */
  name: string;
  /** Human-readable description shown in Agent Telemetry dashboard. */
  description: string;
  /** List of capability keys this agent can fulfil. */
  capabilities: string[];
}

/**
 * The canonical 12-agent swarm registry.
 * Keys are agent names used throughout the event bus and audit logs.
 *
 * @example
 * const nav = agentSwarmRegistry['Navigation Agent'];
 * const canRoute = nav.capabilities.includes(Capability.PLOT_ROUTE);
 */
export const agentSwarmRegistry: Record<string, AgentInfo> = {
  'Command Orchestrator': {
    name: 'Command Orchestrator',
    description: 'Central intent router, capability delegate, and human-in-the-loop coordinator.',
    capabilities: ['orchestrate', 'route-intent', 'session-delegate']
  },
  'Vision Agent': {
    name: 'Vision Agent',
    description: 'Processes ticket scans, lost-child photos, crowd counting, and hazard OCR.',
    capabilities: [
      Capability.OCR_TICKET,
      Capability.DESCRIBE_PHOTO,
      Capability.DETECT_SMOKE,
      Capability.COUNT_CROWD,
    ]
  },
  'Crowd Intelligence Agent': {
    name: 'Crowd Intelligence Agent',
    description: 'Monitors density heatmap zones, gate queues, and stampede risks.',
    capabilities: [
      Capability.PREDICT_CONGESTION,
      Capability.MEASURE_QUEUE,
      Capability.EVALUATE_STAMPEDE,
    ]
  },
  'Navigation Agent': {
    name: 'Navigation Agent',
    description: 'Dijkstra node graph navigation, landmark direction generator, and rerouting.',
    capabilities: [
      Capability.PLOT_ROUTE,
      Capability.LANDMARK_DIRECTIONS,
      Capability.DIVERT_ROUTE,
    ]
  },
  'Accessibility Agent': {
    name: 'Accessibility Agent',
    description: 'Handles step-free ramp routes, quiet zones, and WCAG alerts.',
    capabilities: [
      Capability.WHEELCHAIR_ROUTING,
      Capability.QUIET_ZONES,
      Capability.WCAG_ALERTING,
    ]
  },
  'Emergency Agent': {
    name: 'Emergency Agent',
    description: 'Responder for fire, medical, lost child, and evacuation dispatching.',
    capabilities: [
      Capability.EVACUATE,
      Capability.LOCATE_AED,
      Capability.EMERGENCY_GUIDANCE,
      Capability.FIRST_AID,
    ]
  },
  'Volunteer Agent': {
    name: 'Volunteer Agent',
    description: 'Dispatches nearby volunteers matching required skills.',
    capabilities: [
      Capability.DISPATCH_STAFF,
      Capability.MATCH_VOLUNTEER,
      Capability.VOLUNTEER_ROSTER,
    ]
  },
  'Translation Agent': {
    name: 'Translation Agent',
    description: 'Language translator and sign text interpreter.',
    capabilities: [
      Capability.TRANSLATE_TEXT,
      Capability.DETECT_LANGUAGE,
    ]
  },
  'Transport Agent': {
    name: 'Transport Agent',
    description: 'Coordinates metro countdowns, shuttles, and parking lot occupancy.',
    capabilities: [
      Capability.CHECK_TRANSIT,
      Capability.CHECK_PARKING,
      Capability.RIDESHARE_SURGES,
    ]
  },
  'Sustainability Agent': {
    name: 'Sustainability Agent',
    description: 'Monitors carbon indicators, water efficiency, and electricity.',
    capabilities: [
      Capability.SCORE_SUSTAINABILITY,
      Capability.OPTIMIZE_UTILITY,
    ]
  },
  'Analytics Agent': {
    name: 'Analytics Agent',
    description: 'Calculates response speeds, volunteer deployments, and KPI statistics.',
    capabilities: [
      Capability.CALCULATE_RESPONSE_TIME,
      Capability.VOLUNTEER_UTILIZATION,
      Capability.INCIDENT_TRENDS,
    ]
  },
  'Fan Experience Agent': {
    name: 'Fan Experience Agent',
    description: 'Handles concessions menus, halftime queue times, and allergy checks.',
    capabilities: [
      Capability.PLACE_FOOD_ORDER,
      Capability.ALLERGEN_SCREENING,
      Capability.SUGGEST_FOOD,
    ]
  }
};
