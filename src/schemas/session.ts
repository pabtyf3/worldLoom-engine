/**
 * Session orchestration schemas
 */
import { z } from 'zod';
import { IDSchema, TimestampISOSchema } from './base.js';

export const SessionPlayerSchema = z.object({
  id: IDSchema,
  name: z.string().optional(),
  role: z.string().optional(),
});

export const SessionActionSchema = z.object({
  playerId: IDSchema,
  actionId: IDSchema.optional(),
  exitLabel: z.string().optional(),
  at: TimestampISOSchema,
});

export const SessionStateSchema = z.object({
  id: IDSchema,
  players: z.array(SessionPlayerSchema),
  currentTurn: z.number().optional(),
  pendingActions: z.array(SessionActionSchema).optional(),
});

export const SessionConfigSchema = z.object({
  requiredPlayers: z.number().optional(),
  mode: z.enum(['consensus', 'first', 'majority']).optional(),
});
