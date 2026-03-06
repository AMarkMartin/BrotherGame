/**
 * WindNetworkGenerator.ts
 * Procedurally generates the persistent wind corridor network.
 *
 * Algorithm (graph-first, connectivity guaranteed):
 *  1. Scatter ~12 waypoint hexes across the map using noise-guided placement.
 *  2. Build a Minimum Spanning Tree (Kruskal) over the waypoints — this gives a
 *     fully connected skeleton with no isolated components.
 *  3. Add extra edges (~50% of MST count) between nearby waypoints to create
 *     loops, branches, and the sense of a swirling global network.
 *  4. Trace each edge as a wind corridor: a flow-following walk that steers
 *     between the curl-noise field (organic curves) and the target waypoint
 *     (guaranteed termination). Both endpoints are already waypoints, so
 *     junctions are baked in from the start.
 *  5. Band-expand each corridor spine and detect junctions.
 *
 * Owner: Architecture domain — no Phaser imports.
 */

import type { AxialCoord } from './HexTile';
import { hexId, hexNeighbors } from './HexTile';
import type { WindNetwork, WindCorridor, WindJunction } from './WindNetwork';
import { WIND_NAMES, CORRIDOR_COLORS } from './WindNetwork';
import { fbm } from './NoiseUtils';

const SQRT3   = Math.sqrt(3);
const TILE_SY = 0.55;

function hexFlat(q: number, r: number): { nx: number; ny: number } {
  return { nx: q + r * 0.5, ny: r * SQRT3 * TILE_SY };
}

function cubeLen(a: AxialCoord, b: AxialCoord): number {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs((-a.q - a.r) - (-b.q - b.r)),
  );
}

function parseHexId(id: string): AxialCoord | null {
  const m = id.match(/^q(-?\d+)_r(-?\d+)$/);
  return m ? { q: parseInt(m[1]!, 10), r: parseInt(m[2]!, 10) } : null;
}

function inWorld(q: number, r: number, R: number): boolean {
  return Math.abs(q) <= R && Math.abs(r) <= R && Math.abs(-q - r) <= R;
}

const NEIGH_DIRS = (() => {
  const offsets = [
    { dq:  1, dr:  0 }, { dq:  1, dr: -1 }, { dq:  0, dr: -1 },
    { dq: -1, dr:  0 }, { dq: -1, dr:  1 }, { dq:  0, dr:  1 },
  ];
  return offsets.map(({ dq, dr }) => {
    const { nx, ny } = hexFlat(dq, dr);
    const len = Math.sqrt(nx * nx + ny * ny);
    return { dq, dr, ux: nx / len, uy: ny / len };
  });
})();

const SC  = 0.048;
const EPS = 0.40;

function psi(nx: number, ny: number, ox: number, oy: number): number {
  return fbm(nx * SC + ox, ny * SC + oy, 4);
}

function curlAt(nx: number, ny: number, ox: number, oy: number): { vx: number; vy: number } {
  const vx =  (psi(nx, ny + EPS, ox, oy) - psi(nx, ny - EPS, ox, oy)) / (2 * EPS);
  const vy = -(psi(nx + EPS, ny, ox, oy) - psi(nx - EPS, ny, ox, oy)) / (2 * EPS);
  return { vx, vy };
}

function makeLcg(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function expandBand(spine: AxialCoord[], radius: number): AxialCoord[] {
  const seen   = new Set<string>();
  const result: AxialCoord[] = [];
  for (const point of spine) {
    const queue: Array<{ coord: AxialCoord; depth: number }> = [{ coord: point, depth: 0 }];
    const visited = new Set<string>([hexId(point)]);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (!seen.has(hexId(cur.coord))) { seen.add(hexId(cur.coord)); result.push(cur.coord); }
      if (cur.depth < radius) {
        for (const n of hexNeighbors(cur.coord)) {
          const nId = hexId(n);
          if (!visited.has(nId)) { visited.add(nId); queue.push({ coord: n, depth: cur.depth + 1 }); }
        }
      }
    }
  }
  return result;
}

