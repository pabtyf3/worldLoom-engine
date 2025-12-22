/**
 * WorldLoom Engine Schemas
 *
 * This module provides Zod schemas for runtime validation of bundles and game state.
 * TypeScript types are inferred from these schemas to ensure type safety.
 */

// Re-export all schemas (note: base.js exports ConditionSchemaRef, rules.js exports ConditionSchema)
export * from './base.js';
export * from './lore.js';
export * from './assets.js';
export * from './character.js';
export {
  // Conditions
  FlagConditionSchema,
  StatConditionSchema,
  InventoryConditionSchema,
  ExpressionConditionSchema,
  LoreConditionSchema,
  ConditionSchema,
  // Effects
  SetFlagEffectSchema,
  ModifyStatEffectSchema,
  AddItemEffectSchema,
  RemoveItemEffectSchema,
  SetVariableEffectSchema,
  ModifyVariableEffectSchema,
  SetRelationshipEffectSchema,
  ModifyRelationshipEffectSchema,
  AddCompanionEffectSchema,
  RemoveCompanionEffectSchema,
  SetCompanionFlagEffectSchema,
  ModifyCompanionRelationshipEffectSchema,
  TeleportEffectSchema,
  SetReputationEffectSchema,
  EffectSchema,
  // Rule modules
  RuleModuleRefSchema,
  RuleHookSchema,
} from './rules.js';
export * from './companion.js';
export * from './session.js';
export * from './world.js';
export * from './scene.js';
export * from './bundle.js';
export * from './state.js';

// Import schemas for type inference
import { z } from 'zod';
import { StoryBundleSchema, LoreBundleSchema } from './bundle.js';
import { GameStateSchema } from './state.js';
import { SceneSchema } from './scene.js';
import { ConditionSchema, EffectSchema } from './rules.js';

// Export inferred types for convenience
export type StoryBundle = z.infer<typeof StoryBundleSchema>;
export type LoreBundle = z.infer<typeof LoreBundleSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Effect = z.infer<typeof EffectSchema>;

// Validation helper functions
export function validateStoryBundle(data: unknown): StoryBundle {
  return StoryBundleSchema.parse(data);
}

export function validateLoreBundle(data: unknown): LoreBundle {
  return LoreBundleSchema.parse(data);
}

export function validateGameState(data: unknown): GameState {
  return GameStateSchema.parse(data);
}

export function isValidStoryBundle(data: unknown): data is StoryBundle {
  return StoryBundleSchema.safeParse(data).success;
}

export function isValidLoreBundle(data: unknown): data is LoreBundle {
  return LoreBundleSchema.safeParse(data).success;
}

export function isValidGameState(data: unknown): data is GameState {
  return GameStateSchema.safeParse(data).success;
}
