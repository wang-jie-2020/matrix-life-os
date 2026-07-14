import React from 'react';
import AsciiBox from '../../components/AsciiBox';

const ManualPanel: React.FC = () => {
  return (
    <AsciiBox title="Short Help">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          Use Capture Notes for loose thoughts that are not dated tasks.
        </div>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          Use the Weekly Task Board for tasks that belong to a specific day.
        </div>
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          Use Goal Notes for simple goal text, and Reflections for dated review notes.
        </div>
      </div>
    </AsciiBox>
  );
};

export default ManualPanel;
