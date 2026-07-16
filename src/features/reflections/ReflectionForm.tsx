import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Reflection } from '../../types';
import AsciiButton from '../../components/AsciiButton';

interface ReflectionFormProps {
  existingReflection?: Reflection;
  defaultDate?: string;
  onSave?: () => void;
}

const ReflectionForm: React.FC<ReflectionFormProps> = ({ existingReflection, defaultDate, onSave }) => {
  const saveReflection = useAppStore((s) => s.saveReflection);
  const updateReflection = useAppStore((s) => s.updateReflection);
  const [date, setDate] = useState(existingReflection?.date ?? defaultDate ?? new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState(existingReflection?.content ?? '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    if (existingReflection) {
      updateReflection(existingReflection.id, { date, content: trimmed });
    } else {
      saveReflection({ date, content: trimmed, updatedAt: undefined });
    }
    setContent('');
    onSave?.();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <label className="font-caption" style={{ color: 'var(--text-secondary)' }}>
        Date
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          style={{
            display: 'block',
            marginTop: 'var(--space-1)',
            background: 'transparent',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            padding: 'var(--space-1)',
          }}
        />
      </label>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write the reflection"
        className="font-body"
        rows={6}
        style={{
          resize: 'vertical',
          background: 'transparent',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          padding: 'var(--space-2)',
          outline: 'none',
        }}
      />
      <AsciiButton
        type="submit"
        frame="tight"
        title="Save reflection"
        ariaLabel="Save reflection"
        style={{ alignSelf: 'flex-start' }}
      >
        ✓
      </AsciiButton>
    </form>
  );
};

export default ReflectionForm;
