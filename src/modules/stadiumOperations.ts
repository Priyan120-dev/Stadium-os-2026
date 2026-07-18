/**
 * stadiumOperations.ts — Core Operations Modules
 *
 * Handles tickets, parking space occupancy, concessions prep times,
 * transit scheduling, and security incidents registry.
 */

import { Ticket, Concession, Transit, Incident } from '../mockData';

// ── TICKET SUB-MODULE ──
export const ticketModule = {
  validateTicket(ticketId: string, ticketsState: Record<string, Ticket>) {
    const ticket = ticketsState[ticketId];
    if (!ticket) {
      return { success: false, error: 'Ticket not found in registration database.' };
    }
    return {
      success: true,
      ticket: {
        ...ticket,
        status: 'validated' as const,
        validatedAt: Date.now()
      }
    };
  },

  suggestGate(section: string): string {
    const sectionNum = parseInt(section.replace('Sec', ''), 10);
    if (isNaN(sectionNum)) return 'GateA';
    if (sectionNum >= 118 || sectionNum <= 102) return 'GateA'; // North
    if (sectionNum >= 103 && sectionNum <= 107) return 'GateB'; // East
    if (sectionNum >= 108 && sectionNum <= 112) return 'GateC'; // South
    return 'GateD'; // West (113-117)
  }
};

// ── PARKING SUB-MODULE ──
export const parkingModule = {
  lookupPlate(plate: string) {
    const cleanPlate = plate.toUpperCase().replace(/\s/g, '');
    if (cleanPlate === 'ARG2026' || cleanPlate === 'MATEO1') {
      return {
        hasReservation: true,
        lotId: 'LOT-A',
        lotName: 'Lot A (North)',
        instructions: 'Scan at Lot A reader. Space reserved close to Shuttle Bay 1.'
      };
    }
    return {
      hasReservation: false,
      lotId: 'LOT-B',
      lotName: 'Lot B (East)',
      instructions: 'No active booking found. Drive to Lot B (General Admission).'
    };
  },

  getOccupancy(parkingLotsState: any) {
    return Object.values(parkingLotsState).map((lot: any) => {
      const remaining = lot.capacity - lot.occupied;
      const pct = (lot.occupied / lot.capacity) * 100;
      let status = 'available';
      if (pct > 95) status = 'critical';
      else if (pct > 80) status = 'near-full';
      return {
        ...lot,
        pct: Math.round(pct),
        remaining,
        status
      };
    });
  }
};

// ── FOOD CONCESSIONS SUB-MODULE ──
export interface FoodOrder {
  id: string;
  fanId: string;
  standId: string;
  standName: string;
  items: Record<string, number>;
  status: 'preparing' | 'completed' | 'collected';
  prepTimeMinutes: number;
  placedAt: number;
}

export const foodModule = {
  calculatePrepTime(standId: string, standsState: Record<string, Concession>): number {
    const stand = standsState[standId];
    if (!stand) return 5;
    return stand.queueLength * 1.5 + 3;
  },

  placeConcessionOrder(
    fanId: string,
    standId: string,
    items: Record<string, number>,
    standsState: Record<string, Concession>
  ): { success: boolean; error?: string; order?: FoodOrder } {
    const stand = standsState[standId];
    if (!stand) return { success: false, error: 'Stand location not found.' };

    for (const [item, qty] of Object.entries(items)) {
      const stock = stand.stock[item] || 0;
      if (stock < qty) {
        return { success: false, error: `Sorry, ${item} is currently out of stock at ${stand.name}.` };
      }
    }

    const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const prepTime = this.calculatePrepTime(standId, standsState);

    return {
      success: true,
      order: {
        id: orderId,
        fanId,
        standId,
        standName: stand.name,
        items,
        status: 'preparing',
        prepTimeMinutes: Math.round(prepTime),
        placedAt: Date.now()
      }
    };
  }
};

// ── TRANSPORT SUB-MODULE ──
export const transportModule = {
  getTransitStatus(transportState: Record<string, Transit>) {
    return Object.values(transportState).map(route => {
      let warning = '';
      if (route.crowdLevel === 'high') {
        warning = 'High rider density. Expect 2-3 train delay cycles.';
      } else if (route.status === 'surging') {
        warning = 'Rideshare surge pricing active ($30+ premiums).';
      }
      return {
        ...route,
        warning
      };
    });
  }
};

// ── SECURITY SUB-MODULE ──
export const securityModule = {
  createIncidentReport(nodeId: string, category: Incident['type'], desc?: string): Incident {
    const timestamp = Date.now();
    const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: incidentId,
      type: category,
      severity: category === 'security' || category === 'fire' || category === 'lost-child' ? 'high' : 'low',
      location: `Section ${nodeId.replace('Sec', '')}`,
      nodeId,
      description: desc || `${category.toUpperCase()} incident registered at Section ${nodeId.replace('Sec', '')}.`,
      localizedDescription: desc ? null : `Incidente de tipo ${category} registrado en la Sección ${nodeId.replace('Sec', '')}.`,
      status: 'active',
      detectedBy: 'Staff Tablet Trigger',
      assignedVolunteerId: null,
      timestamp,
      lastUpdated: timestamp
    };
  },

  searchLostRegistry(searchTerm: string, lostItemsState: any[]) {
    const query = searchTerm.toLowerCase();
    return lostItemsState.filter(item =>
      item.description.toLowerCase().includes(query) ||
      item.foundLocation.toLowerCase().includes(query)
    );
  }
};
