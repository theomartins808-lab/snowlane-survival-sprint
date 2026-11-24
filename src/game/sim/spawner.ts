import { SIM_CONFIG, type Coin, type GameState, type LaneIndex, type Obstacle } from "./types";

export function nextRand(state: GameState): number {
  let t = (state.rngState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pickLane(state: GameState): LaneIndex {
  const r = Math.floor(nextRand(state) * 3);
  return r === 0 ? -1 : r === 1 ? 0 : 1;
}

function pickDifferentLane(state: GameState, exclude: LaneIndex): LaneIndex {
  const others = SIM_CONFIG.LANES.filter((l) => l !== exclude);
  const picked = others[Math.floor(nextRand(state) * others.length)];
  return picked ?? 0;
}

function laneHasObstacleNear(state: GameState, lane: LaneIndex, z: number, margin: number): boolean {
  for (const obs of state.obstacles) {
    if (obs.lane !== lane) continue;
    const half = obs.length * 0.5 + margin;
    if (Math.abs(obs.z - z) < half) return true;
  }
  return false;
}

function addCoin(state: GameState, lane: LaneIndex, z: number, y: number): void {
  // Avoid placing a coin inside a solid train body
  for (const obs of state.obstacles) {
    if (
      obs.lane === lane &&
      (obs.kind === "train_red" || obs.kind === "train_brown") &&
      Math.abs(obs.z - z) < obs.length * 0.5 + 0.8
    ) {
      return;
    }
  }
  state.coins.push({
    id: state.nextEntityId++,
    lane,
    x: lane * SIM_CONFIG.LANE_WIDTH,
    y,
    z,
    phase: nextRand(state) * Math.PI * 2,
  });
}

export function spawnObstacleWave(state: GameState, z: number): void {
  const tier = state.difficultyTier;
  const roll = nextRand(state);

  if (roll < 0.46) {
    // Single or double voxel train (always leaves at least 1 lane completely open)
    const lane1 = pickLane(state);
    const kind1 = nextRand(state) < 0.5 ? "train_red" : "train_brown";
    const len1 = 10 + Math.floor(nextRand(state) * 5);
    state.obstacles.push(makeTrain(state, kind1, lane1, z, len1));

    const doubleChance = Math.min(0.65, 0.25 + tier * 0.1);
    if (nextRand(state) < doubleChance) {
      const lane2 = pickDifferentLane(state, lane1);
      const kind2 = kind1 === "train_red" ? "train_brown" : "train_red";
      const len2 = 10 + Math.floor(nextRand(state) * 4);
      state.obstacles.push(makeTrain(state, kind2, lane2, z - 2.5, len2));

      // Bait coins near the train exit in one of the blocked/open lanes, leaving a safe route
      const openLane = SIM_CONFIG.LANES.find((l) => l !== lane1 && l !== lane2) ?? 0;
      if (nextRand(state) < 0.55) {
        // High arc over open lane — stay grounded or duck to dodge! Or low line — jump to dodge!
        const lowLine = nextRand(state) < 0.5;
        for (let i = 0; i < 3; i++) {
          addCoin(state, openLane, z - 1.5 - i * 2.1, lowLine ? 0.85 : 2.35);
        }
      }
    }
  } else if (roll < 0.74) {
    // Jump barrier (1 or 2 lanes)
    const lane1 = pickLane(state);
    state.obstacles.push(makeBarrier(state, "barrier_jump", lane1, z));
    if (nextRand(state) < 0.35 + tier * 0.08) {
      const lane2 = pickDifferentLane(state, lane1);
      state.obstacles.push(makeBarrier(state, "barrier_jump", lane2, z));
    }
  } else {
    // Duck barrier (overhead beam)
    const lane1 = pickLane(state);
    state.obstacles.push(makeBarrier(state, "barrier_duck", lane1, z));
    if (nextRand(state) < 0.3 + tier * 0.08) {
      const lane2 = pickDifferentLane(state, lane1);
      state.obstacles.push(makeBarrier(state, "barrier_duck", lane2, z));
    }
  }
}

export function spawnCoinPattern(state: GameState, z: number): void {
  const tier = state.difficultyTier;
  const roll = nextRand(state);
  const rowCount = Math.min(7, 3 + Math.floor(tier * 0.8));
  const spacing = Math.max(1.75, 2.55 - tier * 0.16);

  // Find lanes free of trains at this z
  const freeLanes = SIM_CONFIG.LANES.filter((l) => !laneHasObstacleNear(state, l, z, 5));
  if (freeLanes.length === 0) return;

  if (roll < 0.42 && freeLanes.length >= 2) {
    // Treacherous 2-lane coin wall — forces quick switch to the remaining safe lane
    const safeLane = freeLanes[Math.floor(nextRand(state) * freeLanes.length)] ?? 0;
    const coinLanes = SIM_CONFIG.LANES.filter((l) => l !== safeLane);
    for (const lane of coinLanes) {
      for (let i = 0; i < rowCount; i++) {
        addCoin(state, lane, z - i * spacing, 0.9);
      }
    }
  } else if (roll < 0.72) {
    // Coin arc pattern: low coins on 1-2 lanes that force a jump or quick sidestep
    const lane = freeLanes[Math.floor(nextRand(state) * freeLanes.length)] ?? 0;
    const arcCount = Math.min(6, 4 + Math.floor(tier / 2));
    for (let i = 0; i < arcCount; i++) {
      const t = arcCount > 1 ? i / (arcCount - 1) : 0.5;
      // Low arc on ground/mid height so jumping over or switching lane dodges it
      const y = 0.85 + Math.sin(t * Math.PI) * 1.15;
      addCoin(state, lane, z - i * spacing, y);
    }
  } else {
    // Slalom bait row switching lanes mid-way
    const laneA = freeLanes[0] ?? -1;
    const laneB = freeLanes[freeLanes.length - 1] ?? 1;
    for (let i = 0; i < rowCount; i++) {
      const lane = i < Math.ceil(rowCount / 2) ? laneA : laneB;
      addCoin(state, lane, z - i * spacing, 0.9);
    }
  }
}

function makeTrain(
  state: GameState,
  kind: "train_red" | "train_brown",
  lane: LaneIndex,
  z: number,
  length: number,
): Obstacle {
  return {
    id: state.nextEntityId++,
    kind,
    lane,
    z,
    length,
    width: 1.95,
    minY: 0,
    maxY: 2.95,
  };
}

function makeBarrier(
  state: GameState,
  kind: "barrier_jump" | "barrier_duck",
  lane: LaneIndex,
  z: number,
): Obstacle {
  return {
    id: state.nextEntityId++,
    kind,
    lane,
    z,
    length: 0.75,
    width: 2.0,
    minY: kind === "barrier_jump" ? 0 : 1.18,
    maxY: kind === "barrier_jump" ? 1.05 : 2.35,
  };
}