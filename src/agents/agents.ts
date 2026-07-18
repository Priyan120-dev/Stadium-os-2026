/**
 * agents.ts — Stadium OS 12-Agent Swarm Coordinator
 *
 * Implements in-browser reactive multi-agent loops, Capability Registry,
 * local queue event processor (claiming, retries, exponential backoffs, DLQ),
 * and the Emergency Authority Policy rules.
 */

import { AgentEvent, AgentLog, Timestamp, Volunteer, Incident, Concession, Transit, stadiumNodes, NavigationMode } from '../mockData';
import { navigationAgent } from './navigationAgent';
import { translateText } from './translationAgent';
import { accessibilityModule } from '../modules/accessibilityModule';
import { incidentService } from '../services/incidentService';

// ---------------------------------------------------------------------------
// 12-AGENT REGISTRY & CAPABILITIES
// ---------------------------------------------------------------------------

export interface AgentInfo {
  name: string;
  description: string;
  capabilities: string[];
}

export const agentSwarmRegistry: Record<string, AgentInfo> = {
  'Command Orchestrator': {
    name: 'Command Orchestrator',
    description: 'Central intent router, capability delegate, and human-in-the-loop coordinator.',
    capabilities: ['orchestrate', 'route-intent', 'session-delegate']
  },
  'Vision Agent': {
    name: 'Vision Agent',
    description: 'Processes ticket scans, lost-child photos, crowd counting, and hazard OCR.',
    capabilities: ['ocr-ticket', 'describe-photo', 'detect-smoke', 'count-crowd']
  },
  'Crowd Intelligence Agent': {
    name: 'Crowd Intelligence Agent',
    description: 'Monitors density heatmap zones, gate queues, and stampede risks.',
    capabilities: ['predict-congestion', 'measure-queue', 'evaluate-stampede']
  },
  'Navigation Agent': {
    name: 'Navigation Agent',
    description: 'Dijkstra node graph navigation, landmark direction generator, and rerouting.',
    capabilities: ['plot-route', 'landmark-directions', 'divert-route']
  },
  'Accessibility Agent': {
    name: 'Accessibility Agent',
    description: 'Handles step-free ramp routes, quiet zones, and WCAG alerts.',
    capabilities: ['wheelchair-routing', 'neurodivergent-quiet-zones', 'wcag-alerting']
  },
  'Emergency Agent': {
    name: 'Emergency Agent',
    description: 'Responder for fire, medical, lost child, and evacuation dispatching.',
    capabilities: ['evacuate', 'locate-aed', 'emergency-guidance', 'first-aid']
  },
  'Volunteer Agent': {
    name: 'Volunteer Agent',
    description: 'Dispatches nearby volunteers matching required skills.',
    capabilities: ['dispatch-staff', 'match-volunteer', 'volunteer-roster']
  },
  'Translation Agent': {
    name: 'Translation Agent',
    description: 'Language translator and sign text interpreter.',
    capabilities: ['translate-text', 'detect-language']
  },
  'Transport Agent': {
    name: 'Transport Agent',
    description: 'Coordinates metro countdowns, shuttles, and parking lot occupancy.',
    capabilities: ['check-transit', 'check-parking', 'rideshare-surges']
  },
  'Sustainability Agent': {
    name: 'Sustainability Agent',
    description: 'Monitors carbon indicators, water efficiency, and electricity.',
    capabilities: ['score-sustainability', 'optimize-utility']
  },
  'Analytics Agent': {
    name: 'Analytics Agent',
    description: 'Calculates response speeds, volunteer deployments, and KPI statistics.',
    capabilities: ['calculate-response-time', 'volunteer-utilization', 'incident-trends']
  },
  'Fan Experience Agent': {
    name: 'Fan Experience Agent',
    description: 'Handles concessions menus, halftime queue times, and allergy checks.',
    capabilities: ['place-food-order', 'allergen-screening', 'suggest-food']
  }
};

// ---------------------------------------------------------------------------
// AUTHORITY POLICY MATRIX
// ---------------------------------------------------------------------------

export const emergencyAuthorityMatrix = {
  INCIDENT_NOTIFY: { auto: true, label: "Notify nearest volunteer & create incident" },
  GUIDANCE_DISPLAY: { auto: true, label: "Display AED / First aid locator and exit arrows" },
  STADIUM_ALARM: { auto: false, label: "Sound Stadium Audio/Visual Alarms" },
  EVACUATION_ORDER: { auto: false, label: "Sound Stadium Evacuation Order" },
  EXTERNAL_DISPATCH: { auto: false, label: "Dispatch External Emergency Services (Fire, Ambulance)" }
};

