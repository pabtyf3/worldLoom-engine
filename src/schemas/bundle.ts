/**
 * Bundle schemas (StoryBundle, LoreBundle)
 */
import { z } from 'zod';
import {
  StoryBundleIDSchema,
  LoreBundleIDSchema,
  VersionedSchema,
  TimestampISOSchema,
} from './base.js';
import { WorldDefinitionSchema } from './world.js';
import { StoryGraphSchema } from './scene.js';
import { RuleModuleRefSchema } from './rules.js';
import { AssetSchema } from './assets.js';
import {
  RaceSchema,
  FactionSchema,
  DeitySchema,
  TraitSchema,
  LoreLocationSchema,
  LoreItemSchema,
  LoreEventSchema,
} from './lore.js';

export const BundleMetadataSchema = z.object({
  author: z.string().optional(),
  license: z.string().optional(),
  createdAt: TimestampISOSchema.optional(),
  updatedAt: TimestampISOSchema.optional(),
  themes: z.array(z.string()).optional().describe('e.g. "horror", "western", "dungeon-crawl"'),
  contentRating: z.enum(['everyone', 'teen', 'mature']).optional().describe('For UI filtering'),
});

export const LoreBundleRefSchema = z.object({
  id: LoreBundleIDSchema,
});

export const StoryBundleSchema = VersionedSchema.extend({
  id: StoryBundleIDSchema,
  name: z.string(),
  description: z.string().optional(),
  loreRefs: z
    .array(LoreBundleRefSchema)
    .optional()
    .describe('Optional link to a lore pack for world canon'),
  world: WorldDefinitionSchema,
  story: StoryGraphSchema,
  ruleModules: z.array(RuleModuleRefSchema).describe('Which rule modules this story expects'),
  assets: z.array(AssetSchema).optional().describe('Optional assets shipped with the story'),
  metadata: BundleMetadataSchema.optional(),
});

export const LoreBundleSchema = VersionedSchema.extend({
  id: LoreBundleIDSchema,
  name: z.string(),
  description: z.string().optional(),
  races: z.array(RaceSchema).optional(),
  factions: z.array(FactionSchema).optional(),
  deities: z.array(DeitySchema).optional(),
  traits: z.array(TraitSchema).optional(),
  locations: z
    .array(LoreLocationSchema)
    .optional()
    .describe('Abstract lore locations; NOT runtime navigation'),
  items: z.array(LoreItemSchema).optional(),
  history: z.array(LoreEventSchema).optional(),
  tags: z.array(z.string()).optional(),
  metadata: BundleMetadataSchema.optional(),
});