class UnionFind {
  private parent: number[];
  constructor(n: number) { this.parent = Array.from({ length: n }, (_, i) => i); }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]!]!;
      x = this.parent[x]!;
    }
    return x;
  }
  unite(a: number, b: number): boolean {
    a = this.find(a); b = this.find(b);
    if (a === b) return false;
    this.parent[b] = a;
    return true;
  }
}

/**
 * Trace a corridor spine from `from` toward `to`, blending curl-noise flow
 * with a direct pull toward the target.  The pull increases as we get closer,
 * guaranteeing termination.
 */
function traceCorridorEdge(
  from: AxialCoord,
  to: AxialCoord,
  worldRadius: number,
  ox: number,
  oy: number,
): AxialCoord[] {
  const totalDist = cubeLen(from, to);
  if (totalDist === 0) return [from];

  const spine: AxialCoord[] = [];
  const visited = new Set<string>();
  let q = from.q, r = from.r;
  const maxSteps = Math.max(totalDist * 3, 40);

  for (let step = 0; step < maxSteps; step++) {
    const id = hexId({ q, r });
    if (visited.has(id)) break;
    visited.add(id);
    spine.push({ q, r });

    const dist = cubeLen({ q, r }, to);
    if (dist <= 1) {
      if (dist === 1) spine.push(to);
      break;
    }

    const progress     = 1 - dist / totalDist;
    const targetWeight = 0.25 + progress * 0.90;

    const { nx, ny } = hexFlat(q, r);
    const { vx, vy } = curlAt(nx, ny, ox, oy);
    const cmag = Math.sqrt(vx * vx + vy * vy) || 1;
    const cux = vx / cmag, cuy = vy / cmag;

    const { nx: tnx, ny: tny } = hexFlat(to.q, to.r);
    const { nx: fnx, ny: fny } = hexFlat(q, r);
    const dtx = tnx - fnx, dty = tny - fny;
    const dmag = Math.sqrt(dtx * dtx + dty * dty) || 1;
    const tux = dtx / dmag, tuy = dty / dmag;

    const bux = cux * (1 - targetWeight) + tux * targetWeight;
    const buy = cuy * (1 - targetWeight) + tuy * targetWeight;
    const bmag = Math.sqrt(bux * bux + buy * buy) || 1;
    const ux = bux / bmag, uy = buy / bmag;

    let best: AxialCoord | null = null;
    let bestScore = -Infinity;

    for (const d of NEIGH_DIRS) {
      const nq = q + d.dq, nr = r + d.dr;
      if (!inWorld(nq, nr, worldRadius)) continue;
      if (visited.has(hexId({ q: nq, r: nr }))) continue;
      const dot   = d.ux * ux + d.uy * uy;
      const ndist = cubeLen({ q: nq, r: nr }, to);
      const score = dot - ndist * 0.01;
      if (score > bestScore) { bestScore = score; best = { q: nq, r: nr }; }
    }

    if (!best) {
      // Fallback: greedy step toward target
      let fbDist = Infinity;
      for (const d of NEIGH_DIRS) {
        const nq = q + d.dq, nr = r + d.dr;
        if (!inWorld(nq, nr, worldRadius)) continue;
        if (visited.has(hexId({ q: nq, r: nr }))) continue;
        const nd = cubeLen({ q: nq, r: nr }, to);
        if (nd < fbDist) { fbDist = nd; best = { q: nq, r: nr }; }
      }
      if (!best) break;
    }

    q = best.q;
    r = best.r;
  }

  return spine;
}

