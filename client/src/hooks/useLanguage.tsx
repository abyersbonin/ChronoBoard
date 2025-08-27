import { useState, useEffect, createContext, useContext } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateEventContent: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  fr: {
    'spa.title': 'Spa Eastman',
    'events.current': 'À présent',
    'events.upcoming': 'Événements à venir',
    'events.today': 'AUJOURD\'HUI',
    'events.tomorrow': 'DEMAIN',
    'events.dayAfter': 'APRÈS-DEMAIN',
    'events.none.current': 'Aucun événement en cours',
    'events.none.upcoming': 'Aucun événement à venir',
    'events.none.message': 'Profitez de ce moment libre dans votre emploi du temps.',
    'events.sync.message': 'Les calendriers iCal se synchronisent automatiquement',
    'events.description': 'Description',
    'weather.forecast': 'Prévisions',
    'weather.unavailable': 'Météo indisponible',
    'admin.login': 'Connexion',
    'admin.logout': 'Déconnexion',
    'admin.settings': 'Paramètres',
    'admin.calendar': 'Calendriers iCal',
    'categories.activities': 'ACTIVITÉS',
    'categories.conference': 'CONFÉRENCE',
    'categories.workshops': 'ATELIERS',
    'categories.visit': 'VISITE',
    'categories.treatment': 'SOINS',
    'categories.dining': 'RESTAURATION',
    'categories.wellness': 'BIEN-ÊTRE',
    'categories.groupe': 'GROUPE',
    'categories.general': 'GÉNÉRAL',
    'categories.other': 'AUTRE',
    'time.format': '24h',
    'mobile.qr.title': 'Consulter sur votre\nappareil mobile',
    'loading': 'Chargement...'
  },
  en: {
    'spa.title': 'Spa Eastman',
    'events.current': 'Current Events',
    'events.upcoming': 'Upcoming Events',
    'events.today': 'TODAY',
    'events.tomorrow': 'TOMORROW',
    'events.dayAfter': 'DAY AFTER',
    'events.none.current': 'No current events',
    'events.none.upcoming': 'No upcoming events',
    'events.none.message': 'Enjoy this free time in your schedule.',
    'events.sync.message': 'iCal calendars sync automatically',
    'events.description': 'Description',
    'weather.forecast': 'Forecast',
    'weather.unavailable': 'Weather unavailable',
    'admin.login': 'Login',
    'admin.logout': 'Logout',
    'admin.settings': 'Settings',
    'admin.calendar': 'iCal Calendars',
    'categories.activities': 'ACTIVITIES',
    'categories.conference': 'CONFERENCE',
    'categories.workshops': 'WORKSHOPS',
    'categories.visit': 'TOUR',
    'categories.treatment': 'TREATMENTS',
    'categories.dining': 'DINING',
    'categories.wellness': 'WELLNESS',
    'categories.groupe': 'GROUP',
    'categories.general': 'GENERAL',
    'categories.other': 'OTHER',
    'time.format': '12h',
    'mobile.qr.title': 'View on your\nmobile device',
    'loading': 'Loading...'
  }
};

