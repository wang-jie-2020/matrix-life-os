import { useEffect, useState } from 'react';
import ActionDesk from './pages/ActionDesk';
import ReviewArchive from './pages/ReviewArchive';
import System from './pages/System';
import { useDayMigration } from './hooks/useDayMigration';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useAppStore } from './store/useAppStore';

type Page = 'actionDesk' | 'reviewArchive' | 'system';

function App() {
  const [page, setPage] = useState<Page>('actionDesk');
  const config = useAppStore((s) => s.config);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const storageWarning = useAppStore((s) => s.storageWarning);
  const setStorageWarning = useAppStore((s) => s.setStorageWarning);
  const setSaveStatus = useAppStore((s) => s.setSaveStatus);

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
          {navButton('actionDesk', 'Action')}
          {navButton('reviewArchive', 'Review')}
          {navButton('system', 'System')}
          <button
            onClick={toggleTheme}
            className="font-h2"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-2)',
            }}
            title="Toggle theme"
          >
            {config.theme === 'dark' ? 'Light' : 'Dark'}
          </button>
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
          <span>Data may not continue saving. Check Local Data Status in System.</span>
          <button
            onClick={() => {
              setPage('system');
            }}
            style={{
              background: 'var(--bg-primary)',
              border: 'none',
              color: 'var(--accent-danger)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: '2px var(--space-2)',
              fontSize: '12px',
            }}
          >
            Open System
          </button>
          <button
            onClick={() => setStorageWarning(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--bg-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: '2px var(--space-2)',
              fontSize: '12px',
              opacity: 0.8,
            }}
          >
            [x]
          </button>
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
