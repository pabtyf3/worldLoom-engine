/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import {
  createNewGame,
  createRuntime,
  enterScene,
  loadLoreBundle,
  loadStoryBundle,
  selectAction,
  selectExit,
  RulesCoreModule,
  SampleRuleModule,
} from './index.js';
import type { Action, Exit, RenderModel, RuntimeContext } from './index.js';

type Choice =
  | { kind: 'exit'; label: string; exit: Exit }
  | { kind: 'action'; label: string; action: Action };

function resolvePath(input: string): string {
  if (path.isAbsolute(input)) {
    return input;
  }
  return path.resolve(process.cwd(), input);
}

function getArg(args: string[], name: string): string | undefined {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) {
    return direct.split('=').slice(1).join('=');
  }
  const index = args.indexOf(name);
  if (index >= 0) {
    return args[index + 1];
  }
  return undefined;
}

function buildChoices(model: RenderModel): Choice[] {
  const exits = model.availableExits.map((exit) => ({
    kind: 'exit' as const,
    label: exit.label,
    exit,
  }));
  const actions = model.availableActions.map((action) => ({
    kind: 'action' as const,
    label: action.label,
    action,
  }));
  return [...exits, ...actions];
}

function printHeader(model: RenderModel): void {
  const heading = model.locationId ? `${model.sceneId} @ ${model.locationId}` : model.sceneId;
  console.log(`\n=== ${heading} ===`);
  console.log(model.narrativeText);
  if (model.recentNarrative?.length) {
    console.log('\nOutcome:');
    model.recentNarrative.forEach((line) => console.log(`- ${line}`));
  }
}

function printChoices(choices: Choice[]): void {
  if (choices.length === 0) {
    console.log('\nNo available actions or exits.');
    return;
  }
  console.log('\nChoices:');
  choices.forEach((choice, index) => {
    const label = choice.kind === 'exit' ? `[Exit] ${choice.label}` : `[Action] ${choice.label}`;
    console.log(`${index + 1}) ${label}`);
  });
  console.log('\nCommands: [number] to choose, "look", "state", "help", "quit"');
}

function printState(): void {
  const state = runtimeState;
  console.log('\nState:');
  console.log(`Scene: ${state.currentSceneId}`);
  if (state.currentLocationId) {
    console.log(`Location: ${state.currentLocationId}`);
  }
  const flags = Object.keys(state.flags);
  console.log(`Flags: ${flags.length ? flags.join(', ') : '(none)'}`);
  const vars = Object.keys(state.vars);
  console.log(`Vars: ${vars.length ? vars.join(', ') : '(none)'}`);
}

let runtimeState: ReturnType<typeof createNewGame>;

async function loadBundles(args: string[]): Promise<{
  runtime: RuntimeContext;
  renderModel: RenderModel;
}> {
  const storyPath = getArg(args, '--story') ?? 'examples/sample-bundles/storybundle-example.json';
  const lorePath = getArg(args, '--lore') ?? 'examples/sample-bundles/lorebundle-example.json';
  const skipLore = args.includes('--no-lore');

  const storyInput = await fs.readFile(resolvePath(storyPath), 'utf8');
  const story = loadStoryBundle(storyInput);

  const loreBundles = [];
  if (!skipLore) {
    try {
      const loreInput = await fs.readFile(resolvePath(lorePath), 'utf8');
      loreBundles.push(loadLoreBundle(loreInput));
    } catch (error) {
      if (getArg(args, '--lore')) {
        throw error;
      }
    }
  }

  const runtimeResult = createRuntime({
    story,
    loreBundles,
    modules: [new RulesCoreModule(), new SampleRuleModule()],
    conditionEvaluation: 'engine+modules',
    onWarning: (warning) => console.warn(`Warning: ${warning.message}`),
  });

  if (!runtimeResult.ok || !runtimeResult.runtime) {
    const errorText = runtimeResult.errors
      .map((error) => `${error.path}: ${error.message}`)
      .join('\n');
    throw new Error(`Runtime init failed:\n${errorText}`);
  }

  const runtime = runtimeResult.runtime;
  runtimeState = createNewGame(runtime);
  const initial = enterScene(runtime, runtimeState, runtimeState.currentSceneId);
  return { runtime, renderModel: initial.renderModel };
}

function printHelp(): void {
  console.log('\nUsage: node dist/cli.js [--story path] [--lore path] [--no-lore]');
  console.log('Example: node dist/cli.js --story examples/sample-bundles/storybundle-example.json');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  try {
    const { runtime, renderModel } = await loadBundles(args);
    let model = renderModel;

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    printHeader(model);
    let choices = buildChoices(model);
    printChoices(choices);

    for (;;) {
      const input = (await rl.question('\n> ')).trim();
      if (!input) {
        continue;
      }
      if (input === 'quit' || input === 'q' || input === 'exit') {
        break;
      }
      if (input === 'help') {
        printHelp();
        printChoices(choices);
        continue;
      }
      if (input === 'look') {
        printHeader(model);
        printChoices(choices);
        continue;
      }
      if (input === 'state') {
        printState();
        continue;
      }

      const pick = Number.parseInt(input, 10);
      if (Number.isNaN(pick) || pick < 1 || pick > choices.length) {
        console.log('Invalid choice. Type a number from the list.');
        continue;
      }
      const choice = choices[pick - 1];
      if (choice.kind === 'exit') {
        const result = selectExit(runtime, runtimeState, choice.exit);
        model = result.renderModel;
      } else {
        const result = selectAction(runtime, runtimeState, choice.action.id);
        model = result.renderModel;
      }
      printHeader(model);
      choices = buildChoices(model);
      printChoices(choices);
      if (choices.length === 0) {
        console.log('\nNo more choices available. Exiting.');
        break;
      }
    }

    rl.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message);
    process.exitCode = 1;
  }
}

void main();
