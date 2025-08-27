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
  'convient à': 'suitable for',
  
  // Complete sentence structures and common spa descriptions
  'Une expérience unique': 'A unique experience',
  'Une occasion de': 'An opportunity to',
  'L\'occasion de': 'The opportunity to',
  'Une façon de': 'A way to',
  'La façon de': 'The way to',
  'Un moyen de': 'A way to',
  'Le moyen de': 'The way to',
  'Une méthode pour': 'A method to',
  'La méthode pour': 'The method to',
  'Une technique pour': 'A technique to',
  'La technique pour': 'The technique to',
  'Une approche pour': 'An approach to',
  'L\'approche pour': 'The approach to',
  'permet de vous': 'allows you to',
  'permet de se': 'allows to',
  'aide à vous': 'helps you to',
  'aide à se': 'helps to',
  'contribue à': 'contributes to',
  'favorise la': 'promotes the',
  'favorise le': 'promotes the',
  'stimule la': 'stimulates the',
  'stimule le': 'stimulates the',
  'améliore la': 'improves the',
  'améliore le': 'improves the',
  'renforce la': 'strengthens the',
  'renforce le': 'strengthens the',
  'développe la': 'develops the',
  'développe le': 'develops the',
  'augmente la': 'increases the',
  'augmente le': 'increases the',
  'réduit la': 'reduces the',
  'réduit le': 'reduces the',
  'diminue la': 'decreases the',
  'diminue le': 'decreases the',
  'libère la': 'releases the',
  'libère le': 'releases the',
  'soulage la': 'relieves the',
  'soulage le': 'relieves the',
  'apaise la': 'soothes the',
  'apaise le': 'soothes the',
  'calme la': 'calms the',
  'calme le': 'calms the',
  'relaxe la': 'relaxes the',
  'relaxe le': 'relaxes the',
  'détend la': 'relaxes the',
  'détend le': 'relaxes the',
  'tonifie la': 'tones the',
  'tonifie le': 'tones the',
  'étire la': 'stretches the',
  'étire le': 'stretches the',
  'assouplit la': 'makes flexible the',
  'assouplit le': 'makes flexible the',
  'harmonise la': 'harmonizes the',
  'harmonise le': 'harmonizes the',
  'équilibre la': 'balances the',
  'équilibre le': 'balances the',
  'régénère la': 'regenerates the',
  'régénère le': 'regenerates the',
  'revitalise la': 'revitalizes the',
  'revitalise le': 'revitalizes the',
  'purifie la': 'purifies the',
  'purifie le': 'purifies the',
  'nettoie la': 'cleanses the',
  'nettoie le': 'cleanses the',
  'nourrit la': 'nourishes the',
  'nourrit le': 'nourishes the',
  'hydrate la': 'hydrates the',
  'hydrate le': 'hydrates the',
  'protège la': 'protects the',
  'protège le': 'protects the',
  'répare la': 'repairs the',
  'répare le': 'repairs the',
  'guérit la': 'heals the',
  'guérit le': 'heals the',
  
  // Specific translations for actual event descriptions
  'animé par': 'led by',
  'animée par': 'led by',
  'professeure de yoga': 'yoga teacher',
  'professeur de yoga': 'yoga teacher',
  'professeure Essentrics': 'Essentrics teacher',
  'kinésiologue': 'kinesiologist',
  'naturopathe': 'naturopath',
  'coach en focusing': 'focusing coach',
  'ce cours': 'this class',
  'cette conférence': 'this conference',
  'cette séance': 'this session',
  'cette rencontre': 'this meeting',
  'accessible à tous': 'accessible to all',
  'vous propose': 'offers you',
  'voyage intérieur': 'inner journey',
  'mêlant': 'blending',
  'méditation sensorielle': 'sensory meditation',
  'postures fluides': 'fluid postures',
  'musique apaisante': 'soothing music',
  'pratiquer à votre rythme': 'practice at your own pace',
  'profonde connexion': 'deep connection',
  'à soi': 'to oneself',
  'demande d\'être': 'requires being',
  'à l\'aise': 'comfortable',
  'sur les genoux': 'on the knees',
  'tenue recommandée': 'recommended attire',
  'vêtements de sport': 'sportswear',
  'confortables': 'comfortable',
  'maillot de bain': 'swimsuit',
  'vous initie aux': 'introduces you to',
  'bienfaits méconnus': 'unknown benefits',
  'oligoéléments': 'trace elements',
  'outil d\'analyse innovant': 'innovative analysis tool',
  'bâtir un capital santé': 'build health capital',
  'solide': 'solid',
  'découvrez': 'discover',
  'aquaforme': 'aqua fitness',
  'mise en forme en douceur': 'gentle fitness',
  'améliore': 'improves',
  'flexibilité': 'flexibility',
  'endurance': 'endurance',
  'tonus musculaire': 'muscle tone',
  'tout en respectant': 'while respecting',
  'rythme du corps': 'body rhythm',
  'a pour but de': 'aims to',
  'vous familiariser avec': 'familiarize you with',
  'lieux': 'places',
  'vous donner': 'give you',
  'informations nécessaires': 'necessary information',
  'afin de maximiser': 'in order to maximize',
  'plaisir de votre séjour': 'pleasure of your stay',
  'en compagnie de': 'in the company of',
  'venez en apprendre': 'come learn',
  'davantage sur': 'more about',
  'principes du': 'principles of',
  'marche lente': 'slow walk',
  'contemplative': 'contemplative',
  'invite aux': 'invites to',
  'mouvements justes': 'right movements',
  'sans tensions': 'without tension',
  'eutonie': 'eutony',
  'corps habité': 'inhabited body',
  'conscience': 'consciousness',
  'présence': 'presence',
  'vous fait découvrir': 'makes you discover',
  'théorie polyvagale': 'polyvagal theory',
  'en explorant': 'by exploring',
  'comment': 'how',
  'système nerveux autonome': 'autonomic nervous system',
  'influence': 'influences',
  'notre quête': 'our quest',
  'sécurité intérieure': 'inner security',
  'relationnelle': 'relational',
  'allie': 'combines',
  'renforcement': 'strengthening',
  'étirements dynamiques': 'dynamic stretching',
  'posture': 'posture',
  'mobilité': 'mobility',
  'vitalité': 'vitality',
  'libérant les fascias': 'releasing the fascia',
  'vous guide dans': 'guides you in',
  'séance de yoga vibratoire': 'vibrational yoga session',
  'posture assise': 'seated posture',
  'pratiquerez': 'will practice',
  'techniques qui': 'techniques that',
  's\'appuie sur': 'relies on',
  'souffle': 'breath',
  'sons': 'sounds',
  'vibrations': 'vibrations',
  'élèvent la fréquence': 'raise the frequency',
  'vibratoire': 'vibrational',
  'énergisent': 'energize',
  'outil': 'tool',
  'analyse': 'analysis',
  'innovant': 'innovative',
  'capital santé': 'health capital',
  
  // Common French words
  'comme': 'like',
  'après': 'after',
  'avant': 'before',
  'durant': 'during',
  'depuis': 'since',
  'vers': 'towards',
  'chez': 'at',
  'sous': 'under',
  'entre': 'between',
  'selon': 'according to',
  'malgré': 'despite',
  'sauf': 'except',
  'autour': 'around',
  'contre': 'against',
  'dedans': 'inside',
  'dehors': 'outside',
  'cependant': 'however',
  'néanmoins': 'nevertheless',
  'pourtant': 'however',
  'toutefois': 'however',
  'donc': 'therefore',
  'ainsi': 'thus',
  'alors': 'then',
  'puis': 'then',
  'enfin': 'finally',
  'surtout': 'especially',
  'notamment': 'notably',
  'également': 'also',
  'aussi': 'also',
  'même': 'even',
  'déjà': 'already',
  'encore': 'still',
  'toujours': 'always',
  'jamais': 'never',
  'parfois': 'sometimes',
  'souvent': 'often',
  'rarement': 'rarely',
  'peut-être': 'maybe',
  'probablement': 'probably',
  'certainement': 'certainly',
  'sûrement': 'surely',
  'naturellement': 'naturally',
  'heureusement': 'fortunately',
  'malheureusement': 'unfortunately',
  'normalement': 'normally',
  'généralement': 'generally',
  'habituellement': 'usually',
  'régulièrement': 'regularly',
  'fréquemment': 'frequently',
  'constamment': 'constantly',
  'immédiatement': 'immediately',
  'directement': 'directly',
  'rapidement': 'quickly',
  'lentement': 'slowly',
  'facilement': 'easily',
  'simplement': 'simply',
  'complètement': 'completely',
  'entièrement': 'entirely',
  'totalement': 'totally',
  'partiellement': 'partially',
  'légèrement': 'slightly',
  'énormément': 'enormously',
  'extrêmement': 'extremely',
  'incroyablement': 'incredibly',
  'remarquablement': 'remarkably',
  'exceptionnellement': 'exceptionally',
  'uniquement': 'only',
  'seulement': 'only',
  'exactement': 'exactly',
  'précisément': 'precisely',
  'approximativement': 'approximately',
  'presque': 'almost',
  'pratiquement': 'practically',
  'vraiment': 'really',
  'réellement': 'really',
  'actuellement': 'currently',
  'maintenant': 'now',
  'hier': 'yesterday',
  'demain': 'tomorrow',
  'bientôt': 'soon',
  'tard': 'late',
  'tôt': 'early',
  'longtemps': 'long time',
  'récemment': 'recently'
};

