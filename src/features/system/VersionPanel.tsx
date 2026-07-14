import React, { useMemo } from 'react';
import AsciiBox from '../../components/AsciiBox';
import { CURRENT_APP_VERSION } from '../../utils/migrateAppData';

const VersionPanel: React.FC = () => {
  const version = useMemo(() => {
    try {
      return window.electronAPI?.getAppVersion?.() || CURRENT_APP_VERSION;
    } catch {
      return CURRENT_APP_VERSION;
    }
  }, []);

  return (
    <AsciiBox title="Version">
      <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
        Current version: <span className="font-mono-data" style={{ color: 'var(--accent-gold)' }}>{version}</span>
      </div>
    </AsciiBox>
  );
};

export default VersionPanel;
