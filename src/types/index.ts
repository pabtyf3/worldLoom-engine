/**
 * Narrative-First RPG Engine – Canonical Types (v1.3)
 * Binding contract for content + runtime state.
 */

// ----------------------------
// Branding types
// ----------------------------
export type ID = string;
export type StoryBundleID = ID;
export type LoreBundleID = ID;
export type SceneID = ID;
export type LocationID = ID;
export type RegionID = ID;
export type LayoutNodeID = ID;
export type AssetID = ID;
export type RuleModuleID = ID;
export type ItemID = ID;
export type FactionID = ID;
export type RaceID = ID;
export type DeityID = ID;
export type TraitID = ID;
export type TimestampISO = string;
export type LoreKey = string;
export type LoreRevealState = 'known' | 'discoverable' | 'hidden';

// ----------------------------
// Versioning
// ----------------------------
export interface Versioned {
  /** Semantic-ish version. Example: "1.3.0" */
  version: string;
  /** Optional schema version for migrations. Example: "storybundle@1.3" */
  schemaVersion?: string;
}

export interface LocalizedText {
  /** e.g. "en-GB" */
  locale: string;
  text: string;
}

export interface TextVariant {
  /** Weighted random selection; default weight=1 */
  text: string;
  weight?: number;
  /** Optional conditions controlling whether this variant can appear */
  condition?: Condition;
}

export type NarrativeText = string | LocalizedText[] | TextVariant[];

// ----------------------------
// Bundles
// ----------------------------
export interface StoryBundle extends Versioned {
  id: StoryBundleID;
  name: string;
  description?: string;

  /** Optional link to a lore pack for world canon. */
  loreRefs?: LoreBundleRef[];

  world: WorldDefinition;
  story: StoryGraph;

  /** Which rule modules this story expects. */
  ruleModules: RuleModuleRef[];

  /** Optional assets shipped with the story. */
  assets?: Asset[];

  metadata?: BundleMetadata;
}

export interface LoreBundle extends Versioned {
  id: LoreBundleID;
  name: string;
  description?: string;

  races?: Race[];
  factions?: Faction[];
  deities?: Deity[];
  traits?: Trait[];

  /** Abstract lore locations; NOT runtime navigation. */
  locations?: LoreLocation[];

  items?: LoreItem[];
  history?: LoreEvent[];

  tags?: string[];
  metadata?: BundleMetadata;
}

export interface BundleMetadata {
  author?: string;
  license?: string;
  createdAt?: TimestampISO;
  updatedAt?: TimestampISO;
  /** e.g. "horror", "western", "dungeon-crawl" */
  themes?: string[];
  /** For UI filtering. */
  contentRating?: 'everyone' | 'teen' | 'mature';
}

export interface LoreBundleRef {
  id: LoreBundleID;
}

// ----------------------------
// World & Spatial Model
// ----------------------------
export interface WorldDefinition {
  id?: ID;
  name?: string;
  description?: string;

  regions?: Region[];
  locations: Location[];
  companions?: CompanionDefinition[];

  /** Optional macro navigation graph between locations/regions. */
  spatialGraph?: SpatialGraph;
}

export interface Region {
  id: RegionID;
  name: string;
  description?: string;

  climate?: string;
  themes?: string[];

  /** References to locations that belong to this region */
  locationIds?: LocationID[];
}

/**
 * A runtime-navigable location. Think: "Town of Rookhaven", "Goblin Caves", "Forest Path".
 * Locations are composed of scenes.
 */
export interface Location {
  id: LocationID;
  name: string;
  type: LocationType;

  description?: string;

  /** Entry point if player arrives at this location via world travel. */
  entryScene: SceneID;

  /** Optional subset listing for validation and editor use. */
  sceneIds?: SceneID[];

  /** Optional layout for navigation intent (text now, tiles later). */
  layout?: LocationLayout;

  /** Optional link to an abstract lore location for canon naming/history. */
  loreLocationId?: ID;

  tags?: string[];
}

