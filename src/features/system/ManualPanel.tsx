import React from 'react';
import AsciiBox from '../../components/AsciiBox';
import { useTranslation } from '../../i18n/react';

const ManualPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AsciiBox title={t('manual.title')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          {t('manual.capture')}
        </div>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          {t('manual.tasks')}
        </div>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          {t('manual.goalsReflections')}
        </div>
      </div>
    </AsciiBox>
  );
};

export default ManualPanel;
