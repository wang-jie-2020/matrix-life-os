import { describe, it, expect } from 'vitest';
import {
  detectInterfaceLanguage,
  getInterfaceLanguageLabelKey,
  translate,
  type TranslationKey,
} from '../src/i18n/index.ts';
import { createDefaultConfig, normalizeConfig } from '../src/store/slices/configSlice.ts';

describe('i18n resolver', () => {
  it('looks up English and Simplified Chinese copy', () => {
    expect(translate('en', 'nav.action')).toBe('Action')
    expect(translate('zh-CN', 'nav.action')).toBe('操作')
  });

  it('shows missing keys in development and falls back to English in production', () => {
    expect(translate('zh-CN', 'test.missing' as TranslationKey, 'development')).toBe('[[test.missing]]')
    expect(translate('zh-CN', 'test.missing' as TranslationKey, 'production')).toBe('test.missing')
    expect(translate('zh-CN', 'nav.action', 'production')).toBe('操作')
  });

  it('detects Chinese system language and falls back to English for unsupported languages', () => {
    expect(detectInterfaceLanguage(['zh-Hans-CN'])).toBe('zh-CN')
    expect(detectInterfaceLanguage(['fr-FR'])).toBe('en')
  });

  it('resolves the current language label from supported language metadata', () => {
    expect(translate('en', getInterfaceLanguageLabelKey('en'))).toBe('English')
    expect(translate('zh-CN', getInterfaceLanguageLabelKey('zh-CN'))).toBe('简体中文')
  });
});

describe('interface language config', () => {
  it('defaults first launch language from the system language', () => {
    expect(createDefaultConfig(['zh-CN']).interfaceLanguage).toBe('zh-CN')
    expect(createDefaultConfig(['de-DE']).interfaceLanguage).toBe('en')
  });

  it('normalizes older persisted config without changing explicit user language', () => {
    expect(
      normalizeConfig(
        {
          currentWeekStart: '2026-07-13',
          lastVisitDate: '2026-07-16',
          theme: 'light',
          taskColumnWidth: 320,
        },
        ['zh-CN']
      ).interfaceLanguage).toBe('zh-CN')

    expect(
      normalizeConfig(
        {
          currentWeekStart: '2026-07-13',
          lastVisitDate: '2026-07-16',
          theme: 'light',
          taskColumnWidth: 320,
          interfaceLanguage: 'en',
        },
        ['zh-CN']
      ).interfaceLanguage).toBe('en')
  });

  it('does not modify user-created content when interface language changes', () => {
    const userRecords = {
      task: 'Call 李 about budget',
      captureNote: 'mañana idea',
      goalNote: 'Keep original goal wording',
      reflection: 'Today felt mixed.',
    };

    const before = structuredClone(userRecords);
    const config = normalizeConfig({ ...createDefaultConfig(['en']), interfaceLanguage: 'zh-CN' }, ['en']);

    expect(config.interfaceLanguage).toBe('zh-CN')
    expect(userRecords).toEqual(before)
  });
});

describe('locale coverage', () => {
  it('has Simplified Chinese copy for every English UI key', async () => {
    const { en } = await import('../src/i18n/locales/en.ts');
    const { zhCN } = await import('../src/i18n/locales/zh-CN.ts');

    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(en).sort())
  });
});
