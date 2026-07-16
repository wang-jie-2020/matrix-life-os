import { useEffect, useRef, useState } from 'react';
import ActionDesk from './pages/ActionDesk';
import ReviewArchive from './pages/ReviewArchive';
import System from './pages/System';
import AsciiButton from './components/AsciiButton';
import { getInterfaceLanguageLabelKey, supportedInterfaceLanguages } from './i18n';
import { useTranslation } from './i18n/react';
import { useDayMigration } from './hooks/useDayMigration';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useAppStore } from './store/useAppStore';
import type { InterfaceLanguage } from './types';

type Page = 'actionDesk' | 'reviewArchive' | 'system';

const LanguageMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const setInterfaceLanguage = useAppStore((s) => s.setInterfaceLanguage);
  const { language, t } = useTranslation();
  const currentLanguageLabel = t(getInterfaceLanguageLabelKey(language));

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const chooseLanguage = (nextLanguage: InterfaceLanguage) => {
    setInterfaceLanguage(nextLanguage);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <AsciiButton
        onClick={() => setIsOpen((value) => !value)}
        className="font-h2"
        frame="tight"
        style={{ color: 'var(--text-secondary)' }}
        title={t('language.openMenu')}
        ariaLabel={t('language.openMenu')}
      >
        {t('language.label')}: {currentLanguageLabel}
      </AsciiButton>
      {isOpen && (
        <div
          role="menu"
          aria-label={t('language.label')}
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-1))',
            right: 0,
            zIndex: 10,
            minWidth: '220px',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
            padding: 'var(--space-2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
            {t('language.current')}: {currentLanguageLabel}
          </div>
          {supportedInterfaceLanguages.map((option) => {
            const active = option.code === language;
            return (
              <button
                key={option.code}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => chooseLanguage(option.code)}
                className="font-caption"
                style={{
                  width: '100%',
                  display: 'block',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  padding: 'var(--space-2)',
                  cursor: 'pointer',
                }}
              >
                {active ? '* ' : '  '}
                {t(option.labelKey)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

function App() {
  const [page, setPage] = useState<Page>('actionDesk');
  const config = useAppStore((s) => s.config);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const storageWarning = useAppStore((s) => s.storageWarning);
  const setStorageWarning = useAppStore((s) => s.setStorageWarning);
  const setSaveStatus = useAppStore((s) => s.setSaveStatus);
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.dataset.theme = config.theme ?? 'dark';
  }, [config.theme]);

  useEffect(() => {
    const handler = () => {
      setStorageWarning(true);
      setSaveStatus('warning');
    };
    window.addEventListener('matrix-storage-save-failed', handler);
    return () => window.removeEventListener('matrix-storage-save-failed', handler);
  }, [setSaveStatus, setStorageWarning]);

  useDayMigration();
  useDocumentTitle();

  const navButton = (target: Page, label: string) => (
    <button
      onClick={() => setPage(target)}
      className="font-h2"
      style={{
        background: 'none',
        border: 'none',
        color: page === target ? 'var(--accent-gold)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        padding: 'var(--space-1) var(--space-2)',
      }}
    >
      {page === target ? `[${label}]` : label}
    </button>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <nav
        style={{
          minHeight: '48px',
          borderBottom: '1px solid var(--border-primary)',
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-primary)',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        <div className="font-display" style={{ color: 'var(--text-primary)', userSelect: 'none' }}>
          Matrix Life OS
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          {navButton('actionDesk', t('nav.action'))}
          {navButton('reviewArchive', t('nav.review'))}
          {navButton('system', t('nav.system'))}
          <AsciiButton
            onClick={toggleTheme}
            className="font-h2"
            frame="tight"
            style={{ color: 'var(--text-secondary)' }}
            title={t('nav.toggleTheme')}
            ariaLabel={t('nav.toggleTheme')}
          >
            {config.theme === 'dark' ? '\u25D0' : '\u25D1'}
          </AsciiButton>
          <LanguageMenu />
        </div>
      </nav>

      {storageWarning && (
        <div
          style={{
            backgroundColor: 'var(--accent-danger)',
            color: 'var(--bg-primary)',
            padding: 'var(--space-2) var(--space-4)',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <span>{t('app.storageWarning')}</span>
          <AsciiButton
            onClick={() => {
              setPage('system');
            }}
            variant="danger"
            style={{
              color: 'var(--accent-danger)',
              fontSize: '12px',
            }}
          >
            {t('app.openSystem')}
          </AsciiButton>
          <AsciiButton
            onClick={() => setStorageWarning(false)}
            variant="danger"
            frame="tight"
            style={{
              color: 'var(--bg-primary)',
              fontSize: '12px',
              opacity: 0.8,
            }}
            title={t('app.dismissWarning')}
            ariaLabel={t('app.dismissWarning')}
          >
            x
          </AsciiButton>
        </div>
      )}

      <main style={{ padding: 'var(--space-6)' }}>
        {page === 'actionDesk' && <ActionDesk />}
        {page === 'reviewArchive' && <ReviewArchive />}
        {page === 'system' && <System />}
      </main>
    </div>
  );
}

export default App;
