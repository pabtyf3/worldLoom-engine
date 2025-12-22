import { describe, it, expect } from '@jest/globals';
import { createRuntime, createNewGame, saveGame, loadGame, enterScene } from '../../src/index.js';
import type { RuleModule, SaveGameInput, StoryBundle } from '../../src/index.js';

const entryModule: RuleModule = {
  id: 'rules.entry',
  system: 'Custom',
  evaluateCondition: () => true,
  resolve: ({ hook }) => {
    if (hook?.type === 'entry') {
      return {
        effects: [{ type: 'setFlag', key: 'entered', value: true }],
      };
    }
    return {};
  },
};

function createEntryStory(): StoryBundle {
  return {
    id: 'test.save',
    version: '1.3.0',
    name: 'Save Story',
    ruleModules: [{ id: 'rules.entry', system: 'Custom' }],
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
          entryRules: [{ moduleId: 'rules.entry', type: 'entry' }],
        },
      ],
    },
  };
}

describe('Save/Load', () => {
  it('round-trips GameState via saveGame/loadGame', () => {
    const story = createEntryStory();
    const runtime = createRuntime({ story, modules: [entryModule] }).runtime!;
    const state = createNewGame(runtime);

    state.flags['quest.started'] = true;
    state.vars['counter'] = 3;

    const saved = saveGame(state);
    const loaded = loadGame(runtime, saved);

    expect(loaded.ok).toBe(true);
    expect(loaded.state?.flags['quest.started']).toBe(true);
    expect(loaded.state?.vars['counter']).toBe(3);
    expect(loaded.state?.currentSceneId).toBe('scene.start');
  });

  it('does not replay entry rules by default on load', () => {
    const story = createEntryStory();
    const runtime = createRuntime({ story, modules: [entryModule] }).runtime!;
    const state = createNewGame(runtime);

    const saved = saveGame(state);
    const loaded = loadGame(runtime, saved);

    expect(loaded.ok).toBe(true);
    expect(loaded.state?.flags['entered']).toBeUndefined();
  });

  it('replays entry rules on load when option is set', () => {
    const story = createEntryStory();
    const runtime = createRuntime({ story, modules: [entryModule] }).runtime!;
    const state = createNewGame(runtime);

    const saved = saveGame(state);
    const loaded = loadGame(runtime, saved, { replayEntryRulesOnLoad: true });

    expect(loaded.ok).toBe(true);
    expect(loaded.state?.flags['entered']).toBe(true);
    expect(loaded.renderModel?.sceneId).toBe('scene.start');
  });

  it('keeps entry rules for normal scene entry', () => {
    const story = createEntryStory();
    const runtime = createRuntime({ story, modules: [entryModule] }).runtime!;
    const state = createNewGame(runtime);

    enterScene(runtime, state, 'scene.start');
    expect(state.flags['entered']).toBe(true);
  });

  it('loads minimal save input with currentScene', () => {
    const story = createEntryStory();
    const runtime = createRuntime({ story, modules: [entryModule] }).runtime!;
    const saved: SaveGameInput = { currentScene: 'scene.start' };

    const loaded = loadGame(runtime, saved);

    expect(loaded.ok).toBe(true);
    expect(loaded.state?.currentSceneId).toBe('scene.start');
    expect(loaded.state?.storyBundleId).toBe('test.save');
  });

  it('warns on inventory items missing from lore', () => {
    const story = createEntryStory();
    const loreBundles = [
      {
        id: 'lore.test',
        version: '1.3.0',
        name: 'Lore',
        items: [{ id: 'item.known', name: 'Known', description: 'Known item.' }],
      },
    ];
    const runtime = createRuntime({ story, modules: [entryModule], loreBundles }).runtime!;
    const state = createNewGame(runtime);
    state.character.inventory.push({
      item: { id: 'item.unknown', name: 'Unknown', description: 'Unknown item.' },
      count: 1,
    });

    const loaded = loadGame(runtime, saveGame(state));

    expect(loaded.ok).toBe(true);
    expect(loaded.errors.some((error) => error.severity === 'warning')).toBe(true);
  });
});
