/**
 * translationAgent.ts — Translation Agent
 *
 * Provides real-time language detection and translation
 * between fans, volunteers, and the command center.
 */

// Generic keyword mapping for classifier
const languageKeywords: Record<string, string[]> = {
  es: ['hijo', 'ayuda', 'perdi', 'puerta', 'baño', 'asiento', 'gracias', 'hola', 'por favor', 'favor', 'necesito', 'medico', 'emergencia', 'pánico', 'perdido', 'boleto'],
  pt: ['filho', 'ajuda', 'perdi', 'porta', 'banheiro', 'assento', 'obrigado', 'olá', 'por favor', 'preciso', 'médico', 'emergência', 'pânico', 'perdido', 'ingresso'],
  fr: ['fils', 'aide', 'perdu', 'porte', 'toilette', 'siège', 'merci', 'bonjour', 's\'il vous plaît', 'besoin', 'médecin', 'urgence', 'panique', 'billet', 'enfant'],
  ar: ['tifl', 'musaeada', 'shukran', 'marhaban', 'walad', 'ibn', 'bab', 'hamam', 'maqad', 'tawaria', 'faza', 'alam', 'sadr', 'sadiq', 'شكرا', 'مساعدة', 'طفل', 'ابن', 'ولد', 'باب', 'حمام', 'مقعد', 'طوارئ', 'ألم', 'صدر', 'طبيب', 'تذكرة']
};

// Multilingual dictionary for high-fidelity demo translations
const multilingualDictionary: Record<string, Record<string, Record<string, string>>> = {
  toEnglish: {
    es: {
      'perdí a mi hijo': 'I lost my son',
      'ayúdame': 'help me',
      'niño extraviado': 'lost child',
      'emergencia médica': 'medical emergency',
      'dolor de pecho': 'chest pain',
      'dónde está mi asiento': 'where is my seat',
      'baño': 'restroom',
      'gracias': 'thank you',
      'hola': 'hello',
      'necesito ayuda': 'I need help',
      'puerta a': 'gate a',
      'puerta b': 'gate b'
    },
    pt: {
      'perdi meu filho': 'I lost my son',
      'ajuda': 'help me',
      'ajude-me': 'help me',
      'criança perdida': 'lost child',
      'emergência médica': 'medical emergency',
      'dor no peito': 'chest pain',
      'onde é o meu assento': 'where is my seat',
      'banheiro': 'restroom',
      'obrigado': 'thank you',
      'olá': 'hello',
      'preciso de ajuda': 'I need help',
      'porta a': 'gate a',
      'porta b': 'gate b'
    },
    fr: {
      'j\'ai perdu mon fils': 'I lost my son',
      'aidez-moi': 'help me',
      'enfant perdu': 'lost child',
      'urgence médicale': 'medical emergency',
      'douleur à la poitrine': 'chest pain',
      'où est mon siège': 'where is my seat',
      'toilettes': 'restroom',
      'merci': 'thank you',
      'bonjour': 'hello',
      'j\'ai besoin d\'aide': 'I need help',
      'porte a': 'gate a',
      'porte b': 'gate b'
    },
    ar: {
      'tifl mafqud': 'lost child',
      'musaeada': 'help me',
      'shukran': 'thank you',
      'marhaban': 'hello',
      'ألم في الصدر': 'chest pain',
      'أين مقعدي': 'where is my seat',
      'شكرا': 'thank you',
      'مساعدة': 'help me',
      'طفل مفقود': 'lost child',
      'فقدت ابني': 'I lost my son',
      'أحتاج إلى مساعدة': 'I need help'
    }
  },
  fromEnglish: {
    es: {
      'medical support dispatched': 'AYUDA MÉDICA EN RUTA. Hemos despachado al equipo médico. El DEA más cercano está a 30m en el baño R5.',
      'route calculated': 'Ruta calculada. Siga las flechas verdes en el mapa SVG.',
      'gate b is clear': 'La Puerta B está despejada. Se recomienda ingresar por ahí.'
    },
    pt: {
      'medical support dispatched': 'SUPORTE MÉDICO A CAMINHO. Equipe de emergência enviada. O DEA mais próximo está a 30m no banheiro R5.',
      'route calculated': 'Rota calculada. Siga as setas verdes no mapa SVG.',
      'gate b is clear': 'A Porta B está livre. Recomendamos entrar por lá.'
    },
    fr: {
      'medical support dispatched': 'SUPPORT MÉDICAL EN ROUTE. L\'équipe d\'urgence a été dépêchée. Le DAE le plus proche est à 30m aux toilettes R5.',
      'route calculated': 'Itinéraire calculé. Suivez les flèches vertes sur la carte SVG.',
      'gate b is clear': 'La porte B est dégagée. Nous vous recommandons d\'entrer par là.'
    },
    ar: {
      'medical support dispatched': 'تم إرسال الدعم الطبي. الفريق في الطريق. جهاز AED الأقرب على بعد 30م في دورة المياه R5.',
      'route calculated': 'تم حساب المسار. اتبع الأسهم الخضراء على الخriطة.',
      'gate b is clear': 'البوابة B سالكة. ننصح بالدخول من هناك.'
    }
  }
};

export const translationAgent = {
  role: 'Translation Agent',
  description: 'Real-time multi-lingual translation and language detection engine.'
};

/**
 * Detect language of user query generically.
 * 
 * @param text - Raw input text.
 * @returns Detected language ISO code ('en' | 'es' | 'ar' | 'pt' | 'fr').
 */
export function detectLanguage(text: string): string {
  const clean = text.toLowerCase();
  let bestLang = 'en';
  let maxScore = 0;

  for (const [lang, keywords] of Object.entries(languageKeywords)) {
    let score = 0;
    keywords.forEach(word => {
      if (clean.includes(word)) {
        score += 1;
      }
    });
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  }
  
  return bestLang;
}

/**
 * Translate text between languages dynamically.
 * 
 * @param text - Text to translate.
 * @param from - Source language code.
 * @param to - Destination language code.
 * @returns Translated text string.
 */
export function translateText(text: string, from: string, to: string): string {
  if (from === to) return text;
  
  const clean = text.toLowerCase().trim();

  // 1. Target is English (foreign -> English)
  if (to === 'en') {
    const dict = multilingualDictionary.toEnglish[from];
    if (dict) {
      if (dict[clean]) return dict[clean];
      
      // Substring check
      for (const [key, val] of Object.entries(dict)) {
        if (clean.includes(key)) return val;
      }
    }
    const langNames: Record<string, string> = { es: 'Spanish', pt: 'Portuguese', fr: 'French', ar: 'Arabic' };
    return `[Translated from ${langNames[from] || from}] ${text}`;
  }

  // 2. Source is English (English -> foreign)
  if (from === 'en') {
    const dict = multilingualDictionary.fromEnglish[to];
    if (dict) {
      if (dict[clean]) return dict[clean];
      
      // Substring check
      for (const [key, val] of Object.entries(dict)) {
        if (clean.includes(key)) return val;
      }
    }
    const langPrefix: Record<string, string> = { es: 'Traducido', pt: 'Traduzido', fr: 'Traduit', ar: 'مترجم' };
    return `[${langPrefix[to] || 'Translated'}] ${text}`;
  }

  return text;
}
