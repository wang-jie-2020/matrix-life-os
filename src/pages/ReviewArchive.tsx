import React, { useState } from 'react';
import AsciiBox from '../components/AsciiBox';
import ReflectionForm from '../features/reflections/ReflectionForm';
import ReflectionGrid from '../features/reflections/ReflectionGrid';
import ReflectionDetailModal from '../features/reflections/ReflectionDetailModal';
import { useTranslation } from '../i18n/react';
import { useAppStore } from '../store/useAppStore';
import type { Reflection } from '../types';

const ReviewArchive: React.FC = () => {
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const isModuleEnabled = useAppStore((s) => s.isModuleEnabled);
  const { t } = useTranslation();

  if (!isModuleEnabled('reflections')) {
    return (
      <div className="font-body" style={{ color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto' }}>
        {t('review.hidden')}
      </div>
    );
  }

  return (
    <div
      className="review-view-enter"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 420px) minmax(0, 1fr)',
        gap: 'var(--space-6)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <AsciiBox title={t('review.newReflection')}>
        <ReflectionForm />
      </AsciiBox>
      <AsciiBox title={t('review.pastReflections')}>
        <ReflectionGrid onViewDetail={setSelectedReflection} />
      </AsciiBox>
      <ReflectionDetailModal reflection={selectedReflection} onClose={() => setSelectedReflection(null)} />
    </div>
  );
};

export default ReviewArchive;