export type LocationType = 'town' | 'dungeon' | 'wilderness' | 'interior' | 'other';

export interface LocationLayout {
  layoutType: 'nodeGraph' | 'grid' | 'abstract';

  /** NodeGraph / Abstract */
  nodes?: LayoutNode[];
  connections?: LayoutConnection[];

  /** Grid */
  grid?: GridLayout;
}

export interface LayoutNode {
  id: LayoutNodeID;
  sceneId: SceneID;
  tags?: string[];
  label?: string;
}

export interface LayoutConnection {
  from: LayoutNodeID;
  to: LayoutNodeID;

  /** Optional direction hint for UI and tile renderers. */
  direction?: Direction;

  /** If present, engine only exposes this connection when condition is true. */
  lockedBy?: Condition;

  /** Optional label shown to player (e.g. "Gate to the Market"). */
  label?: string;
}

export type Direction =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest'
  | 'up'
  | 'down'
  | 'in'
  | 'out'
  | 'none';

export interface GridLayout {
  width: number;
  height: number;

  /**
   * Sparse tile map. Key = "x,y".
   * Values contain scene ids and optional collision/metadata.
   */
  tiles: Record<string, GridTile>;
}

export interface GridTile {
  sceneId: SceneID;
  walkable?: boolean;
  tags?: string[];
}

// Macro travel graph (optional)
export interface SpatialGraph {
  nodes: SpatialNode[];
  edges: SpatialEdge[];
}

export interface SpatialNode {
  id: ID;
  type: 'region' | 'location' | 'landmark';
  refId?: ID; // points to regionId or locationId
  name?: string;
  tags?: string[];
}

export interface SpatialEdge {
  from: ID;
  to: ID;

  travelMode?: 'foot' | 'horse' | 'wagon' | 'ship' | 'other';
  distance?: number; // abstract units; UI decides representation
  condition?: Condition;
}

// ----------------------------
// StoryGraph & Scene System
// ----------------------------
export interface StoryGraph {
  /** All scenes in this story (unique ids). */
  scenes: Scene[];
  /** Default starting scene for a new game. */
  startScene: SceneID;
}

export interface Scene {
  id: SceneID;
  title?: string;

  narrative: NarrativeBlock;
  ambience?: AmbienceBlock;

  /** Navigation between scenes (doors/paths/scene transitions). */
  exits?: Exit[];

  /** Interactive options beyond exits. */
  actions?: Action[];

  /** Optional rules that trigger on scene enter/leave. */
  entryRules?: RuleHook[];
  exitRules?: RuleHook[];

  /** Editor/runtime hints (non-executable) */
  tags?: string[];
  locationId?: LocationID;
}

export interface NarrativeBlock {
  text: NarrativeText;

  pov?: 'first' | 'third';
  tone?: string;

  /** References to lore entities to ensure consistency and enable AI grounding later. */
  loreRefs?: LoreRef[];

  /** Optional inline prompts for future AI replacement (authoring-time use). */
  authorNotes?: string;
}

export interface LoreRef {
  /** Category of referenced entity */
  type: 'race' | 'faction' | 'deity' | 'trait' | 'location' | 'item' | 'event' | 'other';
  id: ID;
  note?: string;
}

export interface AmbienceBlock {
  /** Ambient loop, e.g. wind, tavern murmur */
  soundscape?: AssetRef;
  /** Music bed */
  music?: AssetRef;
  /** Optional illustration(s) */
  imagery?: AssetRef[];
  /** Optional narration voice asset or TTS hint */
  voice?: VoiceSpec;

  lighting?: string;
  mood?: string;
}

export interface VoiceSpec {
  mode: 'none' | 'partial' | 'full';
  /** If pre-recorded narration exists, reference it here. */
  narrationAsset?: AssetRef;
  /** Optional future TTS voice name */
  voiceId?: string;
  /** If partial, indicate which blocks are voiced */
  scope?: 'scene' | 'narrativeOnly' | 'keyLines';
}

