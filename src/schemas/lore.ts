/**
 * Lore entity schemas
 */
import { z } from 'zod';
import { TraitIDSchema, RaceIDSchema, FactionIDSchema, DeityIDSchema, IDSchema } from './base.js';

export const TraitSchema = z.object({
  id: TraitIDSchema,
  name: z.string(),
  description: z.string(),
});

export const RaceSchema = z.object({
  id: RaceIDSchema,
  name: z.string(),
  description: z.string(),
  culture: z.string().optional(),
  physiology: z.string().optional(),
  playable: z.boolean(),
  traitIds: z.array(TraitIDSchema).optional(),
  statModifiers: z.record(z.string(), z.number()).optional(),
  tags: z.array(z.string()).optional(),
});

export const FactionRelationshipSchema = z.object({
  factionId: FactionIDSchema,
  stance: z.enum(['ally', 'enemy', 'neutral', 'unknown']),
  note: z.string().optional(),
});

export const FactionSchema = z.object({
  id: FactionIDSchema,
  name: z.string(),
  description: z.string(),
  ideology: z.string().optional(),
  alignment: z.string().optional(),
  goals: z.array(z.string()).optional(),
  relationships: z.array(FactionRelationshipSchema).optional(),
  tags: z.array(z.string()).optional(),
});

export const DeitySchema = z.object({
  id: DeityIDSchema,
  name: z.string(),
  domains: z.array(z.string()),
  alignment: z.string().optional(),
  worshipperFactionIds: z.array(FactionIDSchema).optional(),
  tags: z.array(z.string()).optional(),
});

export const LoreLocationSchema = z.object({
  id: IDSchema,
  name: z.string(),
  description: z.string(),
  region: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const LoreItemSchema = z.object({
  id: IDSchema,
  name: z.string(),
  description: z.string(),
  rarity: z.string().optional(),
  myth: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const LoreEventSchema = z.object({
  id: IDSchema,
  name: z.string(),
  description: z.string(),
  era: z.string().optional(),
  relatedFactionIds: z.array(FactionIDSchema).optional(),
  tags: z.array(z.string()).optional(),
});
