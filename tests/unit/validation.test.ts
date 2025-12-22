import { describe, it, expect } from '@jest/globals';
import { validateBundles } from '../../src/runtime/validation.js';
import type { LoreBundle, StoryBundle } from '../../src/types/index.js';

function baseStory(): StoryBundle {
  return {
    id: 'test.validation',
    version: '1.3.0',
    name: 'Validation Story',
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
          exits: [{ label: 'Missing', targetScene: 'scene.missing' }],
        },
      ],
    },
  };
}

describe('Validation', () => {
  it('flags missing start scene and broken exit targets', () => {
    const story = baseStory();
    story.story.startScene = 'scene.unknown';

    const result = validateBundles(story, []);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.path === '/story/startScene')).toBe(true);
    expect(result.errors.some((error) => error.message.includes('targetScene'))).toBe(true);
  });

  it('flags duplicate scene ids and broken layout connections', () => {
    const story = baseStory();
    story.story.scenes.push({
      id: 'scene.start',
      narrative: { text: 'Duplicate' },
    });

    story.world.locations[0].layout = {
      layoutType: 'nodeGraph',
      nodes: [{ id: 'node.a', sceneId: 'scene.start' }],
      connections: [{ from: 'node.a', to: 'node.missing' }],
    };

    const result = validateBundles(story, []);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.message.includes('Duplicate scene id'))).toBe(true);
    expect(result.errors.some((error) => error.message.includes('Layout connection'))).toBe(true);
  });

  it('warns on unresolved lore references', () => {
    const story = baseStory();
    story.story.scenes[0].exits = [];
    story.story.scenes[0].narrative = {
      text: 'Lore test',
      loreRefs: [
        { type: 'race', id: 'race.elf' },
        { type: 'faction', id: 'faction.missing' },
      ],
    };

    const lore: LoreBundle = {
      id: 'lore.core',
      version: '1.3.0',
      name: 'Core Lore',
      races: [{ id: 'race.elf', name: 'Elf', description: 'Elf', playable: true }],
    };

    const result = validateBundles(story, [lore]);
    expect(result.ok).toBe(true);
    expect(result.errors.some((error) => error.severity === 'warning')).toBe(true);
    expect(
      result.errors.some((error) => error.message.includes('LoreRef faction:faction.missing'))
    ).toBe(true);
  });

  it('warns on invalid expression conditions', () => {
    const story = baseStory();
    story.story.scenes[0].exits = [
      {
        label: 'Invalid',
        targetScene: 'scene.start',
        condition: { type: 'expression', expr: 'flag.' },
      },
    ];

    const result = validateBundles(story, []);
    expect(result.ok).toBe(true);
    expect(result.errors.some((error) => error.severity === 'warning')).toBe(true);
    expect(result.errors.some((error) => error.message.includes('Expression parse warning'))).toBe(
      true
    );
  });
});
