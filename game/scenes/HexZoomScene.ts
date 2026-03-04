/**
 * HexZoomScene.ts
 * STUB — Pseudo-isometric hex grid around the city; site selection; party selection modal.
 * Owner: Architecture domain
 *
 * === SCENE OWNERSHIP ===
 * Reads from GSM:  hexMap, reachRadius, cityHex, windCorridor, heroRoster, missionResult
 * Writes to GSM:   selectedSite (via MissionContext before launching MissionScene)
 *
 * === TRANSITIONS ===
 * → MissionScene    after party selection confirmed for a surface site
 * → CityViewScene   when player enters the city
 * ← WorldMapScene   (resumed after cycle start)
 * ← MissionScene    (resumed after mission ends; reads missionResult from GSM)
 * ← CityViewScene   (resumed after city management)
 *
 * === RESPONSIBILITIES ===
 * - Render pseudo-isometric squished hex tilemap
 *   (flat-top hexes with scaleY ~0.55 applied to camera/tilemap)
 * - Show reach-ring overlay from IReachSystem
 * - Render out-of-reach hexes at 50% alpha, non-interactive
 * - Render site state-change indicators for recently evolved sites
 * - Allow player to click an accessible hex to open party selection modal
 * - Allow player to click city hex to launch CityViewScene
 * - Party selection modal: filter available heroes, pick Active + Support
 *   → write MissionContext to GSM → launch MissionScene
 * - On resume from MissionScene: display mission result, update site indicators
 * - Trigger audio: hexzoom_enter, hex_hover, hex_select, hex_locked, site_state_changed,
 *   party_select_open, party_select_confirm
 *
 * === DO NOT ===
 * - Handle combat physics (that's MissionScene)
 * - Handle building management (that's CityViewScene)
 * - Render the full-world map (that's WorldMapScene)
 */

import Phaser from 'phaser';
import type { IGameStateManager } from '@systems/IGameStateManager';
import type { IReachSystem } from '@systems/IReachSystem';
import type { ISiteEvolutionSystem } from '@systems/ISiteEvolutionSystem';
import type { IHeroSystem } from '@systems/IHeroSystem';
import type { IAudioService } from '@services/IAudioService';

export const HEX_ZOOM_SCENE_KEY = 'HexZoomScene';

export class HexZoomScene extends Phaser.Scene {
  private gsm!: IGameStateManager;
  private reachSystem!: IReachSystem;
  private siteEvolutionSystem!: ISiteEvolutionSystem;
  private heroSystem!: IHeroSystem;
  private audioService!: IAudioService;

  constructor() {
    super({ key: HEX_ZOOM_SCENE_KEY });
  }

  init(data: {
    gsm: IGameStateManager;
    reachSystem: IReachSystem;
    siteEvolutionSystem: ISiteEvolutionSystem;
    heroSystem: IHeroSystem;
    audioService: IAudioService;
  }): void {
    this.gsm = data.gsm;
    this.reachSystem = data.reachSystem;
    this.siteEvolutionSystem = data.siteEvolutionSystem;
    this.heroSystem = data.heroSystem;
    this.audioService = data.audioService;
  }

  preload(): void {
    // TODO: Load hex tileset atlas (see MANIFEST.md: hex_tileset)
    // TODO: Load site marker sprites and state-change indicator sprites
    // TODO: Load reach ring overlay
  }

  create(): void {
    // TODO: Build Phaser Tilemap from gsm.hexMap data
    // TODO: Apply scaleY ~0.55 for pseudo-isometric projection
    // TODO: Render site markers on each tile based on siteType
    // TODO: Apply reach ring overlay from reachSystem.getHexesInRadius()
    // TODO: Tint out-of-reach tiles 50% alpha
    // TODO: Render state-change indicators from siteEvolutionSystem.getRecentlyChangedSites()
    // TODO: Wire pointer events on accessible hex tiles
    // TODO: Check gsm.missionResult on create (if resuming from mission) and show result panel
    this.add.text(10, 10, '[STUB] HexZoomScene', { color: '#ffffff' });
  }

  update(_time: number, _delta: number): void {
    // TODO: Update hover highlights, animated site markers
  }
}
