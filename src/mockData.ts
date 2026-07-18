/**
 * mockData.ts — Stadium OS Simulated Shared Data Store
 *
 * Implements in-browser reactive database structures mimicking Firestore's
 * Timestamp, collections, and synchronization fields (createdAt, lastUpdated).
 */

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  static now(): Timestamp {
    const ms = Date.now();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }

  static fromDate(date: Date): Timestamp {
    const ms = date.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000));
  }

  toISOString(): string {
    return this.toDate().toISOString();
  }

  toLocaleTimeString(locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string {
    return this.toDate().toLocaleTimeString(locales, options);
  }
}

export const serverTimestamp = () => Timestamp.now();

// ---------------------------------------------------------------------------
// STADIUM SPECIFICATIONS
// ---------------------------------------------------------------------------
export const VENUE_CAPACITY = 80000;
export const CURRENT_OCCUPANCY = 76422; // 95.53%
export const OCCUPANCY_TEXT = "76,422 / 80,000 (95.5%)";

// ---------------------------------------------------------------------------
// STADIUM FLOOR MAP — Node Graph
// Used by Navigation Agent (Dijkstra pathfinding) and StadiumMap SVG renderer
// ---------------------------------------------------------------------------

export interface StadiumNode {
  x: number;
  y: number;
  label: string;
  type: 'gate' | 'section' | 'food' | 'restroom' | 'medical' | 'aed' | 'exit';
  zone: string;
}

export const stadiumNodes: Record<string, StadiumNode> = {
  // ── Gates (compass points) ──────────────────────────────────────────────
  GateA: { x: 400, y: 26,  label: 'Gate A', type: 'gate', zone: 'north' },
  GateB: { x: 756, y: 285, label: 'Gate B', type: 'gate', zone: 'east'  },
  GateC: { x: 400, y: 544, label: 'Gate C', type: 'gate', zone: 'south' },
  GateD: { x: 44,  y: 285, label: 'Gate D', type: 'gate', zone: 'west'  },

  // ── Sections 101–120 (clockwise from north) ──────────────────────────────
  Sec101: { x: 400, y: 72,  label: '§101', type: 'section', zone: 'north'      },
  Sec102: { x: 490, y: 84,  label: '§102', type: 'section', zone: 'north-east' },
  Sec103: { x: 574, y: 118, label: '§103', type: 'section', zone: 'north-east' },
  Sec104: { x: 644, y: 174, label: '§104', type: 'section', zone: 'east'       },
  Sec105: { x: 694, y: 248, label: '§105', type: 'section', zone: 'east'       },
  Sec106: { x: 712, y: 325, label: '§106', type: 'section', zone: 'east'       },
  Sec107: { x: 668, y: 400, label: '§107', type: 'section', zone: 'south-east' },
  Sec108: { x: 598, y: 456, label: '§108', type: 'section', zone: 'south-east' },
  Sec109: { x: 506, y: 496, label: '§109', type: 'section', zone: 'south'      },
  Sec110: { x: 400, y: 512, label: '§110', type: 'section', zone: 'south'      },
  Sec111: { x: 294, y: 496, label: '§111', type: 'section', zone: 'south'      },
  Sec112: { x: 202, y: 456, label: '§112', type: 'section', zone: 'south-west' },
  Sec113: { x: 132, y: 400, label: '§113', type: 'section', zone: 'west'       },
  Sec114: { x: 88,  y: 325, label: '§114', type: 'section', zone: 'west'       },
  Sec115: { x: 106, y: 248, label: '§115', type: 'section', zone: 'west'       },
  Sec116: { x: 156, y: 174, label: '§116', type: 'section', zone: 'north-west' },
  Sec117: { x: 226, y: 118, label: '§117', type: 'section', zone: 'north-west' },
  Sec118: { x: 310, y: 84,  label: '§118', type: 'section', zone: 'north'      },
  Sec119: { x: 454, y: 74,  label: '§119', type: 'section', zone: 'north'      },
  Sec120: { x: 346, y: 74,  label: '§120', type: 'section', zone: 'north'      },

  // ── Food Courts ──────────────────────────────────────────────────────────
  F1: { x: 618, y: 142, label: 'Food F1', type: 'food', zone: 'north-east' },
  F2: { x: 638, y: 430, label: 'Food F2', type: 'food', zone: 'south-east' },
  F3: { x: 162, y: 430, label: 'Food F3', type: 'food', zone: 'south-west' },
  F4: { x: 182, y: 142, label: 'Food F4', type: 'food', zone: 'north-west' },

  // ── Restrooms ─────────────────────────────────────────────────────────────
  R1: { x: 344, y: 52,  label: 'WC R1', type: 'restroom', zone: 'north'      },
  R2: { x: 538, y: 82,  label: 'WC R2', type: 'restroom', zone: 'north-east' },
  R3: { x: 732, y: 224, label: 'WC R3', type: 'restroom', zone: 'east'       },
  R4: { x: 702, y: 374, label: 'WC R4', type: 'restroom', zone: 'east'       },
  R5: { x: 522, y: 520, label: 'WC R5', type: 'restroom', zone: 'south'      },
  R6: { x: 278, y: 520, label: 'WC R6', type: 'restroom', zone: 'south'      },
  R7: { x: 98,  y: 374, label: 'WC R7', type: 'restroom', zone: 'west'       },
  R8: { x: 68,  y: 224, label: 'WC R8', type: 'restroom', zone: 'west'       },

  // ── Medical Tents ─────────────────────────────────────────────────────────
  M1: { x: 400, y: 158, label: 'Medical M1', type: 'medical', zone: 'north-inner' },
  M2: { x: 400, y: 416, label: 'Medical M2', type: 'medical', zone: 'south-inner' },

  // ── AED Stations ─────────────────────────────────────────────────────────
  AED1: { x: 440, y: 50,  label: 'AED 1', type: 'aed', zone: 'north'  },
  AED2: { x: 748, y: 285, label: 'AED 2', type: 'aed', zone: 'east'   },
  AED3: { x: 440, y: 528, label: 'AED 3', type: 'aed', zone: 'south'  },
  AED4: { x: 52,  y: 285, label: 'AED 4', type: 'aed', zone: 'west'   },
  AED5: { x: 400, y: 285, label: 'AED 5', type: 'aed', zone: 'center' },

  // ── Emergency Exits ──────────────────────────────────────────────────────
  E1: { x: 604, y: 68,  label: 'Exit E1', type: 'exit', zone: 'north-east' },
  E2: { x: 718, y: 458, label: 'Exit E2', type: 'exit', zone: 'south-east' },
  E3: { x: 188, y: 504, label: 'Exit E3', type: 'exit', zone: 'south-west' },
  E4: { x: 82,  y: 128, label: 'Exit E4', type: 'exit', zone: 'north-west' },
};

