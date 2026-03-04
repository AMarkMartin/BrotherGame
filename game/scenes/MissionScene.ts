/**
 * MissionScene.ts
 * STUB — 2D side-view surface mission with Arcade physics and real-time combat.
 * Owner: Architecture domain
 *
 * === SCENE OWNERSHIP ===
 * Reads from GSM:  missionContext (at create), heroRoster (hero stats)
 * Writes to GSM:   missionResult, heroRoster (status + XP updates)
 *
 * === TRANSITIONS ===
 * ← HexZoomScene   (launched after party selection)
 * → HexZoomScene   (scene stops after writing missionResult to GSM)
 *
 * === RESPONSIBILITIES ===
 * - Read missionContext from GSM on create; apply support bonuses to active hero stats
 * - Load and create the side-view Tilemap for the site
 * - Spawn the active hero as player-controlled character (Arcade physics)
 * - Spawn enemies based on missionContext.dangerLevel
 * - Spawn resource pickups based on missionContext.resourceSurface
 * - Run real-time combat loop:
 *     - Player input: move left/right, jump, attack
 *     - Enemy AI update loop (simple patrol/pursue behavior)
 *     - Physics collisions: tiles, enemies, pickups
 * - Track objective completion (missionContext.objectives)
 * - Handle mission completion triggers:
 *     success  → all primary objectives met
 *     retreat  → player reaches escape zone
 *     failure  → active hero HP reaches 0
 * - Write MissionResult to GSM.missionResult before stopping scene
 * - Call ISiteEvolutionSystem.applySiteStateChange if visit changes site state
 * - Trigger audio: mission_start, hero_attack, hero_hurt, hero_death, enemy_hurt,
 *   enemy_death, pickup_tier1/2/3, objective_complete, mission_complete_*
 *
 * === DO NOT ===
 * - Manage city state (that's CityViewScene)
 * - Manage hex map rendering (that's HexZoomScene)
 * - Re-apply support bonuses except at scene create
 */

import Phaser from 'phaser';
import type { IGameStateManager } from '@systems/IGameStateManager';
import type { ISiteEvolutionSystem } from '@systems/ISiteEvolutionSystem';
import type { IHeroSystem } from '@systems/IHeroSystem';
import type { IResourceSystem } from '@systems/IResourceSystem';
import type { IAudioService } from '@services/IAudioService';

export const MISSION_SCENE_KEY = 'MissionScene';

export class MissionScene extends Phaser.Scene {
  private gsm!: IGameStateManager;
  private siteEvolutionSystem!: ISiteEvolutionSystem;
  private heroSystem!: IHeroSystem;
  private resourceSystem!: IResourceSystem;
  private audioService!: IAudioService;

  constructor() {
    super({ key: MISSION_SCENE_KEY, physics: { arcade: { gravity: { x: 0, y: 600 }, debug: false } } });
  }

  init(data: {
    gsm: IGameStateManager;
    siteEvolutionSystem: ISiteEvolutionSystem;
    heroSystem: IHeroSystem;
    resourceSystem: IResourceSystem;
    audioService: IAudioService;
  }): void {
    this.gsm = data.gsm;
    this.siteEvolutionSystem = data.siteEvolutionSystem;
    this.heroSystem = data.heroSystem;
    this.resourceSystem = data.resourceSystem;
    this.audioService = data.audioService;
  }

  preload(): void {
    // TODO: Load mission tileset based on gsm.missionContext.siteType
    //       e.g., siteType 'ruin' → mission_tileset_ruins (see MANIFEST.md)
    // TODO: Load hero spritesheet(s) for active hero class
    // TODO: Load enemy spritesheet(s) based on dangerLevel
    // TODO: Load pickup sprites (pickup_tier1/2/3)
  }

  create(): void {
    // TODO: Read gsm.missionContext; throw if null
    // TODO: Apply supportBonuses to active hero stats
    // TODO: Build Arcade physics tilemap
    // TODO: Spawn hero at start position
    // TODO: Spawn enemies and pickups
    // TODO: Set up input handlers (cursors, attack key)
    // TODO: Set up objective tracking
    // TODO: audioService.play('mission_start')
    this.add.text(10, 10, '[STUB] MissionScene', { color: '#ffffff' });
  }

  update(_time: number, _delta: number): void {
    // TODO: Player movement and attack input
    // TODO: Enemy AI update
    // TODO: Check objective completion conditions
    // TODO: Check failure condition (hero HP <= 0)
    // TODO: Check retreat condition (escape zone reached)
  }

  private completeMission(outcome: 'success' | 'retreat' | 'failure'): void {
    // TODO: Build MissionResult from gathered resources, hero statuses, objectives
    // TODO: Write result to gsm.missionResult
    // TODO: Call heroSystem.returnFromMission(...)
    // TODO: audioService.play(`mission_complete_${outcome}`)
    // TODO: this.scene.stop(); (HexZoomScene will resume and read missionResult)
  }
}
