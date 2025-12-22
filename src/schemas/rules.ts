/**
 * Rule system schemas (conditions, effects, hooks, modules)
 */
import { z } from 'zod';
import {
  RuleModuleIDSchema,
  ItemIDSchema,
  SceneIDSchema,
  LocationIDSchema,
  FactionIDSchema,
  IDSchema,
} from './base.js';
import { ItemSchema } from './character.js';

// Conditions
export const FlagConditionSchema = z.object({
  type: z.literal('flag'),
  key: z.string().describe('e.g. "met.blacksmith"'),
  operator: z.enum(['equals', 'notEquals', 'exists', 'notExists']).optional(),
  value: z.boolean().optional(),
});

export const StatConditionSchema = z.object({
  type: z.literal('stat'),
  key: z.string().describe('e.g. "str"'),
  operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq', 'neq']),
  value: z.number(),
});

export const InventoryConditionSchema = z.object({
  type: z.literal('inventory'),
  key: ItemIDSchema.describe('item id'),
  operator: z.enum(['has', 'notHas', 'countGte', 'countLte']).optional(),
  value: z.number().optional().describe('used for count comparisons'),
});

export const ExpressionConditionSchema = z.object({
  type: z.literal('expression'),
  expr: z.string().describe('Expression language defined by engine (see runtime-flow doc)'),
});

export const LoreConditionSchema = z.object({
  type: z.literal('lore'),
  key: z.string().describe('e.g. "race:elf", "faction:thievesGuild", "knows:event:ancientWar"'),
  operator: z.enum(['equals', 'notEquals', 'has', 'notHas']).optional(),
  value: z.unknown().optional(),
});

export const ConditionSchema = z.union([
  FlagConditionSchema,
  StatConditionSchema,
  InventoryConditionSchema,
  ExpressionConditionSchema,
  LoreConditionSchema,
]);

// Effects
export const SetFlagEffectSchema = z.object({
  type: z.literal('setFlag'),
  key: z.string(),
  value: z.boolean(),
});

export const ModifyStatEffectSchema = z.object({
  type: z.literal('modifyStat'),
  key: z.string(),
  delta: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const AddItemEffectSchema = z.object({
  type: z.literal('addItem'),
  item: ItemSchema,
  count: z.number().optional(),
});

export const RemoveItemEffectSchema = z.object({
  type: z.literal('removeItem'),
  itemId: ItemIDSchema,
  count: z.number().optional(),
});

export const SetVariableEffectSchema = z.object({
  type: z.literal('setVar'),
  key: z.string(),
  value: z.unknown(),
});

export const ModifyVariableEffectSchema = z.object({
  type: z.literal('modifyVar'),
  key: z.string(),
  delta: z
    .unknown()
    .describe('number delta or string append etc; engine decides semantics by current type'),
});

export const SetRelationshipEffectSchema = z.object({
  type: z.literal('setRelationship'),
  targetId: IDSchema,
  value: z.number(),
  stage: z.string().optional(),
  flags: z.record(z.string(), z.boolean()).optional(),
});

export const ModifyRelationshipEffectSchema = z.object({
  type: z.literal('modifyRelationship'),
  targetId: IDSchema,
  delta: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const AddCompanionEffectSchema = z.object({
  type: z.literal('addCompanion'),
  companionId: IDSchema,
});

export const RemoveCompanionEffectSchema = z.object({
  type: z.literal('removeCompanion'),
  companionId: IDSchema,
});

export const SetCompanionFlagEffectSchema = z.object({
  type: z.literal('setCompanionFlag'),
  companionId: IDSchema,
  key: z.string(),
  value: z.boolean(),
});

export const ModifyCompanionRelationshipEffectSchema = z.object({
  type: z.literal('modifyCompanionRelationship'),
  companionId: IDSchema,
  delta: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const TeleportEffectSchema = z.object({
  type: z.literal('teleport'),
  targetScene: SceneIDSchema,
  targetLocationId: LocationIDSchema.optional().describe(
    'Optional target location for bookkeeping/UI'
  ),
});

export const SetReputationEffectSchema = z.object({
  type: z.literal('setReputation'),
  factionId: FactionIDSchema,
  value: z.number(),
});

export const EffectSchema = z.union([
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
]);

// Rule modules and hooks
export const RuleModuleRefSchema = z.object({
  id: RuleModuleIDSchema,
  system: z.string().describe('e.g. "SRD5e", "OpenD6", "Custom"'),
  version: z.string().optional().describe('Optional module version/variant'),
  config: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Optional config passed to module at init'),
});

export const RuleHookSchema = z.object({
  moduleId: RuleModuleIDSchema.optional().describe(
    'Which module should handle this hook. If omitted, engine may broadcast to all modules'
  ),
  type: z
    .string()
    .describe('Hook type recognized by the module (e.g. "skillCheck", "attackRoll", "initiative")'),
  payload: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Arbitrary payload; module-defined'),
});
