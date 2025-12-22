import { describe, it, expect } from '@jest/globals';
import { evaluateExpression } from '../../src/runtime/expression.js';
import { createMockGameState } from '../test-utils.js';

describe('Expression evaluator', () => {
  it('evaluates stat/flag expressions', () => {
    const state = createMockGameState({
      flags: { met: true },
      character: { name: 'Player', stats: { str: 12 }, inventory: [] },
    });

    const result = evaluateExpression('flag.met == true && stat.str >= 10', state);
    expect(result.value).toBe(true);
  });

  it('returns false on invalid expression', () => {
    const state = createMockGameState();
    const result = evaluateExpression('flag.', state);
    expect(result.value).toBe(false);
    expect(result.error).toBeDefined();
  });
});
