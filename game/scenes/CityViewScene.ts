/**
 * CityViewScene.ts
 * View-only city display: building slots, hero roster, resources.
 * Owner: Architecture domain
 *
 * === SCENE OWNERSHIP ===
 * Reads from GSM:  resources, cityState, heroRoster
 *
 * === TRANSITIONS ===
 * ← HexZoomScene   (launched when player clicks city hex)
 * → HexZoomScene   (player clicks "Return to Map")
 *
 * Minimal version: view-only — no construction, no recruitment.
 * Displays building slot states, hero roster, and resource totals.
 */

import Phaser from 'phaser';
import type { IGameStateManager } from '@systems/IGameStateManager';
import type { IHeroSystem } from '@systems/IHeroSystem';
import type { IResourceSystem } from '@systems/IResourceSystem';
import type { ServiceBundle } from '../../src/main';

export const CITY_VIEW_SCENE_KEY = 'CityViewScene';

// ── Colour palette ───────────────────────────────────────────
const BG_SKY    = 0x446688;
const BG_CITY   = 0x334455;
const SLOT_EMPTY        = 0x666666;
const SLOT_CONSTRUCTING = 0xccaa33;
const SLOT_BUILT        = 0x44aa44;
const SLOT_UPGRADED     = 0x66ccff;
const TIER_COLORS: Record<number, string> = { 1: '#66ff66', 2: '#6699ff', 3: '#cc66ff' };
const STATUS_COLORS: Record<string, string> = {
  available: '#66ff66',
  on_mission: '#ffaa33',
  injured: '#ff4444',
  recovering: '#ffcc66',
};

export class CityViewScene extends Phaser.Scene {
  private gsm!: IGameStateManager;
  private heroSystem!: IHeroSystem;
  private resourceSystem!: IResourceSystem;
  private services!: ServiceBundle;

  constructor() {
    super({ key: CITY_VIEW_SCENE_KEY });
  }

  init(data: ServiceBundle): void {
    this.services = data;
    this.gsm = data.gsm;
    this.heroSystem = data.heroSystem;
    this.resourceSystem = data.resourceSystem;
  }

