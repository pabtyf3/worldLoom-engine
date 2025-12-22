import type {
  Action,
  AmbienceBlock,
  Asset,
  Condition,
  Effect,
  Exit,
  GameState,
  HistoryEvent,
  LoreBundle,
  NarrativeText,
  RuleHook,
  RuleModule,
  RuleModuleID,
  RuleResult,
  Scene,
  StoryBundle,
} from '../types/index.js';
import { evaluateExpression } from './expression.js';
import { createDefaultRng } from './rng.js';
import type { RNG, ValidationError, ValidationResult } from '../types/index.js';
import { validateBundles, validateGameState } from './validation.js';

const DEFAULT_TIMESTAMP = '1970-01-01T00:00:00.000Z';

export interface RuntimeIndex {
  sceneById: Map<string, Scene>;
  locationById: Map<string, StoryBundle['world']['locations'][number]>;
  assetById: Map<string, Asset>;
  loreByType: {
    raceById: Map<string, unknown>;
    factionById: Map<string, unknown>;
    deityById: Map<string, unknown>;
    traitById: Map<string, unknown>;
    locationById: Map<string, unknown>;
    itemById: Map<string, unknown>;
    eventById: Map<string, unknown>;
  };
}

export interface RuntimeConfig {
  story: StoryBundle;
  loreBundles?: LoreBundle[];
  modules?: RuleModule[];
  rng?: RNG;
  locale?: string;
  conditionEvaluation?: ConditionEvaluationMode;
}

export interface RuntimeContext {
  story: StoryBundle;
  loreBundles: LoreBundle[];
  modules: Map<RuleModuleID, RuleModule>;
  rng: RNG;
  locale?: string;
  index: RuntimeIndex;
  conditionEvaluation: ConditionEvaluationMode;
}

export interface RenderModel {
  sceneId: string;
  locationId?: string;
  narrativeText: string;
  ambience?: AmbienceBlock;
  availableExits: Exit[];
  availableActions: Action[];
  recentNarrative?: string[];
}

export interface EngineResult {
  state: GameState;
  renderModel: RenderModel;
}

export interface RuntimeInitResult extends ValidationResult {
  runtime?: RuntimeContext;
}

export type ConditionEvaluationMode = 'engine' | 'engine+modules';

export interface LoadGameOptions {
  replayEntryRulesOnLoad?: boolean;
}

function buildIndex(story: StoryBundle, loreBundles: LoreBundle[]): RuntimeIndex {
  const sceneById = new Map<string, Scene>();
  story.story.scenes.forEach((scene) => sceneById.set(scene.id, scene));

  const locationById = new Map<string, StoryBundle['world']['locations'][number]>();
  story.world.locations.forEach((location) => locationById.set(location.id, location));

  const assetById = new Map<string, StoryBundle['assets'][number]>();
  story.assets?.forEach((asset) => assetById.set(asset.id, asset));

  const loreByType = {
    raceById: new Map<string, unknown>(),
    factionById: new Map<string, unknown>(),
    deityById: new Map<string, unknown>(),
    traitById: new Map<string, unknown>(),
    locationById: new Map<string, unknown>(),
    itemById: new Map<string, unknown>(),
    eventById: new Map<string, unknown>(),
  };

  loreBundles.forEach((bundle) => {
    bundle.races?.forEach((race) => loreByType.raceById.set(race.id, race));
    bundle.factions?.forEach((faction) => loreByType.factionById.set(faction.id, faction));
    bundle.deities?.forEach((deity) => loreByType.deityById.set(deity.id, deity));
    bundle.traits?.forEach((trait) => loreByType.traitById.set(trait.id, trait));
    bundle.locations?.forEach((location) => loreByType.locationById.set(location.id, location));
    bundle.items?.forEach((item) => loreByType.itemById.set(item.id, item));
    bundle.history?.forEach((event) => loreByType.eventById.set(event.id, event));
  });

  return { sceneById, locationById, assetById, loreByType };
}

