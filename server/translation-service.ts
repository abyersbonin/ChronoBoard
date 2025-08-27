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

      // Use the correct free endpoint with proper format
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
        const errorText = await response.text();
        console.error('ArML Translation API error:', response.status, errorText);
        return text; // Return original text on error
      }

      const result = await response.json();
      console.log('ArML translation result:', result); // Debug log
      const translatedText = result.translated_text || result.translation || result.result || text;
      
      // Cache the result
      this.cache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('Translation service error:', error);
      return text; // Return original text on error
    }
  }

  async translateBatch(texts: string[], fromLang: string = 'fr', toLang: string = 'en'): Promise<string[]> {
    if (texts.length === 0) return [];
    
    // Check cache for all texts
    const cachedResults: string[] = [];
    const uncachedTexts: { text: string, index: number }[] = [];
    
    texts.forEach((text, index) => {
      const cacheKey = `${fromLang}-${toLang}-${text}`;
      if (this.cache.has(cacheKey)) {
        cachedResults[index] = this.cache.get(cacheKey)!;
      } else {
        uncachedTexts.push({ text, index });
      }
    });
    
    // If all are cached, return immediately
    if (uncachedTexts.length === 0) {
      return cachedResults;
    }
    
    try {
      // Use batch translate endpoint for uncached texts
      const response = await fetch(`${this.baseUrl}/v1/batch_translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texts: uncachedTexts.map(item => item.text.replace(/<[^>]*>/g, '').trim()),
          source_lang: fromLang,
          target_lang: toLang
        })
      });

      if (!response.ok) {
        console.error('ArML Batch Translation API error:', response.status);
        // Fallback to individual translations
        const individualResults = await Promise.all(
          uncachedTexts.map(item => this.translateText(item.text, fromLang, toLang))
        );
        
        // Fill in results
        uncachedTexts.forEach((item, idx) => {
          cachedResults[item.index] = individualResults[idx];
        });
        
        return cachedResults;
      }

      const result = await response.json();
      const translations = result.translations || result.translated_texts || result.results || [];
      
      // Cache and fill results
      uncachedTexts.forEach((item, idx) => {
        const translated = translations[idx] || item.text;
        this.cache.set(`${fromLang}-${toLang}-${item.text}`, translated);
        cachedResults[item.index] = translated;
      });
      
      return cachedResults;
    } catch (error) {
      console.error('Batch translation error:', error);
      // Fallback to individual translations
      const individualResults = await Promise.all(
        uncachedTexts.map(item => this.translateText(item.text, fromLang, toLang))
      );
      
      uncachedTexts.forEach((item, idx) => {
        cachedResults[item.index] = individualResults[idx];
      });
      
      return cachedResults;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const translationService = new ArMLTranslationService('arzYUla22d5825d56274936fec-arml-JM');