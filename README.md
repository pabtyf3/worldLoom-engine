# WorldLoom Engine

**WorldLoom Engine** is the open-source, deterministic runtime at the core of the WorldLoom platform.

It is responsible for **executing structured narrative systems** — not for authoring, rendering, or generating content.

The engine provides a stable foundation for interactive worlds built from stories, rules, and state.

---

## Purpose

WorldLoom Engine exists to do one thing well:

> **Execute narrative systems predictably and safely.**

It takes validated, structured content and:

- Applies rules
- Transitions state
- Resolves choices
- Produces outcomes

Nothing more, nothing less.

---

## Design Principles

The engine is intentionally opinionated and constrained.

- **Deterministic execution**\
  Given the same inputs, the engine will always produce the same results.

- **Schema-driven**\
  All input data is validated against versioned schemas before execution.

- **Pure runtime**\
  The engine has no knowledge of:

  - UI or presentation
  - Assets (audio, graphics, etc.)
  - AI systems
  - Networking
  - Persistence

- **Platform-agnostic**\
  The engine can run in:

  - Browsers
  - Desktop applications
  - Mobile apps
  - Headless environments

- **Offline-first**\
  No internet connection is required to execute content.

---

## What the Engine Does

WorldLoom Engine is responsible for:

- Loading validated story bundles
- Managing world and narrative state
- Evaluating declarative rulesets
- Resolving player choices
- Emitting deterministic execution results
- Producing structured outputs for presentation layers

---

## What the Engine Does *Not* Do

To maintain clarity and stability, the engine intentionally does **not**:

- Render text, audio, or graphics
- Interpret or generate natural language
- Invoke AI models or services
- Make network requests
- Manage user accounts or entitlements
- Load or store assets
- Persist state to disk or cloud

These responsibilities belong to higher-level tools and platforms.

---

## Architecture Overview

At a high level, the engine operates as:

1. **Input**

   - Story definitions
   - Rulesets
   - Initial state

2. **Validation**

   - Schema enforcement
   - Structural integrity checks

3. **Execution**

   - Rule evaluation
   - State transitions
   - Choice resolution

4. **Output**

   - Updated state
   - Available choices
   - Execution metadata

All steps are deterministic and side-effect free.

---

## Relationship to Other Repositories

WorldLoom Engine is one part of a larger system:

- ``\
  Defines the schemas and contracts enforced by the engine.

- ``\
  Provides creator-facing tools that author and simulate content executed by the engine.

- ``\
  Builds AI-driven systems on top of the engine’s deterministic core.

The engine does not depend on any of these repositories.

---

## Extensibility

The engine supports extensibility through **declarative, schema-defined modules**, including:

- Rulesets
- World models
- Theme metadata

Arbitrary code plugins are intentionally avoided to preserve:

- Determinism
- Safety
- Inspectability
- AI compatibility

---

## Stability & Versioning

The engine follows semantic versioning.

- **0.x** — Rapid development, breaking changes expected
- **1.0+** — Stable API, backward compatibility guaranteed within major versions

Schema versions are managed independently via `worldloom-spec`.

---

## Getting Started

> ⚠️ The engine is under active development and not yet production-ready.

Basic usage will look like:

```ts
import { Engine } from "worldloom-engine";

const engine = new Engine({
  story,
  ruleset,
  initialState
});

const result = engine.execute({
  choiceId: "choice.explore"
});
```

(Exact APIs will evolve until the first stable release.)

---

## Contributing

Contributions are welcome once the core execution model is stabilised.

Please note:

- The engine is intentionally minimal
- New features must align with documented non-goals
- Changes that introduce side effects or platform coupling will be rejected

See `CONTRIBUTING.md` for details.

---

## License

WorldLoom Engine is released under an open-source license.\
See the `LICENSE` file for details.

---

## Why the Engine Is Open Source

WorldLoom Engine is open-source to ensure:

- Trust and transparency
- Long-term maintainability
- Community extensibility
- Educational adoption
- AI-safe determinism

The engine is the foundation — the value of WorldLoom lies in the tools and ecosystems built on top of it.