// Content translation dictionary for event titles and descriptions
const contentTranslations: Record<string, string> = {
  // Activities and wellness
  'Qi qong en eau chaude (bilingual)': 'Hot Water Qi Gong (bilingual)',
  'Qi qong en eau chaude': 'Hot Water Qi Gong',
  'Étirements dans l\'eau (Bilingual)': 'Water Stretching (Bilingual)',
  'Étirements dans l\'eau': 'Water Stretching',
  'Les pouvoirs extraordinaires du froid (bilingual)': 'The Extraordinary Powers of Cold (bilingual)',
  'Les pouvoirs extraordinaires du froid': 'The Extraordinary Powers of Cold',
  'Essentrics (bilingual)': 'Essentrics (bilingual)',
  'Essentrics': 'Essentrics',
  'Relâchement des tensions profondes avec balles (bilingual)': 'Deep Tension Release with Balls (bilingual)',
  'Relâchement des tensions profondes avec balles': 'Deep Tension Release with Balls',
  'Renforcez votre corps et boostez votre système immunitaire avec  le mouvement,  le chaud et le froid (Bilingual)': 'Strengthen Your Body and Boost Your Immune System with Movement, Heat and Cold (Bilingual)',
  'Renforcez votre corps et boostez votre système immunitaire avec le mouvement, le chaud et le froid': 'Strengthen Your Body and Boost Your Immune System with Movement, Heat and Cold',
  'Marche nordique': 'Nordic Walking',
  
  // Conferences
  'Conférence: Si peu pour tant... L\'importance des oligo-éléments & des minéraux pour la santé': 'Conference: So Little for So Much... The Importance of Trace Elements & Minerals for Health',
  
  // Common terms for partial matching
  'en eau chaude': 'in hot water',
  'dans l\'eau': 'in water',
  'avec balles': 'with balls',
  'système immunitaire': 'immune system',
  'oligo-éléments': 'trace elements',
  'minéraux': 'minerals',
  'santé': 'health',
  'mouvement': 'movement',
  'chaud et froid': 'heat and cold',
  'tensions profondes': 'deep tension',
  'extraordinaires': 'extraordinary',
  'pouvoirs': 'powers',
  'importance': 'importance',
  
  // Additional description terms
  'Description': 'Description',
  'activité': 'activity',
  'activités': 'activities',
  'détente': 'relaxation',
  'relaxation': 'relaxation',
  'bien-être': 'wellness',
  'bienfaits': 'benefits',
  'exercice': 'exercise',
  'exercices': 'exercises',
  'étirement': 'stretching',
  'étirements': 'stretching',
  'respiration': 'breathing',
  'méditation': 'meditation',
  'concentration': 'concentration',
  'équilibre': 'balance',
  'posture': 'posture',
  'postures': 'postures',
  'corps': 'body',
  'esprit': 'mind',
  'énergie': 'energy',
  'vitalité': 'vitality',
  'thérapie': 'therapy',
  'thérapeutique': 'therapeutic',
  'soin': 'treatment',
  'soins': 'treatments',
  'massage': 'massage',
  'massages': 'massages',
  'muscle': 'muscle',
  'muscles': 'muscles',
  'articulation': 'joint',
  'articulations': 'joints',
  'circulation': 'circulation',
  'stress': 'stress',
  'anxiété': 'anxiety',
  'fatigue': 'fatigue',
  'douleur': 'pain',
  'douleurs': 'pain',
  'inflammation': 'inflammation',
  'récupération': 'recovery',
  'guérison': 'healing',
  'prévention': 'prevention',
  'amélioration': 'improvement',
  'renforcement': 'strengthening',
  'assouplissement': 'flexibility',
  'souplesse': 'flexibility',
  'endurance': 'endurance',
  'résistance': 'resistance',
  'force': 'strength',
  'coordination': 'coordination',
  'stabilité': 'stability',
  'mobilité': 'mobility'
};

// Advanced phrase and sentence translations for full French content
const phraseTranslations: Record<string, string> = {
  // Common French phrases and sentence structures
  'Une activité de': 'An activity of',
  'Cette activité': 'This activity',
  'Cette séance': 'This session',
  'Cette pratique': 'This practice',
  'Ce cours': 'This class',
  'Cet atelier': 'This workshop',
  'Cette conférence': 'This conference',
  'Venez découvrir': 'Come discover',
  'Venez apprendre': 'Come learn',
  'Rejoignez-nous': 'Join us',
  'Participez à': 'Participate in',
  'Profitez de': 'Enjoy',
  'Découvrez les': 'Discover the',
  'Apprenez les': 'Learn the',
  'Explorez les': 'Explore the',
  'Bénéficiez des': 'Benefit from the',
  'Ressentez les': 'Feel the',
  'Expérimentez': 'Experience',
  'Pratiquez': 'Practice',
  'Développez': 'Develop',
  'Renforcez': 'Strengthen',
  'Améliorez': 'Improve',
  'Libérez': 'Release',
  'Détendez': 'Relax',
  'Apaisez': 'Soothe',
  'Stimulez': 'Stimulate',
  'Revitalisez': 'Revitalize',
  'Retrouvez': 'Rediscover',
  'Cultivez': 'Cultivate',
  'pour vous': 'for you',
  'pour votre': 'for your',
  'de votre': 'of your',
  'dans votre': 'in your',
  'avec votre': 'with your',
  'sur votre': 'on your',
  'vers votre': 'towards your',
  'selon votre': 'according to your',
  'grâce à': 'thanks to',
  'à travers': 'through',
  'au cours de': 'during',
  'pendant': 'during',
  'tout en': 'while',
  'ainsi que': 'as well as',
  'en même temps': 'at the same time',
  'permettra de': 'will allow to',
  'va vous aider': 'will help you',
  'vous aide à': 'helps you to',
  'vous permet de': 'allows you to',
  'idéal pour': 'ideal for',
  'parfait pour': 'perfect for',
  'excellent pour': 'excellent for',
  'recommandé pour': 'recommended for',
  'adapté à': 'adapted to',
  'convient à': 'suitable for'
};

