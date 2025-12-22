import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, evaluateConditionForState } from '../../src/index.js';
import type { Condition, RuleModule } from '../../src/types/index.js';
import { createMockStoryBundle } from '../test-utils.js';

const overrideModule: RuleModule = {
  id: 'rules.override',
  system: 'Custom',
  evaluateCondition: (condition) => {
    if (condition.type === 'expression') {
      return condition.expr === 'flag.';
    }
    return false;
  },
  resolve: () => ({}),
};

describe('Condition override hooks', () => {
  it('delegates invalid expressions to modules when enabled', () => {
    const story = createMockStoryBundle({
      ruleModules: [{ id: 'rules.override', system: 'Custom' }],
    });
    const runtime = createRuntime({
      story,
      modules: [overrideModule],
      conditionEvaluation: 'engine+modules',
    }).runtime!;
    const state = createNewGame(runtime);

    const condition: Condition = { type: 'expression', expr: 'flag.' };

    expect(evaluateConditionForState(runtime, state, condition)).toBe(true);
  });
});
