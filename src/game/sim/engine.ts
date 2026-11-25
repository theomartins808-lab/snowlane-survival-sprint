import { spawnCoinPattern, spawnObstacleWave } from "./spawner";
import {
  SIM_CONFIG,
  type GameEvent,
  type GameState,
  type InputAction,
  type LaneIndex,
} from "./types";

export function createInitialState(seed = 20261225): GameState {
  return {
    phase: "menu",
    reason: null,
    elapsed: 0,
    distance: 0,
    speed: SIM_CONFIG.BASE_SPEED,
    difficultyTier: 0,
    targetLane: 0,
    laneX: 0,
    playerY: 0,
    playerVy: 0,
    isGrounded: true,
    duckTimer: 0,
    runCycle: 0,
    worldScroll: 0,
    nextObstacleZ: -32,
    nextCoinZ: -22,
    nextEntityId: 1,
    obstacles: [],
    coins: [],
    rngState: seed >>> 0,
    shakeTimer: 0,
    coinFlashTimer: 0,
  };
}

export function startNewRun(state: GameState, seed?: number): void {
  const fresh = createInitialState(seed ?? ((Date.now() ^ 0x9e3779b9) >>> 0));
  Object.assign(state, fresh);
  state.phase = "playing";
  // Pre-populate horizon so the first frame already looks rich
  populateHorizon(state);
}

export function applyInput(state: GameState, action: InputAction): GameEvent | null {
  if (state.phase !== "playing") return null;

  if (action === "left") {
    if (state.targetLane > -1) {
      state.targetLane = (state.targetLane - 1) as LaneIndex;
      return "lane";
    }
    return null;
  }
  if (action === "right") {
    if (state.targetLane < 1) {
      state.targetLane = (state.targetLane + 1) as LaneIndex;
      return "lane";
    }
    return null;
  }
  if (action === "jump") {
    if (state.isGrounded) {
      state.playerVy = SIM_CONFIG.JUMP_VELOCITY;
      state.isGrounded = false;
      state.duckTimer = 0;
      return "jump";
    }
    return null;
  }
  if (action === "duck") {
    if (!state.isGrounded) {
      state.playerVy = Math.min(state.playerVy, SIM_CONFIG.FAST_FALL_VELOCITY);
    }
    state.duckTimer = SIM_CONFIG.DUCK_DURATION;
    return "duck";
  }
  return null;
}

export function populateHorizon(state: GameState): void {
  while (state.nextObstacleZ > SIM_CONFIG.SPAWN_HORIZON_Z) {
    spawnObstacleWave(state, state.nextObstacleZ);
    const gap = Math.max(15, 25 - state.difficultyTier * 1.4);
    state.nextObstacleZ -= gap;
  }
  while (state.nextCoinZ > SIM_CONFIG.SPAWN_HORIZON_Z) {
    spawnCoinPattern(state, state.nextCoinZ);
    // Every 15 seconds more coins appear and closer together
    const coinGap = Math.max(8.5, 19 - state.difficultyTier * 2.2);
    state.nextCoinZ -= coinGap;
  }
}

