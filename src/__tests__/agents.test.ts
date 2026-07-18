/**
 * agents.test.ts — Unit tests for processLocalEvent and agentSwarmRegistry
 *
 * Tests: TICKET_OCR, CROWD_GATE_CHECK, PANIC_PRESSED idempotency,
 * LOST_CHILD_UPLOAD, STAFF_DISPATCH, PROPOSE_CRITICAL_ACTION,
 * unknown event fallback, and isActionApprovalRequired authority matrix.
 */

import { processLocalEvent, isActionApprovalRequired, agentSwarmRegistry, emergencyAuthorityMatrix } from '../agents/agents';
import { initialVolunteers, initialIncidents } from '../mockData';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeDbState(overrides: Partial<Parameters<typeof processLocalEvent>[1]> = {}) {
  const setVolunteers = jest.fn();
  const setIncidents = jest.fn();
  const setAgentLogs = jest.fn();
  const setHighlightedPath = jest.fn();
  const setEvents = jest.fn();
  const addAlert = jest.fn();

  return {
    volunteers: [...initialVolunteers],
    setVolunteers,
    incidents: [...initialIncidents],
    setIncidents,
    concessions: {},
    transit: {},
    agentLogs: [],
    setAgentLogs,
    highlightedPath: [],
    setHighlightedPath,
    stepFree: false,
    setEvents,
    addAlert,
    navigationMode: 'fastest' as const,
    densityMap: {} as Record<string, 'low' | 'medium' | 'high' | 'critical'>,
    ...overrides,
  };
}

