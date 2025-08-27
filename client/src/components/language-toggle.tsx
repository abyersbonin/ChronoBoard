import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
      className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
      data-testid="button-language-toggle"
    >
      {language === 'fr' ? 'EN' : 'FR'}
    </Button>
  );
}