  create(): void {
    const W = Number(this.game.config.width);
    const H = Number(this.game.config.height);

    // ── Background ────────────────────────────────────────
    const bg = this.add.graphics();
    // Sky gradient (upper half)
    bg.fillStyle(BG_SKY, 1);
    bg.fillRect(0, 0, W, H * 0.5);
    // City base (lower half)
    bg.fillStyle(BG_CITY, 1);
    bg.fillRect(0, H * 0.5, W, H * 0.5);
    // "Ground" line
    bg.lineStyle(2, 0x557799, 1);
    bg.lineBetween(0, H * 0.5, W, H * 0.5);

    // ── Title ─────────────────────────────────────────────
    this.add.text(W / 2, 24, 'FLOATING CITY', {
      fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(W / 2, 50, `Cycle ${this.gsm.cycleCount}`, {
      fontSize: '13px', color: '#aabbcc', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ── Building slots ────────────────────────────────────
    this._renderBuildingSlots(W);

    // ── Resource panel (right side) ───────────────────────
    this._renderResourcePanel(W - 220, 80);

    // ── Hero roster (left side) ──────────────────────────
    this._renderHeroRoster(30, 80);

    // ── Return button ─────────────────────────────────────
    this._renderReturnButton(W, H);
  }

  // ── Building slots ─────────────────────────────────────

  private _renderBuildingSlots(sceneW: number): void {
    const slots = this.gsm.cityState.buildingSlots;
    const startX = sceneW / 2 - ((slots.length - 1) * 90) / 2;
    const y = 380;

    this.add.text(sceneW / 2, y - 40, 'BUILDING SLOTS', {
      fontSize: '13px', color: '#aabbcc', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!;
      const x = startX + i * 90;

      // Pick colour by state
      let color = SLOT_EMPTY;
      if (slot.state === 'constructing') color = SLOT_CONSTRUCTING;
      else if (slot.state === 'built') color = SLOT_BUILT;
      else if (slot.state === 'upgraded') color = SLOT_UPGRADED;

      const gfx = this.add.graphics();
      gfx.fillStyle(color, 0.7);
      gfx.fillRect(x - 30, y, 60, 60);
      gfx.lineStyle(2, color, 1);
      gfx.strokeRect(x - 30, y, 60, 60);

      // Slot label
      const label = slot.buildingId ?? slot.slotId;
      this.add.text(x, y + 30, label.replace(/_/g, '\n'), {
        fontSize: '9px', color: '#ffffff', fontFamily: 'monospace', align: 'center',
      }).setOrigin(0.5);

      // State label below
      this.add.text(x, y + 72, slot.state, {
        fontSize: '9px', color: '#888888', fontFamily: 'monospace',
      }).setOrigin(0.5);
    }
  }

  // ── Resource panel ─────────────────────────────────────

  private _renderResourcePanel(x: number, y: number): void {
    const gfx = this.add.graphics();
    gfx.fillStyle(0x222233, 0.8);
    gfx.fillRect(x, y, 200, 180);
    gfx.lineStyle(1, 0x445566, 1);
    gfx.strokeRect(x, y, 200, 180);

    this.add.text(x + 100, y + 14, 'RESOURCES', {
      fontSize: '12px', color: '#aabbcc', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    const res = this.gsm.resources;
    let row = 0;

    // Tier 1
    this.add.text(x + 10, y + 36, 'Tier 1', { fontSize: '10px', color: TIER_COLORS[1], fontFamily: 'monospace' });
    for (const [id, amt] of Object.entries(res.tier1)) {
      this.add.text(x + 20, y + 52 + row * 16, `${id}: ${amt}`, {
        fontSize: '10px', color: '#cccccc', fontFamily: 'monospace',
      });
      row++;
    }

    // Tier 2
    this.add.text(x + 10, y + 52 + row * 16 + 4, 'Tier 2', { fontSize: '10px', color: TIER_COLORS[2], fontFamily: 'monospace' });
    row++;
    for (const [id, amt] of Object.entries(res.tier2)) {
      this.add.text(x + 20, y + 52 + row * 16, `${id}: ${amt}`, {
        fontSize: '10px', color: '#cccccc', fontFamily: 'monospace',
      });
      row++;
    }

    // Tier 3
    this.add.text(x + 10, y + 52 + row * 16 + 4, 'Tier 3', { fontSize: '10px', color: TIER_COLORS[3], fontFamily: 'monospace' });
    row++;
    for (const [id, amt] of Object.entries(res.tier3)) {
      this.add.text(x + 20, y + 52 + row * 16, `${id}: ${amt}`, {
        fontSize: '10px', color: '#cccccc', fontFamily: 'monospace',
      });
      row++;
    }
  }

  // ── Hero roster ────────────────────────────────────────

  private _renderHeroRoster(x: number, y: number): void {
    const heroes = this.heroSystem.getRoster();

    const gfx = this.add.graphics();
    const panelH = Math.max(180, 40 + heroes.length * 70);
    gfx.fillStyle(0x222233, 0.8);
    gfx.fillRect(x, y, 260, panelH);
    gfx.lineStyle(1, 0x445566, 1);
    gfx.strokeRect(x, y, 260, panelH);

    this.add.text(x + 130, y + 14, 'HERO ROSTER', {
      fontSize: '12px', color: '#aabbcc', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    for (let i = 0; i < heroes.length; i++) {
      const hero = heroes[i]!;
      const hy = y + 36 + i * 66;

      // Hero name + class
      this.add.text(x + 10, hy, `${hero.name}  (${hero.heroClass})`, {
        fontSize: '11px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
      });

      // Status
      const statusColor = STATUS_COLORS[hero.status] ?? '#888888';
      this.add.text(x + 10, hy + 16, `Status: ${hero.status}`, {
        fontSize: '10px', color: statusColor, fontFamily: 'monospace',
      });

      // Stats
      this.add.text(x + 10, hy + 32, `C:${hero.stats.combat}  E:${hero.stats.exploration}  D:${hero.stats.diplomacy}  XP:${hero.experience}`, {
        fontSize: '9px', color: '#999999', fontFamily: 'monospace',
      });

      // Divider
      if (i < heroes.length - 1) {
        const dg = this.add.graphics();
        dg.lineStyle(1, 0x334455, 0.6);
        dg.lineBetween(x + 10, hy + 56, x + 250, hy + 56);
      }
    }
  }

  // ── Return button ──────────────────────────────────────

  private _renderReturnButton(sceneW: number, sceneH: number): void {
    const bx = sceneW / 2;
    const by = sceneH - 50;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x335577, 1);
    gfx.fillRect(bx - 90, by - 16, 180, 32);
    gfx.lineStyle(2, 0x5588aa, 1);
    gfx.strokeRect(bx - 90, by - 16, 180, 32);

    this.add.text(bx, by, 'Return to Map', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Invisible interactive zone
    const hitZone = this.add.zone(bx, by, 180, 32).setInteractive({ useHandCursor: true });
    hitZone.on('pointerover', () => {
      gfx.clear();
      gfx.fillStyle(0x4477aa, 1);
      gfx.fillRect(bx - 90, by - 16, 180, 32);
      gfx.lineStyle(2, 0x66aadd, 1);
      gfx.strokeRect(bx - 90, by - 16, 180, 32);
    });
    hitZone.on('pointerout', () => {
      gfx.clear();
      gfx.fillStyle(0x335577, 1);
      gfx.fillRect(bx - 90, by - 16, 180, 32);
      gfx.lineStyle(2, 0x5588aa, 1);
      gfx.strokeRect(bx - 90, by - 16, 180, 32);
    });
    hitZone.on('pointerdown', () => {
      this.scene.start('HexZoomScene', this.services);
    });
  }
}
