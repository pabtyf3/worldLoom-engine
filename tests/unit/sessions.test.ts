import { describe, it, expect } from '@jest/globals';
import {
  createRuntime,
  createNewGame,
  initSession,
  queueSessionAction,
  registerSessionPlayer,
  resolveSessionActions,
} from '../../src/index.js';
import type { StoryBundle } from '../../src/types/index.js';

function createSessionStory(): StoryBundle {
  return {
    id: 'story.sessions',
    version: '1.3.0',
    name: 'Session Story',
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
          actions: [{ id: 'act.wait', label: 'Wait' }],
          exits: [{ label: 'Leave', targetScene: 'scene.start' }],
        },
      ],
    },
  };
}

describe('Session orchestration (optional)', () => {
  it('queues and resolves session actions by first vote', () => {
    const story = createSessionStory();
    const runtime = createRuntime({
      story,
      optionalFeatures: { sessions: true },
    }).runtime!;
    const state = createNewGame(runtime);

    initSession(runtime, state, 'session.test');
    registerSessionPlayer(runtime, state, { id: 'player.a' });
    registerSessionPlayer(runtime, state, { id: 'player.b' });

    queueSessionAction(runtime, state, { playerId: 'player.a', actionId: 'act.wait' });
    queueSessionAction(runtime, state, { playerId: 'player.b', exitLabel: 'Leave' });

    const resolved = resolveSessionActions(runtime, state, { mode: 'first', requiredPlayers: 2 });
    expect(resolved.chosen?.actionId).toBe('act.wait');
    expect(state.session?.pendingActions?.length).toBe(0);
  });

  it('resolves by majority when configured', () => {
    const story = createSessionStory();
    const runtime = createRuntime({
      story,
      optionalFeatures: { sessions: true },
    }).runtime!;
    const state = createNewGame(runtime);

    initSession(runtime, state, 'session.test');
    registerSessionPlayer(runtime, state, { id: 'player.a' });
    registerSessionPlayer(runtime, state, { id: 'player.b' });
    registerSessionPlayer(runtime, state, { id: 'player.c' });

    queueSessionAction(runtime, state, { playerId: 'player.a', exitLabel: 'Leave' });
    queueSessionAction(runtime, state, { playerId: 'player.b', exitLabel: 'Leave' });
    queueSessionAction(runtime, state, { playerId: 'player.c', actionId: 'act.wait' });

    const resolved = resolveSessionActions(runtime, state, {
      mode: 'majority',
      requiredPlayers: 3,
    });
    expect(resolved.chosen?.exitLabel).toBe('Leave');
  });
});
