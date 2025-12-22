import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, enterScene, selectAction } from '../../src/index.js';
import type { RuleModule, StoryBundle } from '../../src/types/index.js';

const testModule: RuleModule = {
  id: 'rules.test',
  system: 'Custom',
  evaluateCondition: () => true,
  resolve: ({ hook }) => {
    if (!hook) {
      return {};
    }
    if (hook.type === 'onEnter') {
      return {
        narrative: 'Entry overlay',
        effects: [{ type: 'setFlag', key: 'entered.scene', value: true }],
      };
    }
    if (hook.type === 'teleport') {
      return {
        effects: [{ type: 'teleport', targetScene: 'scene.target' }],
      };
    }
    if (hook.type === 'actionNarrative') {
      return {
        narrative: 'Action narrative',
      };
    }
    return {};
  },
};

function createRuleStory(): StoryBundle {
  return {
    id: 'test.rules',
    version: '1.3.0',
    name: 'Rule Story',
    ruleModules: [{ id: 'rules.test', system: 'Custom' }],
    world: {
      locations: [
        {
          id: 'loc.start',
          name: 'Start',
          type: 'town',
          entryScene: 'scene.start',
        },
      ],
    },
    story: {
      startScene: 'scene.start',
      scenes: [
        {
          id: 'scene.start',
          locationId: 'loc.start',
          narrative: { text: 'Start' },
          entryRules: [{ moduleId: 'rules.test', type: 'onEnter' }],
          actions: [
            {
              id: 'action.teleport',
              label: 'Teleport',
              ruleHooks: [{ moduleId: 'rules.test', type: 'teleport' }],
            },
            {
              id: 'action.narrative',
              label: 'Narrate',
              ruleHooks: [{ moduleId: 'rules.test', type: 'actionNarrative' }],
            },
          ],
        },
        {
          id: 'scene.target',
          narrative: { text: 'Target' },
        },
      ],
    },
  };
}

describe('RuleModule integration', () => {
  it('applies entry rule effects and narrative overlay', () => {
    const story = createRuleStory();
    const runtime = createRuntime({ story, modules: [testModule] }).runtime!;
    const state = createNewGame(runtime);

    const result = enterScene(runtime, state, 'scene.start');

    expect(state.flags['entered.scene']).toBe(true);
    expect(result.renderModel.narrativeText).toContain('Start');
    expect(result.renderModel.narrativeText).toContain('Entry overlay');
  });

  it('applies teleport effects from rule hook', () => {
    const story = createRuleStory();
    const runtime = createRuntime({ story, modules: [testModule] }).runtime!;
    const state = createNewGame(runtime);

    enterScene(runtime, state, 'scene.start');
    const result = selectAction(runtime, state, 'action.teleport');

    expect(result.renderModel.sceneId).toBe('scene.target');
    expect(state.currentSceneId).toBe('scene.target');
  });

  it('returns action narrative in recentNarrative', () => {
    const story = createRuleStory();
    const runtime = createRuntime({ story, modules: [testModule] }).runtime!;
    const state = createNewGame(runtime);

    enterScene(runtime, state, 'scene.start');
    const result = selectAction(runtime, state, 'action.narrative');

    expect(result.renderModel.recentNarrative).toEqual(['Action narrative']);
  });
});
