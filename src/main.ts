/**
 * src/main.ts
 * ============================================================
 * Phaser Game entry point — Phase 0 bootstrap.
 *
 * This file:
 *   1. Instantiates all stub implementations of every system/service.
 *   2. Wires them into a BootScene that passes them to the first real scene.
 *   3. Registers all scene stubs so Phaser knows about them.
 *
 * Phase 0 exit criterion: `npm run dev` opens a browser window without errors.
 *
 * When a system is implemented, swap its Stub import for the real class here.
 * No scene file should need to change — they all code against the interface.
 *
 * Owner: Architecture (@arch)
 * ============================================================
 */

import Phaser from 'phaser';

// ── Stub imports ──────────────────────────────────────────────
import { GameStateManagerStub }    from '@systems/IGameStateManager';
import { ResourceSystemStub }      from '@systems/IResourceSystem';
import { HeroSystemStub }          from '@systems/IHeroSystem';
import { SiteEvolutionSystemStub } from '@systems/ISiteEvolutionSystem';
import { TradewindSystemStub }     from '@systems/ITradewindSystem';
import { ReachSystemStub }         from '@systems/IReachSystem';
import { TechTreeSystemStub }      from '@systems/ITechTreeSystem';
import { AudioServiceStub }        from '@services/IAudioService';
import { SaveServiceStub }         from '@services/ISaveService';

// ── Scene stubs ───────────────────────────────────────────────
import { WorldMapScene }  from '@scenes/WorldMapScene';
import { HexZoomScene }   from '@scenes/HexZoomScene';
import { MissionScene }   from '@scenes/MissionScene';
import { CityViewScene }  from '@scenes/CityViewScene';
import { UIScene }        from '@scenes/UIScene';

// ── Type-only imports ─────────────────────────────────────────
import type { IGameStateManager }    from '@systems/IGameStateManager';
import type { IResourceSystem }      from '@systems/IResourceSystem';
import type { IHeroSystem }          from '@systems/IHeroSystem';
import type { ISiteEvolutionSystem } from '@systems/ISiteEvolutionSystem';
import type { ITradewindSystem }     from '@systems/ITradewindSystem';
import type { IReachSystem }         from '@systems/IReachSystem';
import type { ITechTreeSystem }      from '@systems/ITechTreeSystem';
import type { IAudioService }        from '@services/IAudioService';
import type { ISaveService }         from '@services/ISaveService';

// ─────────────────────────────────────────────────────────────
// Shared services bundle — passed into every scene via init()
// ─────────────────────────────────────────────────────────────
export interface ServiceBundle {
  gsm:               IGameStateManager;
  resourceSystem:    IResourceSystem;
  heroSystem:        IHeroSystem;
  siteEvolution:     ISiteEvolutionSystem;
  tradewindSystem:   ITradewindSystem;
  reachSystem:       IReachSystem;
  techTreeSystem:    ITechTreeSystem;
  audioService:      IAudioService;
  saveService:       ISaveService;
}

// ─────────────────────────────────────────────────────────────
// BootScene
// Instantiates all stubs, then starts WorldMapScene.
// Never renders anything — just orchestrates startup.
// ─────────────────────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const gsm = new GameStateManagerStub();

    const services: ServiceBundle = {
      gsm,
      resourceSystem:  new ResourceSystemStub(gsm),
      heroSystem:      new HeroSystemStub(gsm),
      siteEvolution:   new SiteEvolutionSystemStub(gsm),
      tradewindSystem: new TradewindSystemStub(gsm),
      reachSystem:     new ReachSystemStub(gsm),
      techTreeSystem:  new TechTreeSystemStub(gsm),
      audioService:    new AudioServiceStub(),
      saveService:     new SaveServiceStub(),
    };

    // Start the persistent UI overlay first so it's always on top.
    this.scene.launch('UIScene', services);

    // Then start the first gameplay scene.
    this.scene.start('WorldMapScene', services);
  }
}

// ─────────────────────────────────────────────────────────────
// Phaser Game configuration
// ─────────────────────────────────────────────────────────────
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,           // WebGL with Canvas fallback
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scene: [
    BootScene,     // runs first, starts the others
    WorldMapScene,
    HexZoomScene,
    MissionScene,
    CityViewScene,
    UIScene,
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },  // MissionScene overrides with gravity: {y:600}
      debug: import.meta.env.DEV,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// ── Launch ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(config);
