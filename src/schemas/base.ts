/**
 * Base schemas for common types and primitives
 */
import { z } from 'zod';

// Branded ID types
export const IDSchema = z.string();
export const StoryBundleIDSchema = IDSchema;
export const LoreBundleIDSchema = IDSchema;
export const SceneIDSchema = IDSchema;
export const LocationIDSchema = IDSchema;
export const RegionIDSchema = IDSchema;
export const LayoutNodeIDSchema = IDSchema;
export const AssetIDSchema = IDSchema;
export const RuleModuleIDSchema = IDSchema;
export const ItemIDSchema = IDSchema;
export const FactionIDSchema = IDSchema;
export const RaceIDSchema = IDSchema;
export const DeityIDSchema = IDSchema;
export const TraitIDSchema = IDSchema;
export const TimestampISOSchema = z.string(); // ISO 8601 timestamp string
export const LoreKeySchema = z.string();

// Lore reveal state
export const LoreRevealStateSchema = z.enum(['known', 'discoverable', 'hidden']);

// Versioning
export const VersionedSchema = z.object({
  version: z.string().describe('Semantic-ish version. Example: "1.3.0"'),
  schemaVersion: z
    .string()
    .optional()
    .describe('Optional schema version for migrations. Example: "storybundle@1.3"'),
});

// Localized text
export const LocalizedTextSchema = z.object({
  locale: z.string().describe('e.g. "en-GB"'),
  text: z.string(),
});

// Text variant
export const TextVariantSchema = z.object({
  text: z.string(),
  weight: z.number().optional().describe('Weighted random selection; default weight=1'),
  condition: z.lazy(() => ConditionSchemaPlaceholder).optional(),
});

// Narrative text (forward reference will be resolved later)
export const NarrativeTextSchema = z.union([
  z.string(),
  z.array(LocalizedTextSchema),
  z.array(TextVariantSchema),
]);

// Direction type
export const DirectionSchema = z.enum([
  'north',
  'south',
  'east',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
  'up',
  'down',
  'in',
  'out',
  'none',
]);

// Forward declaration for Condition (actual definition in rules.ts)
// This is a placeholder that will be resolved by circular import handling
const ConditionSchemaPlaceholder: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.object({
      type: z.literal('flag'),
      key: z.string(),
      operator: z.enum(['equals', 'notEquals', 'exists', 'notExists']).optional(),
      value: z.boolean().optional(),
    }),
    z.object({
      type: z.literal('stat'),
      key: z.string(),
      operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq', 'neq']),
      value: z.number(),
    }),
    z.object({
      type: z.literal('inventory'),
      key: ItemIDSchema,
      operator: z.enum(['has', 'notHas', 'countGte', 'countLte']).optional(),
      value: z.number().optional(),
    }),
    z.object({
      type: z.literal('expression'),
      expr: z.string(),
    }),
    z.object({
      type: z.literal('lore'),
      key: z.string(),
      operator: z.enum(['equals', 'notEquals', 'has', 'notHas']).optional(),
      value: z.unknown().optional(),
    }),
  ])
);

// Export as a non-exported internal reference
export { ConditionSchemaPlaceholder as ConditionSchemaRef };
