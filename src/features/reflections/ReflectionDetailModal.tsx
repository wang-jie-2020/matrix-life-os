import React, { useState } from 'react';
import type { Reflection } from '../../types';
import ReflectionForm from './ReflectionForm';
import { useAppStore } from '../../store/useAppStore';
import AsciiButton from '../../components/AsciiButton';

interface ReflectionDetailModalProps {
  reflection: Reflection | null;
  onClose: () => void;
}

const ReflectionDetailModal: React.FC<ReflectionDetailModalProps> = ({ reflection, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const deleteReflection = useAppStore((s) => s.deleteReflection);

  if (!reflection) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 8, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          padding: 'var(--space-6)',
          maxWidth: '560px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 className="font-h2" style={{ margin: 0, color: 'var(--accent-gold)' }}>
            {isEditing ? 'Edit Reflection' : `Reflection - ${reflection.date}`}
          </h3>
          <AsciiButton onClick={onClose} className="font-h2" frame="tight" title="Close" ariaLabel="Close">
            x
          </AsciiButton>
        </div>

        {isEditing ? (
          <ReflectionForm
            existingReflection={reflection}
            onSave={() => {
              setIsEditing(false);
              onClose();
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="font-body" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
              {reflection.content}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <AsciiButton
                onClick={() => setIsEditing(true)}
                frame="tight"
                title="Edit reflection"
                ariaLabel="Edit reflection"
              >
                ✎
              </AsciiButton>
              <AsciiButton
                onClick={() => {
                  deleteReflection(reflection.id);
                  onClose();
                }}
                variant="danger"
                frame="tight"
                title="Delete reflection"
                ariaLabel="Delete reflection"
              >
                x
              </AsciiButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionDetailModal;
