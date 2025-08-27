import { useTranslation, useLanguage } from "@/hooks/useLanguage";

interface TranslatedTextProps {
  text: string;
  className?: string;
  children?: never;
}

export function TranslatedText({ text, className }: TranslatedTextProps) {
  const { language } = useLanguage();
  const translatedText = useTranslation(text, language);
  
  return <span className={className}>{translatedText}</span>;
}