function initModules(
  story: StoryBundle,
  modules: RuleModule[] = []
): { registry: Map<RuleModuleID, RuleModule>; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const registry = new Map<RuleModuleID, RuleModule>();

  const moduleById = new Map<string, RuleModule>();
  modules.forEach((module) => moduleById.set(module.id, module));

  story.ruleModules.forEach((ref, index) => {
    const module = moduleById.get(ref.id);
    if (!module) {
      errors.push({
        path: `/ruleModules/${index}`,
        message: `Missing rule module implementation for ${ref.id}`,
        severity: 'error',
      });
      return;
    }
    if (module.system !== ref.system) {
      errors.push({
        path: `/ruleModules/${index}/system`,
        message: `Rule module ${ref.id} system mismatch (expected ${ref.system}, got ${module.system})`,
        severity: 'error',
      });
      return;
    }
    registry.set(ref.id, module);
  });

  return { registry, errors };
}

export function createRuntime(config: RuntimeConfig): RuntimeInitResult {
  const loreBundles = config.loreBundles ?? [];
  const validation = validateBundles(config.story, loreBundles);
  const moduleInit = initModules(config.story, config.modules);
  const combinedErrors = [...validation.errors, ...moduleInit.errors];
  const ok = !combinedErrors.some((error) => error.severity === 'error');

  if (!ok) {
    return { ok, errors: combinedErrors };
  }

  return {
    ok,
    errors: combinedErrors,
    runtime: {
      story: config.story,
      loreBundles,
      modules: moduleInit.registry,
      rng: config.rng ?? createDefaultRng(),
      locale: config.locale,
      index: buildIndex(config.story, loreBundles),
      conditionEvaluation: config.conditionEvaluation ?? 'engine',
    },
  };
}

export function loadStoryBundle(input: string | StoryBundle): StoryBundle {
  return typeof input === 'string' ? (JSON.parse(input) as StoryBundle) : input;
}

export function loadLoreBundle(input: string | LoreBundle): LoreBundle {
  return typeof input === 'string' ? (JSON.parse(input) as LoreBundle) : input;
}

export function createNewGame(
  runtime: RuntimeContext,
  characterSeed?: Partial<GameState['character']>
): GameState {
  const startSceneId = runtime.story.story.startScene;
  const startScene = runtime.index.sceneById.get(startSceneId);

  const character = {
    name: characterSeed?.name ?? 'Player',
    stats: characterSeed?.stats ?? {},
    inventory: characterSeed?.inventory ?? [],
    raceId: characterSeed?.raceId,
    factionIds: characterSeed?.factionIds,
    flags: characterSeed?.flags,
  };

  const state: GameState = {
    version: runtime.story.version,
    schemaVersion: runtime.story.schemaVersion,
    storyBundleId: runtime.story.id,
    loreBundleIds: runtime.loreBundles.length
      ? runtime.loreBundles.map((bundle) => bundle.id)
      : undefined,
    currentSceneId: startSceneId,
    currentLocationId: startScene?.locationId,
    character,
    flags: {},
    vars: {},
    history: [],
  };

  return state;
}