export function stepSimulation(state: GameState, rawDt: number): GameEvent[] {
  const dt = Math.min(Math.max(rawDt, 0), 0.05);
  const events: GameEvent[] = [];

  if (state.shakeTimer > 0) state.shakeTimer = Math.max(0, state.shakeTimer - dt);
  if (state.coinFlashTimer > 0) state.coinFlashTimer = Math.max(0, state.coinFlashTimer - dt);

  if (state.phase === "menu") {
    state.runCycle += dt * 7;
    state.worldScroll += dt * 5;
    return events;
  }

  if (state.phase !== "playing") return events;

  state.elapsed += dt;
  state.speed = Math.min(
    SIM_CONFIG.MAX_SPEED,
    SIM_CONFIG.BASE_SPEED + state.elapsed * SIM_CONFIG.SPEED_ACCEL,
  );
  const dz = state.speed * dt;
  state.distance += dz;
  state.worldScroll += dz;
  state.runCycle += dt * (state.speed * 0.72);

  const nextTier = Math.floor(state.elapsed / SIM_CONFIG.DIFFICULTY_STEP_SEC);
  if (nextTier > state.difficultyTier) {
    state.difficultyTier = nextTier;
    events.push("tier_up");
  }

  // Smooth horizontal lane movement
  const targetX = state.targetLane * SIM_CONFIG.LANE_WIDTH;
  const blend = 1 - Math.exp(-SIM_CONFIG.LANE_DAMP * dt);
  state.laneX += (targetX - state.laneX) * blend;

  // Vertical jump & gravity
  const prevY = state.playerY;
  if (!state.isGrounded) {
    state.playerY += state.playerVy * dt;
    state.playerVy -= SIM_CONFIG.GRAVITY * dt;
  }

  if (state.duckTimer > 0) {
    state.duckTimer = Math.max(0, state.duckTimer - dt);
  }

  // Advance entities toward player (+Z)
  state.nextObstacleZ += dz;
  state.nextCoinZ += dz;
  for (const obs of state.obstacles) obs.z += dz;
  for (const coin of state.coins) coin.z += dz;

  // Despawn passed entities
  state.obstacles = state.obstacles.filter((o) => o.z - o.length * 0.5 < SIM_CONFIG.DESPAWN_Z);
  state.coins = state.coins.filter((c) => c.z < SIM_CONFIG.DESPAWN_Z);

  populateHorizon(state);

  // Resolve obstacle support surfaces (landing / running on top of trains & obstacles) vs side/front crash
  const playerHeight =
    state.duckTimer > 0 && state.isGrounded
      ? SIM_CONFIG.PLAYER_DUCK_HEIGHT
      : SIM_CONFIG.PLAYER_STAND_HEIGHT;

  let supportY = 0;
  for (const obs of state.obstacles) {
    const obsX = obs.lane * SIM_CONFIG.LANE_WIDTH;
    if (Math.abs(obs.z) > obs.length * 0.5 + SIM_CONFIG.PLAYER_HALF_DEPTH * 0.85) continue;
    if (Math.abs(obsX - state.laneX) > obs.width * 0.5 + SIM_CONFIG.PLAYER_HALF_WIDTH * 0.75) {
      continue;
    }

    // Check if the player is above or landing onto the top surface of this obstacle
    const canLandOnTop =
      prevY >= obs.maxY - SIM_CONFIG.LANDING_TOLERANCE &&
      state.playerVy <= 0.5 &&
      state.playerY <= obs.maxY + 0.12;

    if (canLandOnTop) {
      if (obs.maxY > supportY) supportY = obs.maxY;
      continue;
    }

    // Already high above the obstacle (flying over it)
    if (state.playerY >= obs.maxY - 0.08) {
      continue;
    }

    // Otherwise check body collision (front/side crash or hitting overhead beam while standing)
    const playerMinY = state.playerY;
    const playerMaxY = playerMinY + playerHeight;
    if (obs.maxY > playerMinY + 0.08 && obs.minY < playerMaxY - 0.08) {
      state.phase = "gameover";
      state.reason = "crash";
      state.shakeTimer = 0.55;
      events.push("crash");
      return events;
    }
  }

  // Snap to support surface (ground y=0 or obstacle roof) or start falling when stepping off
  if (state.playerY <= supportY && state.playerVy <= 0) {
    state.playerY = supportY;
    state.playerVy = 0;
    state.isGrounded = true;
  } else if (state.playerY > supportY) {
    state.isGrounded = false;
  }

  // Check golden coins — touching ANY coin freezes the timer immediately!
  const playerMinY = state.playerY;
  const finalHeight =
    state.duckTimer > 0 && state.isGrounded
      ? SIM_CONFIG.PLAYER_DUCK_HEIGHT
      : SIM_CONFIG.PLAYER_STAND_HEIGHT;
  const playerMaxY = playerMinY + finalHeight;
  for (const coin of state.coins) {
    if (Math.abs(coin.z) > SIM_CONFIG.PLAYER_HALF_DEPTH + SIM_CONFIG.COIN_RADIUS) continue;
    if (Math.abs(coin.x - state.laneX) > SIM_CONFIG.PLAYER_HALF_WIDTH + SIM_CONFIG.COIN_RADIUS) {
      continue;
    }
    if (coin.y + SIM_CONFIG.COIN_RADIUS >= playerMinY && coin.y - SIM_CONFIG.COIN_RADIUS <= playerMaxY) {
      state.phase = "gameover";
      state.reason = "coin";
      state.shakeTimer = 0.7;
      state.coinFlashTimer = 0.65;
      events.push("coin_hit");
      return events;
    }
  }

  return events;
}