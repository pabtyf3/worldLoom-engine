/**
 * Type exports derived from Zod schemas
 *
 * These types are inferred from the runtime schemas in src/schemas/
 * and provide the same interface as the legacy types in index.ts
 *
 * Usage:
 * - Import schemas for validation: import { StoryBundleSchema } from '../schemas'
 * - Import types for type safety: import type { StoryBundle } from './schema-types'
 */

import { z } from 'zod';
import * as schemas from '../schemas/index.js';

// ID branded types
export type ID = z.infer<typeof schemas.IDSchema>;
export type StoryBundleID = z.infer<typeof schemas.StoryBundleIDSchema>;
export type LoreBundleID = z.infer<typeof schemas.LoreBundleIDSchema>;
export type SceneID = z.infer<typeof schemas.SceneIDSchema>;
export type LocationID = z.infer<typeof schemas.LocationIDSchema>;
export type RegionID = z.infer<typeof schemas.RegionIDSchema>;
export type LayoutNodeID = z.infer<typeof schemas.LayoutNodeIDSchema>;
export type AssetID = z.infer<typeof schemas.AssetIDSchema>;
export type RuleModuleID = z.infer<typeof schemas.RuleModuleIDSchema>;
export type ItemID = z.infer<typeof schemas.ItemIDSchema>;
export type FactionID = z.infer<typeof schemas.FactionIDSchema>;
export type RaceID = z.infer<typeof schemas.RaceIDSchema>;
export type DeityID = z.infer<typeof schemas.DeityIDSchema>;
export type TraitID = z.infer<typeof schemas.TraitIDSchema>;
export type TimestampISO = z.infer<typeof schemas.TimestampISOSchema>;
export type LoreKey = z.infer<typeof schemas.LoreKeySchema>;
export type LoreRevealState = z.infer<typeof schemas.LoreRevealStateSchema>;

// Base types
export type Versioned = z.infer<typeof schemas.VersionedSchema>;
export type LocalizedText = z.infer<typeof schemas.LocalizedTextSchema>;
export type TextVariant = z.infer<typeof schemas.TextVariantSchema>;
export type NarrativeText = z.infer<typeof schemas.NarrativeTextSchema>;
export type Direction = z.infer<typeof schemas.DirectionSchema>;

// Bundle types
export type StoryBundle = z.infer<typeof schemas.StoryBundleSchema>;
export type LoreBundle = z.infer<typeof schemas.LoreBundleSchema>;
export type BundleMetadata = z.infer<typeof schemas.BundleMetadataSchema>;
export type LoreBundleRef = z.infer<typeof schemas.LoreBundleRefSchema>;

// Lore types
export type Trait = z.infer<typeof schemas.TraitSchema>;
export type Race = z.infer<typeof schemas.RaceSchema>;
export type Faction = z.infer<typeof schemas.FactionSchema>;
export type FactionRelationship = z.infer<typeof schemas.FactionRelationshipSchema>;
export type Deity = z.infer<typeof schemas.DeitySchema>;
export type LoreLocation = z.infer<typeof schemas.LoreLocationSchema>;
export type LoreItem = z.infer<typeof schemas.LoreItemSchema>;
export type LoreEvent = z.infer<typeof schemas.LoreEventSchema>;

// World types
export type WorldDefinition = z.infer<typeof schemas.WorldDefinitionSchema>;
export type Region = z.infer<typeof schemas.RegionSchema>;
export type Location = z.infer<typeof schemas.LocationSchema>;
export type LocationType = z.infer<typeof schemas.LocationTypeSchema>;
export type LocationLayout = z.infer<typeof schemas.LocationLayoutSchema>;
export type LayoutNode = z.infer<typeof schemas.LayoutNodeSchema>;
export type LayoutConnection = z.infer<typeof schemas.LayoutConnectionSchema>;
export type GridLayout = z.infer<typeof schemas.GridLayoutSchema>;
export type GridTile = z.infer<typeof schemas.GridTileSchema>;
export type SpatialGraph = z.infer<typeof schemas.SpatialGraphSchema>;
export type SpatialNode = z.infer<typeof schemas.SpatialNodeSchema>;
export type SpatialEdge = z.infer<typeof schemas.SpatialEdgeSchema>;

// Scene types
export type StoryGraph = z.infer<typeof schemas.StoryGraphSchema>;
export type Scene = z.infer<typeof schemas.SceneSchema>;
export type NarrativeBlock = z.infer<typeof schemas.NarrativeBlockSchema>;
export type LoreRef = z.infer<typeof schemas.LoreRefSchema>;
export type Exit = z.infer<typeof schemas.ExitSchema>;
export type Action = z.infer<typeof schemas.ActionSchema>;

