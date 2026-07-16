import type { ModuleId, ModuleMeta } from '../../types';

export const MODULE_REGISTRY: ModuleMeta[] = [
  {
    id: 'captureNotes',
    nameKey: 'modules.captureNotes.name',
    descriptionKey: 'modules.captureNotes.description',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'weekBoard',
    nameKey: 'modules.weekBoard.name',
    descriptionKey: 'modules.weekBoard.description',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'goalNotes',
    nameKey: 'modules.goalNotes.name',
    descriptionKey: 'modules.goalNotes.description',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'reflections',
    nameKey: 'modules.reflections.name',
    descriptionKey: 'modules.reflections.description',
    defaultEnabled: true,
    core: false,
  },
  {
    id: 'dataStatus',
    nameKey: 'modules.dataStatus.name',
    descriptionKey: 'modules.dataStatus.description',
    defaultEnabled: true,
    core: true,
  },
];

export const DEFAULT_ENABLED_MODULES: ModuleId[] = MODULE_REGISTRY
  .filter((module) => module.defaultEnabled)
  .map((module) => module.id);
