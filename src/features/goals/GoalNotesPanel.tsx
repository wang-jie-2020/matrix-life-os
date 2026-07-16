import React, { useState } from 'react';
import AsciiBox from '../../components/AsciiBox';
import AsciiButton from '../../components/AsciiButton';
import { useTranslation } from '../../i18n/react';
import { useAppStore } from '../../store/useAppStore';

const GoalNotesPanel: React.FC = () => {
  const goalNotes = useAppStore((s) => s.goalNotes);
  const addGoalNote = useAppStore((s) => s.addGoalNote);
  const updateGoalNote = useAppStore((s) => s.updateGoalNote);
  const deleteGoalNote = useAppStore((s) => s.deleteGoalNote);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { t } = useTranslation();

  const addNote = () => {
    const content = draft.trim();
    if (!content) return;
    addGoalNote(content);
    setDraft('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const content = editingContent.trim();
    if (content) updateGoalNote(editingId, content);
    setEditingId(null);
    setEditingContent('');
  };

  return (
    <AsciiBox title={t('goals.title')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addNote();
            }}
            placeholder={t('goals.placeholder')}
            className="font-body"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              padding: 'var(--space-2) 0',
            }}
          />
          <AsciiButton onClick={addNote} frame="tight" title={t('goals.add')} ariaLabel={t('goals.add')}>
            +
          </AsciiButton>
        </div>

        {goalNotes.length === 0 ? (
          <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
            {t('goals.empty')}
          </div>
        ) : (
          goalNotes.map((note) => (
            <div
              key={note.id}
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'center',
                borderBottom: '1px dashed var(--border-primary)',
                paddingBottom: 'var(--space-2)',
              }}
            >
              {editingId === note.id ? (
                <input
                  autoFocus
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') saveEdit();
                    if (event.key === 'Escape') setEditingId(null);
                  }}
                  className="font-body"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--accent-gold)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              ) : (
                <span className="font-body" style={{ flex: 1, color: 'var(--text-primary)' }}>
                  {note.content}
                </span>
              )}
              <AsciiButton
                onClick={() => {
                  setEditingId(note.id);
                  setEditingContent(note.content);
                }}
                frame="tight"
                title={t('goals.edit')}
                ariaLabel={t('goals.edit')}
              >
                ✎
              </AsciiButton>
              <AsciiButton
                onClick={() => deleteGoalNote(note.id)}
                variant="danger"
                frame="tight"
                title={t('goals.delete')}
                ariaLabel={t('goals.delete')}
              >
                x
              </AsciiButton>
            </div>
          ))
        )}
      </div>
    </AsciiBox>
  );
};

export default GoalNotesPanel;
