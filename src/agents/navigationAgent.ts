/**
 * navigationAgent.ts — Navigation Agent
 * 
 * Performs graph search (Dijkstra) over the stadium node graph
 * and generates Turn-by-Turn landmark instructions.
 */

import { stadiumGraph, stadiumNodes } from '../mockData';
import { accessibilityModule } from '../modules/accessibilityModule';

export interface RouteReport {
  path: string[];
  distance: number;
  instructions: string[];
}

export const navigationAgent = {
  role: 'Navigation Agent',
  description: 'Calculates optimal paths and generates landmark-based route guides.',

  /**
   * Run Dijkstra's algorithm to find the shortest path between two nodes.
   *
   * @param startNode - ID of start node.
   * @param endNode - ID of end node.
   * @param stepFree - If true, avoids stairs or matches accessible nodes.
   * @returns RouteReport
   */
  findRoute(startNode: string, endNode: string, stepFree = false): RouteReport {
    if (!stadiumNodes[startNode] || !stadiumNodes[endNode]) {
      return { path: [], distance: 0, instructions: ['Invalid start or destination location.'] };
    }

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const queue: string[] = [];

    // Initialize all known nodes to be fully resilient
    for (const node in stadiumNodes) {
      distances[node] = Infinity;
      previous[node] = null;
      queue.push(node);
    }
    distances[startNode] = 0;

    while (queue.length > 0) {
      // Sort queue to get node with smallest distance
      queue.sort((a, b) => distances[a] - distances[b]);
      const current = queue.shift()!;

      if (current === endNode) break;
      if (distances[current] === Infinity) break;

      const neighbors = stadiumGraph[current] || {};
      for (const neighbor in neighbors) {
        if (!queue.includes(neighbor)) continue;

        let weight = neighbors[neighbor];

        // Step-free filter: penalize inaccessible sections heavily
        if (stepFree && !accessibilityModule.isNodeAccessible(neighbor)) {
          weight += 1000; // Large penalty to avoid steps/non-accessible sections
        }

        // Accessibility weights: prioritize ramps/elevators if step-free is requested
        if (stepFree) {
          const isRampOrElevator = neighbor.startsWith('E') || neighbor.startsWith('M');
          if (!isRampOrElevator && neighbor.includes('Sec')) {
            // Add a small penalty to simulate prioritizing outer concourses over narrow seating sections
            weight += 2;
          }
        }

        const alt = distances[current] + weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let curr: string | null = endNode;
    while (curr !== null && curr !== undefined) {
      path.unshift(curr);
      curr = previous[curr];
    }

    if (path[0] !== startNode) {
      return { path: [], distance: 0, instructions: ['No valid path found. Please contact a stadium volunteer.'] };
    }

    // Generate natural language instructions based on nodes visited
    const instructions = this.generateInstructions(path, stepFree);

    return {
      path,
      distance: distances[endNode],
      instructions
    };
  },

  /**
   * Generate turn-by-turn guidance notes based on path nodes.
   */
  generateInstructions(path: string[], stepFree: boolean): string[] {
    const instructions: string[] = [];
    if (path.length === 0) return instructions;
    
    instructions.push(`Start walking from ${stadiumNodes[path[0]].label}.`);

    for (let i = 1; i < path.length; i++) {
      const prev = stadiumNodes[path[i - 1]];
      const curr = stadiumNodes[path[i]];
      
      let direction = 'continue';
      if (curr.zone !== prev.zone) {
        direction = `head towards the ${curr.zone.toUpperCase()} zone`;
      }

      let typeDetails = '';
      if (curr.type === 'food') {
        typeDetails = `reaching Food Court ${curr.label.replace('Food ', '')} (great place to grab a snack)`;
      } else if (curr.type === 'restroom') {
        typeDetails = `finding Restroom ${curr.label.replace('WC ', '')} on your right`;
      } else if (curr.type === 'medical') {
        typeDetails = `approaching First Aid station ${curr.label.replace('Medical ', '')}`;
      } else if (curr.type === 'aed') {
        typeDetails = `passing AED Safety box ${curr.label.replace('AED ', '')}`;
      } else if (curr.type === 'gate') {
        typeDetails = `arriving at Gate ${curr.label.replace('Gate ', '')}`;
      } else {
        typeDetails = `entering Section ${curr.label.replace('§', '')}`;
      }

      const accessNote = stepFree && i === path.length - 1 ? ' (Step-free ramp access available here)' : '';
      instructions.push(`Then, ${direction}, ${typeDetails}.${accessNote}`);
    }

    instructions.push('You have arrived at your destination.');
    return instructions;
  }
};
