# WorldLoom Engine Schemas

This directory contains Zod schemas for runtime validation of WorldLoom bundles and game state.

## Overview

All bundle formats and game state are validated using Zod schemas. TypeScript types are inferred from these schemas to ensure type safety and runtime validation stay in sync.

## Usage

### Validating Bundles

```typescript
import { StoryBundleSchema, validateStoryBundle } from './schemas';

// Parse and validate (throws on error)
const bundle = StoryBundleSchema.parse(jsonData);

// Safe parse (returns result object)
const result = StoryBundleSchema.safeParse(jsonData);
if (result.success) {
  const bundle = result.data;
} else {
  console.error(result.error);
}

// Or use helper functions
try {
  const bundle = validateStoryBundle(jsonData);
} catch (error) {
  // Handle validation error
}
```

### Using Types

```typescript
import type { StoryBundle, Scene, Action } from './schemas';

function processBundle(bundle: StoryBundle) {
  // TypeScript knows the exact shape of bundle
}
```

### Importing from Other Projects

If you're using worldLoom-engine from the studio or another frontend:

```typescript
// Import schemas for validation
import { StoryBundleSchema, validateStoryBundle } from 'worldloom-engine/schemas';

// Import types for TypeScript
import type { StoryBundle, LoreBundle } from 'worldloom-engine/schemas';
```

## Schema Organization

- **base.ts** - Primitive types, IDs, common types
- **lore.ts** - Lore entities (races, factions, deities, etc.)
- **assets.ts** - Asset references and ambience
- **character.ts** - Character, items, inventory
- **rules.ts** - Conditions, effects, rule hooks
- **companion.ts** - Companion and relationship system
- **session.ts** - Session orchestration
- **world.ts** - World definition, locations, spatial graph
- **scene.ts** - Scenes, story graph, narrative
- **bundle.ts** - StoryBundle and LoreBundle
- **state.ts** - GameState and runtime state
- **index.ts** - Main export point

## Design Principles

1. **Single Source of Truth**: Types are inferred from schemas, not defined separately
2. **Runtime Validation**: All external data must pass validation
3. **Forward Compatibility**: Schemas use `.optional()` for non-critical fields
4. **Clear Errors**: Zod provides detailed validation error messages
5. **Modular**: Schemas are organized by domain for maintainability

## Migration from Legacy Types

The legacy types in `src/types/index.ts` are being maintained for backward compatibility. New code should import from `src/schemas/`:

```typescript
// Old (still works)
import type { StoryBundle } from '../types';

// New (preferred)
import type { StoryBundle } from '../schemas';
import { StoryBundleSchema } from '../schemas';
```

## Validation Best Practices

### When to Validate

- ✅ When loading bundles from disk/network
- ✅ When receiving data from external sources
- ✅ When deserializing save files
- ✅ Before exporting bundles
- ❌ Not needed for internal function calls (TypeScript handles this)

### Error Handling

```typescript
import { ZodError } from 'zod';

try {
  const bundle = validateStoryBundle(data);
} catch (error) {
  if (error instanceof ZodError) {
    // Detailed validation errors
    console.error('Validation failed:', error.issues);
    // Each issue has: path, message, code
  }
}
```

## Extending Schemas

When adding new fields:

1. Add the field to the appropriate schema file
2. Mark as `.optional()` if not strictly required
3. Add JSDoc description with `.describe()`
4. Run `npm run build` to ensure types are correct
5. Update tests if needed

Example:

```typescript
export const SceneSchema = z.object({
  id: SceneIDSchema,
  title: z.string().optional(),
  // New field
  difficulty: z.number().optional().describe('Optional difficulty rating 1-10'),
  // ...
});
```

## Testing

Run the validation test:

```bash
npx tsx src/schemas/test-validation.ts
```

This verifies that the schemas can validate real bundle structures.
