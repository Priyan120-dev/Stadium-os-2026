/**
 * capabilities.ts — Typed capability constants for the Stadium OS agent capability registry.
 *
 * The capability registry maps incoming query intents to agents. Using typed constants
 * rather than inline strings prevents capability drift across the swarm.
 *
 * @example
 * import { Capability } from '../constants/capabilities';
 * // agentSwarmRegistry['Navigation Agent'].capabilities.includes(Capability.PLOT_ROUTE)
 */

export const Capability = {
  // Vision Agent
  OCR_TICKET: 'ocr-ticket',
  DESCRIBE_PHOTO: 'describe-photo',
  DETECT_SMOKE: 'detect-smoke',
  COUNT_CROWD: 'count-crowd',

  // Crowd Intelligence Agent
  PREDICT_CONGESTION: 'predict-congestion',
  MEASURE_QUEUE: 'measure-queue',
  EVALUATE_STAMPEDE: 'evaluate-stampede',

  // Navigation Agent
  PLOT_ROUTE: 'plot-route',
  LANDMARK_DIRECTIONS: 'landmark-directions',
  DIVERT_ROUTE: 'divert-route',

  // Accessibility Agent
  WHEELCHAIR_ROUTING: 'wheelchair-routing',
  QUIET_ZONES: 'neurodivergent-quiet-zones',
  WCAG_ALERTING: 'wcag-alerting',

  // Emergency Agent
  EVACUATE: 'evacuate',
  LOCATE_AED: 'locate-aed',
  EMERGENCY_GUIDANCE: 'emergency-guidance',
  FIRST_AID: 'first-aid',

  // Volunteer Agent
  DISPATCH_STAFF: 'dispatch-staff',
  MATCH_VOLUNTEER: 'match-volunteer',
  VOLUNTEER_ROSTER: 'volunteer-roster',

  // Translation Agent
  TRANSLATE_TEXT: 'translate-text',
  DETECT_LANGUAGE: 'detect-language',

  // Transport Agent
  CHECK_TRANSIT: 'check-transit',
  CHECK_PARKING: 'check-parking',
  RIDESHARE_SURGES: 'rideshare-surges',

  // Sustainability Agent
  SCORE_SUSTAINABILITY: 'score-sustainability',
  OPTIMIZE_UTILITY: 'optimize-utility',

  // Analytics Agent
  CALCULATE_RESPONSE_TIME: 'calculate-response-time',
  VOLUNTEER_UTILIZATION: 'volunteer-utilization',
  INCIDENT_TRENDS: 'incident-trends',

  // Fan Experience Agent
  PLACE_FOOD_ORDER: 'place-food-order',
  ALLERGEN_SCREENING: 'allergen-screening',
  SUGGEST_FOOD: 'suggest-food',
} as const;

/** Union type of all known capability strings */
export type CapabilityKey = typeof Capability[keyof typeof Capability];
