/**
 * StadiumOSContext.tsx — Shared Stadium OS Context Provider
 *
 * Implements in-browser reactive database state, simulated event claiming,
 * retry loops, and emergency approval expirations using local state & localStorage.
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Ticket,
  Incident,
  Volunteer,
  Concession,
  Transit,
  Alert,
  AgentEvent,
  AgentLog,
  SustainabilityMetrics,
  initialUsers,
  initialTickets,
  initialIncidents,
  initialVolunteers,
  initialDensityMap,
  initialConcessions,
  initialTransit,
  initialSustainability,
  initialAlerts,
  INITIAL_AGENT_LOGS,
  initialParkingLots,
  OCCUPANCY_TEXT
} from '../mockData';
import { processLocalEvent } from '../agents/agents';
import { translateText } from '../agents/translationAgent';

export interface StadiumOSContextType {
  // Database States
  users: Record<string, User>;
  tickets: Record<string, Ticket>;
  incidents: Incident[];
  volunteers: Volunteer[];
  concessions: Record<string, Concession>;
  transit: Record<string, Transit>;
  alerts: Alert[];
  agentEvents: AgentEvent[];
  agentLogs: AgentLog[];
  sustainability: SustainabilityMetrics;
  densityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'>;
  parkingLots: typeof initialParkingLots;

  // Configuration States
  activeUser: User;
  stepFree: boolean;
  setStepFree: (val: boolean) => void;
  preferredLanguage: string;
  setPreferredLanguage: (lang: string) => void;
  highlightedPath: string[];
  setHighlightedPath: (path: string[]) => void;
  demoState: string;
  setDemoState: (state: string) => void;

  // Actions
  addEvent: (eventType: string, payload: Record<string, any>, source: string, target: string, priority?: 'low' | 'medium' | 'high' | 'critical', correlationId?: string) => string;
  addAgentLog: (from: string, to: string, action: string, severity?: 'info' | 'warning' | 'error' | 'critical', correlationId?: string) => void;
  addAlert: (alert: Omit<Alert, 'timestamp' | 'lastUpdated'>) => void;
  resolveIncident: (incidentId: string, volunteerId: string) => void;
  approveCriticalAction: (eventId: string) => void;
  rejectCriticalAction: (eventId: string) => void;
  resetDemo: () => void;
}

const StadiumOSContext = createContext<StadiumOSContextType | undefined>(undefined);

let isWorkerProcessing = false;

export function StadiumOSProvider({ children }: { children: React.ReactNode }) {
  // --- IN-MEMORY AND LOCALSTORAGE STATES ---
  const [users, setUsers] = useState<Record<string, User>>(initialUsers);
  const [tickets, setTickets] = useState<Record<string, Ticket>>(initialTickets);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers);
  const [concessions, setConcessions] = useState<Record<string, Concession>>(initialConcessions);
  const [transit, setTransit] = useState<Record<string, Transit>>(initialTransit);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>(INITIAL_AGENT_LOGS);
  const [sustainability, setSustainability] = useState<SustainabilityMetrics>(initialSustainability);
  const [densityMap] = useState<Record<string, 'low' | 'medium' | 'high' | 'critical'>>(initialDensityMap);
  const [parkingLots] = useState(initialParkingLots);
  const [stepFree, setStepFreeState] = useState<boolean>(false);
  const [preferredLanguage, setPreferredLanguageState] = useState<string>('en');

  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [demoState, setDemoState] = useState<string>('ready');
  const [isLoaded, setIsLoaded] = useState(false);

  const activeUser = users['USR-001'] || initialUsers['USR-001'];

  // --- CLIENT-SIDE LOCALSTORAGE HYDRATION ---
  useEffect(() => {
    const storedUsers = localStorage.getItem('stadium_users');
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    
    const storedTickets = localStorage.getItem('stadium_tickets');
    if (storedTickets) setTickets(JSON.parse(storedTickets));
    
    const storedIncidents = localStorage.getItem('stadium_incidents');
    if (storedIncidents) setIncidents(JSON.parse(storedIncidents));
    
    const storedVolunteers = localStorage.getItem('stadium_volunteers');
    if (storedVolunteers) setVolunteers(JSON.parse(storedVolunteers));
    
    const storedConcessions = localStorage.getItem('stadium_concessions');
    if (storedConcessions) setConcessions(JSON.parse(storedConcessions));
    
    const storedTransit = localStorage.getItem('stadium_transit');
    if (storedTransit) setTransit(JSON.parse(storedTransit));
    
    const storedAlerts = localStorage.getItem('stadium_alerts');
    if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
    
    const storedEvents = localStorage.getItem('stadium_events');
    if (storedEvents) setAgentEvents(JSON.parse(storedEvents));
    
    const storedLogs = localStorage.getItem('stadium_logs');
    if (storedLogs) setAgentLogs(JSON.parse(storedLogs));
    
    const storedSustainability = localStorage.getItem('stadium_sustainability');
    if (storedSustainability) setSustainability(JSON.parse(storedSustainability));
    
    const storedLang = localStorage.getItem('stadium_lang');
    if (storedLang) setPreferredLanguageState(storedLang);
    
    const storedStepFree = localStorage.getItem('stadium_stepfree');
    if (storedStepFree) setStepFreeState(storedStepFree === 'true');

    setIsLoaded(true);
  }, []);

  // --- CROSS-TAB SYNCHRONIZATION ---
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      try {
        if (e.key === 'stadium_users' && e.newValue) setUsers(JSON.parse(e.newValue));
        if (e.key === 'stadium_tickets' && e.newValue) setTickets(JSON.parse(e.newValue));
        if (e.key === 'stadium_incidents' && e.newValue) setIncidents(JSON.parse(e.newValue));
        if (e.key === 'stadium_volunteers' && e.newValue) setVolunteers(JSON.parse(e.newValue));
        if (e.key === 'stadium_concessions' && e.newValue) setConcessions(JSON.parse(e.newValue));
        if (e.key === 'stadium_transit' && e.newValue) setTransit(JSON.parse(e.newValue));
        if (e.key === 'stadium_alerts' && e.newValue) setAlerts(JSON.parse(e.newValue));
        if (e.key === 'stadium_events' && e.newValue) setAgentEvents(JSON.parse(e.newValue));
        if (e.key === 'stadium_logs' && e.newValue) setAgentLogs(JSON.parse(e.newValue));
        if (e.key === 'stadium_sustainability' && e.newValue) setSustainability(JSON.parse(e.newValue));
        if (e.key === 'stadium_lang' && e.newValue) setPreferredLanguageState(e.newValue);
        if (e.key === 'stadium_stepfree' && e.newValue) setStepFreeState(e.newValue === 'true');
      } catch (err) {
        console.error('Error parsing cross-tab storage sync:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- PERSISTENCE SYNCHRONIZER ---
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('stadium_users', JSON.stringify(users));
    localStorage.setItem('stadium_tickets', JSON.stringify(tickets));
    localStorage.setItem('stadium_incidents', JSON.stringify(incidents));
    localStorage.setItem('stadium_volunteers', JSON.stringify(volunteers));
    localStorage.setItem('stadium_concessions', JSON.stringify(concessions));
    localStorage.setItem('stadium_transit', JSON.stringify(transit));
    localStorage.setItem('stadium_alerts', JSON.stringify(alerts));
    localStorage.setItem('stadium_events', JSON.stringify(agentEvents));
    localStorage.setItem('stadium_logs', JSON.stringify(agentLogs));
    localStorage.setItem('stadium_sustainability', JSON.stringify(sustainability));
    localStorage.setItem('stadium_lang', preferredLanguage);
    localStorage.setItem('stadium_stepfree', String(stepFree));
  }, [isLoaded, users, tickets, incidents, volunteers, concessions, transit, alerts, agentEvents, agentLogs, sustainability, preferredLanguage, stepFree]);

  const setStepFree = (val: boolean) => {
    setStepFreeState(val);
    setUsers(prev => ({
      ...prev,
      'USR-001': {
        ...prev['USR-001'],
        accessibilityProfile: val,
        lastUpdated: Date.now()
      }
    }));
  };

  const setPreferredLanguage = (lang: string) => {
    setPreferredLanguageState(lang);
    setUsers(prev => ({
      ...prev,
      'USR-001': {
        ...prev['USR-001'],
        preferredLanguage: lang,
        lastUpdated: Date.now()
      }
    }));
  };

  // --- HELPER WRITERS ---
  const addAgentLog = (
    fromAgent: string,
    toAgent: string,
    action: string,
    severity: AgentLog['severity'] = 'info',
    correlationId = 'corr-general'
  ) => {
    const newLog: AgentLog = {
      id: `LOG-${Math.random().toString(36).substr(2, 9)}`,
      correlationId,
      fromAgent,
      toAgent,
      action,
      localizedAction: translateText(action, 'en', preferredLanguage),
      severity,
      timestamp: Date.now()
    };
    setAgentLogs(prev => [...prev, newLog]);
  };

  const addEvent = (
    eventType: string,
    payload: Record<string, any>,
    sourceAgent: string,
    targetAgent: string,
    priority: AgentEvent['priority'] = 'medium',
    correlationId = `corr-${Math.random().toString(36).substr(2, 9)}`
  ): string => {
    const eventId = `EVT-${Math.random().toString(36).substr(2, 9)}`;
    const idempotencyKey = `idemp-${eventType}-${correlationId}`;

    // Prevent duplicate triggers (Idempotency check)
    if (agentEvents.some(e => e.idempotencyKey === idempotencyKey && e.status !== 'failed')) {
      return agentEvents.find(e => e.idempotencyKey === idempotencyKey)!.eventId;
    }

    const newEvent: AgentEvent = {
      eventId,
      correlationId,
      parentEventId: null,
      eventType,
      sourceAgent,
      targetAgent,
      status: 'queued',
      priority,
      payload,
      workerId: null,
      leaseExpiresAt: null,
      startedAt: null,
      completedAt: null,
      deadLetteredAt: null,
      idempotencyKey,
      retryCount: 0,
      maxRetries: 3,
      errorMessage: null,
      scheduledRetryAt: null,
      result: null,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };

    setAgentEvents(prev => [...prev, newEvent]);
    addAgentLog('Event Bus', sourceAgent, `Queued new event: "${eventType}" [Priority: ${priority}]`, 'info', correlationId);
    return eventId;
  };

  const addAlert = (alertDetails: Omit<Alert, 'timestamp' | 'lastUpdated'>) => {
    const newAlert: Alert = {
      ...alertDetails,
      timestamp: Date.now(),
      lastUpdated: Date.now()
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const resolveIncident = (incidentId: string, volunteerId: string) => {
    const correlationId = `corr-resolve-${Math.random().toString(36).substr(2, 9)}`;
    
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: 'resolved' as const, lastUpdated: Date.now() } : inc));
    setVolunteers(prev => prev.map(v => v.id === volunteerId ? { ...v, status: 'available' as const, task: null, lastUpdated: Date.now() } : v));
    setHighlightedPath([]);
    setDemoState('ready');

    addAgentLog('Volunteer App', 'Command Center', `Incident ${incidentId} resolved by Volunteer ${volunteerId}.`, 'info', correlationId);
  };

  // --- MANUAL EMERGENCY ACTION GATES ---
  const approveCriticalAction = (eventId: string) => {
    const correlationId = `corr-approval-${Math.random().toString(36).substr(2, 9)}`;
    setAgentEvents(prev => prev.map(e => e.eventId === eventId ? {
      ...e,
      status: 'completed',
      completedAt: Date.now(),
      lastUpdated: Date.now(),
      result: { approved: true }
    } : e));

    const event = agentEvents.find(e => e.eventId === eventId);
    if (event) {
      addAgentLog('Operations Command', 'Emergency Agent', `CRITICAL ACTION APPROVED: ${event.payload.actionType}. Dispatching sirens / warning banners.`, 'critical', correlationId);
      
      // Trigger a visual warning alert
      addAlert({
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'evacuation',
        title: 'STADIUM EVACUATION ORDER',
        localizedTitle: { es: 'ORDEN DE EVACUACIÓN', ar: 'أمر إخلاء الملعب' },
        message: 'A critical alarm has sounded. Evacuate the sector immediately.',
        localizedMessage: {
          es: 'Se ha activado una alarma crítica. Evacue el sector de inmediato.',
          ar: 'تم إطلاق إنذار حرج. يرجى إخلاء القطاع فورا.'
        },
        targetUsers: [{ type: 'all' }],
        priority: 'critical',
        status: 'active'
      });
    }
  };

  const rejectCriticalAction = (eventId: string) => {
    const correlationId = `corr-reject-${Math.random().toString(36).substr(2, 9)}`;
    setAgentEvents(prev => prev.map(e => e.eventId === eventId ? {
      ...e,
      status: 'aborted',
      completedAt: Date.now(),
      lastUpdated: Date.now(),
      errorMessage: 'Action rejected by Human Administrator.'
    } : e));

    const event = agentEvents.find(e => e.eventId === eventId);
    if (event) {
      addAgentLog('Operations Command', 'Emergency Agent', `CRITICAL ACTION ABORTED: ${event.payload.actionType} rejected by Human Command.`, 'warning', correlationId);
    }
  };

  // --- EVENT LOOP CLAIMS SIMULATOR ---
  useEffect(() => {
    const queuedEvents = agentEvents.filter(e => e.status === 'queued' && (!e.scheduledRetryAt || e.scheduledRetryAt <= Date.now()));
    if (queuedEvents.length === 0 || isWorkerProcessing) return;

    const eventToProcess = queuedEvents[0];
    isWorkerProcessing = true;

    // Transition event to processing
    setAgentEvents(prev => prev.map(e => e.eventId === eventToProcess.eventId ? {
      ...e,
      status: 'processing',
      workerId: 'worker-sim-1',
      startedAt: Date.now(),
      leaseExpiresAt: Date.now() + 30000,
      lastUpdated: Date.now()
    } : e));

    addAgentLog('Event Bus', 'Simulated Worker', `Simulated claiming task: "${eventToProcess.eventType}" [Lease locked]`, 'info', eventToProcess.correlationId);

    // Run agent execution loop
    processLocalEvent(eventToProcess, {
      volunteers,
      setVolunteers,
      incidents,
      setIncidents,
      concessions,
      transit,
      agentLogs,
      setAgentLogs,
      highlightedPath,
      setHighlightedPath,
      stepFree,
      setEvents: setAgentEvents,
      addAlert
    })
      .then(result => {
        // Resolve successfully
        setAgentEvents(prev => prev.map(e => e.eventId === eventToProcess.eventId ? {
          ...e,
          status: 'completed',
          completedAt: Date.now(),
          lastUpdated: Date.now(),
          result
        } : e));

        addAgentLog(
          eventToProcess.targetAgent,
          eventToProcess.sourceAgent,
          `Event "${eventToProcess.eventType}" successfully completed. Result resolved.`,
          'info',
          eventToProcess.correlationId
        );
        isWorkerProcessing = false;
      })
      .catch((error: any) => {
        // Handle failure retry backoff / Dead Letter Queue (DLQ)
        const nextRetryCount = eventToProcess.retryCount + 1;
        const failed = nextRetryCount > eventToProcess.maxRetries;

        setAgentEvents(prev => prev.map(e => e.eventId === eventToProcess.eventId ? {
          ...e,
          status: failed ? 'failed' : 'queued',
          retryCount: nextRetryCount,
          errorMessage: error.message || 'Worker processing error',
          deadLetteredAt: failed ? Date.now() : null,
          scheduledRetryAt: failed ? null : Date.now() + Math.pow(1.5, nextRetryCount) * 5000,
          lastUpdated: Date.now()
        } : e));

        if (failed) {
          addAgentLog(
            eventToProcess.targetAgent,
            'DLQ Terminal',
            `CRITICAL: Event "${eventToProcess.eventType}" exhausted all retries. Routed to DLQ.`,
            'critical',
            eventToProcess.correlationId
          );
        } else {
          addAgentLog(
            eventToProcess.targetAgent,
            'Event Bus',
            `Error in event "${eventToProcess.eventType}". Scheduling retry #${nextRetryCount} with exponential backoff.`,
            'warning',
            eventToProcess.correlationId
          );
        }
        isWorkerProcessing = false;
      });
  }, [agentEvents]);

  // --- RESET DEMO ACTION ---
  const resetDemo = () => {
    localStorage.clear();
    setUsers(initialUsers);
    setTickets(initialTickets);
    setIncidents(initialIncidents);
    setVolunteers(initialVolunteers);
    setConcessions(initialConcessions);
    setTransit(initialTransit);
    setAlerts(initialAlerts);
    setAgentEvents([]);
    setAgentLogs(INITIAL_AGENT_LOGS);
    setSustainability(initialSustainability);
    setPreferredLanguageState('en');
    setStepFreeState(false);
    setHighlightedPath([]);
    setDemoState('ready');
    isWorkerProcessing = false;
  };

  return (
    <StadiumOSContext.Provider value={{
      users,
      tickets,
      incidents,
      volunteers,
      concessions,
      transit,
      alerts,
      agentEvents,
      agentLogs,
      sustainability,
      densityMap,
      parkingLots,
      activeUser,
      stepFree,
      setStepFree,
      preferredLanguage,
      setPreferredLanguage,
      highlightedPath,
      setHighlightedPath,
      demoState,
      setDemoState,
      addEvent,
      addAgentLog,
      addAlert,
      resolveIncident,
      approveCriticalAction,
      rejectCriticalAction,
      resetDemo
    }}>
      {children}
    </StadiumOSContext.Provider>
  );
}

export function useStadiumOS() {
  const context = useContext(StadiumOSContext);
  if (context === undefined) {
    throw new Error('useStadiumOS must be used within a StadiumOSProvider');
  }
  return context;
}
