// MyMemory Translation Service for professional French-to-English translation
export class MyMemoryTranslationService {
  private apiKey: string;
  private baseUrl = 'https://api.mymemory.translated.net';
  private cache = new Map<string, string>();
  private requestQueue: Promise<any>[] = [];

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
      // Rate limiting - wait between requests
      if (this.requestQueue.length > 0) {
        await Promise.all(this.requestQueue);
        this.requestQueue = [];
      }

      const params = new URLSearchParams({
        q: cleanText,
        langpair: `${fromLang}|${toLang}`,
        key: this.apiKey,
        mt: '1', // Enable machine translation
        de: 'spa-eastman-dashboard@example.com' // Developer email for high volume usage
      });

      const translationPromise = fetch(`${this.baseUrl}/get?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Spa Eastman Dashboard'
        }
      });

      this.requestQueue.push(translationPromise);

      const response = await translationPromise;

      if (!response.ok) {
        console.error('MyMemory API error:', response.status, response.statusText);
        return this.basicPhraseReplacement(cleanText);
      }

      const result = await response.json();
      if (result.responseStatus === 200 && result.responseData) {
        const translatedText = result.responseData.translatedText || cleanText;
        
        // If MyMemory returns the same text, just return it (don't use terrible fallback)
        if (translatedText.toLowerCase().trim() === cleanText.toLowerCase().trim()) {
          // For French text that wasn't translated, try basic phrase replacement only
          const basicResult = this.basicPhraseReplacement(cleanText);
          this.cache.set(cacheKey, basicResult);
          return basicResult;
        }
        
        // Cache the result
        this.cache.set(cacheKey, translatedText);
        
        return translatedText;
      } else {
        console.error('MyMemory translation failed:', result);
        return this.basicPhraseReplacement(cleanText);
      }
    } catch (error) {
      console.error('MyMemory translation service error:', error);
      return this.basicPhraseReplacement(cleanText);
    }
  }

  // Basic phrase replacement - only replace obvious spa terms, no word-by-word
  private basicPhraseReplacement(text: string): string {
    const translations: Record<string, string> = {
      // Complete phrases
      "Qu'est-ce que le Shinrin Yoku?": "What is Shinrin Yoku?",
      "Qu est-ce que le Shinrin Yoku?": "What is Shinrin Yoku?", 
      "En compagnie d'Anne-Marie Laforest": "With Anne-Marie Laforest",
      "En compagnie d Anne-Marie Laforest": "With Anne-Marie Laforest",
      "Animé par": "Led by",
      "Animée par": "Led by",
      "professeure de yoga": "yoga teacher",
      "professeur de yoga": "yoga teacher",
      "kinésiologue": "kinesiologist",
      "naturopathe": "naturopath",
      "Aqua-forme & thermothérapie": "Aqua fitness & thermotherapy",
      "Yoga vibratoire en eau chaude": "Vibrational yoga in hot water", 
      "Essentrics- Réveil du corps": "Essentrics - Body awakening",
      "Les pouvoirs extraordinaires du froid": "The extraordinary powers of cold",
      "Relâchement des tensions profondes avec balles": "Deep tension release with balls",
      "Conférence: Si peu pour tant": "Conference: So little for so much",
      "L'importance des oligo-éléments": "The importance of trace elements",
      "système immunitaire": "immune system",
      "Marche nordique": "Nordic walking",
      "Hatha Yoga": "Hatha Yoga",
      "Aqua forme": "Aqua fitness",
      "Étirements dans l'eau": "Water stretching",
      "Qi qong en eau chaude": "Qi Qong in hot water"
    };

    // Try exact match first
    for (const [french, english] of Object.entries(translations)) {
      if (text.toLowerCase().trim() === french.toLowerCase().trim()) {
        return english;
      }
    }

    // Only do exact phrase matching - no word-by-word replacement
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

  clearCache() {
    this.cache.clear();
  }
}

export const myMemoryTranslationService = new MyMemoryTranslationService('0627d15648186e5328b9');