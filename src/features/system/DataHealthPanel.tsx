import React from 'react';
import AsciiBox from '../../components/AsciiBox';
import { useTranslation } from '../../i18n/react';
import { useAppStore } from '../../store/useAppStore';
import { formatBytes } from '../../utils/formatBytes';

const DataHealthPanel: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const captureNotes = useAppStore((s) => s.captureNotes);
  const goalNotes = useAppStore((s) => s.goalNotes);
  const reflections = useAppStore((s) => s.reflections);
  const saveStatus = useAppStore((s) => s.saveStatus);
  const { t } = useTranslation();
  const sizeBytes = new Blob([JSON.stringify({ tasks, captureNotes, goalNotes, reflections })]).size;

  const rows = [
    [t('records.tasks'), tasks.length],
    [t('records.captureNotes'), captureNotes.length],
    [t('records.goalNotes'), goalNotes.length],
    [t('records.reflections'), reflections.length],
  ] as const;

  return (
    <AsciiBox title={t('modules.dataStatus.name')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          {window.electronAPI ? t('dataHealth.storageElectron') : t('dataHealth.storageBrowser')}
        </div>
        <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
          {t('dataHealth.savedData')}
        </div>
        <div
          className="font-caption"
          style={{
            color: saveStatus === 'warning' ? 'var(--accent-danger)' : 'var(--accent-success)',
          }}
        >
          {t('dataHealth.saveStatus')} {saveStatus === 'warning' ? t('dataHealth.saveWarning') : t('dataHealth.saveOk')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-2)' }}>
          {rows.map(([label, count]) => (
            <React.Fragment key={label}>
              <span className="font-caption" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </span>
              <span className="font-mono-data" style={{ color: 'var(--text-primary)' }}>
                {count}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>
          {t('dataHealth.currentSize')} {formatBytes(sizeBytes)}
        </div>
      </div>
    </AsciiBox>
  );
};

export default DataHealthPanel;
