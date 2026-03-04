/**
 * UIScene.ts
 * STUB — Persistent HUD overlay: resource bars, cycle counter, active objectives.
 * Owner: Architecture domain
 *
 * === SCENE OWNERSHIP ===
 * Reads from GSM:  resources, cycleCount   [READ-ONLY — never writes to GSM]
 * Writes to GSM:   nothing
 *
 * === LIFECYCLE ===
 * - Launched once at game start; never stopped until game closes.
 * - Runs in parallel above WorldMapScene and HexZoomScene.
 * - Hidden/shown selectively: active during WorldMapScene + HexZoomScene,
 *   HIDDEN during MissionScene (MissionScene manages its own HUD) and
 *   CityViewScene (its own UI manages resources display).
 *
 * === RESPONSIBILITIES ===
 * - Display Tier 1, Tier 2, Tier 3 resource counts (read from gsm.resources)
 * - Display current cycle number (read from gsm.cycleCount)
 * - Display active mission objective list (read from gsm.missionContext if active)
 * - Listen for GSM state changes and update displays reactively
 * - Provide show() / hide() methods for other scenes to call
 *
 * === DO NOT ===
 * - Respond to player input (UIScene is display only)
 * - Read hero roster, mission results, or city state directly —
 *   it only cares about resources and cycle count
 * - Contain any game logic
 */

import Phaser from 'phaser';
import type { IGameStateManager } from '@systems/IGameStateManager';

export const UI_SCENE_KEY = 'UIScene';

export class UIScene extends Phaser.Scene {
  private gsm!: IGameStateManager;

  constructor() {
    super({ key: UI_SCENE_KEY });
  }

  init(data: { gsm: IGameStateManager }): void {
    this.gsm = data.gsm;
  }

  preload(): void {
    // TODO: Load resource icons (ui_resource_icon_tier1/2/3 — see MANIFEST.md)
    // TODO: Load ui_resource_bar, ui_panel_bg
  }

  create(): void {
    // TODO: Render resource bar background
    // TODO: Render Tier 1 icon + count text
    // TODO: Render Tier 2 icon + count text
    // TODO: Render Tier 3 icon + count text
    // TODO: Render cycle counter
    this.add.text(10, this.scale.height - 30, '[STUB] UIScene HUD', { color: '#ffffff', fontSize: '12px' });
  }

  update(_time: number, _delta: number): void {
    // TODO: Poll gsm.resources and gsm.cycleCount; update display text objects
    //       (or use Phaser events/callbacks for reactive updates)
  }

  /** Called by MissionScene and CityViewScene to hide the persistent HUD. */
  hide(): void {
    this.scene.setVisible(false);
  }

  /** Called when returning to WorldMapScene or HexZoomScene. */
  show(): void {
    this.scene.setVisible(true);
  }
}