export const stadiumGraph: Record<string, Record<string, number>> = {
  GateA: { Sec101: 1, Sec118: 1, Sec120: 1, R1: 1, AED1: 1, M1: 2 },
  GateB: { Sec105: 1, Sec106: 1, R3: 1, AED2: 1, F1: 2, F2: 2 },
  GateC: { Sec110: 1, Sec111: 1, R5: 1, AED3: 1, M2: 2 },
  GateD: { Sec114: 1, Sec115: 1, R7: 1, AED4: 1, F3: 2, F4: 2 },

  Sec101: { GateA: 1, Sec102: 1, Sec120: 1, F1: 3 },
  Sec102: { Sec101: 1, Sec103: 1, R2: 1 },
  Sec103: { Sec102: 1, Sec104: 1, F1: 1, E1: 2 },
  Sec104: { Sec103: 1, Sec105: 1 },
  Sec105: { Sec104: 1, GateB: 1, R3: 1 },
  Sec106: { GateB: 1, Sec107: 1, F2: 1 },
  Sec107: { Sec106: 1, Sec108: 1, R4: 1, E2: 2 },
  Sec108: { Sec107: 1, Sec109: 1 },
  Sec109: { Sec108: 1, Sec110: 1, R5: 1 },
  Sec110: { Sec109: 1, GateC: 1, M2: 3 },
  Sec111: { GateC: 1, Sec112: 1, R6: 1 },
  Sec112: { Sec111: 1, Sec113: 1, F3: 1, E3: 2 },
  Sec113: { Sec112: 1, Sec114: 1 },
  Sec114: { Sec113: 1, GateD: 1, R7: 1 },
  Sec115: { GateD: 1, Sec116: 1, R8: 1, E4: 2 },
  Sec116: { Sec115: 1, Sec117: 1, F4: 1 },
  Sec117: { Sec116: 1, Sec118: 1 },
  Sec118: { Sec117: 1, GateA: 1, Sec119: 1 },
  Sec119: { Sec118: 1, Sec101: 1 },
  Sec120: { GateA: 1, Sec101: 1 },

  F1: { Sec103: 1, R2: 1, E1: 1, M1: 3 },
  F2: { Sec106: 1, R4: 1, E2: 1 },
  F3: { Sec112: 1, R6: 1, E3: 1 },
  F4: { Sec116: 1, R8: 1, E4: 1 },

  R1: { GateA: 1, AED1: 1 },
  R2: { Sec102: 1, F1: 1 },
  R3: { Sec105: 1, GateB: 1, AED2: 1 },
  R4: { Sec107: 1, F2: 1 },
  R5: { Sec109: 1, GateC: 1, AED3: 1 },
  R6: { Sec111: 1, F3: 1 },
  R7: { Sec114: 1, GateD: 1, AED4: 1 },
  R8: { Sec116: 1, F4: 1 },

  M1: { GateA: 2, AED5: 1, F1: 3, F4: 4 },
  M2: { GateC: 2, AED3: 2, AED5: 1 },

  AED1: { R1: 1, GateA: 1 },
  AED2: { R3: 1, GateB: 1 },
  AED3: { R5: 1, M2: 2 },
  AED4: { R7: 1, GateD: 1 },
  AED5: { M1: 1, M2: 1 },

  E1: { Sec103: 2, F1: 1 },
  E2: { Sec107: 2, F2: 1 },
  E3: { Sec112: 2, F3: 1 },
  E4: { Sec115: 2, F4: 1 },
};

