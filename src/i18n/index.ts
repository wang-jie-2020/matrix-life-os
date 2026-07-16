import type { InterfaceLanguage } from '../types';
import { en } from './locales/en';
import { zhCN } from './locales/zh-CN';
export type { TranslationKey } from './types';
import type { TranslationKey } from './types';

type RuntimeMode = 'development' | 'production';

const locales: Record<InterfaceLanguage, Record<TranslationKey, string>> = {
  en,
  'zh-CN': zhCN,
};

export const supportedInterfaceLanguages: { code: InterfaceLanguage; labelKey: TranslationKey }[] = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'zh-CN', labelKey: 'language.zh-CN' },
];

export const getInterfaceLanguageLabelKey = (language: InterfaceLanguage): TranslationKey =>
  supportedInterfaceLanguages.find((option) => option.code === language)?.labelKey ?? 'language.en';

const getDefaultRuntimeMode = (): RuntimeMode =>
  import.meta.env?.DEV ? 'development' : 'production';

export const detectInterfaceLanguage = (languages: readonly string[] = []): InterfaceLanguage => {
  const [primaryLanguage] = languages;
  return primaryLanguage?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
};

export const translate = (
  language: InterfaceLanguage,
  key: TranslationKey,
  mode: RuntimeMode = getDefaultRuntimeMode()
) => {
  const localized = locales[language]?.[key];
  if (localized) return localized;

  const english = locales.en[key];
  if (english) return mode === 'development' ? `[[${key}]]` : english;

  return mode === 'development' ? `[[${key}]]` : key;
};

export const interpolate = (copy: string, values: Record<string, string>) =>
  Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, value),
    copy
  );