// Complete French-to-English descriptions for actual spa events
const fullDescriptionTranslations: Record<string, string> = {
  // Complete description translations based on actual event data
  "Animé par Marjolaine Grenier, professeure de yoga, ce cours accessible à tous vous propose un voyage intérieur mêlant méditation sensorielle, postures fluides et musique apaisante, pour pratiquer à votre rythme dans une profonde connexion à soi. Ce cours demande d'être à l'aise sur les genoux. Tenue recommandée : Vêtements de sport confortables": "Led by Marjolaine Grenier, yoga teacher, this class accessible to all offers you an inner journey blending sensory meditation, fluid postures and soothing music, to practice at your own pace in a deep connection to yourself. This class requires being comfortable on the knees. Recommended attire: Comfortable sportswear",
  
  "Animée par Nathalia Menga, naturopathe, cette conférence vous initie aux bienfaits méconnus des oligoéléments et à l'Oligoscan, un outil d'analyse innovant pour bâtir un capital santé solide.": "Led by Nathalia Menga, naturopath, this conference introduces you to the unknown benefits of trace elements and the Oligoscan, an innovative analysis tool to build solid health capital.",
  
  "Avec Audrey Blais-Lebel, kinésiologue, découvrez l'aquaforme : une mise en forme en douceur dans l'eau qui améliore flexibilité, endurance et tonus musculaire, tout en respectant le rythme du corps. (Tenue recommandée : maillot de bain)": "With Audrey Blais-Lebel, kinesiologist, discover aqua fitness: gentle fitness in water that improves flexibility, endurance and muscle tone, while respecting the body's rhythm. (Recommended attire: swimsuit)",
  
  "Cette rencontre a pour but de vous familiariser avec les lieux et de vous donner les informations nécessaires afin de maximiser les bienfaits et le plaisir de votre séjour au Spa Eastman.": "This meeting aims to familiarize you with the places and give you the necessary information in order to maximize the benefits and pleasure of your stay at Spa Eastman.",
  
  "En compagnie d'Anne-Marie Lafortune, coach en focusing, venez en apprendre davantage sur les principes du Shinrin yoku, une marche lente et contemplative, qui invite aux mouvements justes sans tensions (ou eutonie) au corps habité de conscience et de présence.": "In the company of Anne-Marie Lafortune, focusing coach, come learn more about the principles of Shinrin yoku, a slow and contemplative walk, which invites right movements without tension (or eutony) to the body inhabited with consciousness and presence.",
  
  "Animée par Anne-Marie Lafortune, coach en focusing, cette conférence vous fait découvrir la théorie polyvagale du Dr. Stephen Porges, en explorant comment notre système nerveux autonome influence notre quête de sécurité intérieure et relationnelle.": "Led by Anne-Marie Lafortune, focusing coach, this conference makes you discover the polyvagal theory of Dr. Stephen Porges, by exploring how our autonomic nervous system influences our quest for inner and relational security.",
  
  "Animée par Carole Bédard, professeure Essentrics, cette séance allie renforcement et étirements dynamiques pour améliorer posture, mobilité, tonus musculaire et vitalité, tout en libérant les fascias. Tenue recommandée : Vêtements de sport confortable": "Led by Carole Bédard, Essentrics teacher, this session combines strengthening and dynamic stretching to improve posture, mobility, muscle tone and vitality, while releasing the fascia. Recommended attire: Comfortable sportswear",
  
  "Anne-Marie Lafortune, coach en focusing vous guide dans une séance de yoga vibratoire. En posture assise, vous pratiquerez des techniques qui s'appuie sur le souffle, les sons et ses vibrations qui élèvent la fréquence vibratoire et énergisent.": "Anne-Marie Lafortune, focusing coach guides you in a vibrational yoga session. In seated posture, you will practice techniques that rely on breath, sounds and their vibrations that raise the vibrational frequency and energize."
};

