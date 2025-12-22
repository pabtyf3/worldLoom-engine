/**
 * Game state and save/load schemas
 */
import { z } from 'zod';
import {
  VersionedSchema,
  StoryBundleIDSchema,
  LoreBundleIDSchema,
  SceneIDSchema,
  LocationIDSchema,
  TimestampISOSchema,
  IDSchema,
  LoreKeySchema,
  LoreRevealStateSchema,
  FactionIDSchema,
} from './base.js';
import { CharacterSchema } from './character.js';
import { CompanionStateSchema } from './companion.js';
import { RelationshipStateSchema } from './companion.js';
import { SessionStateSchema } from './session.js';

export const HistoryEventSchema = z.object({
  at: TimestampISOSchema,
  type: z.enum(['sceneEnter', 'sceneExit', 'action', 'effect', 'rule']),
  sceneId: SceneIDSchema.optional(),
  actionId: IDSchema.optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const GameStateSchema = VersionedSchema.extend({
  storyBundleId: StoryBundleIDSchema.describe('Active story bundle'),
  loreBundleIds: z.array(LoreBundleIDSchema).optional().describe('Active lore bundles (if any)'),
  currentSceneId: SceneIDSchema.describe('Current location/scene'),
  currentLocationId: LocationIDSchema.optional(),
  character: CharacterSchema,
  flags: z
    .record(z.string(), z.boolean())
    .describe('Global story flags (quest states, visited markers, etc.)'),
  vars: z
    .record(z.string(), z.unknown())
    .describe('Arbitrary variables for story/rules (numbers/strings/objects)'),
  loreKnowledge: z
    .record(LoreKeySchema, LoreRevealStateSchema)
    .optional()
    .describe('Optional lore reveal state keyed by lore id (e.g. "race:elf")'),
  reputation: z
    .record(FactionIDSchema, z.number())
    .optional()
    .describe('Optional reputation model by faction'),
  companions: z.array(CompanionStateSchema).optional().describe('Optional companion party state'),
  relationships: z
    .record(IDSchema, RelationshipStateSchema)
    .optional()
    .describe('Optional relationship data keyed by target id'),
  session: SessionStateSchema.optional().describe('Optional session orchestration state'),
  history: z.array(HistoryEventSchema).optional().describe('Engine log for debugging/telemetry'),
});
