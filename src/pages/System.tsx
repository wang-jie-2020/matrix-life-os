import React from 'react';
import AsciiBox from '../components/AsciiBox';
import ModuleManager from '../features/modules/ModuleManager';
import DataHealthPanel from '../features/system/DataHealthPanel';
import VersionPanel from '../features/system/VersionPanel';
import ManualPanel from '../features/system/ManualPanel';

const System: React.FC = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(280px, 1fr))',
        gap: 'var(--space-6)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <AsciiBox title="Feature Visibility">
        <ModuleManager />
      </AsciiBox>
      <VersionPanel />
      <DataHealthPanel />
      <ManualPanel />
    </div>
  );
};

export default System;
