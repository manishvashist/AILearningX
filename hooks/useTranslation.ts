
import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';

export type TranslationKey = keyof typeof translations.en;

export const useTranslation = () => {
  const { settings } = useAppContext();
  const lang = settings.language === 'Hindi' ? 'hi' : 'en';

  const t = useCallback((key: TranslationKey, replacements?: Record<string, string>): string => {
    // The type assertion is safe because we ensure 'hi' has all keys of 'en'.
    let translation = (translations[lang] as any)[key] || translations.en[key];
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
        });
    }
    return translation;
  }, [lang]);

  return t;
};
