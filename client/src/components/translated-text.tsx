import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from 'react';

interface TranslatedTextProps {
  text: string;
  className?: string;
  children?: never;
}

export function TranslatedText({ text, className }: TranslatedTextProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(text);
  
  useEffect(() => {
    if (language === 'fr') {
      setTranslatedText(text);
      return;
    }
    
    // Use MyMemory API directly for translation
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, fromLang: 'fr', toLang: 'en' })
    })
    .then(response => response.json())
    .then(result => {
      if (result.translated) {
        setTranslatedText(result.translated);
      }
    })
    .catch(error => {
      console.warn('Translation failed:', error);
      // Keep original text if translation fails
      setTranslatedText(text);
    });
  }, [text, language]);
  
  return <span className={className}>{translatedText}</span>;
}