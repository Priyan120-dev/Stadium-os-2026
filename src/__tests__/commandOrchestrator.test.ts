/**
 * commandOrchestrator.test.ts — Unit tests for Command Orchestrator agent
 *
 * Tests: capability matching, intent routing, language detection, idempotency,
 * and fallback responses without requiring a real Gemini API key.
 */

import { commandOrchestrator } from '../agents/commandOrchestrator';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeMockContext(overrides: Partial<{
  stepFree: boolean;
  addAgentLog: jest.Mock;
  addEvent: jest.Mock;
  setDemoState: jest.Mock;
}> = {}) {
  const addAgentLog = jest.fn();
  const addEvent = jest.fn().mockReturnValue('EVT-TEST-001');
  const setDemoState = jest.fn();
  return {
    stepFree: false,
    tickets: {},
    setTickets: jest.fn(),
    transport: {},
    concessions: {},
    incidents: [],
    setIncidents: jest.fn(),
    volunteers: [],
    setVolunteers: jest.fn(),
    setHighlightedPath: jest.fn(),
    setDemoState,
    agentLogs: [],
    setAgentLogs: jest.fn(),
    addAgentLog,
    addEvent,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Command Orchestrator — Capability Matching', () => {

  it('routes "lost child" query to Emergency Agent and triggers LOST_CHILD_UPLOAD event', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('I lost my son near gate A', ctx as any, setMessages);

    // Should have dispatched LOST_CHILD_UPLOAD
    expect(ctx.addEvent).toHaveBeenCalledWith(
      'LOST_CHILD_UPLOAD',
      expect.any(Object),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
    expect(ctx.setDemoState).toHaveBeenCalledWith('lost_child_alert');

    // Message should be appended
    const call = setMessages.mock.calls[0][0];
    const messages = call([]);
    expect(messages[0].source).toBe('Emergency Agent');
  });

  it('routes "child" keyword to Emergency Agent', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('I cannot find my child', ctx as any, setMessages);

    expect(ctx.addEvent).toHaveBeenCalledWith(
      'LOST_CHILD_UPLOAD',
      expect.any(Object),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
  });

  it('routes medical emergency keywords to Emergency Agent and triggers PANIC_PRESSED', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('I need help, I have chest pain', ctx as any, setMessages);

    expect(ctx.addEvent).toHaveBeenCalledWith(
      'PANIC_PRESSED',
      expect.any(Object),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
    expect(ctx.setDemoState).toHaveBeenCalledWith('panic_active');
  });

  it('routes "hurt" keyword to Emergency Agent', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('Someone is hurt in section 104', ctx as any, setMessages);

    const eventCall = ctx.addEvent.mock.calls.find((c: string[]) => c[0] === 'PANIC_PRESSED');
    expect(eventCall).toBeDefined();
  });

  it('routes navigation keywords to Navigation Agent with ROUTE_NAVIGATION event', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('How do I get to my seat?', ctx as any, setMessages);

    expect(ctx.addEvent).toHaveBeenCalledWith(
      'ROUTE_NAVIGATION',
      expect.any(Object),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );

    const call = setMessages.mock.calls[0][0];
    const messages = call([]);
    expect(messages[0].source).toBe('Navigation Agent');
  });

  it('routes "restroom" keyword to Navigation Agent', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('Where is the restroom?', ctx as any, setMessages);

    const eventCall = ctx.addEvent.mock.calls.find((c: string[]) => c[0] === 'ROUTE_NAVIGATION');
    expect(eventCall).toBeDefined();
  });

  it('routes crowd keywords to Crowd Intelligence Agent', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('How long is the queue at Gate A?', ctx as any, setMessages);

    // Should log Crowd Intelligence Agent
    const logCall = ctx.addAgentLog.mock.calls.find(
      (c: string[]) => c[1] === 'Crowd Intelligence Agent'
    );
    expect(logCall).toBeDefined();

    const call = setMessages.mock.calls[0][0];
    const messages = call([]);
    expect(messages[0].source).toBe('Crowd Intelligence Agent');
  });

  it('returns ArenaPilot default response for unknown query', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('Tell me about the history of soccer', ctx as any, setMessages);

    const call = setMessages.mock.calls[0][0];
    const messages = call([]);
    expect(messages[0].text.toLowerCase()).toMatch(/arenapilot|copilot|smart stadium/i);
  });

  it('detects non-English language and logs Translation Agent', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    // Spanish: "necesito ayuda" → contains "ayuda" which maps to emergency
    await commandOrchestrator.processQuery('necesito ayuda, tengo dolor', ctx as any, setMessages);

    const translationLog = ctx.addAgentLog.mock.calls.find(
      (c: string[]) => c[1] === 'Translation Agent'
    );
    expect(translationLog).toBeDefined();
  });

  it('appends message with correct timestamp and sender=agent', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('how to get to gate B', ctx as any, setMessages);

    const call = setMessages.mock.calls[0][0];
    const messages = call([]);
    expect(messages[0].sender).toBe('agent');
    expect(messages[0].id).toMatch(/MSG-/);
    expect(messages[0].timestamp).toBeDefined();
    expect(messages[0].correlationId).toBeDefined();
  });

  it('logs capability registry check for every query', async () => {
    const ctx = makeMockContext();
    const setMessages = jest.fn();

    await commandOrchestrator.processQuery('any random question', ctx as any, setMessages);

    const registryLog = ctx.addAgentLog.mock.calls.find(
      (c: string[]) => c[1] === 'Capability Registry'
    );
    expect(registryLog).toBeDefined();
  });
});
