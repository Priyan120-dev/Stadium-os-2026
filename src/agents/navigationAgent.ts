/**
 * navigationAgent.ts — Navigation Agent
 * 
 * Performs graph search (Dijkstra) over the stadium node graph
 * and generates Turn-by-Turn landmark instructions.
 * Now supports NavigationMode for adaptive routing.
 */

import { stadiumGraph, stadiumNodes, NavigationMode } from '../mockData';
import { accessibilityModule } from '../modules/accessibilityModule';

export interface RouteReport {
  path: string[];
  distance: number;
  instructions: string[];
  mode: NavigationMode;
}

/**
 * Returns a per-edge weight multiplier based on the selected navigation mode.
 * This allows the same Dijkstra algorithm to produce different optimal paths.
 */
function getModeWeight(neighbor: string, baseWeight: number, mode: NavigationMode, densityMap?: Record<string, string>): number {
  let weight = baseWeight;

  switch (mode) {
    case 'wheelchair':
      // Heavily penalize stairs (Sec102, Sec106, Sec114 are not step-free per map annotations)
      if (['Sec102', 'Sec106', 'Sec114'].includes(neighbor)) weight += 1000;
      // Prefer exits and medical which have ramp access
      if (neighbor.startsWith('E') || neighbor.startsWith('M')) weight *= 0.5;
      // Sections with ramps (inner concourse)
      if (neighbor.startsWith('R') || neighbor.startsWith('AED')) weight *= 0.8;
      break;

    case 'vip':
      // VIP lounge is near food courts — strongly prefer food courts & exits
      if (neighbor.startsWith('F')) weight *= 0.2;
      if (neighbor.startsWith('E')) weight *= 0.3;
      // Deprioritize crowded gate areas
      if (neighbor.startsWith('Gate')) weight *= 2;
      break;

    case 'least-crowded':
      // Penalize high-density nodes
      if (densityMap) {
        const density = densityMap[neighbor];
        if (density === 'critical') weight *= 8;
        else if (density === 'high')     weight *= 4;
        else if (density === 'medium')   weight *= 2;
      }
      break;

    case 'emergency':
      // Minimize all weights — direct shortest path, ignoring crowd
      weight *= 0.3;
      // Prioritize medical and AED stations
      if (neighbor.startsWith('M') || neighbor.startsWith('AED')) weight *= 0.1;
      break;

    case 'exit':
      // Guide toward exit nodes
      if (neighbor.startsWith('E')) weight *= 0.1;
      if (neighbor.startsWith('Gate')) weight *= 0.2;
      // Penalize going deeper into sections
      if (neighbor.startsWith('Sec')) weight *= 1.5;
      break;

    case 'volunteer':
      // Volunteers traverse via concourses, prefer food courts and restrooms
      if (neighbor.startsWith('F') || neighbor.startsWith('R')) weight *= 0.5;
      break;

    case 'fastest':
    default:
      // No modification — pure Dijkstra
      break;
  }

  return weight;
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
   * @param mode - NavigationMode determining edge weight biases.
   * @param densityMap - Optional density map for least-crowded routing.
   * @returns RouteReport
   */
  findRoute(
    startNode: string,
    endNode: string,
    stepFree = false,
    mode: NavigationMode = 'fastest',
    densityMap?: Record<string, string>
  ): RouteReport {
    if (!stadiumNodes[startNode] || !stadiumNodes[endNode]) {
      return { path: [], distance: 0, instructions: ['Invalid start or destination location.'], mode };
    }

    // Force wheelchair mode if stepFree is requested
    const effectiveMode: NavigationMode = stepFree ? 'wheelchair' : mode;

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

        // Mode-specific edge weight biasing
        weight = getModeWeight(neighbor, weight, effectiveMode, densityMap);

        // Legacy step-free filter (still works in non-wheelchair modes)
        if (stepFree && !accessibilityModule.isNodeAccessible(neighbor)) {
          weight += 1000;
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
      return { path: [], distance: 0, instructions: ['No valid path found. Please contact a stadium volunteer.'], mode: effectiveMode };
    }

    const instructions = this.generateInstructions(path, stepFree, effectiveMode);

    return {
      path,
      distance: distances[endNode],
      instructions,
      mode: effectiveMode
    };
  },

  /**
   * Generate turn-by-turn guidance notes based on path nodes.
   */
  generateInstructions(path: string[], stepFree: boolean, mode: NavigationMode = 'fastest'): string[] {
    const instructions: string[] = [];
    if (path.length === 0) return instructions;

    const modeNote = {
      wheelchair:    '♿ Step-free route selected.',
      vip:           '👑 VIP route — priority access via food courts.',
      'least-crowded': '🌬️ Quiet route — avoiding dense areas.',
      emergency:     '🚨 Emergency fast-track route.',
      exit:          '🚪 Guided exit route.',
      volunteer:     '🦺 Staff concourse route.',
      fastest:       '',
    }[mode] || '';

    if (modeNote) instructions.push(modeNote);
    
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

