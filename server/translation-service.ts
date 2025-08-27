// ArML Translation Service for French-to-English translation
export class ArMLTranslationService {
  private apiKey: string;
  private baseUrl = 'https://api.translate.arml.trymagic.xyz';
  private cache = new Map<string, string>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translateText(text: string, fromLang: string = 'fr', toLang: string = 'en'): Promise<string> {
    if (!text || text.trim() === '') return text;
    
    // Check cache first
    const cacheKey = `${fromLang}-${toLang}-${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Clean HTML tags for translation
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      if (!cleanText) return text;

      // Try the free endpoint without authentication first
      const response = await fetch(`${this.baseUrl}/v1/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: cleanText,
          source_lang: fromLang,
          target_lang: toLang
        })
      });

      if (!response.ok) {
        console.error('ArML Translation API error:', response.status, response.statusText);
        return text; // Return original text on error
      }

      const result = await response.json();
      const translatedText = result.translated_text || result.translation || text;
      
      // Cache the result
      this.cache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('Translation service error:', error);
      return text; // Return original text on error
    }
  }

  async translateBatch(texts: string[], fromLang: string = 'fr', toLang: string = 'en'): Promise<string[]> {
    // For now, translate one by one. Could be optimized with batch API if available
    const translations = await Promise.all(
      texts.map(text => this.translateText(text, fromLang, toLang))
    );
    return translations;
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const translationService = new ArMLTranslationService('arzYUla22d5825d56274936fec-arml-JM');