export function generateWindNetwork(worldRadius: number, seed: number): WindNetwork {
  const rng = makeLcg(seed);
  const ox  = 10 + ((rng() * 40) | 0);
  const oy  = 10 + ((rng() * 40) | 0);

  const usedNames = new Set<string>();
  let colorIdx    = 0;

  function pickName(): string {
    for (let i = 0; i < WIND_NAMES.length * 2; i++) {
      const name = WIND_NAMES[(rng() * WIND_NAMES.length) | 0] ?? WIND_NAMES[0]!;
      if (!usedNames.has(name)) { usedNames.add(name); return name; }
    }
    return 'Current ' + (colorIdx + 1);
  }

  // ── Step 1: Scatter waypoints across the map ──────────────────────────────
  // For global-wind look, we plant fixed points near all four cardinal edges
  // first, then fill in mid-distance waypoints.  This forces some corridors to
  // span the full visible world, making the network feel planetary in scale.
  const NUM_WAYPOINTS  = 17;
  const MIN_SEPARATION = Math.floor(worldRadius * 0.20);

  const waypoints: AxialCoord[] = [{ q: 0, r: 0 }];

  // Four cardinal near-edge points (spread 85 % of world radius)
  const er = Math.floor(worldRadius * 0.85);
  const cardinalPts: AxialCoord[] = [
    { q: 0,   r: -er },            // north
    { q: er,  r: -(er >> 1) },     // east
    { q: 0,   r:  er },            // south
    { q: -er, r:  (er >> 1) },     // west
  ];
  for (const wp of cardinalPts) {
    if (inWorld(wp.q, wp.r, worldRadius)) waypoints.push(wp);
  }

  // Fill remaining waypoints with uniform-radius (not sqrt) distribution
  // so we get good mid-to-outer coverage, not a cluster in the centre.
  for (let attempt = 0; attempt < NUM_WAYPOINTS * 100 && waypoints.length < NUM_WAYPOINTS; attempt++) {
    const angle  = rng() * Math.PI * 2;
    const radius = (0.30 + rng() * 0.65) * worldRadius;  // uniform across 30–95 %
    const wx     = radius * Math.cos(angle) * 1.5;
    const wy     = radius * Math.sin(angle) / TILE_SY;
    const q      = Math.round(wx / 1.5);
    const r      = Math.round(wy / SQRT3 - q * 0.5);
    if (!inWorld(q, r, worldRadius)) continue;
    if (!waypoints.some(w => cubeLen({ q, r }, w) < MIN_SEPARATION))
      waypoints.push({ q, r });
  }

  const N = waypoints.length;

  // ── Step 2: MST (Kruskal) ─────────────────────────────────────────────────
  type Edge = { a: number; b: number; dist: number };
  const allEdges: Edge[] = [];
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++)
      allEdges.push({ a: i, b: j, dist: cubeLen(waypoints[i]!, waypoints[j]!) });
  allEdges.sort((x, y) => x.dist - y.dist);

  const uf = new UnionFind(N);
  const mstEdges: Edge[] = [];
  for (const edge of allEdges) {
    if (uf.unite(edge.a, edge.b)) {
      mstEdges.push(edge);
      if (mstEdges.length === N - 1) break;
    }
  }

  // ── Step 3: Extra edges (loops / extra branches) ──────────────────────────
  // First, count existing MST degree per waypoint.
  const degree = new Array<number>(N).fill(0);
  for (const e of mstEdges) { degree[e.a]!++; degree[e.b]!++; }

  const usedPairs = new Set(mstEdges.map(e => `${e.a}_${e.b}`));

  // Force an extra edge for every degree-1 (leaf) waypoint so that every
  // junction has at least two distinct corridors — no true dead ends.
  for (let i = 0; i < N; i++) {
    if (degree[i]! > 1) continue;
    // Find the closest waypoint not already connected to i.
    let bestJ = -1, bestDist = Infinity;
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const key1 = `${Math.min(i,j)}_${Math.max(i,j)}`;
      const key2 = `${i}_${j}`;
      if (usedPairs.has(key1) || usedPairs.has(key2)) continue;
      const d = cubeLen(waypoints[i]!, waypoints[j]!);
      if (d < bestDist) { bestDist = d; bestJ = j; }
    }
    if (bestJ < 0) continue;
    const a = Math.min(i, bestJ), b = Math.max(i, bestJ);
    const key = `${a}_${b}`;
    if (!usedPairs.has(key)) {
      usedPairs.add(key);
      mstEdges.push({ a, b, dist: bestDist });
      degree[a]!++; degree[b]!++;
    }
  }

  const mstSet     = new Set(mstEdges.map(e => `${e.a}_${e.b}`));
  const maxExtra   = Math.floor(N * 0.7);
  const maxExtraDist = Math.floor(worldRadius * 0.55);
  const extraEdges: Edge[] = [];
  for (const edge of allEdges) {
    if (extraEdges.length >= maxExtra) break;
    const key = `${Math.min(edge.a,edge.b)}_${Math.max(edge.a,edge.b)}`;
    if (mstSet.has(`${edge.a}_${edge.b}`) || usedPairs.has(key)) continue;
    if (edge.dist > maxExtraDist) break;
    if (rng() < 0.55) { extraEdges.push(edge); usedPairs.add(key); }
  }

  const corridorEdges = [...mstEdges, ...extraEdges];

  // ── Step 4: Trace each edge as a corridor ─────────────────────────────────
  const spineHexMap = new Map<string, string[]>();
  const corridors: WindCorridor[] = [];

  for (const edge of corridorEdges) {
    const from = waypoints[edge.a]!;
    const to   = waypoints[edge.b]!;

    const spine = rng() < 0.5
      ? traceCorridorEdge(from, to, worldRadius, ox, oy)
      : traceCorridorEdge(to, from, worldRadius, ox, oy).reverse();

    if (spine.length < 4) continue;

    const corridorId = `corridor_${corridors.length}`;
    const speed      = 1 + (Math.floor(rng() * 5 + 0.5) % 3);
    const color      = CORRIDOR_COLORS[colorIdx++ % CORRIDOR_COLORS.length]!;

    for (const h of spine) {
      const id   = hexId(h);
      const list = spineHexMap.get(id) ?? [];
      if (!list.includes(corridorId)) list.push(corridorId);
      spineHexMap.set(id, list);
    }

    // Force both waypoint endpoints into the map so they register as junctions
    for (const waypt of [from, to]) {
      const wId   = hexId(waypt);
      const wList = spineHexMap.get(wId) ?? [];
      if (!wList.includes(corridorId)) wList.push(corridorId);
      spineHexMap.set(wId, wList);
    }

    corridors.push({ id: corridorId, name: pickName(), spine, bandHexes: expandBand(spine, 1), speed, color });
  }

  // ── Step 5: Junction detection ─────────────────────────────────────────────
  const junctions: WindJunction[]  = [];
  const processedJunctionHexes     = new Set<string>();

  for (const [hId, cIds] of spineHexMap) {
    if (cIds.length < 2)                 continue;
    if (processedJunctionHexes.has(hId)) continue;
    processedJunctionHexes.add(hId);

    const coord = parseHexId(hId);
    if (!coord) continue;

    const tooClose = junctions.some(j =>
      Math.max(
        Math.abs(j.hex.q - coord.q),
        Math.abs(j.hex.r - coord.r),
        Math.abs((-j.hex.q - j.hex.r) - (-coord.q - coord.r)),
      ) <= 2,
    );
    if (tooClose) continue;

    const uniqueCids = [...new Set(cIds)];
    const spineIndices: Record<string, number> = {};
    for (const cId of uniqueCids) {
      const corr = corridors.find(c => c.id === cId);
      if (!corr) continue;
      const idx = corr.spine.findIndex(h => hexId(h) === hId);
      if (idx >= 0) spineIndices[cId] = idx;
    }

    junctions.push({
      id: `junction_${junctions.length}`,
      hex: coord,
      corridorIds: uniqueCids,
      spineIndices,
    });
  }

  return { corridors, junctions };
}
