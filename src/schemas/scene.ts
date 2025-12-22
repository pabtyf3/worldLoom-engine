/**
 * Scene and story graph schemas
 */
import { z } from 'zod';
import { IDSchema, SceneIDSchema, NarrativeTextSchema } from './base.js';
import { ConditionSchema, EffectSchema, RuleHookSchema } from './rules.js';
import { AmbienceBlockSchema } from './assets.js';

export const LoreRefSchema = z.object({
  type: z
    .enum(['race', 'faction', 'deity', 'trait', 'location', 'item', 'event', 'other'])
    .describe('Category of referenced entity'),
  id: IDSchema,
  note: z.string().optional(),
});

export const NarrativeBlockSchema = z.object({
  text: NarrativeTextSchema,
  pov: z.enum(['first', 'third']).optional(),
  tone: z.string().optional(),
  loreRefs: z
    .array(LoreRefSchema)
    .optional()
    .describe('References to lore entities to ensure consistency and enable AI grounding later'),
  authorNotes: z
    .string()
    .optional()
    .describe('Optional inline prompts for future AI replacement (authoring-time use)'),
});

export const ExitSchema = z.object({
  label: z.string(),
  targetScene: SceneIDSchema,
  condition: ConditionSchema.optional(),
  travelText: NarrativeTextSchema.optional().describe('Optional narrative shown on traversal'),
});

export const ActionSchema = z.object({
  id: IDSchema,
  label: z.string(),
  condition: ConditionSchema.optional().describe('If false, action is hidden/disabled'),
  effects: z
    .array(EffectSchema)
    .optional()
    .describe('What happens when selected (engine applies effects + optional rule hooks)'),
  ruleHooks: z
    .array(RuleHookSchema)
    .optional()
    .describe(
      'Optional rule hooks when action occurs (for dice rolls, checks, combat triggers, etc.)'
    ),
  category: z
    .enum(['talk', 'search', 'use', 'combat', 'move', 'other'])
    .optional()
    .describe('Optional action category for UI grouping'),
});

export const SceneSchema = z.object({
  id: SceneIDSchema,
  title: z.string().optional(),
  narrative: NarrativeBlockSchema,
  ambience: AmbienceBlockSchema.optional(),
  exits: z
    .array(ExitSchema)
    .optional()
    .describe('Navigation between scenes (doors/paths/scene transitions)'),
  actions: z.array(ActionSchema).optional().describe('Interactive options beyond exits'),
  entryRules: z
    .array(RuleHookSchema)
    .optional()
    .describe('Optional rules that trigger on scene enter'),
  exitRules: z
    .array(RuleHookSchema)
    .optional()
    .describe('Optional rules that trigger on scene leave'),
  tags: z.array(z.string()).optional().describe('Editor/runtime hints (non-executable)'),
  locationId: IDSchema.optional(),
});

export const StoryGraphSchema = z.object({
  scenes: z.array(SceneSchema).describe('All scenes in this story (unique ids)'),
  startScene: SceneIDSchema.describe('Default starting scene for a new game'),
});
