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
    
    // Use MyMemory API directly for translation - no fallback
    const translateText = async () => {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text, fromLang: 'fr', toLang: 'en' })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.translated) {
            setTranslatedText(result.translated);
          } else {
            setTranslatedText(text); // Keep original if no translation
          }
        } else {
          console.warn('Translation API failed:', response.status);
          setTranslatedText(text); // Keep original if API fails
        }
      } catch (error) {
        console.warn('Translation error:', error);
        setTranslatedText(text); // Keep original if network fails
      }
    };
    
    translateText();
  }, [text, language]);
  
  return <span className={className}>{translatedText}</span>;
}