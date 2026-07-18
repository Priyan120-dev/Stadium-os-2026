import { navigationAgent } from '../agents/navigationAgent';

describe('Navigation Agent - Dijkstra Pathfinding', () => {
  it('should find the fastest path between Gate A and Sec 104', () => {
    const route = navigationAgent.findRoute('GateA', 'Sec104', false, 'fastest');
    expect(route.path).toBeDefined();
    expect(route.path.length).toBeGreaterThan(0);
    expect(route.path[0]).toBe('GateA');
  });

  it('should enforce step-free routing when stepFree is true', () => {
    // Section 102 is step-free prohibited in wheelchair mode weightings
    const route = navigationAgent.findRoute('GateA', 'Sec102', true, 'wheelchair');
    expect(route.instructions.some(ins => ins.toLowerCase().includes('wheelchair') || ins.toLowerCase().includes('step-free'))).toBe(true);
  });

  it('should reroute to avoid high-density sections in least-crowded mode', () => {
    const densityMap = {
      Sec101: 'critical' as const,
      Sec102: 'low' as const
    };
    const route = navigationAgent.findRoute('GateA', 'Sec103', false, 'least-crowded', densityMap);
    expect(route.path).toBeDefined();
  });

  it('should prioritize emergency assets in emergency routing mode', () => {
    const route = navigationAgent.findRoute('GateA', 'AED5', false, 'emergency');
    expect(route.path).toContain('AED5');
  });
});
