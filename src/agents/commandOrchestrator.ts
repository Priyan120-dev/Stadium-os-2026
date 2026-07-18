/**
 * commandOrchestrator.ts — Command Orchestrator Agent
 *
 * Coordinates specialized agents, parses user intent, checks capabilities,
 * and handles dual-mode simulated translation and execution pathways.
 */

import { detectLanguage, translateText } from './translationAgent';
import { AgentLog, AgentEvent, Ticket, Concession, Transit, Volunteer, Incident } from '../mockData';
import { navigationAgent } from './navigationAgent';

export interface OrchestratorContext {
  stepFree: boolean;
  tickets: Record<string, Ticket>;
  setTickets: React.Dispatch<React.SetStateAction<Record<string, Ticket>>>;
  transport: Record<string, Transit>;
  concessions: Record<string, Concession>;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  volunteers: Volunteer[];
  setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>;
  setHighlightedPath: React.Dispatch<React.SetStateAction<string[]>>;
  setDemoState: React.Dispatch<React.SetStateAction<string>>;
  agentLogs: AgentLog[];
  setAgentLogs: React.Dispatch<React.SetStateAction<AgentLog[]>>;
  addAgentLog: (from: string, to: string, action: string, severity?: 'info' | 'warning' | 'error' | 'critical', correlationId?: string) => void;
  addEvent: (eventType: string, payload: Record<string, any>, source: string, target: string, priority?: 'low' | 'medium' | 'high' | 'critical', correlationId?: string) => string;
}

