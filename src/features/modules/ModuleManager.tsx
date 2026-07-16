import React from 'react';
import { useTranslation } from '../../i18n/react';
import { useAppStore } from '../../store/useAppStore';
import { MODULE_REGISTRY } from './moduleRegistry';
import AsciiButton from '../../components/AsciiButton';

const ModuleManager: React.FC = () => {
  const enabledModules = useAppStore((s) => s.enabledModules);
  const toggleModule = useAppStore((s) => s.toggleModule);
  const { t } = useTranslation();

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
                {t(module.nameKey)}
              </div>
              <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>
                {t(module.descriptionKey)}
              </div>
            </div>
            <AsciiButton
              onClick={() => {
                if (!module.core) toggleModule(module.id);
              }}
              disabled={module.core}
              frame="tight"
              title={module.core ? t('modules.coreAlwaysShown') : enabled ? t('modules.hide') : t('modules.show')}
              ariaLabel={module.core ? t('modules.coreAlwaysShown') : enabled ? t('modules.hide') : t('modules.show')}
              style={{
                border: '1px solid var(--border-primary)',
                color: enabled ? 'var(--accent-gold)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {module.core ? t('modules.core') : enabled ? t('modules.on') : t('modules.off')}
            </AsciiButton>
          </div>
        );
      })}
    </div>
  );
};

export default ModuleManager;