// Asset types
export type Asset = z.infer<typeof schemas.AssetSchema>;
export type AssetType = z.infer<typeof schemas.AssetTypeSchema>;
export type AssetRef = z.infer<typeof schemas.AssetRefSchema>;
export type AmbienceBlock = z.infer<typeof schemas.AmbienceBlockSchema>;
export type VoiceSpec = z.infer<typeof schemas.VoiceSpecSchema>;

// Rule types
export type Condition = z.infer<typeof schemas.ConditionSchema>;
export type FlagCondition = z.infer<typeof schemas.FlagConditionSchema>;
export type StatCondition = z.infer<typeof schemas.StatConditionSchema>;
export type InventoryCondition = z.infer<typeof schemas.InventoryConditionSchema>;
export type ExpressionCondition = z.infer<typeof schemas.ExpressionConditionSchema>;
export type LoreCondition = z.infer<typeof schemas.LoreConditionSchema>;

export type Effect = z.infer<typeof schemas.EffectSchema>;
export type SetFlagEffect = z.infer<typeof schemas.SetFlagEffectSchema>;
export type ModifyStatEffect = z.infer<typeof schemas.ModifyStatEffectSchema>;
export type AddItemEffect = z.infer<typeof schemas.AddItemEffectSchema>;
export type RemoveItemEffect = z.infer<typeof schemas.RemoveItemEffectSchema>;
export type SetVariableEffect = z.infer<typeof schemas.SetVariableEffectSchema>;
export type ModifyVariableEffect = z.infer<typeof schemas.ModifyVariableEffectSchema>;
export type SetRelationshipEffect = z.infer<typeof schemas.SetRelationshipEffectSchema>;
export type ModifyRelationshipEffect = z.infer<typeof schemas.ModifyRelationshipEffectSchema>;
export type AddCompanionEffect = z.infer<typeof schemas.AddCompanionEffectSchema>;
export type RemoveCompanionEffect = z.infer<typeof schemas.RemoveCompanionEffectSchema>;
export type SetCompanionFlagEffect = z.infer<typeof schemas.SetCompanionFlagEffectSchema>;
export type ModifyCompanionRelationshipEffect = z.infer<
  typeof schemas.ModifyCompanionRelationshipEffectSchema
>;
export type TeleportEffect = z.infer<typeof schemas.TeleportEffectSchema>;
export type SetReputationEffect = z.infer<typeof schemas.SetReputationEffectSchema>;

export type RuleModuleRef = z.infer<typeof schemas.RuleModuleRefSchema>;
export type RuleHook = z.infer<typeof schemas.RuleHookSchema>;

// Character types
export type Character = z.infer<typeof schemas.CharacterSchema>;
export type Item = z.infer<typeof schemas.ItemSchema>;
export type InventoryEntry = z.infer<typeof schemas.InventoryEntrySchema>;

// Companion types
export type RelationshipState = z.infer<typeof schemas.RelationshipStateSchema>;
export type CompanionDefinition = z.infer<typeof schemas.CompanionDefinitionSchema>;
export type CompanionState = z.infer<typeof schemas.CompanionStateSchema>;

// Session types
export type SessionPlayer = z.infer<typeof schemas.SessionPlayerSchema>;
export type SessionAction = z.infer<typeof schemas.SessionActionSchema>;
export type SessionState = z.infer<typeof schemas.SessionStateSchema>;
export type SessionConfig = z.infer<typeof schemas.SessionConfigSchema>;

// State types
export type GameState = z.infer<typeof schemas.GameStateSchema>;
export type HistoryEvent = z.infer<typeof schemas.HistoryEventSchema>;

// Re-export RuleModule and RNG interfaces (these are runtime contracts, not data schemas)
export interface RuleModule {
  id: RuleModuleID;
  system: string;
  evaluateCondition(cond: Condition, state: GameState, ctx?: EvaluationContext): boolean;
  resolve(ctx: RuleContext): RuleResult;
}

export interface EvaluationContext {
  sceneId?: SceneID;
  locationId?: LocationID;
  scope?: Record<string, unknown>;
}

export interface RuleContext {
  state: GameState;
  scene: Scene;
  action?: Action;
  hook?: RuleHook;
  rng?: RNG;
}

export interface RuleResult {
  narrative?: NarrativeText;
  effects?: Effect[];
  outcome?: 'success' | 'failure' | 'neutral';
  data?: Record<string, unknown>;
}

export interface RNG {
  next(): number;
  int(min: number, max: number): number;
  roll(notation: string): number;
}

// Validation types
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}
