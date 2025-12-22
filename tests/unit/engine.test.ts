import { describe, it, expect } from '@jest/globals';
import {
  VERSION,
  createRuntime,
  createNewGame,
  enterScene,
  getRenderModel,
} from '../../src/index.js';
import { createMockStoryBundle } from '../test-utils.js';

describe('Engine', () => {
  describe('VERSION', () => {
    it('should export a version string', () => {
      expect(VERSION).toBeDefined();
      expect(typeof VERSION).toBe('string');
      expect(VERSION).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should be alpha version', () => {
      expect(VERSION).toContain('alpha');
    });
  });

  it('creates runtime and renders start scene', () => {
    const story = createMockStoryBundle();
    const runtimeResult = createRuntime({ story });
    expect(runtimeResult.ok).toBe(true);
    expect(runtimeResult.runtime).toBeDefined();

    const runtime = runtimeResult.runtime!;
    const state = createNewGame(runtime);
    const result = enterScene(runtime, state, state.currentSceneId);

    expect(result.renderModel.narrativeText).toContain('Start scene.');
    expect(result.renderModel.availableExits).toHaveLength(0);
    expect(result.renderModel.availableActions).toHaveLength(0);

    const model = getRenderModel(runtime, state);
    expect(model.sceneId).toBe('scene.start');
  });
});
