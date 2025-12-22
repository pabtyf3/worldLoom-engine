/**
 * Character and inventory schemas
 */
import { z } from 'zod';
import { IDSchema, ItemIDSchema, RaceIDSchema, FactionIDSchema } from './base.js';

export const ItemSchema = z.object({
  id: ItemIDSchema,
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  loreItemId: IDSchema.optional().describe('Optional link to lore definition'),
  properties: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Arbitrary stats (damage, armour, value, etc.) interpreted by RuleModules'),
});

export const InventoryEntrySchema = z.object({
  item: ItemSchema,
  count: z.number(),
});

export const CharacterSchema = z.object({
  id: IDSchema.optional(),
  name: z.string(),
  stats: z.record(z.string(), z.number()).describe('Rule system decides which stats exist'),
  inventory: z.array(InventoryEntrySchema).describe('Inventory items owned'),
  raceId: RaceIDSchema.optional().describe('Optional world-facing attributes for lore/rules'),
  factionIds: z.array(FactionIDSchema).optional(),
  flags: z
    .record(z.string(), z.boolean())
    .optional()
    .describe('Arbitrary flags on the character specifically'),
});
