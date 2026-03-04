/**
 * WorldMapScene.ts
 * STUB — 2D flat world map: city icon, tradewind corridors, wind route selection.
 * Owner: Architecture domain
 *
 * === SCENE OWNERSHIP ===
 * Reads from GSM:  cityHex, cycleCount, windOptions, windCorridor
 * Writes to GSM:   cityHex, windCorridor (via ITradewindSystem.applyChoice)
 *
 * === TRANSITIONS ===
 * → HexZoomScene   after player confirms wind route choice
 *
 * === RESPONSIBILITIES ===
 * - Render the flat world map background
 * - Show the city as a movable icon at cityHex
 * - Render 2–3 wind route options from ITradewindSystem.generateOptions()
 * - Let player pick a route; call ITradewindSystem.applyChoice(), then launch HexZoomScene
 * - Trigger audio: cycle_start, wind_option_hover, wind_option_select, city_move
 * - Show UIScene HUD (UIScene is already running persistently)
 *
 * === DO NOT ===
 * - Render hex tiles (that's HexZoomScene's job)
 * - Read or write hero roster or mission state
 * - Instantiate concrete system classes — use the interfaces passed at construction
 */

import Phaser from 'phaser';
import type { IGameStateManager } from '@systems/IGameStateManager';
import type { ITradewindSystem } from '@systems/ITradewindSystem';
import type { IAudioService } from '@services/IAudioService';

export const WORLD_MAP_SCENE_KEY = 'WorldMapScene';

export class WorldMapScene extends Phaser.Scene {
  private gsm!: IGameStateManager;
  private tradewindSystem!: ITradewindSystem;
  private audioService!: IAudioService;

  constructor() {
    super({ key: WORLD_MAP_SCENE_KEY });
  }

  init(data: {
    gsm: IGameStateManager;
    tradewindSystem: ITradewindSystem;
    audioService: IAudioService;
  }): void {
    this.gsm = data.gsm;
    this.tradewindSystem = data.tradewindSystem;
    this.audioService = data.audioService;
  }

  preload(): void {
    // TODO: Load world map background, city icon, wind arrow assets
    // Reference asset IDs from game/assets/MANIFEST.md
  }

  create(): void {
    // TODO: Render world map background
    // TODO: Place city icon at gsm.cityHex
    // TODO: Call tradewindSystem.generateOptions(gsm.cityHex, gsm.cycleCount)
    // TODO: Render wind route options; allow player to hover and select
    // TODO: On selection confirmed → tradewindSystem.applyChoice(option) → launch HexZoomScene
    this.add.text(10, 10, '[STUB] WorldMapScene', { color: '#ffffff' });
  }

  update(_time: number, _delta: number): void {
    // TODO: Animate city icon, wind overlays
  }
}
