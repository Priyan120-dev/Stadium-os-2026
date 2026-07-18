/**
 * sustainabilityService.ts — Real GREEN_SCORE Computation for the Sustainability Agent
 *
 * Computes a weighted environmental score from four sustainability dimensions:
 * - Solar/renewable energy share (electricity demand)
 * - Water efficiency (litres vs. expected per-fan baseline)
 * - Waste recycling rate (kg waste vs. venue benchmark)
 * - Carbon offset achievement (carbon kg vs. venue baseline)
 *
 * Score range: 0–100 (higher is greener).
 */

import { SustainabilityMetrics } from '../mockData';

/** Breakdown of score contributions per sustainability pillar */
export interface GreenScoreBreakdown {
  /** Weighted energy score component (0–25) */
  energyScore: number;
  /** Weighted water efficiency score component (0–25) */
  waterScore: number;
  /** Weighted waste management score component (0–25) */
  wasteScore: number;
  /** Weighted carbon reduction score component (0–25) */
  carbonScore: number;
  /** Final aggregated green score (0–100) */
  totalScore: number;
  /** Letter grade: A+, A, B, C, D */
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  /** Human-readable explanation of the score */
  rationale: string;
}

/** MetLife Stadium venue benchmarks for 80,000 capacity event */
const VENUE_BENCHMARKS = {
  /** Expected electricity demand kW for a full matchday event */
  electricityBaselineKw: 1500,
  /** Expected water consumption litres at full occupancy */
  waterBaselineLitres: 6000,
  /** Expected waste kg for 80,000 fans */
  wasteBaselineKg: 500,
  /** Expected carbon footprint kg for a full FIFA matchday */
  carbonBaselineKg: 3500,
} as const;

/**
 * Computes a live GREEN_SCORE and breakdown from current sustainability metrics.
 *
 * @param metrics - Current `SustainabilityMetrics` from the stadium state.
 * @returns A `GreenScoreBreakdown` with per-pillar scores and a total score.
 *
 * @example
 * const score = computeGreenScore(sustainability);
 * console.log(`Green Score: ${score.totalScore} (${score.grade})`);
 */
export function computeGreenScore(metrics: SustainabilityMetrics): GreenScoreBreakdown {
  // ── Energy Score (0–25): lower electricity demand → better score ────────
  const energyRatio = Math.min(metrics.electricityKw / VENUE_BENCHMARKS.electricityBaselineKw, 1.5);
  const energyScore = Math.round(Math.max(0, 25 * (1 - (energyRatio - 0.5) / 1.0)));

  // ── Water Score (0–25): lower consumption → better score ───────────────
  const waterRatio = Math.min(metrics.waterLitres / VENUE_BENCHMARKS.waterBaselineLitres, 1.5);
  const waterScore = Math.round(Math.max(0, 25 * (1 - (waterRatio - 0.5) / 1.0)));

  // ── Waste Score (0–25): lower waste kg → better score ──────────────────
  const wasteRatio = Math.min(metrics.wasteKg / VENUE_BENCHMARKS.wasteBaselineKg, 1.5);
  const wasteScore = Math.round(Math.max(0, 25 * (1 - (wasteRatio - 0.5) / 1.0)));

  // ── Carbon Score (0–25): lower carbon kg → better score ────────────────
  const carbonRatio = Math.min(metrics.carbonKg / VENUE_BENCHMARKS.carbonBaselineKg, 1.5);
  const carbonScore = Math.round(Math.max(0, 25 * (1 - (carbonRatio - 0.5) / 1.0)));

  // ── Total ───────────────────────────────────────────────────────────────
  const totalScore = Math.min(100, Math.max(0, energyScore + waterScore + wasteScore + carbonScore));

  // ── Grade ───────────────────────────────────────────────────────────────
  let grade: GreenScoreBreakdown['grade'];
  if (totalScore >= 95) grade = 'A+';
  else if (totalScore >= 85) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';
  else grade = 'D';

  // ── Rationale ───────────────────────────────────────────────────────────
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (energyScore >= 20) strengths.push('low energy draw');
  else weaknesses.push('high electricity demand');

  if (waterScore >= 20) strengths.push('efficient water use');
  else weaknesses.push('excess water consumption');

  if (wasteScore >= 20) strengths.push('excellent waste reduction');
  else weaknesses.push('waste above venue benchmark');

  if (carbonScore >= 20) strengths.push('carbon footprint well managed');
  else weaknesses.push('carbon emissions above target');

  const rationale = [
    strengths.length > 0 ? `Strengths: ${strengths.join(', ')}.` : '',
    weaknesses.length > 0 ? `Areas for improvement: ${weaknesses.join(', ')}.` : '',
  ].filter(Boolean).join(' ') || 'Operating within normal venue parameters.';

  return {
    energyScore,
    waterScore,
    wasteScore,
    carbonScore,
    totalScore,
    grade,
    rationale,
  };
}