export interface Exit {
  label: string;
  targetScene: SceneID;
  condition?: Condition;
  /** Optional narrative shown on traversal */
  travelText?: NarrativeText;
}

export interface Action {
  id: ID;
  label: string;

  /** If false, action is hidden/disabled. */
  condition?: Condition;

  /** What happens when selected (engine applies effects + optional rule hooks). */
  effects?: Effect[];

  /** Optional rule hooks when action occurs (for dice rolls, checks, combat triggers, etc.) */
  ruleHooks?: RuleHook[];

  /** Optional action category for UI grouping */
  category?: 'talk' | 'search' | 'use' | 'combat' | 'move' | 'other';
}

// ----------------------------
// Rules: RuleModules, Hooks, Conditions, Effects
// ----------------------------
export interface RuleModuleRef {
  id: RuleModuleID;
  /** e.g. "SRD5e", "OpenD6", "Custom" */
  system: string;
  /** Optional module version/variant. */
  version?: string;
  /** Optional config passed to module at init. */
  config?: Record<string, unknown>;
}

export interface RuleHook {
  /** Which module should handle this hook. If omitted, engine may broadcast to all modules. */
  moduleId?: RuleModuleID;

  /** Hook type recognized by the module (e.g. "skillCheck", "attackRoll", "initiative"). */
  type: string;

  /** Arbitrary payload; module-defined. */
  payload?: Record<string, unknown>;
}

/**
 * Runtime contract for a RuleModule implementation.
 * - The engine owns game state.
 * - A module may propose mutations via RuleResult.effects (engine applies them).
 */
export interface RuleModule {
  id: RuleModuleID;
  system: string;

  /** Evaluate a condition. Engine uses this to show/hide actions/exits and gate content. */
  evaluateCondition(cond: Condition, state: GameState, ctx?: EvaluationContext): boolean;

  /**
   * Resolve an action/hook into an outcome. The module may:
   * - consume randomness/dice
   * - produce narrative text
   * - propose effects to apply
   */
  resolve(ctx: RuleContext): RuleResult;
}

export interface EvaluationContext {
  sceneId?: SceneID;
  locationId?: LocationID;
  /** e.g. current NPC id, target entity, etc. */
  scope?: Record<string, unknown>;
}

export interface RuleContext {
  state: GameState;
  scene: Scene;
  action?: Action;
  hook?: RuleHook;
  rng?: RNG;
}

export interface RuleResult {
  /** Optional text to append/replace narrative for this resolution */
  narrative?: NarrativeText;
  /** Proposed effects to apply to game state */
  effects?: Effect[];
  /** Optional flags for UI */
  outcome?: 'success' | 'failure' | 'neutral';
  /** Optional structured result for logs/telemetry */
  data?: Record<string, unknown>;
}

/**
 * Conditions are declarative gates. Engine + RuleModules evaluate them.
 * Expression conditions can be handled by a built-in evaluator or delegated to a module.
 */
export type Condition =
  | FlagCondition
  | StatCondition
  | InventoryCondition
  | ExpressionCondition
  | LoreCondition;

export interface FlagCondition {
  type: 'flag';
  key: string; // e.g. "met.blacksmith"
  operator?: 'equals' | 'notEquals' | 'exists' | 'notExists';
  value?: boolean;
}

export interface StatCondition {
  type: 'stat';
  key: string; // e.g. "str"
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  value: number;
}

export interface InventoryCondition {
  type: 'inventory';
  key: ItemID; // item id
  operator?: 'has' | 'notHas' | 'countGte' | 'countLte';
  value?: number; // used for count comparisons
}

export interface ExpressionCondition {
  type: 'expression';
  /** Expression language defined by engine (see runtime-flow doc). */
  expr: string;
}

export interface LoreCondition {
  type: 'lore';
  /** e.g. "race:elf", "faction:thievesGuild", "knows:event:ancientWar" */
  key: string;
  operator?: 'equals' | 'notEquals' | 'has' | 'notHas';
  value?: unknown;
}

/**
 * Effects mutate game state. Only the engine applies effects.
 */
