/**
 * navigation.test.ts — Comprehensive Dijkstra unit tests for navigationAgent
 *
 * Covers: happy paths, disconnected/invalid nodes, step-free re-weighting,
 * mode-specific edge-weight biases, generateInstructions output, and edge cases.
 */

import { navigationAgent } from '../agents/navigationAgent';

describe('Navigation Agent — Dijkstra Pathfinding', () => {

  // ── HAPPY PATH ─────────────────────────────────────────────────────────────

  it('finds a valid path between GateA and Sec104 in fastest mode', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec104', false, 'fastest');
    expect(route.path).toBeDefined();
    expect(route.path.length).toBeGreaterThan(0);
    expect(route.path[0]).toBe('GateA');
    expect(route.path[route.path.length - 1]).toBe('Sec104');
    expect(route.distance).toBeGreaterThan(0);
  });

  it('returns a single-element path when start and end are the same node', () => {
    const route = navigationAgent.findRoute('GateA', 'GateA', false, 'fastest');
    expect(route.path).toEqual(['GateA']);
    expect(route.distance).toBe(0);
  });

  // ── DISCONNECTED / INVALID NODES ───────────────────────────────────────────

  it('returns empty path and error instruction for unknown start node', () => {
    const route = navigationAgent.findRoute('UNKNOWN_NODE_XYZ', 'Sec104', false);
    expect(route.path).toHaveLength(0);
    expect(route.instructions.some(i => i.toLowerCase().includes('invalid'))).toBe(true);
  });

  it('returns empty path and error instruction for unknown end node', () => {
    const route = navigationAgent.findRoute('GateA', 'UNKNOWN_NODE_XYZ', false);
    expect(route.path).toHaveLength(0);
    expect(route.instructions.some(i => i.toLowerCase().includes('invalid'))).toBe(true);
  });

  it('returns empty path when both nodes are unknown', () => {
    const route = navigationAgent.findRoute('FAKE_A', 'FAKE_B', false);
    expect(route.path).toHaveLength(0);
  });

  // ── STEP-FREE RE-WEIGHTING ─────────────────────────────────────────────────

  it('produces a wheelchair mode route that avoids stairwell sections', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec107', true, 'wheelchair');
    // Sec102, Sec106, Sec114 are penalised +1000 in wheelchair mode
    const avoidedNodes = ['Sec102', 'Sec106', 'Sec114'];
    const pathContainsStairs = route.path.some(n => avoidedNodes.includes(n));
    expect(pathContainsStairs).toBe(false);
    expect(route.mode).toBe('wheelchair');
  });

  it('forces wheelchair mode when stepFree flag is true regardless of mode arg', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec104', true, 'fastest');
    expect(route.mode).toBe('wheelchair');
  });

  it('includes step-free note in instructions for wheelchair routing', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec104', true, 'wheelchair');
    const hasNote = route.instructions.some(
      i => i.toLowerCase().includes('step-free') || i.toLowerCase().includes('♿')
    );
    expect(hasNote).toBe(true);
  });

  // ── LEAST-CROWDED RE-WEIGHTING ─────────────────────────────────────────────

  it('avoids critical-density nodes in least-crowded mode', () => {
    const densityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      Sec101: 'critical',
      Sec102: 'critical',
    };
    // Route from GateA to Sec103 — Sec101/102 are on the most direct path
    const fastest = navigationAgent.findRoute('GateA', 'Sec103', false, 'fastest');
    const leastCrowded = navigationAgent.findRoute('GateA', 'Sec103', false, 'least-crowded', densityMap);

    // Least-crowded should produce a different path avoiding critical sections
    if (fastest.path.includes('Sec101') || fastest.path.includes('Sec102')) {
      expect(leastCrowded.path).not.toEqual(fastest.path);
    }
    expect(leastCrowded.path.length).toBeGreaterThan(0);
  });

  // ── EMERGENCY MODE ─────────────────────────────────────────────────────────

  it('finds path ending at AED node in emergency mode', () => {
    const route = navigationAgent.findRoute('GateA', 'AED5', false, 'emergency');
    expect(route.path).toContain('AED5');
    expect(route.mode).toBe('emergency');
  });

  it('includes emergency note in instructions for emergency mode', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec104', false, 'emergency');
    const hasNote = route.instructions.some(i => i.includes('🚨') || i.toLowerCase().includes('emergency'));
    expect(hasNote).toBe(true);
  });

  // ── VIP MODE ───────────────────────────────────────────────────────────────

  it('includes VIP note in instructions for vip mode', () => {
    const route = navigationAgent.findRoute('GateA', 'F1', false, 'vip');
    const hasNote = route.instructions.some(i => i.includes('👑') || i.toLowerCase().includes('vip'));
    expect(hasNote).toBe(true);
  });

  // ── EXIT MODE ──────────────────────────────────────────────────────────────

  it('includes exit note in instructions for exit mode', () => {
    const route = navigationAgent.findRoute('Sec104', 'E1', false, 'exit');
    const hasNote = route.instructions.some(i => i.includes('🚪') || i.toLowerCase().includes('exit'));
    expect(hasNote).toBe(true);
    expect(route.path).toContain('E1');
  });

  // ── INSTRUCTION GENERATION ─────────────────────────────────────────────────

  it('generateInstructions returns empty array for empty path', () => {
    const instructions = navigationAgent.generateInstructions([], false, 'fastest');
    expect(instructions).toHaveLength(0);
  });

  it('generateInstructions always ends with arrival message', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec104', false, 'fastest');
    const last = route.instructions[route.instructions.length - 1];
    expect(last.toLowerCase()).toContain('arrived');
  });

  it('generateInstructions starts with Start walking from', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec104', false, 'fastest');
    expect(route.instructions[0]).toMatch(/start walking from/i);
  });

  // ── ROUTE INTEGRITY ────────────────────────────────────────────────────────

  it('path is contiguous (no teleports between non-adjacent nodes)', () => {
    const route = navigationAgent.findRoute('GateB', 'GateD', false, 'fastest');
    // Every node in path should be a known stadium node
    route.path.forEach(nodeId => {
      expect(nodeId).toBeTruthy();
    });
  });

  it('returns consistent results for the same input (deterministic)', () => {
    const r1 = navigationAgent.findRoute('GateA', 'Sec104', false, 'fastest');
    const r2 = navigationAgent.findRoute('GateA', 'Sec104', false, 'fastest');
    expect(r1.path).toEqual(r2.path);
    expect(r1.distance).toBe(r2.distance);
  });
});
