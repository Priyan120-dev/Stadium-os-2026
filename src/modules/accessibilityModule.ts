/**
 * accessibilityModule.ts — Accessibility Operations Module
 *
 * Manages wheelchair escorts, neurodivergent quiet zones, and elevator/step-free accessibility logic.
 */

import { StadiumNode } from '../mockData';

export interface EscortRequest {
  id: string;
  fanId: string;
  type: 'wheelchair-escort';
  nodeId: string;
  status: 'pending' | 'assigned' | 'completed';
  timestamp: number;
  description: string;
}

export const accessibilityModule = {
  /**
   * Log wheelchair assistance requests.
   * Creates custom tasks for volunteer dispatch.
   */
  requestEscort(fanId: string, section: string): EscortRequest {
    const timestamp = Date.now();
    const requestId = `ACC-${Math.floor(100 + Math.random() * 900)}`;

    return {
      id: requestId,
      fanId,
      type: 'wheelchair-escort',
      nodeId: section,
      status: 'pending',
      timestamp,
      description: `Wheelchair assistance escort requested at Section ${section.replace('Sec', '')}.`
    };
  },

  /**
   * Identifies nearest sensory room node for neurodivergent fans.
   */
  findQuietZones(nodeId: string, nodes: Record<string, StadiumNode>): string[] {
    // Quiet zones inside standard node list
    const quietNodes = ['M1', 'M2']; // Mocking medical/rest zones as calm bays
    return quietNodes;
  },

  /**
   * Identifies if a node is step-free accessible.
   * wired for accessibility routing filter.
   */
  isNodeAccessible(nodeId: string): boolean {
    const inaccessible = ['Sec102', 'Sec106', 'Sec114', 'Sec118'];
    return !inaccessible.includes(nodeId);
  }
};