// ---------------------------------------------------------------------------
// DATA MODEL TYPES
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  preferredLanguage: string;
  fallbackLanguage: 'en';
  ticketId: string;
  accessibilityProfile: boolean;
  role: 'fan' | 'volunteer' | 'admin' | 'supervisor';
  lastUpdated: number;
}

export interface Ticket {
  id: string;
  fanId: string;
  seat: string;
  seatNode: string;
  gate: string;
  status: 'valid' | 'validated' | 'flagged';
  validatedAt: number | null;
  lastUpdated: number;
}

export interface Incident {
  id: string;
  type: 'crowd' | 'medical' | 'fire' | 'lost-child' | 'security' | 'cleanup';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  nodeId: string;
  description: string;
  localizedDescription: string | null;
  status: 'active' | 'en-route' | 'resolved';
  detectedBy: string;
  assignedVolunteerId: string | null;
  timestamp: number;
  lastUpdated: number;
}

export interface Volunteer {
  id: string;
  name: string;
  initials: string;
  zone: string;
  nodeId: string;
  status: 'available' | 'busy' | 'off-duty';
  skills: string[];
  task: {
    id: string;
    description: string;
    nodeId: string;
    severity: string;
  } | null;
  lastUpdated: number;
}

export interface Concession {
  id: string;
  location: string;
  name: string;
  queueLength: number;
  waitMin: number;
  stock: Record<string, number>;
  lastUpdated: number;
}

export interface Transit {
  id: string;
  type: 'train' | 'shuttle' | 'rideshare';
  route: string;
  eta: string;
  crowdLevel: 'low' | 'medium' | 'high';
  status: string;
  lastUpdated: number;
}

export interface Alert {
  id: string;
  type: 'amber-alert' | 'weather' | 'evacuation' | 'gate-divert';
  title: string;
  localizedTitle: Record<string, string>;
  message: string;
  localizedMessage: Record<string, string>;
  targetUsers: { type: 'all' | 'role' | 'userId' | 'zone' | 'accessibility'; value?: string }[];
  priority: 'low' | 'high' | 'critical';
  timestamp: number;
  status: 'active' | 'cleared';
  lastUpdated: number;
}

export interface AgentEvent {
  eventId: string;
  correlationId: string;
  parentEventId: string | null;
  eventType: string;
  sourceAgent: string;
  targetAgent: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'aborted';
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: Record<string, any>;
  workerId: string | null;
  leaseExpiresAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
  deadLetteredAt: number | null;
  idempotencyKey: string;
  retryCount: number;
  maxRetries: number;
  errorMessage: string | null;
  scheduledRetryAt: number | null;
  result: Record<string, any> | null;
  createdAt: number;
  lastUpdated: number;
}

