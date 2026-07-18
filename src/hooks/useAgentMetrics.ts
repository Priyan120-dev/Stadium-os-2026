/**
 * useAgentMetrics.ts
 * Hook to retrieve and query real-time agent capability metrics, health,
 * and current task status from the global Stadium OS context.
 */
'use client';
import { useStadiumOS } from '../context/StadiumOSContext';
import { useMemo } from 'react';
import { AgentMetric } from '../mockData';

export function useAgentMetrics() {
  const { agentMetrics, agentEvents } = useStadiumOS();

  const metricsArray = useMemo(() => Object.values(agentMetrics), [agentMetrics]);

  // Compute aggregate swarm statistics
  const swarmStats = useMemo(() => {
    const totalProcessed = metricsArray.reduce((acc, curr) => acc + curr.performance.totalEventsProcessed, 0);
    const totalLatency = metricsArray.reduce((acc, curr) => acc + curr.performance.avgResponseMs, 0);
    const avgLatency = metricsArray.length > 0 ? Math.round(totalLatency / metricsArray.length) : 0;
    const avgHealth = metricsArray.length > 0 ? Math.round(metricsArray.reduce((acc, curr) => acc + curr.health, 0) / metricsArray.length) : 100;
    const activeAgents = metricsArray.filter(a => a.status === 'online' || a.status === 'busy').length;

    return {
      totalProcessed,
      avgLatency,
      avgHealth,
      activeAgents,
      totalAgents: metricsArray.length
    };
  }, [metricsArray]);

  const getAgentMetric = (agentName: string): AgentMetric | undefined => {
    return agentMetrics[agentName];
  };

  const isAgentActive = (agentName: string): boolean => {
    const agent = agentMetrics[agentName];
    return agent ? (agent.status === 'online' || agent.status === 'busy') : false;
  };

  return {
    agentMetrics,
    metricsArray,
    swarmStats,
    getAgentMetric,
    isAgentActive
  };
}