export type Effect =
  | SetFlagEffect
  | ModifyStatEffect
  | AddItemEffect
  | RemoveItemEffect
  | SetVariableEffect
  | ModifyVariableEffect
  | SetRelationshipEffect
  | ModifyRelationshipEffect
  | AddCompanionEffect
  | RemoveCompanionEffect
  | SetCompanionFlagEffect
  | ModifyCompanionRelationshipEffect
  | TeleportEffect
  | SetReputationEffect;

export interface SetFlagEffect {
  type: 'setFlag';
  key: string;
  value: boolean;
}

export interface ModifyStatEffect {
  type: 'modifyStat';
  key: string;
  delta: number;
  min?: number;
  max?: number;
}

export interface AddItemEffect {
  type: 'addItem';
  item: Item;
  count?: number;
}

export interface RemoveItemEffect {
  type: 'removeItem';
  itemId: ItemID;
  count?: number;
}

export interface SetVariableEffect {
  type: 'setVar';
  key: string;
  value: unknown;
}

export interface ModifyVariableEffect {
  type: 'modifyVar';
  key: string;
  /** number delta or string append etc; engine decides semantics by current type */
  delta: unknown;
}

export interface SetRelationshipEffect {
  type: 'setRelationship';
  targetId: ID;
  value: number;
  stage?: string;
  flags?: Record<string, boolean>;
}

export interface ModifyRelationshipEffect {
  type: 'modifyRelationship';
  targetId: ID;
  delta: number;
  min?: number;
  max?: number;
}

export interface AddCompanionEffect {
  type: 'addCompanion';
  companionId: ID;
}

export interface RemoveCompanionEffect {
  type: 'removeCompanion';
  companionId: ID;
}

export interface SetCompanionFlagEffect {
  type: 'setCompanionFlag';
  companionId: ID;
  key: string;
  value: boolean;
}

export interface ModifyCompanionRelationshipEffect {
  type: 'modifyCompanionRelationship';
  companionId: ID;
  delta: number;
  min?: number;
  max?: number;
}

export interface TeleportEffect {
  type: 'teleport';
  targetScene: SceneID;
  /** Optional target location for bookkeeping/UI */
  targetLocationId?: LocationID;
}

export interface SetReputationEffect {
  type: 'setReputation';
  factionId: FactionID;
  value: number;
}

// ----------------------------
// Character & Items
// ----------------------------
export interface Character {
  id?: ID;
  name: string;

  /** Rule system decides which stats exist. */
  stats: Record<string, number>;

  /** Inventory items owned. */
  inventory: InventoryEntry[];

  /** Optional world-facing attributes for lore/rules */
  raceId?: RaceID;
  factionIds?: FactionID[];

  /** Arbitrary flags on the character specifically */
  flags?: Record<string, boolean>;
}

export interface InventoryEntry {
  item: Item;
  count: number;
}

export interface Item {
  id: ItemID;
  name: string;
  description?: string;

  tags?: string[];

  /** Optional link to lore definition */
  loreItemId?: ID;

  /** Arbitrary stats (damage, armour, value, etc.) interpreted by RuleModules */
  properties?: Record<string, unknown>;
}

// ----------------------------
// Assets
// ----------------------------
export interface Asset {
  id: AssetID;
  type: AssetType;
  path: string;

  /** Optional metadata for loaders */
  mimeType?: string;
  durationMs?: number;
  width?: number;
  height?: number;

  tags?: string[];
}

export type AssetType = 'image' | 'audio' | 'voice' | 'other';

export interface AssetRef {
  id: AssetID;
  /** Optional: allow remote later; must be supported offline for Phase 1 shipping content */
  uri?: string;
}

// ----------------------------
// Lore Entities
// ----------------------------
export interface Trait {
  id: TraitID;
  name: string;
  description: string;
}

export interface Race {
  id: RaceID;
  name: string;

  description: string;
  culture?: string;
  physiology?: string;

  playable: boolean;

