// MyMemory Translation Service for professional French-to-English translation
export class MyMemoryTranslationService {
  private apiKey: string;
  private baseUrl = 'https://api.mymemory.translated.net';
  private cache = new Map<string, string>();
  private lastRequestTime = 0;
  private requestDelay = 250; // Start with 250ms delay between requests
  private maxDelay = 5000; // Maximum delay of 5 seconds

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translateText(text: string, fromLang: string = 'fr', toLang: string = 'en'): Promise<string> {
    if (!text || text.trim() === '' || toLang === 'fr') return text;
    
    // Check cache first
    const cacheKey = `${fromLang}-${toLang}-${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Clean HTML tags for translation
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return text;

    try {
      // Enhanced rate limiting with exponential backoff
      await this.waitWithBackoff();

      const params = new URLSearchParams({
        q: cleanText,
        langpair: `${fromLang}|${toLang}`,
        key: this.apiKey,
        mt: '1', // Enable machine translation
        de: 'spa-eastman-dashboard@example.com' // Developer email for high volume usage
      });

      const response = await fetch(`${this.baseUrl}/get?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Spa Eastman Dashboard'
        }
      });

      if (response.status === 429) {
        console.warn('MyMemory API quota exhausted, using comprehensive fallback translation for:', cleanText);
        const fallbackResult = this.basicPhraseReplacement(cleanText);
        this.cache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }

      if (!response.ok) {
        console.error('MyMemory API error:', response.status, response.statusText);
        const fallbackResult = this.basicPhraseReplacement(cleanText);
        this.cache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }

      const result = await response.json();
      if (result.responseStatus === 200 && result.responseData) {
        const translatedText = result.responseData.translatedText || cleanText;
        
        // Reset delay on successful response
        this.resetDelay();
        
        // If MyMemory returns the same text, use enhanced phrase replacement
        if (translatedText.toLowerCase().trim() === cleanText.toLowerCase().trim()) {
          const basicResult = this.basicPhraseReplacement(cleanText);
          this.cache.set(cacheKey, basicResult);
          return basicResult;
        }
        
        // Post-process common translation issues and preserve specific French lake names
        const postProcessed = translatedText
          .replace(/\bbullets\b/gi, 'balls') // "balles" should be "balls" not "bullets" in spa context
          .replace(/\bBullets\b/gi, 'Balls') // Same for capitalized
          // Only preserve specific lake names as requested
          .replace(/Silver Lake/gi, "Lac d'Argent") // Preserve French lake name
          .replace(/Lake Stukely/gi, "Lac Stukely") // Preserve French lake name  
          .replace(/Stukely Lake/gi, "Lac Stukely") // Alternative translation
          .replace(/Orford Lake/gi, "Lac Orford") // Preserve French lake name
          .replace(/Lake Orford/gi, "Lac Orford"); // Alternative translation
        
        // Cache the result
        this.cache.set(cacheKey, postProcessed);
        
        return postProcessed;
      } else {
        console.error('MyMemory translation failed:', result);
        this.increaseDelay();
        const fallbackResult = this.basicPhraseReplacement(cleanText);
        this.cache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }
    } catch (error) {
      console.error('MyMemory translation service error:', error);
      this.increaseDelay();
      const fallbackResult = this.basicPhraseReplacement(cleanText);
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  // Enhanced phrase replacement for better fallback translations
  private basicPhraseReplacement(text: string): string {
    const translations: Record<string, string> = {
      // Event titles and descriptions
      "Nos 6 piliers mieux-être - Visite de 3 de nos sites": "Our 6 wellness pillars - Visit to 3 of our sites",
      "Nos 6 piliers mieux-être - Visite de bienvenue": "Our 6 wellness pillars - Welcome visit",
      "Le pouvoir créateur de nos pensées": "The creative power of our thoughts",
      "Cette rencontre a pour but de partager notre philosophie et de vous familiariser avec nos 6 piliers mieux-être.": "This meeting aims to share our philosophy and familiarize you with our 6 wellness pillars.",
      "Cette rencontre a pour but de vous familiariser avec les lieux et de vous donner les informations nécessaires afin de maximiser les bienfaits et le plaisir de votre séjour au Spa Eastman.": "This meeting aims to familiarize you with the facilities and give you the necessary information to maximize the benefits and pleasure of your stay at Spa Eastman.",
      "Qu'est-ce que le Shinrin Yoku?": "What is Shinrin Yoku?",
      "Qu est-ce que le Shinrin Yoku?": "What is Shinrin Yoku?",
      "En compagnie d'Anne-Marie Laforest": "With Anne-Marie Laforest",
      "En compagnie d Anne-Marie Laforest": "With Anne-Marie Laforest",
      "L'influence positive des lettres et des sons": "The positive influence of letters and sounds",
      "L'influence de la numérologie sur votre quotidien": "The influence of numerology on your daily life",
      "Nicole Dumont": "Nicole Dumont",
      "Animée par Nicole Dumont": "Led by Nicole Dumont",
      
      // Activity names
      "Animé par": "Led by",
      "Animée par": "Led by", 
      "professeure de yoga": "yoga teacher",
      "professeur de yoga": "yoga teacher",
      "kinésiologue": "kinesiologist",
      "naturopathe": "naturopath",
      "Aqua-forme & thermothérapie": "Aqua fitness & thermotherapy",
      "Yoga vibratoire en eau chaude": "Vibrational yoga in hot water",
      "Essentrics- Réveil du corps": "Essentrics - Body awakening",
      "Essentrics (bilingual)": "Essentrics (bilingual)",
      "Les pouvoirs extraordinaires du froid": "The extraordinary powers of cold",
      "Les pouvoirs extraordinaires du froid (bilingual)": "The extraordinary powers of cold (bilingual)",
      "Relâchement des tensions profondes avec balles": "Deep tension release with balls",
      "Relâchement des tensions profondes avec balles (bilingual)": "Release of deep tensions with balls (bilingual)",
      "Renforcez votre corps et boostez votre système immunitaire avec  le mouvement,  le chaud et le froid (Bilingual)": "Strengthen your body and boost your immune system with movement, heat and cold (Bilingual)",
      
      // Conference topics  
      "Conférence: Si peu pour tant": "Conference: So little for so much",
      "Conférence: Connaître et comprendre comment mon corps, mon esprit, sont des alliers pour la vie": "Conference: Knowing and understanding how my body and mind are allies for life",
      "L'importance des oligo-éléments": "The importance of trace elements",
      "L'importance des oligo-éléments & des minéraux pour la santé": "The importance of trace elements & minerals for health",
      "Si peu pour tant... L'importance des oligo-éléments & des minéraux pour la santé": "So little for so much... The importance of trace elements & minerals for health",
      
      // Activities  
      "système immunitaire": "immune system",
      "Marche nordique": "Nordic walking",
      "Hatha Yoga": "Hatha Yoga",
      "Hatha yoga": "Hatha yoga",
      "Aqua forme": "Aqua fitness",
      "Aqua forme (bilingual)": "Aqua fitness (bilingual)",
      "Aqua-forme (bilingual)": "Aqua fitness (bilingual)",
      "Étirements dans l'eau": "Water stretching",
      "Étirements dans l'eau (Bilingual)": "Water stretching (Bilingual)",
      "Qi qong en eau chaude": "Qi Qong in hot water",
      "Qi qong en eau chaude (bilingual)": "Qi Qong in hot water (bilingual)",
      "Yoga matinal (Bilingual)": "Morning yoga (Bilingual)",
      "Yoga dynamique": "Dynamic yoga",
      "Yoga doux (bilingual)": "Gentle yoga (bilingual)",
      "Yoga (bilingual)": "Yoga (bilingual)",
      "Souplesse en sauna infrarouge (bilingual)": "Flexibility in infrared sauna (bilingual)",
      "Les 5 Tibétains pour augmenter l'énergie vitale (bilingual)": "The 5 Tibetans to increase vital energy (bilingual)",
      "Chimie du Bonheur": "Chemistry of Happiness",
      "Danse - Exercice - créativité (bilingual)": "Dance - Exercise - Creativity (bilingual)",
      "Méditation, une plongée au coeur de soi (bilingual)": "Meditation, a dive into the heart of self (bilingual)",
      
      // Locations
      "Piscine intérieure": "Indoor pool",
      "Piscine intérieure- Billets à la boutique": "Indoor pool - Tickets at the boutique",
      "Départ de la réception": "Departure from reception",
      "Salle lac Stukely": "Lac Stukely room",
      "Salle Lac d'Argent": "Lac d'Argent room",
      "Pergola extérieure": "Outdoor pergola",
      "Pergola extérieure * salle lac d'Argent en cas de pluie": "Outdoor pergola * Lac d'Argent room in case of rain",
      "Pergola * Salle lac d'Argent en cas de pluie": "Pergola * Lac d'Argent room in case of rain",
      "Bassin Oval": "Oval pool",
      "Bassin Oval * Billets à la boutique": "Oval pool * Tickets at the boutique",
      "Sauna Namaste": "Namaste Sauna",
      "Bistro et Corrid'Art": "Bistro and Corrid'Art",
      "Aper'Art": "Aper'Art",
      "lac Stukely": "Lac Stukely",
      "Lac d'Argent": "Lac d'Argent",
      "lac d'Argent": "Lac d'Argent", 
      "Lac Orford": "Lac Orford",
      "lac Orford": "Lac Orford",
      
      // Common terms
      "Description": "Description",
      "bilingual": "bilingual",
      "(bilingual)": "(bilingual)",
      "(Bilingual)": "(Bilingual)"
    };

    // Try exact phrase matching - case insensitive
    for (const [french, english] of Object.entries(translations)) {
      if (text.toLowerCase().trim() === french.toLowerCase().trim()) {
        return english;
      }
    }

    // If no exact match, return original text (better than terrible word-by-word)
    return text;
  }

  async translateBatch(texts: string[], fromLang: string = 'fr', toLang: string = 'en'): Promise<string[]> {
    // Translate texts in parallel with rate limiting
    const translations = await Promise.all(
      texts.map((text, index) => 
        new Promise<string>(resolve => {
          // Stagger requests by 100ms to avoid rate limiting
          setTimeout(() => {
            this.translateText(text, fromLang, toLang).then(resolve);
          }, index * 100);
        })
      )
    );
    return translations;
  }

  // Enhanced rate limiting with exponential backoff
  private async waitWithBackoff() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Increase delay on rate limit hit
  private increaseDelay() {
    this.requestDelay = Math.min(this.requestDelay * 2, this.maxDelay);
    console.log(`Increased translation delay to ${this.requestDelay}ms due to rate limiting`);
  }

  // Reset delay on successful request
  private resetDelay() {
    this.requestDelay = 250;
  }

  clearCache() {
    this.cache.clear();
  }
}

// Clear any existing cache and create fresh instance
const apiKey = process.env.MYMEMORY_API_KEY || '0627d15648186e5328b9';
console.log(`Using MyMemory API key: ${apiKey.substring(0, 10)}...`);

export const myMemoryTranslationService = new MyMemoryTranslationService(apiKey);