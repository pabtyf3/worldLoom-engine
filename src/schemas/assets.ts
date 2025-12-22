/**
 * Asset schemas
 */
import { z } from 'zod';
import { AssetIDSchema } from './base.js';

export const AssetTypeSchema = z.enum(['image', 'audio', 'voice', 'other']);

export const AssetSchema = z.object({
  id: AssetIDSchema,
  type: AssetTypeSchema,
  path: z.string(),
  mimeType: z.string().optional().describe('Optional metadata for loaders'),
  durationMs: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export const AssetRefSchema = z.object({
  id: AssetIDSchema,
  uri: z
    .string()
    .optional()
    .describe(
      'Optional: allow remote later; must be supported offline for Phase 1 shipping content'
    ),
});

export const VoiceSpecSchema = z.object({
  mode: z.enum(['none', 'partial', 'full']),
  narrationAsset: AssetRefSchema.optional().describe(
    'If pre-recorded narration exists, reference it here'
  ),
  voiceId: z.string().optional().describe('Optional future TTS voice name'),
  scope: z
    .enum(['scene', 'narrativeOnly', 'keyLines'])
    .optional()
    .describe('If partial, indicate which blocks are voiced'),
});

export const AmbienceBlockSchema = z.object({
  soundscape: AssetRefSchema.optional().describe('Ambient loop, e.g. wind, tavern murmur'),
  music: AssetRefSchema.optional().describe('Music bed'),
  imagery: z.array(AssetRefSchema).optional().describe('Optional illustration(s)'),
  voice: VoiceSpecSchema.optional().describe('Optional narration voice asset or TTS hint'),
  lighting: z.string().optional(),
  mood: z.string().optional(),
});
