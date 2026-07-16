import React from 'react';
import { useTranslation } from '../../i18n/react';
import { useAppStore } from '../../store/useAppStore';
import type { Reflection } from '../../types';

interface ReflectionGridProps {
  onViewDetail: (reflection: Reflection) => void;
}

const ReflectionGrid: React.FC<ReflectionGridProps> = ({ onViewDetail }) => {
  const reflections = useAppStore((s) => s.reflections);
  const { t } = useTranslation();
  const sorted = [...reflections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return (
      <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
        {t('reflection.empty')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {sorted.map((reflection) => (
        <button
          key={reflection.id}
          onClick={() => onViewDetail(reflection)}
          style={{
            textAlign: 'left',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            padding: 'var(--space-2)',
            cursor: 'pointer',
          }}
        >
          <div className="font-caption" style={{ color: 'var(--accent-gold)' }}>
            {reflection.date}
          </div>
          <div className="font-body">
            {reflection.content.length > 120 ? `${reflection.content.slice(0, 120)}...` : reflection.content}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ReflectionGrid;
