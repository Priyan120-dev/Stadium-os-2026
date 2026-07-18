import { copilotEngine } from '../agents/copilotEngine';

describe('Copilot Engine - Intent routing and fallbacks', () => {
  it('should intercept emergency keywords and return safety template responses in Spanish', async () => {
    let outputReply = '';
    let outputSource = '';

    await copilotEngine.getResponse(
      'fuego en mi seccion',
      [],
      'es',
      false,
      'corr-test',
      (reply, source) => {
        outputReply = reply;
        outputSource = source;
      },
      () => {}
    );

    expect(outputSource).toBe('Emergency AI Core');
    expect(outputReply).toContain('ALERTA DE EMERGENCIA');
  });

  it('should intercept emergency keywords and return safety template responses in English', async () => {
    let outputReply = '';
    let outputSource = '';

    await copilotEngine.getResponse(
      'chest pain section 104',
      [],
      'en',
      false,
      'corr-test',
      (reply, source) => {
        outputReply = reply;
        outputSource = source;
      },
      () => {}
    );

    expect(outputSource).toBe('Medical Dispatcher');
    expect(outputReply).toContain('MEDICAL EMERGENCY');
  });

  it('should fallback to local demo response when query is general conversational text', async () => {
    let outputReply = '';
    let outputSource = '';

    await copilotEngine.getResponse(
      'where is restroom r3?',
      [],
      'en',
      false,
      'corr-test',
      (reply, source) => {
        outputReply = reply;
        outputSource = source;
      },
      () => {}
    );

    expect(outputSource).toBe('Stadium Navigation');
    expect(outputReply).toBeDefined();
  });
});
