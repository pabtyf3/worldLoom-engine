import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  createRuntime,
  createNewGame,
  enterScene,
  loadLoreBundle,
  loadStoryBundle,
  RulesCoreModule,
} from '../../src/index.js';

describe('RenderModel snapshots', () => {
  it('renders example story bundle', async () => {
    const baseDir = path.dirname(fileURLToPath(import.meta.url));
    const storyPath = path.join(baseDir, '../fixtures/storybundle-example.json');
    const lorePath = path.join(baseDir, '../fixtures/lorebundle-example.json');

    const storyData = await fs.readFile(storyPath, 'utf-8');
    const loreData = await fs.readFile(lorePath, 'utf-8');

    const story = loadStoryBundle(storyData);
    const lore = loadLoreBundle(loreData);

    const runtime = createRuntime({
      story,
      loreBundles: [lore],
      modules: [new RulesCoreModule()],
      rng: undefined,
    }).runtime!;

    const state = createNewGame(runtime);
    const result = enterScene(runtime, state, 'scene.square');

    expect(result.renderModel).toMatchSnapshot({
      narrativeText: expect.any(String),
    });
  });
});
