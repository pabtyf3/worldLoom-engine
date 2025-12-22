import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, selectAction } from '../../src/index.js';
import type { StoryBundle } from '../../src/types/index.js';

function createCompanionStory(): StoryBundle {
  return {
    id: 'story.companions',
    version: '1.3.0',
    name: 'Companion Story',
    ruleModules: [],
    world: {
      locations: [
        {
          id: 'loc.start',
          name: 'Start',
          type: 'town',
          entryScene: 'scene.start',
        },
      ],
      companions: [
        {
          id: 'companion.rose',
          name: 'Rose',
          role: 'scout',
          defaultRelationship: { value: 5, stage: 'neutral' },
        },
      ],
    },
    story: {
      startScene: 'scene.start',
      scenes: [
        {
          id: 'scene.start',
          narrative: { text: 'Start' },
          actions: [
            {
              id: 'act.recruit',
              label: 'Invite Rose',
              effects: [{ type: 'addCompanion', companionId: 'companion.rose' }],
            },
            {
              id: 'act.bond',
              label: 'Share a story',
              effects: [
                { type: 'modifyCompanionRelationship', companionId: 'companion.rose', delta: 2 },
              ],
            },
            {
              id: 'act.flag',
              label: 'Mark loyalty',
              effects: [
                {
                  type: 'setCompanionFlag',
                  companionId: 'companion.rose',
                  key: 'loyal',
                  value: true,
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

describe('Companion effects (optional)', () => {
  it('applies companion add/relationship/flag effects when enabled', () => {
    const story = createCompanionStory();
    const runtime = createRuntime({
      story,
      optionalFeatures: { companions: true },
    }).runtime!;
    const state = createNewGame(runtime);

    selectAction(runtime, state, 'act.recruit');
    expect(state.companions?.some((companion) => companion.id === 'companion.rose')).toBe(true);

    selectAction(runtime, state, 'act.bond');
    const rose = state.companions?.find((companion) => companion.id === 'companion.rose');
    expect(rose?.relationship?.value).toBe(7);

    selectAction(runtime, state, 'act.flag');
    expect(rose?.flags?.loyal).toBe(true);
  });
});
