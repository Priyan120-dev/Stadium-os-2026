/**
 * stadiumService.ts — Service for Concessions and Parking Operations
 */
import { Concession, Transit } from '../types';

export const stadiumService = {
  /**
   * Calculate queue wait times based on number of active orders
   */
  calculatePrepTime(standId: string, standsState: Record<string, Concession>): number {
    const stand = standsState[standId];
    if (!stand) return 5;
    return stand.queueLength * 1.5 + 3;
  },

  /**
   * Evaluate concessions ordering and stock availability
   */
  placeConcessionOrder(
    fanId: string,
    standId: string,
    items: Record<string, number>,
    standsState: Record<string, Concession>
  ) {
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
        status: 'preparing' as const,
        prepTimeMinutes: Math.round(prepTime),
        placedAt: Date.now()
      }
    };
  },

  /**
   * Look up vehicle registration bookings
   */
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

  /**
   * Process transit warnings based on crowd congestion
   */
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
