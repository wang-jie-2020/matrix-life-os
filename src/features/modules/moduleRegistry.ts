import type { ModuleId, ModuleMeta } from '../../types';

export const MODULE_REGISTRY: ModuleMeta[] = [
  {
    id: 'captureNotes',
    name: 'Capture Notes',
    description: 'Loose notes that are not dated tasks.',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'weekBoard',
    name: 'Weekly Task Board',
    description: 'Dated tasks shown across one week.',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'goalNotes',
    name: 'Goal Notes',
    description: 'Simple notes for goals.',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'reflections',
    name: 'Reflections',
    description: 'Dated review notes.',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'dataStatus',
    name: 'Local Data Status',
    description: 'Readable status for locally saved records.',
    defaultEnabled: true,
    core: true,
  },
];

export const DEFAULT_ENABLED_MODULES: ModuleId[] = MODULE_REGISTRY
  .filter((module) => module.defaultEnabled)
  .map((module) => module.id);
