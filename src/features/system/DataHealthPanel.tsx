import React from 'react';
import AsciiBox from '../../components/AsciiBox';
import { useAppStore } from '../../store/useAppStore';
import { formatBytes } from '../../utils/formatBytes';

const getStorageLocation = () =>
  window.electronAPI
    ? 'Stored locally in this app on this computer.'
    : 'Stored locally in this browser profile.';

const DataHealthPanel: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const captureNotes = useAppStore((s) => s.captureNotes);
  const goalNotes = useAppStore((s) => s.goalNotes);
  const reflections = useAppStore((s) => s.reflections);
  const saveStatus = useAppStore((s) => s.saveStatus);
  const sizeBytes = new Blob([JSON.stringify({ tasks, captureNotes, goalNotes, reflections })]).size;

  const rows = [
    ['Tasks', tasks.length],
    ['Capture Notes', captureNotes.length],
    ['Goal Notes', goalNotes.length],
    ['Reflections', reflections.length],
  ] as const;

  return (
    <AsciiBox title="Local Data Status">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          {getStorageLocation()}
        </div>
        <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
          Saved data: dated tasks, capture notes, goal notes, and dated reflections.
        </div>
        <div
          className="font-caption"
          style={{
            color: saveStatus === 'warning' ? 'var(--accent-danger)' : 'var(--accent-success)',
          }}
        >
          Save status: {saveStatus === 'warning' ? 'Data may not continue saving.' : 'Local saves are available.'}
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
          Current saved record size: {formatBytes(sizeBytes)}
        </div>
      </div>
    </AsciiBox>
  );
};

export default DataHealthPanel;
