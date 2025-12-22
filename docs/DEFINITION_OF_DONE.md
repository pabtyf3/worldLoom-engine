# Definition of Done (Engine)

This document defines what it means for worldLoom Engine to be "done" for the current phase.
Items are organized by required core behavior and optional features that can be enabled
without breaking determinism or the base runtime.

## Core Requirements (Must Have)

- Deterministic execution: same inputs produce same outputs across platforms.
- Schema-first runtime: StoryBundle + LoreBundle validated before execution.
- Runtime execution flow matches `runtime_execution_flow.md` (v1.3).
- Stable public API surface for runtime creation, execution, and save/load.
- Save/load preserves exact state and supports replayEntryRulesOnLoad option.
- Condition evaluation supports flag/stat/inventory/lore/expression.
- Effects apply sequentially and record history events.
- Test coverage for determinism, validation, execution, and save/load.
- No side effects or I/O inside runtime execution (pure functions).
- CLI example can run a sample bundle end-to-end in terminal.

## Optional Feature Set (Should Have, Optional/Config-Gated)

These features are implemented but remain optional and off by default.
They must not change core runtime behavior unless explicitly enabled.

- Lore reveal states (known/discoverable/hidden) with optional gating helpers.
- Companion entities with relationship variables and participation rules.
- Relationship mechanics (including romance) as a specialization of relationships.
- Session orchestration primitives for multiplayer-safe input aggregation.

## Non-Goals (Out of Scope for Done)

- Real-time combat simulation.
- Procedural map generation.
- AI DM runtime.
- Presentation-layer rendering or UI.

## Acceptance Checklist

- All Core Requirements are met with tests.
- Optional features are behind explicit configuration flags.
- Public docs list supported optional features and how to enable them.
- No open blocking issues in the engine backlog.

## Status Notes (Current)

- Optional features implemented: lore reveal states, companions, relationships, sessions.
- Optional features are gated via `optionalFeatures` in runtime config.
