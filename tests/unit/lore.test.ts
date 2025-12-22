import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, evaluateConditionForState } from '../../src/index.js';
import type { Condition } from '../../src/types/index.js';
import { createMockStoryBundle } from '../test-utils.js';

describe('Lore conditions', () => {
  it('evaluates race and faction keys', () => {
    const story = createMockStoryBundle();
    const runtime = createRuntime({ story }).runtime!;
    const state = createNewGame(runtime, {
      raceId: 'race.elf',
      factionIds: ['faction.thieves'],
    });

    const raceCondition: Condition = { type: 'lore', key: 'race:race.elf' };
    const factionCondition: Condition = { type: 'lore', key: 'faction:faction.thieves' };
    const missingCondition: Condition = { type: 'lore', key: 'faction:faction.guard' };

    expect(evaluateConditionForState(runtime, state, raceCondition)).toBe(true);
    expect(evaluateConditionForState(runtime, state, factionCondition)).toBe(true);
    expect(evaluateConditionForState(runtime, state, missingCondition)).toBe(false);
  });

  it('evaluates knows keys via flags or vars', () => {
    const story = createMockStoryBundle();
    const runtime = createRuntime({ story }).runtime!;
    const state = createNewGame(runtime);

    state.flags['knows.event.secret'] = true;
    state.vars['knows.event.rumor'] = true;

    const flagCondition: Condition = { type: 'lore', key: 'knows:event.secret' };
    const varCondition: Condition = { type: 'lore', key: 'knows:event.rumor' };
    const unknownCondition: Condition = { type: 'lore', key: 'knows:event.other' };

    expect(evaluateConditionForState(runtime, state, flagCondition)).toBe(true);
    expect(evaluateConditionForState(runtime, state, varCondition)).toBe(true);
    expect(evaluateConditionForState(runtime, state, unknownCondition)).toBe(false);
  });
});
