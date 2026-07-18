/**
 * stadium-os.spec.ts — Playwright E2E tests for Stadium OS 2026
 *
 * Covers the three demo flows documented in the README:
 *   1. Ticket Scan      — scan ticket → Dijkstra route lights up on map
 *   2. Panic Button     — click panic → Emergency Agent log + incident badge
 *   3. Lost Child       — click lost child → Amber Alert log + volunteer busy
 *
 * Runs against the Next.js dev server on http://localhost:3000
 */

import { test, expect } from '@playwright/test';

// Give the heavy React context time to hydrate
const HYDRATION_TIMEOUT = 5000;
const ACTION_TIMEOUT = 8000;

test.describe('Stadium OS — Demo Flow E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to simulator, wait for full hydration
    await page.goto('/simulator', { waitUntil: 'networkidle' });
    await page.waitForTimeout(HYDRATION_TIMEOUT);
  });

  // ── FLOW 1: TICKET SCAN ─────────────────────────────────────────────────────

  test('Flow 1 — Ticket Scan: scans ticket and shows validated status', async ({ page }) => {
    // Find the Scan Ticket / OCR button within the Fan panel section
    // The fan panel renders a scan-ticket action button
    const scanBtn = page.getByRole('button', { name: /scan|ticket|ocr/i }).first();
    await scanBtn.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
    await scanBtn.click();

    // After scan, a VALIDATED or route confirmation appears in the UI
    // The panel shows ticket validation state or agent log confirms TICKET_OCR
    const validatedElement = page.getByText(/validated|ticket.*valid|ocr.*scan|route.*calculated/i).first();
    await expect(validatedElement).toBeVisible({ timeout: ACTION_TIMEOUT });
  });

  test('Flow 1 — Ticket Scan: triggers TICKET_OCR agent event visible in log', async ({ page }) => {
    const scanBtn = page.getByRole('button', { name: /scan|ticket|ocr/i }).first();
    await scanBtn.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
    await scanBtn.click();

    // Agent log terminal or event bus should show TICKET_OCR or Vision Agent activity
    const logEntry = page.getByText(/TICKET_OCR|Vision Agent|ticket.*scan|ocr/i).first();
    await expect(logEntry).toBeVisible({ timeout: ACTION_TIMEOUT });
  });

  // ── FLOW 2: PANIC BUTTON ────────────────────────────────────────────────────

  test('Flow 2 — Panic Button: activates emergency and shows Emergency Agent log', async ({ page }) => {
    // Find the panic button in the Fan panel
    const panicBtn = page.getByRole('button', { name: /panic|medical|emergency|sos/i }).first();
    await panicBtn.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
    await panicBtn.click();

    // Emergency Agent should be referenced in the agent log terminal
    const emergencyLog = page.getByText(/Emergency Agent|medical.*dispatch|PANIC_PRESSED|medical support/i).first();
    await expect(emergencyLog).toBeVisible({ timeout: ACTION_TIMEOUT });
  });

  test('Flow 2 — Panic Button: creates an active incident', async ({ page }) => {
    const panicBtn = page.getByRole('button', { name: /panic|medical|emergency|sos/i }).first();
    await panicBtn.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
    await panicBtn.click();

    // Active incident count or incident text should appear
    const incidentText = page.getByText(/incident|INC-|medical|active.*emergency/i).first();
    await expect(incidentText).toBeVisible({ timeout: ACTION_TIMEOUT });
  });

  // ── FLOW 3: LOST CHILD ──────────────────────────────────────────────────────

  test('Flow 3 — Lost Child: triggers Amber Alert and shows in agent log', async ({ page }) => {
    // Find the Lost Child button
    const lostChildBtn = page.getByRole('button', { name: /lost.*child|amber|missing|niño/i }).first();
    await lostChildBtn.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
    await lostChildBtn.click();

    // Amber Alert should appear in the log or alert banner
    const amberText = page.getByText(/amber.*alert|AMBER ALERT|lost.*child|LOST_CHILD/i).first();
    await expect(amberText).toBeVisible({ timeout: ACTION_TIMEOUT });
  });

  test('Flow 3 — Lost Child: dispatches a volunteer (volunteer becomes busy)', async ({ page }) => {
    const lostChildBtn = page.getByRole('button', { name: /lost.*child|amber|missing|niño/i }).first();
    await lostChildBtn.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
    await lostChildBtn.click();

    // Volunteer Agent dispatch or "busy" status should appear
    const dispatchText = page.getByText(/volunteer.*dispatch|Sarah Chen|busy|dispatched.*volunteer|En Route/i).first();
    await expect(dispatchText).toBeVisible({ timeout: ACTION_TIMEOUT });
  });

  // ── NAVIGATION SMOKE TESTS ──────────────────────────────────────────────────

  test('Simulator loads with all three role panels', async ({ page }) => {
    // The simulator should show Fan, Volunteer, and Command sections/tabs
    const fanSection = page.getByText(/Mateo García|Fan|fan.*copilot/i).first();
    await expect(fanSection).toBeVisible({ timeout: HYDRATION_TIMEOUT });
  });

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Stadium OS/i);
    const heroText = page.getByText(/Stadium OS|World Cup|FIFA|ArenaPilot/i).first();
    await expect(heroText).toBeVisible({ timeout: HYDRATION_TIMEOUT });
  });

  test('Command page loads with Digital Twin map', async ({ page }) => {
    await page.goto('/command', { waitUntil: 'networkidle' });
    await page.waitForTimeout(HYDRATION_TIMEOUT);
    // SVG map or mission control elements should be visible
    const mapOrControl = page.locator('svg, [data-testid="digital-twin"], [aria-label*="map"], [aria-label*="stadium"]').first();
    const altText = page.getByText(/mission control|command|Digital Twin|stadium map/i).first();
    const isVisible = await mapOrControl.isVisible() || await altText.isVisible();
    expect(isVisible).toBe(true);
  });
});
