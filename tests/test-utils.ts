import type { GameState, StoryBundle } from '../src/types/index.js';

/**
 * Shared test utilities
 */

export function createMockStoryBundle(overrides: Partial<StoryBundle> = {}): StoryBundle {
  return {
    id: 'test.bundle',
    version: '1.3.0',
    name: 'Test Bundle',
    loreRefs: [],
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
      scenes: [
        {
          id: 'scene.start',
          narrative: { text: 'Start scene.' },
          exits: [],
          actions: [],
        },
      ],
      startScene: 'scene.start',
    },
    ...overrides,
  };
}

export function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: '1.3.0',
    storyBundleId: 'test.bundle',
    currentSceneId: 'scene.start',
    character: {
      name: 'Player',
      stats: {},
      inventory: [],
    },
    flags: {},
    vars: {},
    ...overrides,
  };
}
