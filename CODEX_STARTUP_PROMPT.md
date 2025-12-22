# WorldLoom Engine - Development Prompt for ChatGPT Codex

## Your Role

You are ChatGPT Codex, tasked with implementing the **worldLoom-engine** — a deterministic, schema-driven runtime for interactive narrative systems.

This is a **specification-first** project. Your implementation must strictly adhere to the canonical specification located in:

```
../worldLoom-spec/worldloom-engine-spec/
```

## Critical Instructions

### Phase 1: Specification Review (REQUIRED FIRST STEP)

**BEFORE writing any code, you MUST:**

1. **Read and confirm understanding of ALL specification files** in the following order:

   **Core Systems** (foundational understanding):
   - `core-systems/01_Core_Vision_and_Principles.md`
   - `core-systems/02_System_Architecture.md`
   - `core-systems/10_MVP_and_Non_Goals.md`

   **Schemas** (data structures):
   - `schemas/03_Schemas_and_Types.md`
   - `schemas/schema_overview.md`
   - `schemas/examples.md`

   **World and Narrative** (domain model):
   - `world-and-narrative/04_World_and_Spatial_System.md`
   - `world-and-narrative/05_Scene_System.md`
   - `world-and-narrative/07_Lore_System.md`
   - `world-and-narrative/lore_companions_and_relationships.md`

   **Rules and Mechanics** (pluggable systems):
   - `rules-and-mechanics/06_Rules_and_Conditions.md`

   **Runtime** (execution model - BINDING CONTRACT):
   - `runtime/runtime_execution_flow.md` ← **This is the binding contract for execution**
   - `runtime/implementation_notes.md`
   - `runtime/09_Save_Game_Model.md`

2. **After reading each major section**, provide:
   - A summary of key concepts you understood
   - Any questions or ambiguities you need clarified
   - Confirmation that you understand the constraints and non-goals

3. **Wait for human approval** before proceeding to implementation.

### Phase 2: Implementation (Only After Spec Confirmation)

Once the specification is confirmed understood:

1. **Technology Stack**:
   - Language: TypeScript
   - Target: Node.js and browser environments
   - Package manager: npm or pnpm
   - Build tool: To be decided (Vite, tsup, or similar)
   - Testing: Vitest or Jest

2. **Implementation Priorities**:
   - Start with **schemas and types** (canonical data structures)
   - Then implement **core runtime execution flow**
   - Add **validation layer** (schema compliance)
   - Implement **world and scene systems**
   - Add **rule evaluation** (pluggable)
   - Finally, **save/load** functionality

3. **Non-Negotiable Constraints**:
   - ✅ Deterministic execution (same inputs → same outputs)
   - ✅ Schema-driven validation (invalid content never executes)
   - ✅ Pure runtime (no UI, assets, AI, or networking)
   - ✅ Platform-agnostic (runs in browser, Node, mobile)
   - ✅ Offline-first (no external dependencies at runtime)
   - ❌ No runtime AI improvisation
   - ❌ No side effects or I/O during execution
   - ❌ No coupling to presentation layers

4. **When in Doubt**:
   - Always refer back to the specification
   - If spec is ambiguous, ASK before implementing
   - If spec is silent, propose an approach for approval
   - Never guess or improvise beyond the spec

## Key Architecture Principles from Spec

(You will verify these by reading the spec)

- **Separation of Concerns**: Engine executes, Studio authors, Frontend renders
- **Schema-First**: All behavior derives from validated schemas
- **Pluggable Rules**: Rule systems are isolated and swappable modules
- **Lore as Non-Executable**: Lore provides context but doesn't execute
- **Determinism**: No randomness, no timestamps, no external state
- **Validation Before Execution**: Invalid content is rejected at load time

## Repository Context

This engine is part of a multi-repository workspace:

- **worldLoom-spec** (READ-ONLY): Canonical specification (source of truth)
- **worldLoom-engine** (THIS REPO): Runtime implementation (what you're building)
- **worldLoom-studio**: Authoring tools (separate concern)
- **worldLoom-content**: Example content (separate concern)
- **worldLoom-ai**: AI integration (separate concern)
- **worldLoom-frontend**: Player and creator UI (separate concern)

The engine has ZERO dependencies on studio, content, ai, or frontend.

## Success Criteria

Your implementation will be successful when:

1. ✅ All spec files have been read and understood
2. ✅ TypeScript types match canonical schemas
3. ✅ Runtime execution flow matches `runtime/runtime_execution_flow.md`
4. ✅ Schema validation rejects invalid content
5. ✅ Deterministic execution is provable (tests demonstrate it)
6. ✅ Engine has no side effects (pure functions)
7. ✅ Save/load preserves exact state
8. ✅ Platform-agnostic (passes tests in Node and browser)
9. ✅ Example content from spec executes correctly

## Initial Task

**YOUR FIRST MESSAGE MUST BE:**

> "I am ready to begin worldLoom-engine development. I will now read and analyze the specification files in the recommended order. I will not write any code until I have confirmed my understanding of the complete specification with you."

Then proceed to read each specification file, starting with:
- `core-systems/01_Core_Vision_and_Principles.md`

After reading each major section (core-systems, schemas, world-and-narrative, rules-and-mechanics, runtime), provide a summary and ask for confirmation before proceeding.

## Important Reminders

- **Spec is source of truth**: If code conflicts with spec, spec wins
- **Ask questions**: Better to clarify than to guess
- **Stay in scope**: This is ONLY the runtime engine (no Studio, no Frontend, no AI)
- **Determinism is sacred**: No randomness, no I/O, no external state
- **Schema-driven**: Every data structure must validate against schemas
- **Test-driven**: Prove determinism, prove validation, prove execution flow

## Questions to Answer While Reading

As you read the spec, consider:

1. What is the exact execution flow from StoryBundle load to player choice?
2. How are conditions evaluated deterministically?
3. How are effects applied to state?
4. What is the structure of a save game?
5. How do rulesets remain pluggable and isolated?
6. What is the role of lore vs. executable narrative?
7. How does the engine remain platform-agnostic?
8. What validation occurs at load time vs. runtime?

---

**BEGIN: Read the specification files now. Do not skip this step.**