// Cache for ArML API translations
const translationCache = new Map<string, string>();
const translationPromises = new Map<string, Promise<string>>();

// Professional translation function using ArML API  
async function fetchTranslation(text: string, fromLang: string = 'fr', toLang: string = 'en'): Promise<string> {
  const cacheKey = `${fromLang}-${toLang}-${text}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  // Check if translation is already in progress
  if (translationPromises.has(cacheKey)) {
    return translationPromises.get(cacheKey)!;
  }
  
  // Start new translation
  const translationPromise = (async () => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          fromLang: fromLang,
          toLang: toLang
        })
      });

      if (response.ok) {
        const result = await response.json();
        const translatedText = result.translated || text;
        
        // Cache the result
        translationCache.set(cacheKey, translatedText);
        translationPromises.delete(cacheKey); // Clean up
        return translatedText;
      } else {
        console.warn('Translation API failed, using fallback');
        translationPromises.delete(cacheKey); // Clean up
        return fallbackTranslateEventContent(text, toLang === 'en' ? 'en' : 'fr');
      }
    } catch (error) {
      console.warn('Translation error, using fallback:', error);
      translationPromises.delete(cacheKey); // Clean up
      return fallbackTranslateEventContent(text, toLang === 'en' ? 'en' : 'fr');
    }
  })();
  
  translationPromises.set(cacheKey, translationPromise);
  return translationPromise;
}

// Hook for reactive translations
export function useTranslation(text: string, targetLanguage: Language): string {
  const [translatedText, setTranslatedText] = useState<string>(text);
  
  useEffect(() => {
    if (targetLanguage === 'fr') {
      setTranslatedText(text);
      return;
    }
    
    // For English, check cache first for immediate update
    const cacheKey = `fr-en-${text}`;
    if (translationCache.has(cacheKey)) {
      setTranslatedText(translationCache.get(cacheKey)!);
      return;
    }
    
    // Start translation and update when complete
    setTranslatedText(fallbackTranslateEventContent(text, targetLanguage)); // Show fallback immediately
    
    fetchTranslation(text, 'fr', 'en').then(translated => {
      setTranslatedText(translated);
    });
  }, [text, targetLanguage]);
  
  return translatedText;
}

// Synchronous translation function for backward compatibility
function translateEventContent(text: string, language: Language): string {
  if (language === 'fr') return text;
  
  // Check cache for instant return
  const cacheKey = `fr-en-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  // Start async translation in background
  fetchTranslation(text, 'fr', 'en');
  
  // Return fallback immediately
  return fallbackTranslateEventContent(text, language);
}

