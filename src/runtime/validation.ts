import type {
  Action,
  AmbienceBlock,
  AssetRef,
  Condition,
  LoreBundle,
  LoreRef,
  NarrativeText,
  Scene,
  StoryBundle,
  ValidationError,
  ValidationResult,
} from '../types/index.js';
import { validateExpression } from './expression.js';

interface LoreIndex {
  raceIds: Set<string>;
  factionIds: Set<string>;
  deityIds: Set<string>;
  traitIds: Set<string>;
  locationIds: Set<string>;
  itemIds: Set<string>;
  eventIds: Set<string>;
}

function buildLoreIndex(loreBundles: LoreBundle[]): LoreIndex {
  const index: LoreIndex = {
    raceIds: new Set(),
    factionIds: new Set(),
    deityIds: new Set(),
    traitIds: new Set(),
    locationIds: new Set(),
    itemIds: new Set(),
    eventIds: new Set(),
  };

  for (const bundle of loreBundles) {
    bundle.races?.forEach((race) => index.raceIds.add(race.id));
    bundle.factions?.forEach((faction) => index.factionIds.add(faction.id));
    bundle.deities?.forEach((deity) => index.deityIds.add(deity.id));
    bundle.traits?.forEach((trait) => index.traitIds.add(trait.id));
    bundle.locations?.forEach((loc) => index.locationIds.add(loc.id));
    bundle.items?.forEach((item) => index.itemIds.add(item.id));
    bundle.history?.forEach((event) => index.eventIds.add(event.id));
  }

  return index;
}

function addError(errors: ValidationError[], path: string, message: string): void {
  errors.push({ path, message, severity: 'error' });
}

function addWarning(errors: ValidationError[], path: string, message: string): void {
  errors.push({ path, message, severity: 'warning' });
}

function validateRequiredString(value: unknown, path: string, errors: ValidationError[]): void {
  if (typeof value !== 'string' || value.trim() === '') {
    addError(errors, path, 'Expected non-empty string');
  }
}

function collectAssetRefs(ambience?: AmbienceBlock): AssetRef[] {
  if (!ambience) return [];
  const refs: AssetRef[] = [];
  if (ambience.soundscape) refs.push(ambience.soundscape);
  if (ambience.music) refs.push(ambience.music);
  if (ambience.imagery) refs.push(...ambience.imagery);
  if (ambience.voice?.narrationAsset) refs.push(ambience.voice.narrationAsset);
  return refs;
}

function validateLoreRef(
  loreRef: LoreRef,
  loreIndex: LoreIndex,
  errors: ValidationError[],
  path: string
): void {
  const exists = ((): boolean => {
    switch (loreRef.type) {
      case 'race':
        return loreIndex.raceIds.has(loreRef.id);
      case 'faction':
        return loreIndex.factionIds.has(loreRef.id);
      case 'deity':
        return loreIndex.deityIds.has(loreRef.id);
      case 'trait':
        return loreIndex.traitIds.has(loreRef.id);
      case 'location':
        return loreIndex.locationIds.has(loreRef.id);
      case 'item':
        return loreIndex.itemIds.has(loreRef.id);
      case 'event':
        return loreIndex.eventIds.has(loreRef.id);
      case 'other':
        return true;
      default:
        return false;
    }
  })();

  if (!exists) {
    addWarning(errors, path, `LoreRef ${loreRef.type}:${loreRef.id} does not resolve`);
  }
}

function validateSceneRefs(
  scene: Scene,
  sceneIds: Set<string>,
  locationIds: Set<string>,
  errors: ValidationError[],
  path: string
): void {
  if (scene.locationId && !locationIds.has(scene.locationId)) {
    addWarning(errors, `${path}/locationId`, `Scene locationId ${scene.locationId} not found`);
  }

  scene.exits?.forEach((exit, index) => {
    if (!sceneIds.has(exit.targetScene)) {
      addError(
        errors,
        `${path}/exits/${index}/targetScene`,
        `Exit targetScene ${exit.targetScene} not found`
      );
    }
  });
}

function warnOnExpression(
  condition: Condition | undefined,
  errors: ValidationError[],
  path: string
): void {
  if (!condition || condition.type !== 'expression') {
    return;
  }
  const result = validateExpression(condition.expr);
  if (!result.ok) {
    addWarning(errors, path, `Expression parse warning: ${result.error ?? 'invalid expression'}`);
  }
}

function validateNarrativeText(text: NarrativeText, errors: ValidationError[], path: string): void {
  if (!Array.isArray(text)) {
    return;
  }
  if (text.length === 0) {
    return;
  }
  if (typeof text[0] === 'object' && 'text' in text[0] && !('locale' in text[0])) {
    const variants = text as { text: string; condition?: Condition }[];
    variants.forEach((variant, index) => {
      warnOnExpression(variant.condition, errors, `${path}/${index}/condition`);
    });
  }
}

function validateConditions(
  actions: Action[] | undefined,
  errors: ValidationError[],
  path: string
): void {
  if (!actions) return;
  actions.forEach((action, index) => {
    warnOnExpression(action.condition, errors, `${path}/${index}/condition`);
  });
}

