import { detectLanguage, translateText } from '../agents/translationAgent';

describe('Translation Agent - Language detection and lookup', () => {
  it('should detect Spanish correctly', () => {
    const lang = detectLanguage('Necesito ayuda por favor');
    expect(lang).toBe('es');
  });

  it('should detect Arabic correctly', () => {
    const lang = detectLanguage('شكرا جزيلا');
    expect(lang).toBe('ar');
  });

  it('should fallback to English when no keywords match', () => {
    const lang = detectLanguage('Random text query');
    expect(lang).toBe('en');
  });

  it('should translate dictionary phrases from Spanish to English', () => {
    const translated = translateText('perdí a mi hijo', 'es', 'en');
    expect(translated).toBe('I lost my son');
  });

  it('should translate dictionary phrases from English to Spanish', () => {
    const translated = translateText('medical support dispatched', 'en', 'es');
    expect(translated).toContain('AYUDA MÉDICA EN RUTA');
  });
});
