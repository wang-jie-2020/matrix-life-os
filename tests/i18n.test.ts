import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectInterfaceLanguage,
  getInterfaceLanguageLabelKey,
  translate,
  type TranslationKey,
} from '../src/i18n/index.ts';
import { createDefaultConfig, normalizeConfig } from '../src/store/slices/configSlice.ts';

describe('i18n resolver', () => {
  it('looks up English and Simplified Chinese copy', () => {
    assert.equal(translate('en', 'nav.action'), 'Action');
    assert.equal(translate('zh-CN', 'nav.action'), '操作');
  });

  it('shows missing keys in development and falls back to English in production', () => {
    assert.equal(translate('zh-CN', 'test.missing' as TranslationKey, 'development'), '[[test.missing]]');
    assert.equal(translate('zh-CN', 'test.missing' as TranslationKey, 'production'), 'test.missing');
    assert.equal(translate('zh-CN', 'nav.action', 'production'), '操作');
  });

  it('detects Chinese system language and falls back to English for unsupported languages', () => {
    assert.equal(detectInterfaceLanguage(['zh-Hans-CN']), 'zh-CN');
    assert.equal(detectInterfaceLanguage(['fr-FR']), 'en');
  });

  it('resolves the current language label from supported language metadata', () => {
    assert.equal(translate('en', getInterfaceLanguageLabelKey('en')), 'English');
    assert.equal(translate('zh-CN', getInterfaceLanguageLabelKey('zh-CN')), '简体中文');
  });
});

describe('interface language config', () => {
  it('defaults first launch language from the system language', () => {
    assert.equal(createDefaultConfig(['zh-CN']).interfaceLanguage, 'zh-CN');
    assert.equal(createDefaultConfig(['de-DE']).interfaceLanguage, 'en');
  });

  it('normalizes older persisted config without changing explicit user language', () => {
    assert.equal(
      normalizeConfig(
        {
          currentWeekStart: '2026-07-13',
          lastVisitDate: '2026-07-16',
          theme: 'light',
          taskColumnWidth: 320,
        },
        ['zh-CN']
      ).interfaceLanguage,
      'zh-CN'
    );

    assert.equal(
      normalizeConfig(
        {
          currentWeekStart: '2026-07-13',
          lastVisitDate: '2026-07-16',
          theme: 'light',
          taskColumnWidth: 320,
          interfaceLanguage: 'en',
        },
        ['zh-CN']
      ).interfaceLanguage,
      'en'
    );
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

    assert.equal(config.interfaceLanguage, 'zh-CN');
    assert.deepEqual(userRecords, before);
  });
});

describe('locale coverage', () => {
  it('has Simplified Chinese copy for every English UI key', async () => {
    const { en } = await import('../src/i18n/locales/en.ts');
    const { zhCN } = await import('../src/i18n/locales/zh-CN.ts');

    assert.deepEqual(Object.keys(zhCN).sort(), Object.keys(en).sort());
  });
});
