/**
 * WorldMapScene.ts
 * 2D flat world map: city position and wind route selection.
 * Owner: Architecture domain
 *
 * === SCENE OWNERSHIP ===
 * Reads from GSM:  cityHex, cycleCount
 * Writes to GSM:   cityHex, windCorridor (via ITradewindSystem.applyChoice)
 *
 * === TRANSITIONS ===
 * → HexZoomScene   after player confirms wind route choice
 */

import Phaser from 'phaser';
import type { IGameStateManager } from '@systems/IGameStateManager';
import type { ITradewindSystem } from '@systems/ITradewindSystem';
import type { IHeroSystem } from '@systems/IHeroSystem';
import type { IAudioService } from '@services/IAudioService';
import type { TradewindOption } from '@data/TradewindOption';
import { hexId } from '@data/HexTile';
import type { ServiceBundle } from '../../src/main';

export const WORLD_MAP_SCENE_KEY = 'WorldMapScene';

/** Route card colours (cycling). */
const ROUTE_COLORS = [0x3388cc, 0x33aa66, 0xcc8833];

export class WorldMapScene extends Phaser.Scene {
  private gsm!: IGameStateManager;
  private tradewindSystem!: ITradewindSystem;
  private heroSystem!: IHeroSystem;
  private audioService!: IAudioService;
  private services!: ServiceBundle;

  constructor() {
    super({ key: WORLD_MAP_SCENE_KEY });
  }

  init(data: ServiceBundle): void {
    this.services = data;
    this.gsm = data.gsm;
    this.tradewindSystem = data.tradewindSystem;
    this.heroSystem = data.heroSystem;
    this.audioService = data.audioService;
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // Advance recovering/injured heroes at cycle start
    this.heroSystem.advanceCycleStatuses();

    // Show UIScene HUD
    const uiScene = this.scene.get('UIScene');
    if (uiScene) (uiScene as unknown as { show(): void }).show();

    // ── Background ────────────────────────────────────────
    this.add.graphics()
      .fillStyle(0x0a0a2e, 1)
      .fillRect(0, 0, W, H);

    // Sky gradient effect (subtle)
    const gradient = this.add.graphics();
    gradient.fillStyle(0x112244, 0.5);
    gradient.fillRect(0, 0, W, H / 2);

    // ── Title ─────────────────────────────────────────────
    this.add.text(W / 2, 50, `Cycle ${this.gsm.cycleCount} — Choose a Wind Route`, {
      fontSize: '34px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ── City icon ─────────────────────────────────────────
    const cityScreenX = W / 2;
    const cityScreenY = H / 2 - 80;
    const city = this.add.graphics();
    city.fillStyle(0xffcc00, 1);
    city.fillCircle(cityScreenX, cityScreenY, 28);
    city.lineStyle(2, 0xffffff, 1);
    city.strokeCircle(cityScreenX, cityScreenY, 28);

    this.add.text(cityScreenX, cityScreenY - 45, 'Your City', {
      fontSize: '18px',
      color: '#ffcc00',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(cityScreenX, cityScreenY + 40, `[${hexId(this.gsm.cityHex)}]`, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ── Generate wind route options ───────────────────────
    const options = this.tradewindSystem.generateOptions(
      this.gsm.cityHex,
      this.gsm.cycleCount,
    );

    this._renderRouteCards(options, W);
  }

  // ── Private ─────────────────────────────────────────────

  private _renderRouteCards(options: TradewindOption[], screenWidth: number): void {
    const cardW = 360;
    const cardH = 170;
    const startY = this.scale.height / 2 + 80;
    const totalWidth = options.length * (cardW + 30) - 30;
    const startX = (screenWidth - totalWidth) / 2;

    options.forEach((option, i) => {
      const x = startX + i * (cardW + 30);
      const y = startY;
      const color = ROUTE_COLORS[i % ROUTE_COLORS.length]!;

      // Card background
      const card = this.add.graphics();
      card.fillStyle(color, 0.3);
      card.fillRoundedRect(x, y, cardW, cardH, 10);
      card.lineStyle(2, color, 0.8);
      card.strokeRoundedRect(x, y, cardW, cardH, 10);

      // Card text
      this.add.text(x + cardW / 2, y + 28, option.label, {
        fontSize: '22px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(x + cardW / 2, y + 65, option.description, {
        fontSize: '16px',
        color: '#cccccc',
        fontFamily: 'monospace',
        wordWrap: { width: cardW - 30 },
      }).setOrigin(0.5);

      this.add.text(x + cardW / 2, y + 110, `→ ${hexId(option.resultingCityHex)}  |  ${option.windCorridor.length} hexes in corridor`, {
        fontSize: '15px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      // Hit zone for click
      const hitZone = this.add.zone(x + cardW / 2, y + cardH / 2, cardW, cardH)
        .setInteractive({ useHandCursor: true });

      hitZone.on('pointerover', () => {
        card.clear();
        card.fillStyle(color, 0.6);
        card.fillRoundedRect(x, y, cardW, cardH, 10);
        card.lineStyle(3, 0xffffff, 1);
        card.strokeRoundedRect(x, y, cardW, cardH, 10);
      });

      hitZone.on('pointerout', () => {
        card.clear();
        card.fillStyle(color, 0.3);
        card.fillRoundedRect(x, y, cardW, cardH, 10);
        card.lineStyle(2, color, 0.8);
        card.strokeRoundedRect(x, y, cardW, cardH, 10);
      });

      hitZone.on('pointerdown', () => {
        this._selectRoute(option);
      });
    });
  }

  private _selectRoute(option: TradewindOption): void {
    this.tradewindSystem.applyChoice(option);
    this.scene.start('HexZoomScene', this.services);
  }
}
