import type { RuleModule, RuleResult } from '../../types/index.js';

/**
 * Minimal core rules stub for examples/tests.
 */
export class RulesCoreModule implements RuleModule {
  id = 'rules.core';
  system = 'Custom';

  evaluateCondition(): boolean {
    return true;
  }

  resolve(): RuleResult {
    return {};
  }
}