// Fallback translation function for when API is unavailable
function fallbackTranslateEventContent(text: string, language: Language): string {
  if (language === 'fr') return text; // Return original French text
  if (!text || text.trim() === '') return text; // Return empty text as-is
  
  // Clean HTML tags from text for comparison
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  
  // First try exact match for complete descriptions
  const exactMatch = Object.keys(fullDescriptionTranslations).find(
    key => key.toLowerCase() === cleanText.toLowerCase()
  );
  if (exactMatch) {
    return fullDescriptionTranslations[exactMatch];
  }
  
  // Try exact match for titles
  const titleMatch = Object.keys(contentTranslations).find(
    key => key.toLowerCase() === cleanText.toLowerCase()
  );
  if (titleMatch) {
    return contentTranslations[titleMatch];
  }
  
  // Apply comprehensive translation patterns
  let translatedText = text;
  
  // Apply phrase-level translations first (longer phrases)
  const allTranslations = { ...phraseTranslations, ...contentTranslations };
  const sortedPhrases = Object.entries(allTranslations)
    .sort(([a], [b]) => b.length - a.length);
    
  sortedPhrases.forEach(([french, english]) => {
    if (french.length > 3 && translatedText.toLowerCase().includes(french.toLowerCase())) {
      const regex = new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translatedText = translatedText.replace(regex, english);
    }
  });
  
  // Apply comprehensive word-level translation with better word boundaries
  translatedText = translatedText
    // Essential French words - comprehensive coverage
    .replace(/\banime par\b/gi, 'led by')
    .replace(/\banimé par\b/gi, 'led by')
    .replace(/\banimée par\b/gi, 'led by')
    .replace(/\bprofesseure de yoga\b/gi, 'yoga teacher')
    .replace(/\bprofesseur de yoga\b/gi, 'yoga teacher')
    .replace(/\bkinésiologue\b/gi, 'kinesiologist')
    .replace(/\bnaturopathe\b/gi, 'naturopath')
    .replace(/\bcoach en focusing\b/gi, 'focusing coach')
    .replace(/\bce cours\b/gi, 'this class')
    .replace(/\bcette conférence\b/gi, 'this conference')
    .replace(/\bcette séance\b/gi, 'this session')
    .replace(/\bcette rencontre\b/gi, 'this meeting')
    .replace(/\baccessible à tous\b/gi, 'accessible to all')
    .replace(/\bvous propose\b/gi, 'offers you')
    .replace(/\bvoyage intérieur\b/gi, 'inner journey')
    .replace(/\bmêlant\b/gi, 'blending')
    .replace(/\bméditation sensorielle\b/gi, 'sensory meditation')
    .replace(/\bpostures fluides\b/gi, 'fluid postures')
    .replace(/\bmusique apaisante\b/gi, 'soothing music')
    .replace(/\bà votre rythme\b/gi, 'at your own pace')
    .replace(/\bprofonde connexion\b/gi, 'deep connection')
    .replace(/\bà soi\b/gi, 'to oneself')
    .replace(/\bdemande d'être\b/gi, 'requires being')
    .replace(/\bà l'aise\b/gi, 'comfortable')
    .replace(/\bsur les genoux\b/gi, 'on the knees')
    .replace(/\btenue recommandée\b/gi, 'recommended attire')
    .replace(/\bvêtements de sport\b/gi, 'sportswear')
    .replace(/\bconfortables\b/gi, 'comfortable')
    .replace(/\bconfortable\b/gi, 'comfortable')
    .replace(/\bmaillot de bain\b/gi, 'swimsuit')
    .replace(/\bvous initie aux\b/gi, 'introduces you to')
    .replace(/\bbienfaits méconnus\b/gi, 'unknown benefits')
    .replace(/\boligoéléments\b/gi, 'trace elements')
    .replace(/\boutil d'analyse innovant\b/gi, 'innovative analysis tool')
    .replace(/\bcapital santé\b/gi, 'health capital')
    .replace(/\bsolide\b/gi, 'solid')
    .replace(/\bdécouvrez\b/gi, 'discover')
    .replace(/\baquaforme\b/gi, 'aqua fitness')
    .replace(/\bmise en forme en douceur\b/gi, 'gentle fitness')
    .replace(/\baméliore\b/gi, 'improves')
    .replace(/\bflexibilité\b/gi, 'flexibility')
    .replace(/\bendurance\b/gi, 'endurance')
    .replace(/\btonus musculaire\b/gi, 'muscle tone')
    .replace(/\btout en respectant\b/gi, 'while respecting')
    .replace(/\brythme du corps\b/gi, 'body rhythm')
    .replace(/\ba pour but de\b/gi, 'aims to')
    .replace(/\bvous familiariser avec\b/gi, 'familiarize you with')
    .replace(/\blieux\b/gi, 'places')
    .replace(/\bvous donner\b/gi, 'give you')
    .replace(/\binformations nécessaires\b/gi, 'necessary information')
    .replace(/\bafin de maximiser\b/gi, 'in order to maximize')
    .replace(/\bbienfaits\b/gi, 'benefits')
    .replace(/\bplaisir de votre séjour\b/gi, 'pleasure of your stay')
    .replace(/\ben compagnie de\b/gi, 'in the company of')
    .replace(/\bvenez en apprendre\b/gi, 'come learn')
    .replace(/\bdavantage sur\b/gi, 'more about')
    .replace(/\bprincipes du\b/gi, 'principles of')
    .replace(/\bmarche lente\b/gi, 'slow walk')
    .replace(/\bcontemplative\b/gi, 'contemplative')
    .replace(/\binvite aux\b/gi, 'invites to')
    .replace(/\bmouvements justes\b/gi, 'right movements')
    .replace(/\bsans tensions\b/gi, 'without tension')
    .replace(/\beutonie\b/gi, 'eutony')
    .replace(/\bcorps habité\b/gi, 'inhabited body')
    .replace(/\bconscience\b/gi, 'consciousness')
    .replace(/\bprésence\b/gi, 'presence')
    .replace(/\bvous fait découvrir\b/gi, 'makes you discover')
    .replace(/\bthéorie polyvagale\b/gi, 'polyvagal theory')
    .replace(/\ben explorant\b/gi, 'by exploring')
    .replace(/\bcomment\b/gi, 'how')
    .replace(/\bsystème nerveux autonome\b/gi, 'autonomic nervous system')
    .replace(/\binfluence\b/gi, 'influences')
    .replace(/\bnotre quête\b/gi, 'our quest')
    .replace(/\bsécurité intérieure\b/gi, 'inner security')
    .replace(/\brelationnelle\b/gi, 'relational')
    .replace(/\ballie\b/gi, 'combines')
    .replace(/\brenforcement\b/gi, 'strengthening')
    .replace(/\bétirements dynamiques\b/gi, 'dynamic stretching')
    .replace(/\bposture\b/gi, 'posture')
    .replace(/\bmobilité\b/gi, 'mobility')
    .replace(/\bvitalité\b/gi, 'vitality')
    .replace(/\blibérant les fascias\b/gi, 'releasing the fascia')
    .replace(/\bvous guide dans\b/gi, 'guides you in')
    .replace(/\bséance de yoga vibratoire\b/gi, 'vibrational yoga session')
    .replace(/\bposture assise\b/gi, 'seated posture')
    .replace(/\bpratiquerez\b/gi, 'will practice')
    .replace(/\btechniques qui\b/gi, 'techniques that')
    .replace(/\bs'appuie sur\b/gi, 'relies on')
    .replace(/\bsouffle\b/gi, 'breath')
    .replace(/\bsons\b/gi, 'sounds')
    .replace(/\bvibrations\b/gi, 'vibrations')
    .replace(/\bélèvent la fréquence\b/gi, 'raise the frequency')
    .replace(/\bvibratoire\b/gi, 'vibrational')
    .replace(/\bénergisent\b/gi, 'energize')
    // Basic French grammar
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
    .replace(/\bet\s+/gi, 'and ')
    .replace(/\bou\s+/gi, 'or ')
    .replace(/\bavec\s+/gi, 'with ')
    .replace(/\bsans\s+/gi, 'without ')
    .replace(/\bpour\s+/gi, 'for ')
    .replace(/\bpar\s+/gi, 'by ')
    .replace(/\bsur\s+/gi, 'on ')
    .replace(/\bdans\s+/gi, 'in ')
    .replace(/\bde\s+/gi, 'of ')
    .replace(/\bà\s+/gi, 'to ')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ');
  
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