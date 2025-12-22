/**
 * Companion and relationship schemas
 */
import { z } from 'zod';
import { IDSchema } from './base.js';

export const RelationshipStateSchema = z.object({
  value: z.number(),
  stage: z.string().optional(),
  flags: z.record(z.string(), z.boolean()).optional(),
});

export const CompanionDefinitionSchema = z.object({
  id: IDSchema,
  name: z.string(),
  role: z.string().optional(),
  description: z.string().optional(),
  defaultRelationship: RelationshipStateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const CompanionStateSchema = z.object({
  id: IDSchema,
  name: z.string(),
  role: z.string().optional(),
  relationship: RelationshipStateSchema.optional(),
  flags: z.record(z.string(), z.boolean()).optional(),
});
