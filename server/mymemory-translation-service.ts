import { enhancedTranslationService } from './enhanced-translation-service';

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
        console.warn('MyMemory API quota exhausted, using enhanced fallback translation for:', cleanText);
        const fallbackResult = await enhancedTranslationService.translateText(cleanText, fromLang, toLang);
        this.cache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }

      if (!response.ok) {
        console.error('MyMemory API error:', response.status, response.statusText);
        const fallbackResult = await enhancedTranslationService.translateText(cleanText, fromLang, toLang);
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
          const basicResult = await enhancedTranslationService.translateText(cleanText, fromLang, toLang);
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
        const fallbackResult = await enhancedTranslationService.translateText(cleanText, fromLang, toLang);
        this.cache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }
    } catch (error) {
      console.error('MyMemory translation service error:', error);
      this.increaseDelay();
      const fallbackResult = await enhancedTranslationService.translateText(cleanText, fromLang, toLang);
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }
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