  traitIds?: TraitID[];
  statModifiers?: Record<string, number>;

  tags?: string[];
}

export interface Faction {
  id: FactionID;
  name: string;

  description: string;
  ideology?: string;
  alignment?: string;

  goals?: string[];
  relationships?: FactionRelationship[];

  tags?: string[];
}

export interface FactionRelationship {
  factionId: FactionID;
  stance: 'ally' | 'enemy' | 'neutral' | 'unknown';
  note?: string;
}

export interface Deity {
  id: DeityID;
  name: string;

  domains: string[];
  alignment?: string;

  worshipperFactionIds?: FactionID[];
  tags?: string[];
}

export interface LoreLocation {
  id: ID;
  name: string;
  description: string;
  region?: string;
  tags?: string[];
}

export interface LoreItem {
  id: ID;
  name: string;
  description: string;
  rarity?: string;
  myth?: string;
  tags?: string[];
}

export interface LoreEvent {
  id: ID;
  name: string;
  description: string;
  era?: string;
  relatedFactionIds?: FactionID[];
  tags?: string[];
}

// ----------------------------
// Optional Companion + Relationship System
// ----------------------------
export interface RelationshipState {
  value: number;
  stage?: string;
  flags?: Record<string, boolean>;
}

export interface CompanionDefinition {
  id: ID;
  name: string;
  role?: string;
  description?: string;
  defaultRelationship?: RelationshipState;
  tags?: string[];
}

export interface CompanionState {
  id: ID;
  name: string;
  role?: string;
  relationship?: RelationshipState;
  flags?: Record<string, boolean>;
}

// ----------------------------
// Optional Session Orchestration
// ----------------------------
export interface SessionPlayer {
  id: ID;
  name?: string;
  role?: string;
}

export interface SessionAction {
  playerId: ID;
  actionId?: ID;
  exitLabel?: string;
  at: TimestampISO;
}

export interface SessionState {
  id: ID;
  players: SessionPlayer[];
  currentTurn?: number;
  pendingActions?: SessionAction[];
}

// ----------------------------
// Runtime State & Save/Load
// ----------------------------
export interface GameState extends Versioned {
  /** Active story bundle. */
  storyBundleId: StoryBundleID;

  /** Active lore bundles (if any) */
  loreBundleIds?: LoreBundleID[];

  /** Current location/scene. */
  currentSceneId: SceneID;
  currentLocationId?: LocationID;

  character: Character;

  /** Global story flags (quest states, visited markers, etc.) */
  flags: Record<string, boolean>;

  /** Arbitrary variables for story/rules (numbers/strings/objects). */
  vars: Record<string, unknown>;

  /** Optional lore reveal state keyed by lore id (e.g. "race:elf"). */
  loreKnowledge?: Record<LoreKey, LoreRevealState>;

  /** Optional reputation model by faction. */
  reputation?: Record<FactionID, number>;

  /** Optional companion party state. */
  companions?: CompanionState[];

  /** Optional relationship data keyed by target id. */
  relationships?: Record<ID, RelationshipState>;

  /** Optional session orchestration state. */
  session?: SessionState;

  /** Engine log for debugging/telemetry. */
  history?: HistoryEvent[];
}

export interface HistoryEvent {
  at: TimestampISO;
  type: 'sceneEnter' | 'sceneExit' | 'action' | 'effect' | 'rule';
  sceneId?: SceneID;
  actionId?: ID;
  data?: Record<string, unknown>;
}

// ----------------------------
// RNG abstraction
// ----------------------------
export interface RNG {
  /** returns float in [0,1) */
  next(): number;
  /** returns int in [min,max] inclusive */
  int(min: number, max: number): number;
  /** dice utility; e.g. roll("2d6+1") */
  roll(notation: string): number;
}

// ----------------------------
// Minimal validation interfaces (optional helper types)
// ----------------------------
export interface ValidationError {
  path: string; // JSON pointer-ish: "/story/scenes/3/id"
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}

// ----------------------------
// End of canonical types
// ----------------------------
