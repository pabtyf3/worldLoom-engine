import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  createRuntime,
  loadLoreBundle,
  loadStoryBundle,
  RulesCoreModule,
} from '../../src/index.js';

describe('Runtime Integration', () => {
  describe('Bundle Loading', () => {
    it('should load minimal bundle and validate', async () => {
      const baseDir = path.dirname(fileURLToPath(import.meta.url));
      const bundlePath = path.join(baseDir, '../fixtures/minimal-bundle.json');
      const bundleData = await fs.readFile(bundlePath, 'utf-8');
      const bundle = loadStoryBundle(bundleData);

      const result = createRuntime({ story: bundle });

      expect(result.ok).toBe(true);
      expect(result.runtime?.story.id).toBe('test.minimal');
    });

    it('loads example story + lore fixtures', async () => {
      const baseDir = path.dirname(fileURLToPath(import.meta.url));
      const storyPath = path.join(baseDir, '../fixtures/storybundle-example.json');
      const lorePath = path.join(baseDir, '../fixtures/lorebundle-example.json');

      const storyData = await fs.readFile(storyPath, 'utf-8');
      const loreData = await fs.readFile(lorePath, 'utf-8');

      const story = loadStoryBundle(storyData);
      const lore = loadLoreBundle(loreData);

      const result = createRuntime({
        story,
        loreBundles: [lore],
        modules: [new RulesCoreModule()],
      });

      expect(result.ok).toBe(true);
      expect(result.runtime?.story.id).toBe('story.rookhaven.intro');
      expect(result.runtime?.loreBundles[0].id).toBe('lore.rookhaven');
    });
  });
});