export const commandOrchestrator = {
  role: 'Command Orchestrator',
  description: 'Central intent router and capability registry coordinator.',

  /**
   * Process incoming user queries by matching intent against agent capabilities.
   */
  async processQuery(text: string, context: OrchestratorContext, setMessages: any, apiConfig?: { key?: string; useGemini?: boolean }) {
    const correlationId = `corr-chat-${Math.random().toString(36).substr(2, 9)}`;
    const detectedLang = detectLanguage(text);
    let englishText = text;

    // Log language detection to the audit log
    if (detectedLang !== 'en') {
      context.addAgentLog(
        'Command Orchestrator',
        'Translation Agent',
        `Language check: "${detectedLang.toUpperCase()}" detected. Translating original message: "${text}"`,
        'info',
        correlationId
      );
      englishText = translateText(text, detectedLang, 'en');
    }

    context.addAgentLog(
      'Command Orchestrator',
      'Capability Registry',
      `Checking capability registry for query intent: "${englishText}"`,
      'info',
      correlationId
    );

    const queryLower = englishText.toLowerCase().trim();
    let responseText = '';
    let routedTo = 'Command Orchestrator';

    // 1. MATCH CAPABILITIES VIA KEYWORD INTENT REGISTRY
    if (queryLower.includes('lost') || queryLower.includes('separated') || queryLower.includes('child') || queryLower.includes('son') || queryLower.includes('hijo')) {
      // Emergency Agent: Lost Child capability
      routedTo = 'Emergency Agent';
      context.addAgentLog(
        'Command Orchestrator',
        'Emergency Agent',
        'Capability Match: [emergency-guidance, lost-child]. Delegating amber alert trigger.',
        'error',
        correlationId
      );

      // Trigger queue task
      context.addEvent('LOST_CHILD_UPLOAD', { estimatedAge: '8', shirtColor: 'Blue Shirt', details: 'curly hair' }, 'Command Orchestrator', 'Vision Agent', 'high', correlationId);

      context.setDemoState('lost_child_alert');
      
      responseText = "¡ALERTA AMBER INICIADA! He recibido el reporte del menor extraviado. Por favor, sube una foto de tu hijo usando el botón de carga a continuación para que nuestro Agente de Visión pueda extraer la descripción del menor y alertar a todos los voluntarios de la sección.";
      if (detectedLang === 'en') {
        responseText = "AMBER ALERT INITIATED! I have received the report of the missing child. Please upload a photo of your child using the upload button below so our Vision Agent can extract their physical description and notify all volunteers in the area.";
      }
    } else if (queryLower.includes('help') || queryLower.includes('pain') || queryLower.includes('hurt') || queryLower.includes('medical') || queryLower.includes('doctor') || queryLower.includes('emergency') || queryLower.includes('panic') || queryLower.includes('ayuda') || queryLower.includes('dolor')) {
      // Emergency Agent: First-Aid / Medical capability
      routedTo = 'Emergency Agent';
      context.addAgentLog(
        'Command Orchestrator',
        'Emergency Agent',
        'Capability Match: [first-aid, emergency-guidance]. Dispatching first aid and AED check.',
        'error',
        correlationId
      );

      // Dispatch event
      context.addEvent('PANIC_PRESSED', { section: 'Sec104' }, 'Command Orchestrator', 'Emergency Agent', 'critical', correlationId);
      context.addEvent('STAFF_DISPATCH', { incidentId: 'INC-003', nodeId: 'Sec104', description: 'Medical assistance needed at Sec 104' }, 'Emergency Agent', 'Volunteer Agent', 'high', correlationId);

      context.setDemoState('panic_active');

      responseText = "ESTÁ EN RUTA AYUDA MÉDICA. Hemos despachado al equipo médico más cercano. Por favor mantente en tu lugar. El DEA más cercano se encuentra a 30 metros en el baño R5.";
      if (detectedLang === 'en') {
        responseText = "MEDICAL SUPPORT DISPATCHED. Emergency team has been routed to your section. Please remain where you are. The nearest AED is located 30 meters away at Restroom R5.";
      }
    } else if (queryLower.includes('go') || queryLower.includes('route') || queryLower.includes('how to') || queryLower.includes('map') || queryLower.includes('find') || queryLower.includes('navigation') || queryLower.includes('seat') || queryLower.includes('restroom') || queryLower.includes('bathroom') || queryLower.includes('baño') || queryLower.includes('ir a')) {
      // Navigation Agent: Plot-Route capability
      routedTo = 'Navigation Agent';
      context.addAgentLog(
        'Command Orchestrator',
        'Navigation Agent',
        'Capability Match: [plot-route]. Resolving waypoint destinations.',
        'info',
        correlationId
      );

      let dest = 'Sec104';
      if (queryLower.includes('gate b') || queryLower.includes('puerta b')) dest = 'GateB';
      else if (queryLower.includes('gate a') || queryLower.includes('puerta a')) dest = 'GateA';
      else if (queryLower.includes('wc') || queryLower.includes('restroom') || queryLower.includes('bathroom') || queryLower.includes('baño')) dest = 'R3';
      else if (queryLower.includes('food') || queryLower.includes('eat') || queryLower.includes('hot dog') || queryLower.includes('comida')) dest = 'F1';

      context.addEvent('ROUTE_NAVIGATION', { start: 'Sec104', end: dest, stepFree: context.stepFree }, 'Command Orchestrator', 'Navigation Agent', 'medium', correlationId);

      responseText = `Ruta calculada a ${dest}. Sigue los indicadores iluminados en verde en el pasillo principal. Caminata estimada: 3 minutos.`;
      if (detectedLang === 'en') {
        responseText = `Route calculated to ${dest}. Follow the highlighted green arrows in the main corridor. Estimated walk time: 3 minutes.`;
      }
    } else if (queryLower.includes('crowd') || queryLower.includes('congestion') || queryLower.includes('queue') || queryLower.includes('wait') || queryLower.includes('line') || queryLower.includes('fila')) {
      // Crowd Intelligence Agent
      routedTo = 'Crowd Intelligence Agent';
      context.addAgentLog(
        'Command Orchestrator',
        'Crowd Intelligence Agent',
        'Capability Match: [predict-congestion, measure-queue]. Fetching density overlays.',
        'info',
        correlationId
      );

      responseText = "El flujo en la Puerta B está despejado (espera de 3 min). La Puerta A tiene congestión crítica (espera de 28 min). Recomiendo ingresar por la Puerta B.";
      if (detectedLang === 'en') {
        responseText = "Gate B is clear (3 min queue). Gate A is critical (28 min queue). We highly recommend entering through Gate B.";
      }
    } else if (queryLower.includes('food') || queryLower.includes('menu') || queryLower.includes('order') || queryLower.includes('hotdog') || queryLower.includes('nachos') || queryLower.includes('comida') || queryLower.includes('alergia') || queryLower.includes('peanuts')) {
      // Fan Experience Agent
      routedTo = 'Fan Experience Agent';
      context.addAgentLog(
        'Command Orchestrator',
        'Fan Experience Agent',
        'Capability Match: [allergen-screening, suggest-food]. Fetching concessions list.',
        'info',
        correlationId
      );

      responseText = "Puntos de comida cercanos: 'North Bites' (F1) a 40m. Su tiempo de espera es de 6 minutos. Menu: Hamburguesas, Nachos y Hot Dogs sin maní.";
      if (detectedLang === 'en') {
        responseText = "Nearby food stands: 'North Bites' (F1) is 40m away. Current queue: 6 mins. Menu: Burgers, Nachos, and Hot Dogs. Peanut-free options verified.";
      }
    } else if (queryLower.includes('parking') || queryLower.includes('car') || queryLower.includes('lot') || queryLower.includes('estacionar')) {
      // Transport Agent
      routedTo = 'Transport Agent';
      context.addAgentLog(
        'Command Orchestrator',
        'Transport Agent',
        'Capability Match: [check-parking]. Fetching Lot A occupancy.',
        'info',
        correlationId
      );

      responseText = "El lote A está al 95% de capacidad (Demo Live Data). Quedan espacios disponibles en el lote B. ¿Tienes una reserva previa?";
      if (detectedLang === 'en') {
        responseText = "Parking Lot A is 95% full (Demo Live Data). Spaces are still available in Lot B. Do you have a pre-booked reservation?";
      }
    } else if (queryLower.includes('transit') || queryLower.includes('train') || queryLower.includes('shuttle') || queryLower.includes('bus') || queryLower.includes('tren')) {
      // Transport Agent
      routedTo = 'Transport Agent';
      context.addAgentLog(
        'Command Orchestrator',
        'Transport Agent',
        'Capability Match: [check-transit]. Fetching GTFS feeds.',
        'info',
        correlationId
      );

      responseText = "Los trenes de NJ Transit están operando a tiempo. El servicio de Shuttle al Lote A pasa cada 8 minutos por la Puerta C.";
      if (detectedLang === 'en') {
        responseText = "NJ Transit trains are running on schedule. Shuttle service to Lot A is departing Gate C every 8 minutes.";
      }
    }

    // Default fallback if no keyword matches
    if (!responseText) {
      routedTo = 'Command Orchestrator';
      responseText = `Hola, soy ArenaPilot. Estoy aquí para guiarte en el estadio. Puedo ayudarte con:
1. Buscar rutas accesibles al baño o tu asiento.
2. Evitar filas congestionadas.
3. Solicitar ayuda de voluntarios o emergencias médicas.
¿En qué te puedo asistir?`;
      if (detectedLang === 'en') {
        responseText = `Hi, I am ArenaPilot, your Smart Stadium copilot. I can assist you with:
1. Navigating step-free routes to your seat or concessions.
2. Checking gate congestion and queue times.
3. Activating medical alerts or volunteer escorts.
What can I help you with today?`;
      }
    }

    // 2. LIVE OPTIONAL GEMINI CLIENT CALL (IF VITE_GEMINI_API_KEY CONFIGURED)
    // Runs on client only if key is provided; otherwise skips with zero quota errors.
    const optionalKey = typeof window !== 'undefined' ? window.localStorage.getItem('VITE_GEMINI_API_KEY') : null;
    if (optionalKey && apiConfig?.useGemini) {
      // (This will hook into the client-side Gemini fallback helper in Phase 4)
    }

    // Log log translation back if translated hardcoded values
    if (detectedLang !== 'en' && !responseText.includes('Hola') && !responseText.includes('ALERTA') && !responseText.includes('ESTÁ') && routedTo !== 'Command Orchestrator') {
      responseText = translateText(responseText, 'en', detectedLang);
    }

    // Append to messages list
    setMessages((prev: any) => [
      ...prev,
      {
        id: `MSG-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: routedTo,
        correlationId
      }
    ]);
  }
};