// Function to translate event content
function translateEventContent(text: string, language: Language): string {
  if (language === 'fr') return text; // Return original French text
  if (!text || text.trim() === '') return text; // Return empty text as-is
  
  // For English, try to translate
  let translatedText = text;
  
  // First try exact match (case-insensitive)
  const exactMatch = Object.keys(contentTranslations).find(
    key => key.toLowerCase() === text.toLowerCase()
  );
  if (exactMatch) {
    return contentTranslations[exactMatch];
  }
  
  // Apply phrase-level translations first (longer phrases)
  const sortedPhrases = Object.entries(phraseTranslations)
    .sort(([a], [b]) => b.length - a.length);
    
  sortedPhrases.forEach(([french, english]) => {
    if (translatedText.toLowerCase().includes(french.toLowerCase())) {
      const regex = new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translatedText = translatedText.replace(regex, english);
    }
  });
  
  // Then apply word-level translations (sort by length, longest first for better matching)
  const sortedTranslations = Object.entries(contentTranslations)
    .sort(([a], [b]) => b.length - a.length);
    
  sortedTranslations.forEach(([french, english]) => {
    if (french.length > 2 && translatedText.toLowerCase().includes(french.toLowerCase())) {
      // Use word boundaries for better matching
      const regex = new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translatedText = translatedText.replace(regex, english);
    }
  });
  
  // Comprehensive French-to-English translation for common words and grammar
  translatedText = translatedText
    // Articles
    .replace(/\ble\s+/gi, 'the ')
    .replace(/\bla\s+/gi, 'the ')
    .replace(/\bles\s+/gi, 'the ')
    .replace(/\bun\s+/gi, 'a ')
    .replace(/\bune\s+/gi, 'a ')
    .replace(/\bdes\s+/gi, 'some ')
    .replace(/\bdu\s+/gi, 'of the ')
    .replace(/\bde la\s+/gi, 'of the ')
    .replace(/\bde l'\s*/gi, 'of the ')
    .replace(/\bd'\s*/gi, 'of ')
    // Prepositions
    .replace(/\bet\s+/gi, 'and ')
    .replace(/\bou\s+/gi, 'or ')
    .replace(/\bavec\s+/gi, 'with ')
    .replace(/\bsans\s+/gi, 'without ')
    .replace(/\bpour\s+/gi, 'for ')
    .replace(/\bpar\s+/gi, 'by ')
    .replace(/\bsur\s+/gi, 'on ')
    .replace(/\bsous\s+/gi, 'under ')
    .replace(/\bdans\s+/gi, 'in ')
    .replace(/\bvers\s+/gi, 'towards ')
    .replace(/\bchez\s+/gi, 'at ')
    .replace(/\bentre\s+/gi, 'between ')
    .replace(/\bcontre\s+/gi, 'against ')
    .replace(/\bde\s+/gi, 'of ')
    .replace(/\bà\s+/gi, 'to ')
    // Common verbs (infinitive and conjugated forms)
    .replace(/\best\s+/gi, 'is ')
    .replace(/\bsont\s+/gi, 'are ')
    .replace(/\bêtre\s+/gi, 'to be ')
    .replace(/\bavoir\s+/gi, 'to have ')
    .replace(/\bfaire\s+/gi, 'to do ')
    .replace(/\baller\s+/gi, 'to go ')
    .replace(/\bvenir\s+/gi, 'to come ')
    .replace(/\bvoir\s+/gi, 'to see ')
    .replace(/\bsavoir\s+/gi, 'to know ')
    .replace(/\bpouvoir\s+/gi, 'to be able ')
    .replace(/\bvouloir\s+/gi, 'to want ')
    .replace(/\bdevoir\s+/gi, 'must ')
    .replace(/\bprendre\s+/gi, 'to take ')
    .replace(/\bdonner\s+/gi, 'to give ')
    .replace(/\bmettre\s+/gi, 'to put ')
    .replace(/\bparler\s+/gi, 'to speak ')
    .replace(/\baider\s+/gi, 'to help ')
    .replace(/\btrouver\s+/gi, 'to find ')
    .replace(/\bpenser\s+/gi, 'to think ')
    .replace(/\bpasser\s+/gi, 'to pass ')
    .replace(/\bsentir\s+/gi, 'to feel ')
    .replace(/\btenir\s+/gi, 'to hold ')
    .replace(/\bjouer\s+/gi, 'to play ')
    .replace(/\bvivre\s+/gi, 'to live ')
    .replace(/\bmourir\s+/gi, 'to die ')
    .replace(/\bchercher\s+/gi, 'to search ')
    .replace(/\btravailler\s+/gi, 'to work ')
    .replace(/\bapprendre\s+/gi, 'to learn ')
    .replace(/\bcomprendre\s+/gi, 'to understand ')
    .replace(/\boutiliser\s+/gi, 'to use ')
    .replace(/\baméliorer\s+/gi, 'to improve ')
    .replace(/\baugmenter\s+/gi, 'to increase ')
    .replace(/\bdiminuer\s+/gi, 'to decrease ')
    .replace(/\breduire\s+/gi, 'to reduce ')
    .replace(/\bobtenir\s+/gi, 'to obtain ')
    .replace(/\batteindre\s+/gi, 'to reach ')
    .replace(/\bréaliser\s+/gi, 'to achieve ')
    .replace(/\bmaintenir\s+/gi, 'to maintain ')
    // Body and wellness terms
    .replace(/\btête\s+/gi, 'head ')
    .replace(/\bcou\s+/gi, 'neck ')
    .replace(/\bépaules\s+/gi, 'shoulders ')
    .replace(/\bépaule\s+/gi, 'shoulder ')
    .replace(/\bbras\s+/gi, 'arms ')
    .replace(/\bmains\s+/gi, 'hands ')
    .replace(/\bmain\s+/gi, 'hand ')
    .replace(/\bdoigts\s+/gi, 'fingers ')
    .replace(/\bpoitrine\s+/gi, 'chest ')
    .replace(/\bdos\s+/gi, 'back ')
    .replace(/\bventre\s+/gi, 'stomach ')
    .replace(/\bjambes\s+/gi, 'legs ')
    .replace(/\bjambe\s+/gi, 'leg ')
    .replace(/\bpieds\s+/gi, 'feet ')
    .replace(/\bpied\s+/gi, 'foot ')
    .replace(/\byeux\s+/gi, 'eyes ')
    .replace(/\boeil\s+/gi, 'eye ')
    // Adjectives
    .replace(/\bbon\s+/gi, 'good ')
    .replace(/\bbonne\s+/gi, 'good ')
    .replace(/\bmauvais\s+/gi, 'bad ')
    .replace(/\bmauvaise\s+/gi, 'bad ')
    .replace(/\bgrand\s+/gi, 'big ')
    .replace(/\bgrande\s+/gi, 'big ')
    .replace(/\bpetit\s+/gi, 'small ')
    .replace(/\bpetite\s+/gi, 'small ')
    .replace(/\bnouveau\s+/gi, 'new ')
    .replace(/\bnouvelle\s+/gi, 'new ')
    .replace(/\bvieux\s+/gi, 'old ')
    .replace(/\bvieille\s+/gi, 'old ')
    .replace(/\bjeune\s+/gi, 'young ')
    .replace(/\bfort\s+/gi, 'strong ')
    .replace(/\bforte\s+/gi, 'strong ')
    .replace(/\bfaible\s+/gi, 'weak ')
    .replace(/\brapide\s+/gi, 'fast ')
    .replace(/\blent\s+/gi, 'slow ')
    .replace(/\blente\s+/gi, 'slow ')
    .replace(/\bfacile\s+/gi, 'easy ')
    .replace(/\bdifficile\s+/gi, 'difficult ')
    .replace(/\bimportant\s+/gi, 'important ')
    .replace(/\bimportante\s+/gi, 'important ')
    .replace(/\bnécessaire\s+/gi, 'necessary ')
    .replace(/\bpossible\s+/gi, 'possible ')
    .replace(/\bimpossible\s+/gi, 'impossible ')
    .replace(/\butile\s+/gi, 'useful ')
    .replace(/\binutile\s+/gi, 'useless ')
    .replace(/\beffectif\s+/gi, 'effective ')
    .replace(/\befficace\s+/gi, 'efficient ')
    .replace(/\bcomplet\s+/gi, 'complete ')
    .replace(/\bcomplète\s+/gi, 'complete ')
    .replace(/\bpartiel\s+/gi, 'partial ')
    .replace(/\bpartielle\s+/gi, 'partial ')
    .replace(/\bprofond\s+/gi, 'deep ')
    .replace(/\bprofonde\s+/gi, 'deep ')
    .replace(/\bsuperficiel\s+/gi, 'superficial ')
    .replace(/\bsuperficielle\s+/gi, 'superficial ')
    // Time and frequency
    .replace(/\bmaintenant\s+/gi, 'now ')
    .replace(/\baujourd'hui\s+/gi, 'today ')
    .replace(/\bhier\s+/gi, 'yesterday ')
    .replace(/\bdemain\s+/gi, 'tomorrow ')
    .replace(/\btoujours\s+/gi, 'always ')
    .replace(/\bjamais\s+/gi, 'never ')
    .replace(/\bsouvent\s+/gi, 'often ')
    .replace(/\brarement\s+/gi, 'rarely ')
    .replace(/\bparfois\s+/gi, 'sometimes ')
    .replace(/\bquand\s+/gi, 'when ')
    .replace(/\bavant\s+/gi, 'before ')
    .replace(/\baprès\s+/gi, 'after ')
    // Numbers
    .replace(/\bun\b/gi, 'one')
    .replace(/\bdeux\b/gi, 'two')
    .replace(/\btrois\b/gi, 'three')
    .replace(/\bquatre\b/gi, 'four')
    .replace(/\bcinq\b/gi, 'five')
    .replace(/\bsix\b/gi, 'six')
    .replace(/\bsept\b/gi, 'seven')
    .replace(/\bhuit\b/gi, 'eight')
    .replace(/\bneuf\b/gi, 'nine')
    .replace(/\bdix\b/gi, 'ten')
  
  return translatedText.trim();
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('spa-eastman-language');
    return (saved as Language) || 'fr'; // Default to French
  });

  // Save language preference
  useEffect(() => {
    localStorage.setItem('spa-eastman-language', language);
  }, [language]);

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    translateEventContent: (text: string) => translateEventContent(text, language)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper function to format time based on language preference
export function formatTime(date: Date, language: Language): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'en'
  };
  
  const locale = language === 'fr' ? 'fr-CA' : 'en-US';
  return date.toLocaleTimeString(locale, options);
}

// Helper function to format date based on language preference
export function formatDate(date: Date, language: Language, options?: Intl.DateTimeFormatOptions): string {
  const locale = language === 'fr' ? 'fr-CA' : 'en-US';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString(locale, defaultOptions);
}