/**
 * authorityPolicy.ts — Emergency Authority Policy Matrix
 *
 * Defines which stadium-wide emergency actions can be taken automatically
 * by the AI swarm and which require explicit human approval (Human-in-the-Loop gate).
 *
 * Rationale: Actions with potential for mass disruption (alarms, evacuation,
 * external dispatch) must be approved by an Operations Command supervisor.
 */

/**
 * Maps action types to their policy configuration.
 * - `auto: true`  → the swarm can execute without human approval
 * - `auto: false` → a 15-second countdown approval modal is displayed first
 */
export const emergencyAuthorityMatrix = {
  INCIDENT_NOTIFY: {
    auto: true,
    label: 'Notify nearest volunteer & create incident'
  },
  GUIDANCE_DISPLAY: {
    auto: true,
    label: 'Display AED / First aid locator and exit arrows'
  },
  STADIUM_ALARM: {
    auto: false,
    label: 'Sound Stadium Audio/Visual Alarms'
  },
  EVACUATION_ORDER: {
    auto: false,
    label: 'Sound Stadium Evacuation Order'
  },
  EXTERNAL_DISPATCH: {
    auto: false,
    label: 'Dispatch External Emergency Services (Fire, Ambulance)'
  }
} as const;

/** Valid action keys recognised by the authority matrix. */
export type AuthorityActionKey = keyof typeof emergencyAuthorityMatrix;

/**
 * Returns whether a given action requires explicit human approval before execution.
 *
 * @param actionType - One of the authority matrix keys.
 * @returns `true` if a human supervisor must approve; `false` if the swarm can act autonomously.
 *
 * @example
 * isActionApprovalRequired('STADIUM_ALARM'); // → true
 * isActionApprovalRequired('INCIDENT_NOTIFY'); // → false
 */
export function isActionApprovalRequired(actionType: AuthorityActionKey): boolean {
  return !emergencyAuthorityMatrix[actionType].auto;
}
