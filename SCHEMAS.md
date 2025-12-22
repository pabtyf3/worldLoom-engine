# WorldLoom Engine - Schema Implementation

## Overview

The worldLoom-engine now uses **Zod schemas** as the single source of truth for all bundle formats and game state validation. This provides runtime validation while keeping TypeScript types in perfect sync.

## What Was Implemented

### ✅ Complete Schema Coverage

All types from `src/types/index.ts` have been converted to Zod schemas:

- **Base types** - IDs, timestamps, versioning, narrative text
- **Bundle formats** - StoryBundle, LoreBundle, metadata
- **Lore entities** - Races, factions, deities, traits, locations, items, events
- **World & spatial** - Locations, regions, layouts, spatial graphs
- **Story content** - Scenes, story graphs, narrative blocks, exits, actions
- **Rule system** - Conditions, effects, rule hooks, rule module refs
- **Character system** - Character, inventory, items
- **Optional features** - Companions, relationships, sessions
- **Game state** - Runtime state, history events

### 📁 Schema Organization

```
src/schemas/
├── base.ts           # Primitive types, IDs, common types
├── lore.ts           # Lore entities (races, factions, etc.)
├── assets.ts         # Asset references and ambience
├── character.ts      # Character, items, inventory
├── rules.ts          # Conditions, effects, rule hooks
├── companion.ts      # Companion and relationship system
├── session.ts        # Session orchestration
├── world.ts          # World definition, locations, spatial
├── scene.ts          # Scenes, story graph, narrative
├── bundle.ts         # StoryBundle and LoreBundle
├── state.ts          # GameState and runtime state
├── index.ts          # Main export with helper functions
└── README.md         # Documentation
```

## Usage

### Validating Bundles

```typescript
import { validateStoryBundle, StoryBundleSchema } from './schemas';

// Throws on validation error
const bundle = validateStoryBundle(jsonData);

// Safe parse (doesn't throw)
const result = StoryBundleSchema.safeParse(jsonData);
if (result.success) {
  console.log('Valid bundle:', result.data);
} else {
  console.error('Validation errors:', result.error.issues);
}
```

### Using Types

```typescript
import type { StoryBundle, Scene, Action, Effect } from './schemas';

function processScene(scene: Scene) {
  // TypeScript knows exact shape
}
```

### Type Inference

Types are automatically inferred from schemas:

```typescript
import { z } from 'zod';
import { SceneSchema } from './schemas';

// Type is automatically inferred
type Scene = z.infer<typeof SceneSchema>;
```

## Benefits

### 🛡️ Runtime Safety
- Validate bundles when loading from disk/network
- Catch malformed data before it causes runtime errors
- Clear error messages for debugging

### 🔄 Type Sync
- TypeScript types are inferred from schemas
- Impossible for types and validation to drift apart
- Single source of truth

### 📝 Self-Documenting
- Schema descriptions become documentation
- IDE shows field descriptions on hover
- Easy to understand data structure

### 🔧 Better Errors
```typescript
// Zod provides detailed error paths
{
  "path": ["story", "scenes", 0, "narrative", "text"],
  "message": "Required",
  "code": "invalid_type"
}
```

## Migration Path

### For Engine Code

The engine currently imports from `src/types/index.ts`. Both old and new imports work:

```typescript
// Old (still works, backward compatible)
import type { StoryBundle } from './types';

// New (preferred for new code)
import type { StoryBundle } from './schemas';
import { StoryBundleSchema } from './schemas';
```

### For Studio & Frontends

Projects that depend on worldLoom-engine can now validate bundles:

```typescript
// In worldLoom-studio or other projects
import {
  validateStoryBundle,
  StoryBundleSchema
} from 'worldloom-engine/schemas';
import type { StoryBundle } from 'worldloom-engine/schemas';

// Validate before export
const validated = validateStoryBundle(bundle);
```

## Next Steps

### Recommended Integrations

1. **Loader Enhancement** - Add validation to bundle loading
   ```typescript
   // In src/runtime/engine.ts loadStoryBundle
   export function loadStoryBundle(data: unknown): StoryBundle {
     return validateStoryBundle(data); // Now validates!
   }
   ```

2. **Save File Validation** - Validate game state on load
   ```typescript
   export function loadGameState(json: string): GameState {
     const data = JSON.parse(json);
     return validateGameState(data);
   }
   ```

3. **Studio Export** - Validate bundles before export
   ```typescript
   // In worldLoom-studio export
   const validated = validateStoryBundle(bundle);
   // Only export if validation passes
   ```

4. **JSON Schema Export** - Generate JSON Schema for tools
   ```typescript
   import { zodToJsonSchema } from 'zod-to-json-schema';
   const jsonSchema = zodToJsonSchema(StoryBundleSchema);
   ```

## Files Created

- ✅ `src/schemas/base.ts`
- ✅ `src/schemas/lore.ts`
- ✅ `src/schemas/assets.ts`
- ✅ `src/schemas/character.ts`
- ✅ `src/schemas/rules.ts`
- ✅ `src/schemas/companion.ts`
- ✅ `src/schemas/session.ts`
- ✅ `src/schemas/world.ts`
- ✅ `src/schemas/scene.ts`
- ✅ `src/schemas/bundle.ts`
- ✅ `src/schemas/state.ts`
- ✅ `src/schemas/index.ts`
- ✅ `src/schemas/README.md`
- ✅ `src/types/schema-types.ts` (alternative type export)

## Testing

All existing tests pass without modification. The schemas are fully compatible with the existing type system.

```bash
npm test
# Test Suites: 14 passed, 14 total
# Tests:       32 passed, 32 total
```

## Dependencies

- **zod** - Runtime validation library (added to package.json)

## Examples

See `src/schemas/README.md` for detailed usage examples and best practices.
