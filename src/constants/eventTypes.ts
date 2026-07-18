/**
 * eventTypes.ts — Typed event type constants for the Stadium OS agent event bus.
 *
 * Using a `const` object with `as const` prevents typos from raw string literals
 * and provides autocomplete throughout the codebase.
 *
 * @example
 * import { EventType } from '../constants/eventTypes';
 * addEvent(EventType.PANIC_PRESSED, payload, ...);
 */

export const EventType = {
  /** Vision Agent: OCR-validates a fan's ticket */
  TICKET_OCR: 'TICKET_OCR',

  /** Crowd Intelligence Agent: measures gate queue and congestion */
  CROWD_GATE_CHECK: 'CROWD_GATE_CHECK',

  /** Navigation Agent: Dijkstra route computation between two nodes */
  ROUTE_NAVIGATION: 'ROUTE_NAVIGATION',

  /** Emergency Agent: fan-triggered medical panic alarm */
  PANIC_PRESSED: 'PANIC_PRESSED',

  /** Vision Agent: processes lost-child photo and broadcasts Amber Alert */
  LOST_CHILD_UPLOAD: 'LOST_CHILD_UPLOAD',

  /** Volunteer Agent: dispatches nearest available volunteer to an incident */
  STAFF_DISPATCH: 'STAFF_DISPATCH',

  /** Emergency Agent: proposes a high-impact action requiring human approval */
  PROPOSE_CRITICAL_ACTION: 'PROPOSE_CRITICAL_ACTION',

  /** Analytics Agent: computes live KPI dashboard data */
  KPI_REPORT: 'KPI_REPORT',

  /** Sustainability Agent: computes environmental score metrics */
  ENERGY_AUDIT: 'ENERGY_AUDIT',
} as const;

/** Union type of all known event type strings */
export type EventTypeKey = typeof EventType[keyof typeof EventType];
