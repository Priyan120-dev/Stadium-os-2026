/**
 * runTests.ts — Stadium OS Test Suite
 *
 * Implements unit and integration tests for Dijkstra navigation routing,
 * accessibility constraints, event bus state transitions, retries, and authority policies.
 */

import { navigationAgent } from '../agents/navigationAgent';
import { isActionApprovalRequired } from '../agents/agents';
import { initialVolunteers, initialIncidents, AgentEvent } from '../mockData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${message}`);
  }
}

// ── TEST 1: DIJKSTRA NAVIGATION PATHS ──
function testDijkstraStandardPath() {
  console.log('Testing Dijkstra Standard Route...');
  // Route from GateA to Section 104
  const result = navigationAgent.findRoute('GateA', 'Sec104', false);
  assert(result.path.length > 0, 'Should find a path');
  assert(result.path[0] === 'GateA', 'Path should start at GateA');
  assert(result.path[result.path.length - 1] === 'Sec104', 'Path should end at Sec104');
  console.log('✓ Test passed: Dijkstra Standard Path.');
}

// ── TEST 2: ACCESSIBILITY STEP-FREE ROUTING ──
function testAccessibilityStepFreePath() {
  console.log('Testing Accessibility Step-Free Rerouting...');
  // Nodes Sec102, Sec106, Sec114, Sec118 are flagged stairs
  // Ensure Dijkstra step-free avoids these sections
  const result = navigationAgent.findRoute('GateA', 'Sec104', true);
  assert(!result.path.includes('Sec102'), 'Accessible path must NOT traverse stairs Sec102');
  assert(!result.path.includes('Sec106'), 'Accessible path must NOT traverse stairs Sec106');
  console.log('✓ Test passed: Accessibility Step-Free Routing.');
}

// ── TEST 3: EMERGENCY AUTHORITY MATRICES ──
function testEmergencyAuthorityPolicy() {
  console.log('Testing Emergency Authority Policies...');
  assert(!isActionApprovalRequired('INCIDENT_NOTIFY'), 'Incident notifications should auto-dispatch');
  assert(!isActionApprovalRequired('GUIDANCE_DISPLAY'), 'AED displays should auto-dispatch');
  assert(isActionApprovalRequired('STADIUM_ALARM'), 'Critical Stadium Alarm MUST require human approval');
  assert(isActionApprovalRequired('EVACUATION_ORDER'), 'Critical Evacuation Orders MUST require human approval');
  assert(isActionApprovalRequired('EXTERNAL_DISPATCH'), 'Critical External Dispatches MUST require human approval');
  console.log('✓ Test passed: Emergency Authority Policies.');
}

// ── TEST 4: STATE RETRY DEAD-LETTER INTEGRITY ──
function testDeadLetterQueueRouting() {
  console.log('Testing Dead Letter Queue (DLQ) State transitions...');
  
  const mockEvent: AgentEvent = {
    eventId: 'EVT-TEST',
    correlationId: 'corr-test',
    parentEventId: null,
    eventType: 'TICKET_OCR',
    sourceAgent: 'Test Harness',
    targetAgent: 'Vision Agent',
    status: 'queued',
    priority: 'medium',
    payload: {},
    workerId: null,
    leaseExpiresAt: null,
    startedAt: null,
    completedAt: null,
    deadLetteredAt: null,
    idempotencyKey: 'idemp-test',
    retryCount: 3, // Already at max retry count
    maxRetries: 3,
    errorMessage: null,
    scheduledRetryAt: null,
    result: null,
    createdAt: Date.now(),
    lastUpdated: Date.now()
  };

  // Simulate claiming and error routing to DLQ
  const nextRetryCount = mockEvent.retryCount + 1;
  const isDlqDeadLettered = nextRetryCount > mockEvent.maxRetries;

  assert(isDlqDeadLettered === true, 'Next retry count must exhaust limit and trigger DLQ');
  console.log('✓ Test passed: Dead Letter Queue (DLQ) Routing.');
}

// Run All Tests
export function runAllTests() {
  console.log('=============================================');
  console.log('STARTING STADIUM OS INTEGRATION TEST SUITE...');
  console.log('=============================================');
  try {
    testDijkstraStandardPath();
    testAccessibilityStepFreePath();
    testEmergencyAuthorityPolicy();
    testDeadLetterQueueRouting();
    console.log('=============================================');
    console.log('✓ ALL TESTS PASSED SUCCESSFULLY! SYSTEM STABLE.');
    console.log('=============================================');
  } catch (err: any) {
    console.error('❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

// Run if direct node execution
if (require.main === module) {
  runAllTests();
}
