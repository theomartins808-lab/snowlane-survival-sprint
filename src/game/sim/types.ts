export type LaneIndex = -1 | 0 | 1;

export type GamePhase = "menu" | "playing" | "paused" | "gameover";

export type GameOverReason = "coin" | "crash" | null;

export type ObstacleKind = "train_red" | "train_brown" | "barrier_jump" | "barrier_duck";

export type InputAction = "left" | "right" | "jump" | "duck";

export type GameEvent = "lane" | "jump" | "duck" | "coin_hit" | "crash" | "tier_up";

export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  lane: LaneIndex;
  z: number;
  length: number;
  width: number;
  minY: number;
  maxY: number;
}

export interface Coin {
  id: number;
  lane: LaneIndex;
  x: number;
  y: number;
  z: number;
  phase: number;
}

export interface GameState {
  phase: GamePhase;
  reason: GameOverReason;
  elapsed: number;
  distance: number;
  speed: number;
  difficultyTier: number;
  targetLane: LaneIndex;
  laneX: number;
  playerY: number;
  playerVy: number;
  isGrounded: boolean;
  duckTimer: number;
  runCycle: number;
  worldScroll: number;
  nextObstacleZ: number;
  nextCoinZ: number;
  nextEntityId: number;
  obstacles: Obstacle[];
  coins: Coin[];
  rngState: number;
  shakeTimer: number;
  coinFlashTimer: number;
}

export const SIM_CONFIG = {
  LANE_WIDTH: 2.6,
  LANES: [-1, 0, 1] as readonly LaneIndex[],
  BASE_SPEED: 15,
  MAX_SPEED: 34,
  SPEED_ACCEL: 0.32,
  LANE_DAMP: 15,
  GRAVITY: 40,
  JUMP_VELOCITY: 15.8,
  FAST_FALL_VELOCITY: -22,
  DUCK_DURATION: 0.65,
  PLAYER_HALF_WIDTH: 0.42,
  PLAYER_HALF_DEPTH: 0.4,
  PLAYER_STAND_HEIGHT: 1.85,
  PLAYER_DUCK_HEIGHT: 0.92,
  COIN_RADIUS: 0.56,
  LANDING_TOLERANCE: 0.52,
  DIFFICULTY_STEP_SEC: 15,
  SPAWN_HORIZON_Z: -115,
  DESPAWN_Z: 14,
} as const;

export function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}