export interface AgentLog {
  id: string;
  correlationId: string;
  fromAgent: string;
  toAgent: string;
  action: string;
  localizedAction: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
}

export interface SustainabilityMetrics {
  id: string;
  carbonKg: number;
  electricityKw: number;
  waterLitres: number;
  wasteKg: number;
  greenScore: number;
  lastUpdated: number;
}

// ---------------------------------------------------------------------------
// INITIAL IN-MEMORY COLLECTIONS (INITIAL STATE FOR DEMO HEARTBEAT & RESET)
// ---------------------------------------------------------------------------

export const initialUsers: Record<string, User> = {
  'USR-001': {
    id: 'USR-001',
    name: 'Mateo García',
    preferredLanguage: 'es',
    fallbackLanguage: 'en',
    ticketId: 'TKT-001',
    accessibilityProfile: false,
    role: 'fan',
    lastUpdated: Date.now()
  }
};

export const initialTickets: Record<string, Ticket> = {
  'TKT-001': {
    id: 'TKT-001',
    fanId: 'USR-001',
    seat: '104-G',
    seatNode: 'Sec104',
    gate: 'GateA',
    status: 'valid',
    validatedAt: null,
    lastUpdated: Date.now()
  }
};

export const initialIncidents: Incident[] = [
  {
    id: 'INC-001',
    type: 'crowd',
    severity: 'high',
    location: 'Gate A',
    nodeId: 'GateA',
    description: 'Gate A is critical (28 min queue). Recomended diversion active.',
    localizedDescription: 'La Puerta A está en congestión crítica (espera de 28 min). Desvío activo.',
    status: 'active',
    detectedBy: 'Crowd Intelligence Agent',
    assignedVolunteerId: null,
    timestamp: Date.now() - 480000,
    lastUpdated: Date.now() - 480000
  },
  {
    id: 'INC-002',
    type: 'cleanup',
    severity: 'low',
    location: 'Restroom R3',
    nodeId: 'R3',
    description: 'Cleanup required at Restroom R3.',
    localizedDescription: 'Limpieza solicitada en el baño R3.',
    status: 'active',
    detectedBy: 'Fan Experience Agent',
    assignedVolunteerId: null,
    timestamp: Date.now() - 180000,
    lastUpdated: Date.now() - 180000
  }
];

export const initialVolunteers: Volunteer[] = [
  {
    id: 'VOL-001',
    name: 'Sarah Chen',
    initials: 'SC',
    zone: 'north',
    nodeId: 'F1',
    status: 'available',
    skills: ['first-aid', 'spanish', 'accessibility'],
    task: null,
    lastUpdated: Date.now()
  },
  {
    id: 'VOL-002',
    name: 'Ahmed Al-Rashid',
    initials: 'AA',
    zone: 'east',
    nodeId: 'GateB',
    status: 'available',
    skills: ['arabic', 'crowd-management'],
    task: null,
    lastUpdated: Date.now()
  },
  {
    id: 'VOL-003',
    name: 'Elena Vasquez',
    initials: 'EV',
    zone: 'south',
    nodeId: 'Sec110',
    status: 'available',
    skills: ['portuguese', 'spanish', 'medical-support'],
    task: null,
    lastUpdated: Date.now()
  }
];

export const initialDensityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  GateA: 'critical',
  GateB: 'low',
  GateC: 'medium',
  GateD: 'low',
  Sec101: 'high',
  Sec102: 'medium',
  Sec103: 'low',
  Sec104: 'low',
  Sec105: 'low',
  Sec106: 'medium',
  Sec107: 'medium',
  Sec108: 'medium',
  Sec109: 'high',
  Sec110: 'high',
  Sec111: 'medium',
  Sec112: 'low',
  Sec113: 'low',
  Sec114: 'low',
  Sec115: 'low',
  Sec116: 'medium',
  Sec117: 'medium',
  Sec118: 'medium',
  Sec119: 'medium',
  Sec120: 'medium',
};