function makeEvent(eventType: string, payload: Record<string, unknown> = {}, correlationId = 'corr-test') {
  return {
    eventId: `EVT-TEST-${Math.random().toString(36).substr(2, 6)}`,
    correlationId,
    parentEventId: null,
    eventType,
    sourceAgent: 'Test',
    targetAgent: 'Test',
    status: 'processing' as const,
    priority: 'medium' as const,
    payload,
    workerId: 'worker-test',
    leaseExpiresAt: Date.now() + 30000,
    startedAt: Date.now(),
    completedAt: null,
    deadLetteredAt: null,
    idempotencyKey: `idemp-${eventType}-${correlationId}`,
    retryCount: 0,
    maxRetries: 3,
    errorMessage: null,
    scheduledRetryAt: null,
    result: null,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
}

// ── processLocalEvent tests ───────────────────────────────────────────────────

describe('processLocalEvent — TICKET_OCR', () => {
  it('returns validated ticket result with gate and seat', async () => {
    const result = await processLocalEvent(makeEvent('TICKET_OCR', { ticketId: 'TKT-001' }), makeDbState());
    expect(result.validated).toBe(true);
    expect(result.gate).toBe('GateA');
    expect(result.seat).toBe('104-G');
    expect(result.seatNode).toBe('Sec104');
  });

  it('uses default ticketId if not provided', async () => {
    const result = await processLocalEvent(makeEvent('TICKET_OCR', {}), makeDbState());
    expect(result.ticketId).toBe('TKT-001');
  });
});

describe('processLocalEvent — CROWD_GATE_CHECK', () => {
  it('reports Gate A as congested with 28-min wait', async () => {
    const result = await processLocalEvent(makeEvent('CROWD_GATE_CHECK', { gate: 'GateA' }), makeDbState());
    expect(result.isCongested).toBe(true);
    expect(result.waitMin).toBe(28);
    expect(result.recommendedGate).toBe('GateB');
  });

  it('reports Gate B as clear with 3-min wait', async () => {
    const result = await processLocalEvent(makeEvent('CROWD_GATE_CHECK', { gate: 'GateB' }), makeDbState());
    expect(result.isCongested).toBe(false);
    expect(result.waitMin).toBe(3);
    expect(result.recommendedGate).toBe('GateB');
  });
});

describe('processLocalEvent — PANIC_PRESSED', () => {
  it('creates a medical incident and returns incidentId', async () => {
    const db = makeDbState();
    const result = await processLocalEvent(makeEvent('PANIC_PRESSED', { section: 'Sec104' }), db);
    expect(result.incidentId).toMatch(/INC-/);
    expect(result.severity).toBeDefined();
    expect(result.autoActionCompleted).toBe(true);
    expect(result.requiresApproval).toBe(false);
    expect(db.setIncidents).toHaveBeenCalled();
  });

  it('idempotency: duplicate PANIC_PRESSED for same section returns without creating duplicate', async () => {
    const mockSetIncidents = jest.fn();
    // Pre-populate with existing active medical incident at Sec104
    const existingIncident = {
      id: 'INC-EXISTING',
      type: 'medical' as const,
      severity: 'low' as const,
      location: 'Section 104',
      nodeId: 'Sec104',
      description: 'Existing',
      localizedDescription: null,
      status: 'active' as const,
      detectedBy: 'Test',
      assignedVolunteerId: null,
      timestamp: Date.now(),
      lastUpdated: Date.now(),
    };
    const db = makeDbState({ incidents: [existingIncident], setIncidents: mockSetIncidents });
    const result = await processLocalEvent(makeEvent('PANIC_PRESSED', { section: 'Sec104' }), db);
    expect(result.incidentId).toBeDefined();
    // setIncidents should have been called but functional idempotency check should filter it
    const setIncidentsCall = mockSetIncidents.mock.calls[0];
    if (setIncidentsCall) {
      const updaterFn = setIncidentsCall[0];
      const newState = updaterFn([existingIncident]);
      expect(newState).toHaveLength(1); // No duplicate added
    }
  });
});

describe('processLocalEvent — LOST_CHILD_UPLOAD', () => {
  it('creates amber alert broadcast and assigns volunteer', async () => {
    const db = makeDbState();
    const result = await processLocalEvent(
      makeEvent('LOST_CHILD_UPLOAD', { estimatedAge: '8', shirtColor: 'Red Shirt', details: 'Blue cap' }),
      db
    );
    expect(result.amberAlertBroadcasted).toBe(true);
    expect(result.incidentId).toMatch(/INC-/);
    expect(result.childDescription).toContain('Amber Alert');
    expect(db.addAlert).toHaveBeenCalled();
  });

  it('idempotency: duplicate LOST_CHILD_UPLOAD does not create second incident', async () => {
    const mockSetIncidents = jest.fn();
    const existingChild = {
      id: 'INC-CHILD-1',
      type: 'lost-child' as const,
      severity: 'high' as const,
      location: 'Section 104',
      nodeId: 'Sec104',
      description: 'Existing amber alert',
      localizedDescription: null,
      status: 'active' as const,
      detectedBy: 'Vision Agent',
      assignedVolunteerId: null,
      timestamp: Date.now(),
      lastUpdated: Date.now(),
    };
    const db = makeDbState({ incidents: [existingChild], setIncidents: mockSetIncidents });
    await processLocalEvent(makeEvent('LOST_CHILD_UPLOAD', { estimatedAge: '8' }), db);
    const setIncidentsCall = mockSetIncidents.mock.calls[0];
    if (setIncidentsCall) {
      const updaterFn = setIncidentsCall[0];
      const newState = updaterFn([existingChild]);
      expect(newState).toHaveLength(1); // Idempotency respected
    }
  });
});

describe('processLocalEvent — STAFF_DISPATCH', () => {
  it('marks first available volunteer as busy with task', async () => {
    const db = makeDbState();
    const result = await processLocalEvent(
      makeEvent('STAFF_DISPATCH', { incidentId: 'INC-001', nodeId: 'Sec104', description: 'Medical assist' }),
      db
    );
    expect(result.assignedVolunteerId).toBeDefined();
    expect(result.volunteerName).toBeDefined();
    expect(result.etaMinutes).toBe(2);
    expect(db.setVolunteers).toHaveBeenCalled();
  });

  it('throws when no volunteers are available', async () => {
    const busyVolunteers = initialVolunteers.map(v => ({ ...v, status: 'busy' as const }));
    const db = makeDbState({ volunteers: busyVolunteers });
    await expect(
      processLocalEvent(makeEvent('STAFF_DISPATCH', { incidentId: 'INC-001' }), db)
    ).rejects.toThrow('No volunteers available');
  });
});

describe('processLocalEvent — PROPOSE_CRITICAL_ACTION', () => {
  it('returns requiresApproval=true for STADIUM_ALARM', async () => {
    const db = makeDbState();
    const result = await processLocalEvent(
      makeEvent('PROPOSE_CRITICAL_ACTION', { actionType: 'STADIUM_ALARM', description: 'Alarm test' }),
      db
    );
    expect(result.requiresApproval).toBe(true);
    expect(result.actionType).toBe('STADIUM_ALARM');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});

describe('processLocalEvent — Unknown event type', () => {
  it('returns a fallback message for unrecognised events', async () => {
    const db = makeDbState();
    const result = await processLocalEvent(makeEvent('TOTALLY_UNKNOWN_EVENT', {}), db);
    expect(result.message).toContain('TOTALLY_UNKNOWN_EVENT');
  });
});

// ── Authority Policy Matrix ───────────────────────────────────────────────────

describe('isActionApprovalRequired — Authority Policy Matrix', () => {
  it('STADIUM_ALARM requires human approval', () => {
    expect(isActionApprovalRequired('STADIUM_ALARM')).toBe(true);
  });

  it('EVACUATION_ORDER requires human approval', () => {
    expect(isActionApprovalRequired('EVACUATION_ORDER')).toBe(true);
  });

  it('EXTERNAL_DISPATCH requires human approval', () => {
    expect(isActionApprovalRequired('EXTERNAL_DISPATCH')).toBe(true);
  });

  it('INCIDENT_NOTIFY does NOT require approval (auto=true)', () => {
    expect(isActionApprovalRequired('INCIDENT_NOTIFY')).toBe(false);
  });

  it('GUIDANCE_DISPLAY does NOT require approval (auto=true)', () => {
    expect(isActionApprovalRequired('GUIDANCE_DISPLAY')).toBe(false);
  });
});

// ── Agent Swarm Registry ──────────────────────────────────────────────────────

describe('agentSwarmRegistry — Capability checks', () => {
  it('contains all 12 expected agents', () => {
    const agents = Object.keys(agentSwarmRegistry);
    expect(agents).toHaveLength(12);
  });

  it('Navigation Agent has plot-route capability', () => {
    expect(agentSwarmRegistry['Navigation Agent'].capabilities).toContain('plot-route');
  });

  it('Emergency Agent has emergency-guidance capability', () => {
    expect(agentSwarmRegistry['Emergency Agent'].capabilities).toContain('emergency-guidance');
  });

  it('Sustainability Agent has score-sustainability capability', () => {
    expect(agentSwarmRegistry['Sustainability Agent'].capabilities).toContain('score-sustainability');
  });

  it('Analytics Agent has calculate-response-time capability', () => {
    expect(agentSwarmRegistry['Analytics Agent'].capabilities).toContain('calculate-response-time');
  });

  it('each agent has name, description, and non-empty capabilities', () => {
    Object.values(agentSwarmRegistry).forEach(agent => {
      expect(agent.name).toBeTruthy();
      expect(agent.description).toBeTruthy();
      expect(agent.capabilities.length).toBeGreaterThan(0);
    });
  });
});
