import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, selectAction } from '../../src/index.js';
import type { StoryBundle } from '../../src/types/index.js';

function createRelationshipStory(): StoryBundle {
  return {
    id: 'story.relationships',
    version: '1.3.0',
    name: 'Relationship Story',
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
    },
    story: {
      startScene: 'scene.start',
      scenes: [
        {
          id: 'scene.start',
          narrative: { text: 'Start' },
          actions: [
            {
              id: 'act.set',
              label: 'Set relationship',
              effects: [
                { type: 'setRelationship', targetId: 'npc.mayor', value: 3, stage: 'neutral' },
              ],
            },
            {
              id: 'act.modify',
              label: 'Improve relationship',
              effects: [{ type: 'modifyRelationship', targetId: 'npc.mayor', delta: 2 }],
            },
          ],
        },
      ],
    },
  };
}

describe('Relationship effects (optional)', () => {
  it('applies relationship effects when enabled', () => {
    const story = createRelationshipStory();
    const runtime = createRuntime({
      story,
      optionalFeatures: { relationships: true },
    }).runtime!;
    const state = createNewGame(runtime);

    selectAction(runtime, state, 'act.set');
    expect(state.relationships?.['npc.mayor']?.value).toBe(3);

    selectAction(runtime, state, 'act.modify');
    expect(state.relationships?.['npc.mayor']?.value).toBe(5);
  });
});
