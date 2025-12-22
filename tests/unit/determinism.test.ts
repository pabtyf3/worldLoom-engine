import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, enterScene, LcgRng } from '../../src/index.js';
import type { StoryBundle } from '../../src/types/index.js';

function createVariantStory(): StoryBundle {
  return {
    id: 'test.variants',
    version: '1.3.0',
    name: 'Variant Story',
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
          locationId: 'loc.start',
          narrative: {
            text: [
              { text: 'Variant A', weight: 1 },
              { text: 'Variant B', weight: 1 },
            ],
          },
        },
      ],
    },
  };
}

describe('Determinism', () => {
  it('returns same narrative for same seed', () => {
    const story = createVariantStory();
    const rngA = new LcgRng(42);
    const rngB = new LcgRng(42);

    const runtimeA = createRuntime({ story, rng: rngA }).runtime!;
    const runtimeB = createRuntime({ story, rng: rngB }).runtime!;

    const stateA = createNewGame(runtimeA);
    const stateB = createNewGame(runtimeB);

    const resultA = enterScene(runtimeA, stateA, stateA.currentSceneId);
    const resultB = enterScene(runtimeB, stateB, stateB.currentSceneId);

    expect(resultA.renderModel.narrativeText).toBe(resultB.renderModel.narrativeText);
  });

  it('produces deterministic sequence for repeated runs', () => {
    const story = createVariantStory();
    const rng = new LcgRng(42);
    const runtime = createRuntime({ story, rng }).runtime!;
    const state = createNewGame(runtime);

    const first = enterScene(runtime, state, state.currentSceneId).renderModel.narrativeText;
    const second = enterScene(runtime, state, state.currentSceneId).renderModel.narrativeText;

    const replayRng = new LcgRng(42);
    const replayRuntime = createRuntime({ story, rng: replayRng }).runtime!;
    const replayState = createNewGame(replayRuntime);

    const replayFirst = enterScene(replayRuntime, replayState, replayState.currentSceneId)
      .renderModel.narrativeText;
    const replaySecond = enterScene(replayRuntime, replayState, replayState.currentSceneId)
      .renderModel.narrativeText;

    expect(first).toBe(replayFirst);
    expect(second).toBe(replaySecond);
  });
});
