import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, evaluateConditionForState } from '../../src/index.js';
import type { Condition } from '../../src/index.js';
import { createMockStoryBundle } from '../test-utils.js';

describe('History events', () => {
  it('records a rule event when expression parsing fails', () => {
    const story = createMockStoryBundle();
    const runtime = createRuntime({ story }).runtime!;
    const state = createNewGame(runtime);

    const condition: Condition = { type: 'expression', expr: 'flag.' };
    const result = evaluateConditionForState(runtime, state, condition);

    expect(result).toBe(false);
    expect(state.history?.some((event) => event.type === 'rule')).toBe(true);
  });
});
