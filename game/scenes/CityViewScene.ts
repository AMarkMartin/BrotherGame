/**
 * CityViewScene.ts
 * STUB — HOMM-style painted city view: building management, hero recruitment, resources.
 * Owner: Architecture domain
 *
 * === SCENE OWNERSHIP ===
 * Reads from GSM:  resources, cityState, heroRoster
 * Writes to GSM:   resources, cityState, heroRoster
 *
 * === TRANSITIONS ===
 * ← HexZoomScene   (launched when player enters the city)
 * → HexZoomScene   (scene stops when player closes city view)
 *
 * === RESPONSIBILITIES ===
 * - Render layered city background artwork (sky layer + city base layer)
 * - Render building slot hotspot regions at their fixed positions
 * - For each slot: show correct building sprite based on BuildingSlotState
 *   (empty placeholder / constructing overlay / built building sprite)
 * - Handle pointer events on building slots:
 *     empty slot clicked   → show build options panel (ITechTreeSystem.getAvailableBuildings)
 *     built slot clicked   → show upgrade/info panel
 * - Handle building construction:
 *     player confirms build → ITechTreeSystem.startConstruction(buildingId, slotId)
 * - Complete constructions on scene open:
 *     ITechTreeSystem.processCycleCompletions(gsm.cycleCount)
 * - Hero recruitment panel: show available hero classes (cityState.availableHeroClasses)
 *     player recruits → IHeroSystem.recruit(heroClass) → update hero roster display
 * - Sidebar panel: display Tier 1 / Tier 2 / Tier 3 resource counts from IResourceSystem
 * - Close / return button → this.scene.stop() → HexZoomScene resumes
 * - Trigger audio: city_enter, building_slot_hover, building_slot_select,
 *   building_construct_start, building_construct_complete, hero_recruit, resource_insufficient
 *
 * === DO NOT ===
 * - Handle combat or hex navigation (those are MissionScene and HexZoomScene)
 * - Use Arcade physics (city view is pure sprites + interactive zones, no physics)
 */

import Phaser from 'phaser';
import type { IGameStateManager } from '@systems/IGameStateManager';
import type { ITechTreeSystem } from '@systems/ITechTreeSystem';
import type { IHeroSystem } from '@systems/IHeroSystem';
import type { IResourceSystem } from '@systems/IResourceSystem';
import type { IAudioService } from '@services/IAudioService';

export const CITY_VIEW_SCENE_KEY = 'CityViewScene';

export class CityViewScene extends Phaser.Scene {
  private gsm!: IGameStateManager;
  private techTreeSystem!: ITechTreeSystem;
  private heroSystem!: IHeroSystem;
  private resourceSystem!: IResourceSystem;
  private audioService!: IAudioService;

  constructor() {
    super({ key: CITY_VIEW_SCENE_KEY });
  }

  init(data: {
    gsm: IGameStateManager;
    techTreeSystem: ITechTreeSystem;
    heroSystem: IHeroSystem;
    resourceSystem: IResourceSystem;
    audioService: IAudioService;
  }): void {
    this.gsm = data.gsm;
    this.techTreeSystem = data.techTreeSystem;
    this.heroSystem = data.heroSystem;
    this.resourceSystem = data.resourceSystem;
    this.audioService = data.audioService;
  }

  preload(): void {
    // TODO: Load city background layers (city_bg_base, city_bg_city — see MANIFEST.md)
    // TODO: Load building sprites for all known buildings
    // TODO: Load building_slot_empty, building_slot_hover, building_constructing
    // TODO: Load hero portrait sprites
    // TODO: Load UI panel and button sprites
  }

  create(): void {
    // TODO: Process any pending construction completions
    // TODO: Render city background (sky layer + city base)
    // TODO: Render building slots at their fixed positions
    // TODO: Render resource sidebar panel
    // TODO: Render hero roster panel
    // TODO: Wire slot pointer events
    // TODO: Add close/return button
    // TODO: audioService.setAmbience('music_city')
    this.add.text(10, 10, '[STUB] CityViewScene', { color: '#ffffff' });
  }

  update(_time: number, _delta: number): void {
    // TODO: Update resource count display if resources change
  }
}
