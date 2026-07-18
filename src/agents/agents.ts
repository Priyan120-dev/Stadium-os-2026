/**
 * agents.ts — Stadium OS 12-Agent Swarm Coordinator
 *
 * Acts as the main entry point for the agent swarm.
 * Core logic is split into focused modules:
 *   - agentRegistry.ts  → 12-agent capability registry
 *   - authorityPolicy.ts → emergency authority matrix & approval gate
 *
 * Implements: event processor (claiming, retries, exponential backoff, DLQ),
 * and re-exports all public symbols for backward compatibility.
 */

import { AgentEvent, AgentLog, Volunteer, Incident, Concession, Transit, NavigationMode } from '../mockData';
import { navigationAgent } from './navigationAgent';
import { incidentService } from '../services/incidentService';
import { calculateKPIs } from '../services/analyticsService';
import { computeGreenScore } from '../services/sustainabilityService';

// Re-export from focused modules for backward compatibility
import { agentSwarmRegistry } from './agentRegistry';
import type { AgentInfo } from './agentRegistry';
export type { AgentInfo } from './agentRegistry';
export { agentSwarmRegistry } from './agentRegistry';
import { emergencyAuthorityMatrix, isActionApprovalRequired } from './authorityPolicy';
import type { AuthorityActionKey } from './authorityPolicy';
export type { AuthorityActionKey } from './authorityPolicy';
export { emergencyAuthorityMatrix, isActionApprovalRequired } from './authorityPolicy';

// ---------------------------------------------------------------------------
// LOCAL SIMULATED EVENT PROCESSING HEARTBEAT
// (Registry and authority policy are in agentRegistry.ts / authorityPolicy.ts)
// ---------------------------------------------------------------------------

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

    case 'KPI_REPORT': {
      // Analytics Agent: compute live KPIs from current state
      const kpis = calculateKPIs(dbState.agentLogs, dbState.incidents, dbState.volunteers);
      return {
        avgResponseTimeMinutes: kpis.avgResponseTimeMinutes,
        incidentResolutionRate: kpis.incidentResolutionRate,
        volunteerUtilizationPct: kpis.volunteerUtilizationPct,
        totalEventsProcessed: kpis.totalEventsProcessed,
        activeIncidentCount: kpis.activeIncidentCount,
      };
    }

    case 'ENERGY_AUDIT': {
      // Sustainability Agent: compute environmental score from current metrics
      const metrics = payload.metrics;
      if (!metrics) {
        return { message: 'No sustainability metrics provided for ENERGY_AUDIT.' };
      }
      const greenScore = computeGreenScore(metrics);
      return {
        totalScore: greenScore.totalScore,
        grade: greenScore.grade,
        energyScore: greenScore.energyScore,
        waterScore: greenScore.waterScore,
        wasteScore: greenScore.wasteScore,
        carbonScore: greenScore.carbonScore,
        rationale: greenScore.rationale,
      };
    }

    default:
      return { message: `Simulated worker resolved event: ${eventType}` };
  }
}