export function saveGame(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function loadGame(
  runtime: RuntimeContext,
  input: string | GameState,
  options: LoadGameOptions = {}
): ValidationResult & { state?: GameState; renderModel?: RenderModel } {
  const state = typeof input === 'string' ? (JSON.parse(input) as GameState) : input;
  if (state.storyBundleId !== runtime.story.id) {
    return {
      ok: false,
      errors: [
        {
          path: '/storyBundleId',
          message: `Save storyBundleId ${state.storyBundleId} does not match ${runtime.story.id}`,
          severity: 'error',
        },
      ],
    };
  }
  const validation = validateGameState({
    currentSceneId: state.currentSceneId,
    storySceneIds: new Set(runtime.story.story.scenes.map((scene) => scene.id)),
  });

  if (!validation.ok) {
    return { ...validation, state: undefined };
  }

  if (options.replayEntryRulesOnLoad) {
    const result = enterScene(runtime, state, state.currentSceneId);
    return { ...validation, state: result.state, renderModel: result.renderModel };
  }

  return { ...validation, state };
}

function nowStamp(): string {
  return DEFAULT_TIMESTAMP;
}

function recordHistory(state: GameState, event: Omit<HistoryEvent, 'at'>): void {
  if (!state.history) return;
  state.history.push({
    ...event,
    at: nowStamp(),
  });
}

function resolveNarrativeText(
  text: NarrativeText,
  runtime: RuntimeContext,
  state: GameState
): string {
  if (typeof text === 'string') {
    return text;
  }

  if (
    Array.isArray(text) &&
    text.length > 0 &&
    typeof text[0] === 'object' &&
    'locale' in text[0]
  ) {
    const localized = text as { locale: string; text: string }[];
    if (!runtime.locale) {
      return localized[0].text;
    }
    const match = localized.find((entry) => entry.locale === runtime.locale);
    return match?.text ?? localized[0].text;
  }

  const variants = text as { text: string; weight?: number; condition?: Condition }[];
  const filtered = variants.filter(
    (variant) => !variant.condition || evaluateCondition(runtime, state, variant.condition)
  );
  if (filtered.length === 0) {
    return variants[0]?.text ?? '';
  }

  const totalWeight = filtered.reduce((sum, variant) => sum + (variant.weight ?? 1), 0);
  let pick = runtime.rng.next() * totalWeight;
  for (const variant of filtered) {
    pick -= variant.weight ?? 1;
    if (pick <= 0) {
      return variant.text;
    }
  }

  return filtered[filtered.length - 1].text;
}

function evaluateCondition(
  runtime: RuntimeContext,
  state: GameState,
  condition: Condition
): boolean {
  switch (condition.type) {
    case 'flag': {
      const value = state.flags[condition.key];
      const operator = condition.operator ?? 'equals';
      switch (operator) {
        case 'exists':
          return condition.key in state.flags;
        case 'notExists':
          return !(condition.key in state.flags);
        case 'notEquals':
          return value !== (condition.value ?? true);
        case 'equals':
        default:
          return value === (condition.value ?? true);
      }
    }
    case 'stat': {
      const statValue = state.character.stats[condition.key] ?? 0;
      switch (condition.operator) {
        case 'gt':
          return statValue > condition.value;
        case 'gte':
          return statValue >= condition.value;
        case 'lt':
          return statValue < condition.value;
        case 'lte':
          return statValue <= condition.value;
        case 'eq':
          return statValue === condition.value;
        case 'neq':
          return statValue !== condition.value;
        default:
          return false;
      }
    }
    case 'inventory': {
      const entry = state.character.inventory.find((item) => item.item.id === condition.key);
      const count = entry?.count ?? 0;
      const operator = condition.operator ?? 'has';
      const value = condition.value ?? 1;
      switch (operator) {
        case 'has':
          return count > 0;
        case 'notHas':
          return count === 0;
        case 'countGte':
          return count >= value;
        case 'countLte':
          return count <= value;
        default:
          return false;
      }
    }
    case 'expression': {
      const result = evaluateExpression(condition.expr, state);
      if (!result.value && result.error && runtime.conditionEvaluation === 'engine+modules') {
        return evaluateConditionWithModules(runtime, state, condition) ?? false;
      }
      return result.value;
    }
    case 'lore': {
      const key = condition.key;
      if (key.startsWith('race:')) {
        return state.character.raceId === key.slice('race:'.length);
      }
      if (key.startsWith('faction:')) {
        return state.character.factionIds?.includes(key.slice('faction:'.length)) ?? false;
      }
      if (key.startsWith('knows:')) {
        const knowledgeKey = `knows.${key.slice('knows:'.length)}`;
        return state.flags[knowledgeKey] || state.vars[knowledgeKey] === true;
      }
      const operator = condition.operator ?? 'equals';
      switch (operator) {
        case 'has':
          return Boolean(state.vars[key] ?? state.flags[key]);
        case 'notHas':
          return !(state.vars[key] ?? state.flags[key]);
        case 'notEquals':
          return (state.vars[key] ?? state.flags[key]) !== condition.value;
        case 'equals':
        default:
          return (state.vars[key] ?? state.flags[key]) === condition.value;
      }
    }
    default:
      return evaluateConditionWithModules(runtime, state, condition) ?? false;
  }
}

function evaluateConditionWithModules(
  runtime: RuntimeContext,
  state: GameState,
  condition: Condition
): boolean | undefined {
  if (runtime.conditionEvaluation !== 'engine+modules') {
    return undefined;
  }
  for (const module of runtime.modules.values()) {
    const result = module.evaluateCondition(condition, state, {
      sceneId: state.currentSceneId,
      locationId: state.currentLocationId,
    });
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
}
function resolveRuleHook(
  runtime: RuntimeContext,
  state: GameState,
  scene: Scene,
  hook: RuleHook,
  action?: Action
): RuleResult | undefined {
  if (hook.moduleId) {
    const module = runtime.modules.get(hook.moduleId);
    if (!module) {
      return undefined;
    }
    return module.resolve({ state, scene, action, hook, rng: runtime.rng });
  }

  for (const module of runtime.modules.values()) {
    const result = module.resolve({ state, scene, action, hook, rng: runtime.rng });
    if (result.effects || result.narrative || result.outcome || result.data) {
      return result;
    }
  }
  return undefined;
}

function applyEffects(
  _runtime: RuntimeContext,
  state: GameState,
  effects: Effect[] = []
): { state: GameState; teleportTarget?: string } {
  let teleportTarget: string | undefined;

  for (const effect of effects) {
    switch (effect.type) {
      case 'setFlag':
        state.flags[effect.key] = effect.value;
        break;
      case 'modifyStat': {
        const current = state.character.stats[effect.key] ?? 0;
        let next = current + effect.delta;
        if (effect.min !== undefined) {
          next = Math.max(effect.min, next);
        }
        if (effect.max !== undefined) {
          next = Math.min(effect.max, next);
        }
        state.character.stats[effect.key] = next;
        break;
      }
      case 'addItem': {
        const count = effect.count ?? 1;
        const existing = state.character.inventory.find((item) => item.item.id === effect.item.id);
        if (existing) {
          existing.count += count;
        } else {
          state.character.inventory.push({ item: effect.item, count });
        }
        break;
      }
      case 'removeItem': {
        const count = effect.count ?? 1;
        const existing = state.character.inventory.find((item) => item.item.id === effect.itemId);
        if (existing) {
          existing.count -= count;
          if (existing.count <= 0) {
            state.character.inventory = state.character.inventory.filter(
              (item) => item.item.id !== effect.itemId
            );
          }
        }
        break;
      }
      case 'setVar':
        state.vars[effect.key] = effect.value;
        break;
      case 'modifyVar': {
        const current = state.vars[effect.key];
        if (typeof current === 'number' && typeof effect.delta === 'number') {
          state.vars[effect.key] = current + effect.delta;
        } else if (typeof current === 'string' && typeof effect.delta === 'string') {
          state.vars[effect.key] = current + effect.delta;
        } else {
          state.vars[effect.key] = effect.delta;
        }
        break;
      }
      case 'teleport':
        teleportTarget = effect.targetScene;
        if (effect.targetLocationId) {
          state.currentLocationId = effect.targetLocationId;
        }
        break;
      case 'setReputation':
        if (!state.reputation) {
          state.reputation = {};
        }
        state.reputation[effect.factionId] = effect.value;
        break;
      default:
        break;
    }
    recordHistory(state, { type: 'effect', data: { effect: effect.type } });
  }

  return { state, teleportTarget };
}

function collectExits(scene: Scene, runtime: RuntimeContext, state: GameState): Exit[] {
  return (scene.exits ?? []).filter(
    (exit) => !exit.condition || evaluateCondition(runtime, state, exit.condition)
  );
}

function collectActions(scene: Scene, runtime: RuntimeContext, state: GameState): Action[] {
  return (scene.actions ?? []).filter(
    (action) => !action.condition || evaluateCondition(runtime, state, action.condition)
  );
}

function buildRenderModel(
  runtime: RuntimeContext,
  state: GameState,
  scene: Scene,
  overlays: string[] = [],
  recentNarrative: string[] = []
): RenderModel {
  const baseNarrative = resolveNarrativeText(scene.narrative.text, runtime, state);
  const narrativeText = [baseNarrative, ...overlays].filter(Boolean).join('\n\n');

  return {
    sceneId: scene.id,
    locationId: scene.locationId,
    narrativeText,
    ambience: scene.ambience,
    availableExits: collectExits(scene, runtime, state),
    availableActions: collectActions(scene, runtime, state),
    recentNarrative: recentNarrative.length ? recentNarrative : undefined,
  };
}

export function enterScene(
  runtime: RuntimeContext,
  state: GameState,
  sceneId: string
): EngineResult {
  const scene = runtime.index.sceneById.get(sceneId);
  if (!scene) {
    throw new Error(`Scene ${sceneId} not found`);
  }

  state.currentSceneId = sceneId;
  if (scene.locationId) {
    state.currentLocationId = scene.locationId;
  }

  recordHistory(state, { type: 'sceneEnter', sceneId });

  const overlays: string[] = [];
  for (const hook of scene.entryRules ?? []) {
    const result = resolveRuleHook(runtime, state, scene, hook);
    if (result?.effects) {
      const applied = applyEffects(runtime, state, result.effects);
      if (applied.teleportTarget) {
        return enterScene(runtime, state, applied.teleportTarget);
      }
    }
    if (result?.narrative) {
      overlays.push(resolveNarrativeText(result.narrative, runtime, state));
    }
  }

  return {
    state,
    renderModel: buildRenderModel(runtime, state, scene, overlays),
  };
}

export function getRenderModel(runtime: RuntimeContext, state: GameState): RenderModel {
  const scene = runtime.index.sceneById.get(state.currentSceneId);
  if (!scene) {
    throw new Error(`Scene ${state.currentSceneId} not found`);
  }
  return buildRenderModel(runtime, state, scene);
}

export function selectExit(
  runtime: RuntimeContext,
  state: GameState,
  exit: Exit | number
): EngineResult {
  const scene = runtime.index.sceneById.get(state.currentSceneId);
  if (!scene) {
    throw new Error(`Scene ${state.currentSceneId} not found`);
  }

  const targetExit = typeof exit === 'number' ? scene.exits?.[exit] : exit;
  if (!targetExit) {
    throw new Error('Exit not found');
  }

  if (targetExit.condition && !evaluateCondition(runtime, state, targetExit.condition)) {
    throw new Error('Exit condition failed');
  }

  recordHistory(state, {
    type: 'action',
    sceneId: scene.id,
    data: { kind: 'exit', label: targetExit.label },
  });

  for (const hook of scene.exitRules ?? []) {
    const result = resolveRuleHook(runtime, state, scene, hook);
    if (result?.effects) {
      const applied = applyEffects(runtime, state, result.effects);
      if (applied.teleportTarget) {
        return enterScene(runtime, state, applied.teleportTarget);
      }
    }
  }

  return enterScene(runtime, state, targetExit.targetScene);
}

export function selectAction(
  runtime: RuntimeContext,
  state: GameState,
  actionId: string
): EngineResult {
  const scene = runtime.index.sceneById.get(state.currentSceneId);
  if (!scene) {
    throw new Error(`Scene ${state.currentSceneId} not found`);
  }

  const action = scene.actions?.find((candidate) => candidate.id === actionId);
  if (!action) {
    throw new Error(`Action ${actionId} not found`);
  }

  if (action.condition && !evaluateCondition(runtime, state, action.condition)) {
    throw new Error('Action condition failed');
  }

  recordHistory(state, { type: 'action', sceneId: scene.id, actionId });

  let teleportTarget: string | undefined;
  if (action.effects) {
    const applied = applyEffects(runtime, state, action.effects);
    teleportTarget = applied.teleportTarget;
  }

  const actionNarrative: string[] = [];
  for (const hook of action.ruleHooks ?? []) {
    const result = resolveRuleHook(runtime, state, scene, hook, action);
    if (!result) continue;
    if (result.effects) {
      const applied = applyEffects(runtime, state, result.effects);
      teleportTarget = applied.teleportTarget ?? teleportTarget;
    }
    if (result.narrative) {
      actionNarrative.push(resolveNarrativeText(result.narrative, runtime, state));
    }
  }

  if (teleportTarget) {
    return enterScene(runtime, state, teleportTarget);
  }

  return {
    state,
    renderModel: buildRenderModel(runtime, state, scene, [], actionNarrative),
  };
}

export function evaluateConditionForState(
  runtime: RuntimeContext,
  state: GameState,
  condition: Condition
): boolean {
  return evaluateCondition(runtime, state, condition);
}

export function getAmbience(scene: Scene): AmbienceBlock | undefined {
  return scene.ambience;
}

export function getValidation(
  story: StoryBundle,
  loreBundles: LoreBundle[] = []
): ValidationResult {
  return validateBundles(story, loreBundles);
}
