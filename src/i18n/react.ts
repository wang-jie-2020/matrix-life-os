import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { translate, type TranslationKey } from '.';

export const useTranslation = () => {
  const language = useAppStore((s) => s.config.interfaceLanguage);
  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);

  return { language, t };
};
