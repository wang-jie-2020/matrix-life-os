import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MODULE_REGISTRY } from './moduleRegistry';
import AsciiButton from '../../components/AsciiButton';

const ModuleManager: React.FC = () => {
  const enabledModules = useAppStore((s) => s.enabledModules);
  const toggleModule = useAppStore((s) => s.toggleModule);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {MODULE_REGISTRY.map((module) => {
        const enabled = enabledModules.length === 0 || enabledModules.includes(module.id);
        return (
          <div
            key={module.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) 0',
              borderBottom: '1px dashed var(--border-primary)',
            }}
          >
            <div>
              <div className="font-body" style={{ color: 'var(--text-primary)' }}>
                {module.name}
              </div>
              <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>
                {module.description}
              </div>
            </div>
            <AsciiButton
              onClick={() => {
                if (!module.core) toggleModule(module.id);
              }}
              disabled={module.core}
              frame="tight"
              title={module.core ? 'Core module is always shown' : enabled ? 'Hide module' : 'Show module'}
              ariaLabel={module.core ? 'Core module is always shown' : enabled ? 'Hide module' : 'Show module'}
              style={{
                border: '1px solid var(--border-primary)',
                color: enabled ? 'var(--accent-gold)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {module.core ? 'CORE' : enabled ? 'ON' : 'OFF'}
            </AsciiButton>
          </div>
        );
      })}
    </div>
  );
};

export default ModuleManager;
