import type { RuleContext, RuleModule, RuleResult } from '../types/index.js';

/**
 * Sample RuleModule implementation demonstrating hooks and simple conditions.
 */
export class SampleRuleModule implements RuleModule {
  id = 'rules.sample';
  system = 'Custom';

  evaluateCondition(): boolean {
    return true;
  }

  resolve({ hook }: RuleContext): RuleResult {
    if (!hook) {
      return {};
    }
    if (hook.type === 'sampleNarrative') {
      return {
        narrative: 'Sample rule narrative.',
      };
    }
    if (hook.type === 'sampleEffect') {
      return {
        effects: [{ type: 'setFlag', key: 'sample.effect', value: true }],
      };
    }
    return {};
  }
}
