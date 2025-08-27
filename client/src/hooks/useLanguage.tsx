import { useState, useEffect, createContext, useContext } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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
    'weather.forecast': 'Prévisions',
    'admin.login': 'Connexion',
    'admin.logout': 'Déconnexion',
    'admin.settings': 'Paramètres',
    'admin.calendar': 'Calendriers iCal',
    'categories.activities': 'ACTIVITÉS',
    'categories.conference': 'CONFÉRENCE',
    'categories.visit': 'VISITE',
    'categories.treatment': 'SOINS',
    'categories.dining': 'RESTAURATION',
    'categories.wellness': 'BIEN-ÊTRE',
    'time.format': '24h',
    'mobile.qr.title': 'Consulter sur votre\nappareil mobile'
  },
  en: {
    'spa.title': 'Spa Eastman',
    'events.current': 'Current Events',
    'events.upcoming': 'Upcoming Events',
    'events.today': 'TODAY',
    'events.tomorrow': 'TOMORROW',
    'events.dayAfter': 'DAY AFTER',
    'weather.forecast': 'Forecast',
    'admin.login': 'Login',
    'admin.logout': 'Logout',
    'admin.settings': 'Settings',
    'admin.calendar': 'iCal Calendars',
    'categories.activities': 'ACTIVITIES',
    'categories.conference': 'CONFERENCE',
    'categories.visit': 'TOUR',
    'categories.treatment': 'TREATMENTS',
    'categories.dining': 'DINING',
    'categories.wellness': 'WELLNESS',
    'time.format': '12h',
    'mobile.qr.title': 'View on your\nmobile device'
  }
};

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
    t
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