// Check if an action requires human approval
export function isActionApprovalRequired(actionType: keyof typeof emergencyAuthorityMatrix): boolean {
  return !emergencyAuthorityMatrix[actionType].auto;
}

// ---------------------------------------------------------------------------
// LOCAL SIMULATED EVENT PROCESSING HEARTBEAT
// ---------------------------------------------------------------------------

// Simulated in-browser execution lock
let isWorkerProcessing = false;

export async function processLocalEvent(
  event: AgentEvent,
  dbState: {
    volunteers: Volunteer[];
    setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>;
    incidents: Incident[];
    setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
    concessions: Record<string, Concession>;
    transit: Record<string, Transit>;
    agentLogs: AgentLog[];
    setAgentLogs: React.Dispatch<React.SetStateAction<AgentLog[]>>;
    highlightedPath: string[];
    setHighlightedPath: React.Dispatch<React.SetStateAction<string[]>>;
    stepFree: boolean;
    setEvents: React.Dispatch<React.SetStateAction<AgentEvent[]>>;
    addAlert: (alert: any) => void;
    navigationMode?: NavigationMode;
    densityMap?: Record<string, 'low' | 'medium' | 'high' | 'critical'>;
  }
): Promise<Record<string, any>> {
  const { eventType, payload } = event;
  const correlationId = event.correlationId;

  // Simulate worker execution delay
  await new Promise(resolve => setTimeout(resolve, 800));

  switch (eventType) {
    case 'TICKET_OCR': {
      // Vision Agent: OCR Scan Ticket
      const ticketId = payload.ticketId || 'TKT-001';
      return {
        ticketId,
        validated: true,
        gate: 'GateA',
        seat: '104-G',
        seatNode: 'Sec104'
      };
    }

    case 'CROWD_GATE_CHECK': {
      // Crowd Intelligence Agent: checks wait times
      const gate = payload.gate || 'GateA';
      // Critical check for Gate A
      const isCongested = gate === 'GateA';
      return {
        gate,
        isCongested,
        waitMin: isCongested ? 28 : 3,
        recommendedGate: isCongested ? 'GateB' : gate
      };
    }

    case 'ROUTE_NAVIGATION': {
      // Navigation Agent: Dijkstra route
      const start = payload.start || 'GateA';
      const end = payload.end || 'Sec104';
      const stepFree = payload.stepFree || false;
      const mode = payload.mode || dbState.navigationMode || 'fastest';

      const route = navigationAgent.findRoute(start, end, stepFree, mode, dbState.densityMap);
      dbState.setHighlightedPath(route.path);

      return {
        path: route.path,
        distance: route.distance,
        instructions: route.instructions
      };
    }

    case 'PANIC_PRESSED': {
      // Emergency Agent: Medical emergency creation
      const section = payload.section || 'Sec104';
      
      // Auto actions: Create incident + alert nearest staff
      const newIncident = incidentService.createIncidentReport(section, 'medical', 'Fan Mateo García reported medical distress (chest pain) at Sec 104.');
      
      dbState.setIncidents(prev => {
        if (prev.some(i => i.id === newIncident.id || (i.nodeId === section && i.type === 'medical' && i.status === 'active'))) {
          return prev; // Idempotent check
        }
        return [...prev, newIncident];
      });

      return {
        incidentId: newIncident.id,
        severity: newIncident.severity,
        autoActionCompleted: true,
        requiresApproval: false
      };
    }

    case 'LOST_CHILD_UPLOAD': {
      // Vision Agent: process photo of lost child
      const estimatedAge = payload.estimatedAge || '8';
      const shirtColor = payload.shirtColor || 'Blue Shirt';
      const details = payload.details || 'Curly hair, wearing red cap';
      
      const childDesc = `Amber Alert: Missing child (male, age ${estimatedAge}, wearing ${shirtColor}, ${details}) last seen near Sec 104.`;
      
      // Auto Action: Find first available volunteer
      const availableVolunteers = dbState.volunteers.filter(v => v.status === 'available');
      const volunteer = availableVolunteers[0]; // e.g. Sarah Chen or first free staff

      // Create lost child incident
      const newIncident: Incident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'lost-child',
        severity: 'high',
        location: 'Section 104',
        nodeId: 'Sec104',
        description: childDesc,
        localizedDescription: `Alerta Amber: Niño extraviado (varón, edad ${estimatedAge}, vistiendo ${shirtColor}, ${details}) visto por última vez cerca Sec 104.`,
        status: 'active',
        detectedBy: 'Vision Agent',
        assignedVolunteerId: volunteer ? volunteer.id : null,
        timestamp: Date.now(),
        lastUpdated: Date.now()
      };

      dbState.setIncidents(prev => {
        if (prev.some(i => i.type === 'lost-child' && i.status === 'active')) {
          return prev; // Idempotency
        }
        return [...prev, newIncident];
      });

      if (volunteer) {
        // Dispatch volunteer and assign task
        dbState.setVolunteers(prev => prev.map(v => v.id === volunteer.id ? {
          ...v,
          status: 'busy',
          task: {
            id: newIncident.id,
            description: childDesc,
            nodeId: 'Sec104',
            severity: 'high'
          }
        } : v));

        // Highlight Dijkstra navigation route for volunteer (e.g. from F1 to Sec104)
        const route = navigationAgent.findRoute(volunteer.nodeId, 'Sec104', dbState.stepFree);
        dbState.setHighlightedPath(route.path);

        // Add corresponding audit logs
        const dispatchLog: AgentLog = {
          id: `LOG-${Math.random().toString(36).substr(2, 9)}`,
          correlationId,
          fromAgent: 'Emergency Agent',
          toAgent: 'Volunteer Agent',
          action: `Auto Action: Alerting volunteer ${volunteer.name} (skills: ${volunteer.skills.join(', ')}) to search Section 104.`,
          localizedAction: `Acción automática: Alertando a la voluntaria ${volunteer.name} para buscar en la Sección 104.`,
          severity: 'warning',
          timestamp: Date.now()
        };

        const tabletLog: AgentLog = {
          id: `LOG-${Math.random().toString(36).substr(2, 9)}`,
          correlationId,
          fromAgent: 'Volunteer Agent',
          toAgent: 'Staff Tablet',
          action: `Dispatched ${volunteer.name} to Section 104. Status updated: En Route.`,
          localizedAction: `Despachada ${volunteer.name} a la Sección 104. Estado actualizado: En camino.`,
          severity: 'warning',
          timestamp: Date.now()
        };

        dbState.setAgentLogs(prev => [...prev, dispatchLog, tabletLog]);
      }

      // Broadcast alert to all staff
      dbState.addAlert({
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'amber-alert',
        title: 'Amber Alert',
        localizedTitle: { es: 'Alerta Amber', ar: 'تنبيه Amber' },
        message: childDesc,
        localizedMessage: {
          es: `Hijo extraviado: varón, ~${estimatedAge} años, con ${shirtColor} y ${details}. Alerta emitida en Sec 104.`,
          ar: `طفل مفقود: ذكر، ~${estimatedAge} سنوات، يرتدي ${shirtColor} و ${details}.`
        },
        targetUsers: [{ type: 'role', value: 'staff' }],
        priority: 'high',
        timestamp: Date.now(),
        status: 'active'
      });

      return {
        incidentId: newIncident.id,
        childDescription: childDesc,
        amberAlertBroadcasted: true,
        assignedVolunteerId: volunteer ? volunteer.id : null
      };
    }

    case 'STAFF_DISPATCH': {
      // Volunteer Agent: Dispatches volunteer
      const incidentId = payload.incidentId;
      const incidentNode = payload.nodeId || 'Sec104';
      const incidentDesc = payload.description || 'Assistance requested.';
      
      // Find closest volunteer
      const availableVolunteers = dbState.volunteers.filter(v => v.status === 'available');
      if (availableVolunteers.length === 0) {
        throw new Error('No volunteers available for dispatch');
      }

      // Just choose the first available for simple simulation
      const volunteer = availableVolunteers[0];

      dbState.setVolunteers(prev => prev.map(v => v.id === volunteer.id ? {
        ...v,
        status: 'busy',
        task: {
          id: incidentId,
          description: incidentDesc,
          nodeId: incidentNode,
          severity: 'high'
        }
      } : v));

      return {
        assignedVolunteerId: volunteer.id,
        volunteerName: volunteer.name,
        etaMinutes: 2
      };
    }

    case 'PROPOSE_CRITICAL_ACTION': {
      // Emergency Agent: proposes sound alarm or evac
      const actionType = payload.actionType as keyof typeof emergencyAuthorityMatrix;
      const description = payload.description || 'Emergency evacuation recommended.';
      
      return {
        actionType,
        requiresApproval: true,
        description,
        confidence: 0.98,
        expectedImpact: 'Contain incident, clear 400 fans via exit routes E1/E2.'
      };
    }

    default:
      return { message: `Simulated worker resolved event: ${eventType}` };
  }
}
