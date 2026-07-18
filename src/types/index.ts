/**
 * index.ts — Core TypeScript Interface Definitions
 */

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

export interface AgentPerformanceMetric {
  avgResponseMs: number;
  successRate: number;
  totalEventsProcessed: number;
  eventsLast5Min: number;
}

export interface AgentMetric {
  name: string;
  status: 'online' | 'busy' | 'error' | 'idle' | 'offline';
  health: number; // 0-100%
  currentTask: string | null;
  confidenceScore: number; // 0-1
  processingTimeMs: number;
  lastActiveAt: number;
  capabilities: string[];
  recentEventIds: string[];
  performance: AgentPerformanceMetric;
  color: string;
}

export type NavigationMode =
  | 'fastest'
  | 'least-crowded'
  | 'wheelchair'
  | 'vip'
  | 'emergency'
  | 'volunteer'
  | 'exit';

export interface StadiumNode {
  x: number;
  y: number;
  label: string;
  type: 'gate' | 'section' | 'food' | 'restroom' | 'medical' | 'aed' | 'exit';
  zone: string;
}

export interface GateUtilization {
  gateId: string;
  label: string;
  utilization: number;
  throughputPerHour: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface HourlyArrival {
  hour: string;
  count: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  source?: string;
  correlationId?: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  duration?: number;
}
