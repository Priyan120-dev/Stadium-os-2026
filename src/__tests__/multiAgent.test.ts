import { agentSwarmRegistry } from '../agents/agents';

describe('Multi-Agent Swarm Registry', () => {
  it('should list all critical agents in the registry', () => {
    expect(agentSwarmRegistry).toBeDefined();
    expect(agentSwarmRegistry['Command Orchestrator']).toBeDefined();
    expect(agentSwarmRegistry['Crowd Intelligence Agent']).toBeDefined();
    expect(agentSwarmRegistry['Emergency Agent']).toBeDefined();
    expect(agentSwarmRegistry['Volunteer Agent']).toBeDefined();
    expect(agentSwarmRegistry['Translation Agent']).toBeDefined();
  });

  it('should define capabilities for each agent', () => {
    const orchestrator = agentSwarmRegistry['Command Orchestrator'];
    expect(orchestrator.capabilities).toContain('orchestrate');
    expect(orchestrator.capabilities).toContain('route-intent');
  });
});
