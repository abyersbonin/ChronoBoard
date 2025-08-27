import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from 'react';

interface TranslatedTextProps {
  text: string;
  className?: string;
  children?: never;
}

// Global translation queue and cache to prevent rate limiting
class TranslationManager {
  private static instance: TranslationManager;
  private cache = new Map<string, string>();
  private requestQueue: Array<{
    text: string;
    resolve: (text: string) => void;
    reject: (error: any) => void;
  }> = [];
  private isProcessing = false;

  static getInstance(): TranslationManager {
    if (!TranslationManager.instance) {
      TranslationManager.instance = new TranslationManager();
    }
    return TranslationManager.instance;
  }

  async translate(text: string): Promise<string> {
    // Check cache first
    const cacheKey = `fr-en-${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Return original text for French language or empty text
    if (!text || text.trim() === '') {
      return text;
    }

    // Add to queue and process
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ text, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      try {
        // Check cache again in case it was added while waiting
        const cacheKey = `fr-en-${request.text}`;
        if (this.cache.has(cacheKey)) {
          request.resolve(this.cache.get(cacheKey)!);
          continue;
        }

        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: request.text, fromLang: 'fr', toLang: 'en' })
        });
        
        if (response.ok) {
          const result = await response.json();
          const translated = result.translated || request.text;
          this.cache.set(cacheKey, translated);
          request.resolve(translated);
        } else {
          console.warn('Translation API failed:', response.status);
          request.resolve(request.text); // Return original on failure
        }
      } catch (error) {
        console.warn('Translation error:', error);
        request.resolve(request.text); // Return original on error
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  clearCache() {
    this.cache.clear();
  }
}

const translationManager = TranslationManager.getInstance();

export function TranslatedText({ text, className }: TranslatedTextProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(text);
  
  useEffect(() => {
    if (language === 'fr') {
      setTranslatedText(text);
      return;
    }
    
    // Use queued translation system to avoid rate limiting
    translationManager.translate(text).then(setTranslatedText);
  }, [text, language]);
  
  return <span className={className}>{translatedText}</span>;
}