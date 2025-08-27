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
  
  // Then try partial matches for common terms (sort by length, longest first for better matching)
  const sortedTranslations = Object.entries(contentTranslations)
    .sort(([a], [b]) => b.length - a.length);
    
  sortedTranslations.forEach(([french, english]) => {
    if (french.length > 2 && translatedText.toLowerCase().includes(french.toLowerCase())) {
      // Use word boundaries for better matching
      const regex = new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translatedText = translatedText.replace(regex, english);
    }
  });
  
  return translatedText;
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