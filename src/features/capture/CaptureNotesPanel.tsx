import React, { useState } from 'react';
import AsciiBox from '../../components/AsciiBox';
import AsciiButton from '../../components/AsciiButton';
import { useTranslation } from '../../i18n/react';
import { useAppStore } from '../../store/useAppStore';

const CaptureNotesPanel: React.FC = () => {
  const captureNotes = useAppStore((s) => s.captureNotes);
  const addCaptureNote = useAppStore((s) => s.addCaptureNote);
  const updateCaptureNote = useAppStore((s) => s.updateCaptureNote);
  const deleteCaptureNote = useAppStore((s) => s.deleteCaptureNote);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { t } = useTranslation();

  const addNote = () => {
    const content = draft.trim();
    if (!content) return;
    addCaptureNote(content);
    setDraft('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const content = editingContent.trim();
    if (content) updateCaptureNote(editingId, content);
    setEditingId(null);
    setEditingContent('');
  };

  return (
    <AsciiBox title={t('capture.title')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addNote();
            }}
            placeholder={t('capture.placeholder')}
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
          <AsciiButton onClick={addNote} frame="tight" title={t('capture.add')} ariaLabel={t('capture.add')}>
            +
          </AsciiButton>
        </div>

        {captureNotes.length === 0 ? (
          <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
            {t('capture.empty')}
          </div>
        ) : (
          captureNotes.map((note) => (
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
                title={t('capture.edit')}
                ariaLabel={t('capture.edit')}
              >
                ✎
              </AsciiButton>
              <AsciiButton
                onClick={() => deleteCaptureNote(note.id)}
                variant="danger"
                frame="tight"
                title={t('capture.delete')}
                ariaLabel={t('capture.delete')}
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

export default CaptureNotesPanel;
