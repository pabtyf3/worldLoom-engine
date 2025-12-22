/**
 * World and spatial schemas
 */
import { z } from 'zod';
import {
  IDSchema,
  RegionIDSchema,
  LocationIDSchema,
  SceneIDSchema,
  LayoutNodeIDSchema,
  DirectionSchema,
} from './base.js';
import { ConditionSchema } from './rules.js';
import { CompanionDefinitionSchema } from './companion.js';

export const LocationTypeSchema = z.enum(['town', 'dungeon', 'wilderness', 'interior', 'other']);

export const GridTileSchema = z.object({
  sceneId: SceneIDSchema,
  walkable: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const GridLayoutSchema = z.object({
  width: z.number(),
  height: z.number(),
  tiles: z
    .record(z.string(), GridTileSchema)
    .describe(
      'Sparse tile map. Key = "x,y". Values contain scene ids and optional collision/metadata'
    ),
});

export const LayoutNodeSchema = z.object({
  id: LayoutNodeIDSchema,
  sceneId: SceneIDSchema,
  tags: z.array(z.string()).optional(),
  label: z.string().optional(),
});

export const LayoutConnectionSchema = z.object({
  from: LayoutNodeIDSchema,
  to: LayoutNodeIDSchema,
  direction: DirectionSchema.optional().describe(
    'Optional direction hint for UI and tile renderers'
  ),
  lockedBy: ConditionSchema.optional().describe(
    'If present, engine only exposes this connection when condition is true'
  ),
  label: z
    .string()
    .optional()
    .describe('Optional label shown to player (e.g. "Gate to the Market")'),
});

export const LocationLayoutSchema = z.object({
  layoutType: z.enum(['nodeGraph', 'grid', 'abstract']),
  nodes: z.array(LayoutNodeSchema).optional().describe('NodeGraph / Abstract'),
  connections: z.array(LayoutConnectionSchema).optional(),
  grid: GridLayoutSchema.optional().describe('Grid'),
});

export const LocationSchema = z.object({
  id: LocationIDSchema,
  name: z.string(),
  type: LocationTypeSchema,
  description: z.string().optional(),
  entryScene: SceneIDSchema.describe(
    'Entry point if player arrives at this location via world travel'
  ),
  sceneIds: z
    .array(SceneIDSchema)
    .optional()
    .describe('Optional subset listing for validation and editor use'),
  layout: LocationLayoutSchema.optional().describe(
    'Optional layout for navigation intent (text now, tiles later)'
  ),
  loreLocationId: IDSchema.optional().describe(
    'Optional link to an abstract lore location for canon naming/history'
  ),
  tags: z.array(z.string()).optional(),
});

export const RegionSchema = z.object({
  id: RegionIDSchema,
  name: z.string(),
  description: z.string().optional(),
  climate: z.string().optional(),
  themes: z.array(z.string()).optional(),
  locationIds: z
    .array(LocationIDSchema)
    .optional()
    .describe('References to locations that belong to this region'),
});

export const SpatialNodeSchema = z.object({
  id: IDSchema,
  type: z.enum(['region', 'location', 'landmark']),
  refId: IDSchema.optional().describe('points to regionId or locationId'),
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const SpatialEdgeSchema = z.object({
  from: IDSchema,
  to: IDSchema,
  travelMode: z.enum(['foot', 'horse', 'wagon', 'ship', 'other']).optional(),
  distance: z.number().optional().describe('abstract units; UI decides representation'),
  condition: ConditionSchema.optional(),
});

export const SpatialGraphSchema = z.object({
  nodes: z.array(SpatialNodeSchema),
  edges: z.array(SpatialEdgeSchema),
});

export const WorldDefinitionSchema = z.object({
  id: IDSchema.optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  regions: z.array(RegionSchema).optional(),
  locations: z.array(LocationSchema),
  companions: z.array(CompanionDefinitionSchema).optional(),
  spatialGraph: SpatialGraphSchema.optional().describe(
    'Optional macro navigation graph between locations/regions'
  ),
});