export const initialConcessions: Record<string, Concession> = {
  'STAND-F1A': { id: 'STAND-F1A', location: 'F1', name: 'North Bites',  queueLength: 4,  waitMin: 6,  stock: { burger: 48, hotdog: 22, nachos: 35 }, lastUpdated: Date.now() },
  'STAND-F1B': { id: 'STAND-F1B', location: 'F1', name: 'Craft Drinks', queueLength: 2,  waitMin: 3,  stock: { beer: 80, water: 120, soda: 60 }, lastUpdated: Date.now() },
  'STAND-F2A': { id: 'STAND-F2A', location: 'F2', name: 'East Grill',   queueLength: 12, waitMin: 18, stock: { burger: 12, hotdog: 40, nachos: 28 }, lastUpdated: Date.now() },
  'STAND-F3A': { id: 'STAND-F3A', location: 'F3', name: 'South Bites',  queueLength: 8,  waitMin: 12, stock: { burger: 30, hotdog: 18, nachos: 55 }, lastUpdated: Date.now() },
  'STAND-F4A': { id: 'STAND-F4A', location: 'F4', name: 'West Grill',   queueLength: 3,  waitMin: 4,  stock: { burger: 60, hotdog: 34, nachos: 42 }, lastUpdated: Date.now() },
};

export const initialTransit: Record<string, Transit> = {
  'TRAIN-NJ': { id: 'TRAIN-NJ', type: 'train',   route: 'NJ Transit Line',      eta: '22 min', crowdLevel: 'high',   status: 'on-time', lastUpdated: Date.now() },
  'SHUTTLE-A': { id: 'SHUTTLE-A', type: 'shuttle', route: 'Lot A Shuttle',         eta: '8 min',  crowdLevel: 'medium', status: 'running', lastUpdated: Date.now() },
  'RIDESHARE': { id: 'RIDESHARE', type: 'rideshare', route: 'Rideshare Zone B3',   eta: '14 min', crowdLevel: 'high',   status: 'surging', lastUpdated: Date.now() },
};

export const initialSustainability: SustainabilityMetrics = {
  id: 'SUST-001',
  carbonKg: 2420,
  electricityKw: 1140,
  waterLitres: 4850,
  wasteKg: 320,
  greenScore: 92,
  lastUpdated: Date.now()
};

export const initialAlerts: Alert[] = [
  {
    id: 'ALT-001',
    type: 'gate-divert',
    title: 'Gate A Divert Alert',
    localizedTitle: { es: 'Alerta de desvío de la Puerta A', ar: 'تنبيه تحويل البوابة أ' },
    message: 'Gate A is heavily congested. Please enter through Gate B.',
    localizedMessage: { es: 'La Puerta A está muy congestionada. Ingrese por la Puerta B.', ar: 'البوابة أ مزدحمة للغاية. يرجى الدخول من البوابة ب.' },
    targetUsers: [{ type: 'zone', value: 'north' }],
    priority: 'high',
    timestamp: Date.now() - 300000,
    status: 'active',
    lastUpdated: Date.now()
  }
];

export const INITIAL_AGENT_LOGS: AgentLog[] = [
  {
    id: 'LOG-000',
    correlationId: 'corr-init-1',
    fromAgent: 'Command Orchestrator',
    toAgent: 'Crowd Intelligence Agent',
    action: 'Match-day monitoring activated. Stated Occupancy benchmark checked.',
    localizedAction: 'Monitoreo de día de partido activado. Capacidad y ocupación verificada.',
    severity: 'info',
    timestamp: Date.now() - 600000
  },
  {
    id: 'LOG-001',
    correlationId: 'corr-init-2',
    fromAgent: 'Crowd Intelligence Agent',
    toAgent: 'Navigation Agent',
    action: 'Gate A queue: 28 min. Parallel capability task dispatch: recommend route divert.',
    localizedAction: 'Fila en Puerta A: 28 min. Tarea en paralelo iniciada: recomendar desvío de ruta.',
    severity: 'warning',
    timestamp: Date.now() - 580000
  }
];

export const initialParkingLots = {
  'LOT-A': { id: 'LOT-A', name: 'Lot A (North)', capacity: 1200, occupied: 1140, status: 'near-full' },
  'LOT-B': { id: 'LOT-B', name: 'Lot B (East)',  capacity: 800,  occupied: 480,  status: 'available' },
  'LOT-C': { id: 'LOT-C', name: 'Lot C (South)', capacity: 900,  occupied: 720,  status: 'moderate'  },
};
