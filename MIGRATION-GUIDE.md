# Migration Guide: Using Schemas in worldLoom-studio

## Quick Start

The worldLoom-studio can now import and use the schemas from worldLoom-engine for validation.

## Installation

The studio should already depend on worldLoom-engine. If using a monorepo workspace:

```json
// worldLoom-studio/package.json
{
  "dependencies": {
    "worldloom-engine": "workspace:*"
  }
}
```

## Importing Schemas

### For Validation

```typescript
// In worldLoom-studio
import {
  validateStoryBundle,
  validateLoreBundle,
  StoryBundleSchema,
  LoreBundleSchema
} from 'worldloom-engine/schemas';
```

### For Types

```typescript
// In worldLoom-studio
import type {
  StoryBundle,
  LoreBundle,
  Scene,
  Action,
  Effect
} from 'worldloom-engine/schemas';
```

## Example: Validating Before Export

```typescript
// src/core/export/BundleExporter.ts
import { validateStoryBundle } from 'worldloom-engine/schemas';
import type { StoryBundle } from 'worldloom-engine/schemas';

export class BundleExporter {
  export(bundle: StoryBundle): BundleExportResult {
    // Validate before exporting
    try {
      const validated = validateStoryBundle(bundle);
      // Continue with export
      return this.createExportPayload(validated);
    } catch (error) {
      if (error instanceof ZodError) {
        // Return validation errors to user
        return {
          success: false,
          errors: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        };
      }
      throw error;
    }
  }
}
```

## Example: Validating User Input

```typescript
// When creating a new scene
import { SceneSchema } from 'worldloom-engine/schemas';
import type { Scene } from 'worldloom-engine/schemas';

function createScene(userInput: unknown): Scene {
  // Validate user input matches schema
  const scene = SceneSchema.parse(userInput);
  return scene;
}

// Or with safe parsing
function validateSceneInput(userInput: unknown) {
  const result = SceneSchema.safeParse(userInput);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues
    };
  }
  return {
    valid: true,
    scene: result.data
  };
}
```

## Example: Type-Safe Bundle Creation

```typescript
import type { StoryBundle } from 'worldloom-engine/schemas';
import { validateStoryBundle } from 'worldloom-engine/schemas';

class ProjectManager {
  createBundle(project: Project): StoryBundle {
    const bundle: StoryBundle = {
      version: '1.3.0',
      id: project.id,
      name: project.name,
      world: {
        locations: project.locations,
        // TypeScript ensures this matches StoryBundle shape
      },
      story: {
        scenes: project.scenes,
        startScene: project.startSceneId,
      },
      ruleModules: project.ruleModules || []
    };

    // Validate before returning
    return validateStoryBundle(bundle);
  }
}
```

## Replacing Studio's Custom Validation

If the studio has custom validation in `BundleValidator.ts`, you can simplify it:

### Before (Custom Validation)

```typescript
// Old approach
export class BundleValidator {
  validate(bundle: any): BundleValidationResult {
    const issues: ValidationIssue[] = [];

    if (!bundle.id) {
      issues.push({ path: 'id', message: 'Required' });
    }
    if (!bundle.name) {
      issues.push({ path: 'name', message: 'Required' });
    }
    // ... hundreds of lines of manual validation

    return { success: issues.length === 0, issues };
  }
}
```

### After (Using Zod Schemas)

```typescript
// New approach
import { StoryBundleSchema } from 'worldloom-engine/schemas';
import { ZodError } from 'zod';

export class BundleValidator {
  validate(bundle: unknown): BundleValidationResult {
    const result = StoryBundleSchema.safeParse(bundle);

    if (result.success) {
      return { success: true, issues: [] };
    }

    return {
      success: false,
      issues: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        severity: 'error' as const
      }))
    };
  }
}
```

## Benefits for Studio

1. **No Duplicate Validation** - Don't maintain separate validation logic
2. **Guaranteed Compatibility** - Studio exports what engine can load
3. **Better Error Messages** - Zod provides detailed validation errors
4. **Type Safety** - TypeScript types match runtime validation
5. **Single Source of Truth** - Engine defines the format

## Validation on Import

```typescript
// When loading a project from disk
import { validateStoryBundle } from 'worldloom-engine/schemas';

async function loadProject(path: string): Promise<StoryBundle> {
  const json = await fs.readFile(path, 'utf-8');
  const data = JSON.parse(json);

  // Validate before using
  return validateStoryBundle(data);
}
```

## Error Handling

```typescript
import { ZodError } from 'zod';
import { validateStoryBundle } from 'worldloom-engine/schemas';

try {
  const bundle = validateStoryBundle(unknownData);
} catch (error) {
  if (error instanceof ZodError) {
    // Show user-friendly errors
    for (const issue of error.issues) {
      console.error(`Error at ${issue.path.join('.')}: ${issue.message}`);
    }
    // Example output:
    // Error at story.scenes.0.narrative.text: Required
    // Error at world.locations.0.entryScene: Invalid scene ID
  }
}
```

## Integration Checklist

- [ ] Update studio to import schemas from `worldloom-engine/schemas`
- [ ] Replace custom validation with Zod schema validation
- [ ] Add validation before bundle export
- [ ] Add validation when loading projects
- [ ] Update type imports to use schema-inferred types
- [ ] Test with malformed bundles to verify error messages
- [ ] Remove duplicate type definitions from studio

## Next Steps

1. Update `BundleValidator.ts` to use schemas
2. Update `BundleExporter.ts` to validate before export
3. Update project loading to validate imported data
4. Remove duplicate type definitions
5. Test validation with edge cases
