/**
 * TradewindSystem.ts
 * Manages city movement along the persistent wind corridor network.
 * Owner: Architecture domain
 *
 * No Phaser imports — pure game logic.
 *
 * The city automatically advances along its assigned WindCorridor each cycle.
 * At a WindJunction the player may switch to an intersecting corridor.
 */

import type { AxialCoord }       from '@data/HexTile';
import { hexId, hexDistance }    from '@data/HexTile';
import type { WindCorridor, WindJunction }    from '@data/WindNetwork';
import type { ITradewindSystem } from './ITradewindSystem';
import type { IGameStateManager } from './IGameStateManager';

/** How many spine steps ahead we scan when looking for an upcoming junction. */
const JUNCTION_LOOK_AHEAD = 6;

export class TradewindSystem implements ITradewindSystem {
  constructor(private _gsm: IGameStateManager) {}

  // ── Internal helpers ───────────────────────────────────────────────────

  private _activeCorridor(): WindCorridor | null {
    const id = this._gsm.currentCorridorId;
    return this._gsm.windNetwork.corridors.find(c => c.id === id) ?? null;
  }

  /** Nearest junction within LOOK_AHEAD steps of the current spine position. */
  private _nearestJunctionAhead(): WindJunction | null {
    const corr = this._activeCorridor();
    if (!corr) return null;

    const idx     = this._gsm.currentSpineIndex;
    const network = this._gsm.windNetwork;
    const scan    = Math.min(idx + JUNCTION_LOOK_AHEAD, corr.spine.length - 1);

    for (let i = idx; i <= scan; i++) {
      const j = network.junctions.find(j => {
        // Junction is "at" this spine hex if its hex is within 1 step
        return hexDistance(j.hex, corr.spine[i]!) <= 1 &&
               j.corridorIds.includes(corr.id);
      });
      if (j) return j;
    }
    return null;
  }

  // ── ITradewindSystem ───────────────────────────────────────────────────

  advanceCityAlongCorridor(): void {
    const corr = this._activeCorridor();
    if (!corr) { this._gsm.advanceCycle(); return; }

    const speed   = corr.speed;
    const cur     = this._gsm.currentSpineIndex;
    const nextIdx = Math.min(cur + speed, corr.spine.length - 1);

    this._gsm.setCurrentCorridor(corr.id, nextIdx);
    this._gsm.setCityHex(corr.spine[nextIdx]!);
    this._gsm.setWindCorridor(corr.bandHexes);
    this._gsm.advanceCycle();
  }

  isAtJunction(): boolean {
    return this._nearestJunctionAhead() !== null;
  }

  getUpcomingJunction(): {
    junction: WindJunction;
    options: Array<{ corridor: WindCorridor; spineIndex: number; direction: 'forward' | 'backward' }>;
  } | null {
    const junction = this._nearestJunctionAhead();
    if (!junction) return null;

    const activeId  = this._gsm.currentCorridorId;
    const network   = this._gsm.windNetwork;

    const options = junction.corridorIds
      .filter(cId => cId !== activeId)
      .flatMap((cId): Array<{ corridor: WindCorridor; spineIndex: number; direction: 'forward' | 'backward' }> => {
        const corr = network.corridors.find(c => c.id === cId);
        if (!corr) return [];

        // Find the junction spine index for this corridor
        const jIdx = junction.spineIndices[cId] ?? 0;

        // Determine which end of the corridor is "forward" from city perspective
        // (simple heuristic: pick direction that moves away from city hub)
        return [{ corridor: corr, spineIndex: jIdx, direction: 'forward' as const }];
      });

    return { junction, options };
  }

  switchCorridor(corridorId: string): void {
    const network = this._gsm.windNetwork;
    const corr    = network.corridors.find(c => c.id === corridorId);
    if (!corr) return;

    // Find the junction that connects our current corridor and the target
    const junction = network.junctions.find(j =>
      j.corridorIds.includes(this._gsm.currentCorridorId) &&
      j.corridorIds.includes(corridorId),
    );
    const jIdx = (junction?.spineIndices[corridorId]) ?? 0;

    this._gsm.setCurrentCorridor(corridorId, jIdx);
    this._gsm.setCityHex(corr.spine[jIdx]!);
    this._gsm.setWindCorridor(corr.bandHexes);
  }

  getCorridorHexes(): AxialCoord[] {
    return this._gsm.windCorridor;
  }

  getActiveSpine(): AxialCoord[] {
    return this._activeCorridor()?.spine ?? [this._gsm.cityHex];
  }
}