export function validateBundles(
  story: StoryBundle,
  loreBundles: LoreBundle[] = []
): ValidationResult {
  const errors: ValidationError[] = [];

  validateRequiredString(story.id, '/id', errors);
  validateRequiredString(story.version, '/version', errors);
  validateRequiredString(story.name, '/name', errors);

  if (!story.world || !Array.isArray(story.world.locations)) {
    addError(errors, '/world/locations', 'Expected locations array');
  }

  if (!story.story || !Array.isArray(story.story.scenes)) {
    addError(errors, '/story/scenes', 'Expected scenes array');
  }

  if (!story.story || typeof story.story.startScene !== 'string') {
    addError(errors, '/story/startScene', 'Expected startScene id');
  }

  if (!Array.isArray(story.ruleModules)) {
    addError(errors, '/ruleModules', 'Expected ruleModules array');
  }

  const sceneIds = new Set<string>();
  story.story?.scenes?.forEach((scene, index) => {
    validateRequiredString(scene.id, `/story/scenes/${index}/id`, errors);
    if (sceneIds.has(scene.id)) {
      addError(errors, `/story/scenes/${index}/id`, `Duplicate scene id ${scene.id}`);
    }
    sceneIds.add(scene.id);
  });

  const locationIds = new Set<string>();
  story.world?.locations?.forEach((location, index) => {
    validateRequiredString(location.id, `/world/locations/${index}/id`, errors);
    if (locationIds.has(location.id)) {
      addError(errors, `/world/locations/${index}/id`, `Duplicate location id ${location.id}`);
    }
    locationIds.add(location.id);

    if (!sceneIds.has(location.entryScene)) {
      addError(
        errors,
        `/world/locations/${index}/entryScene`,
        `Location entryScene ${location.entryScene} not found`
      );
    }

    const layout = location.layout;
    if (layout?.nodes) {
      const nodeIds = new Set<string>();
      layout.nodes.forEach((node, nodeIndex) => {
        if (nodeIds.has(node.id)) {
          addError(
            errors,
            `/world/locations/${index}/layout/nodes/${nodeIndex}/id`,
            `Duplicate layout node id ${node.id}`
          );
        }
        nodeIds.add(node.id);
        if (!sceneIds.has(node.sceneId)) {
          addError(
            errors,
            `/world/locations/${index}/layout/nodes/${nodeIndex}/sceneId`,
            `Layout node sceneId ${node.sceneId} not found`
          );
        }
      });

      layout.connections?.forEach((connection, connIndex) => {
        if (!nodeIds.has(connection.from)) {
          addError(
            errors,
            `/world/locations/${index}/layout/connections/${connIndex}/from`,
            `Layout connection from ${connection.from} not found`
          );
        }
        if (!nodeIds.has(connection.to)) {
          addError(
            errors,
            `/world/locations/${index}/layout/connections/${connIndex}/to`,
            `Layout connection to ${connection.to} not found`
          );
        }
      });
    }
  });

  if (story.story?.startScene && !sceneIds.has(story.story.startScene)) {
    addError(errors, '/story/startScene', `Start scene ${story.story.startScene} not found`);
  }

  story.story?.scenes?.forEach((scene, index) => {
    validateSceneRefs(scene, sceneIds, locationIds, errors, `/story/scenes/${index}`);
  });

  const assetIds = new Set<string>();
  story.assets?.forEach((asset, index) => {
    if (assetIds.has(asset.id)) {
      addError(errors, `/assets/${index}/id`, `Duplicate asset id ${asset.id}`);
    }
    assetIds.add(asset.id);
  });

  const loreIndex = buildLoreIndex(loreBundles);
  story.story?.scenes?.forEach((scene, sceneIndex) => {
    validateNarrativeText(
      scene.narrative.text,
      errors,
      `/story/scenes/${sceneIndex}/narrative/text`
    );

    scene.narrative.loreRefs?.forEach((loreRef, refIndex) => {
      validateLoreRef(
        loreRef,
        loreIndex,
        errors,
        `/story/scenes/${sceneIndex}/narrative/loreRefs/${refIndex}`
      );
    });

    collectAssetRefs(scene.ambience).forEach((assetRef, refIndex) => {
      if (!assetIds.has(assetRef.id)) {
        addWarning(
          errors,
          `/story/scenes/${sceneIndex}/ambience/${refIndex}`,
          `AssetRef ${assetRef.id} not found in story assets`
        );
      }
    });

    scene.exits?.forEach((exit, exitIndex) => {
      warnOnExpression(
        exit.condition,
        errors,
        `/story/scenes/${sceneIndex}/exits/${exitIndex}/condition`
      );
    });

    validateConditions(scene.actions, errors, `/story/scenes/${sceneIndex}/actions`);

    scene.actions?.forEach((action, actionIndex) => {
      action.effects?.forEach((effect, effectIndex) => {
        if (effect.type === 'teleport' && !sceneIds.has(effect.targetScene)) {
          addError(
            errors,
            `/story/scenes/${sceneIndex}/actions/${actionIndex}/effects/${effectIndex}/targetScene`,
            `Teleport targetScene ${effect.targetScene} not found`
          );
        }
      });
    });
  });

  story.world?.locations?.forEach((location, locationIndex) => {
    location.layout?.connections?.forEach((connection, connectionIndex) => {
      warnOnExpression(
        connection.lockedBy,
        errors,
        `/world/locations/${locationIndex}/layout/connections/${connectionIndex}/lockedBy`
      );
    });
  });

  story.world?.spatialGraph?.edges?.forEach((edge, edgeIndex) => {
    warnOnExpression(edge.condition, errors, `/world/spatialGraph/edges/${edgeIndex}/condition`);
  });

  return {
    ok: !errors.some((error) => error.severity === 'error'),
    errors,
  };
}

export interface GameStateValidationInput {
  currentSceneId: string;
  storySceneIds: Set<string>;
}

export function validateGameState(input: GameStateValidationInput): ValidationResult {
  const errors: ValidationError[] = [];
  if (!input.storySceneIds.has(input.currentSceneId)) {
    addError(errors, '/currentSceneId', `Scene ${input.currentSceneId} not found`);
  }
  return { ok: !errors.some((error) => error.severity === 'error'), errors };
}

export function isConditionExpression(
  condition: Condition
): condition is { type: 'expression'; expr: string } {
  return condition.type === 'expression';
}
