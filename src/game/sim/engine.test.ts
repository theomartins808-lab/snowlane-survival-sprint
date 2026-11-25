import { describe, expect, it } from "vitest";
import { applyInput, createInitialState, startNewRun, stepSimulation } from "./engine";
import { formatTimer, SIM_CONFIG } from "./types";

describe("thzinkkj — simulação Não Pegue a Moeda", () => {
  it("formata o cronômetro no formato MM:SS", () => {
    expect(formatTimer(0)).toBe("00:00");
    expect(formatTimer(7.9)).toBe("00:07");
    expect(formatTimer(65)).toBe("01:05");
  });

  it("para o cronômetro imediatamente e dá Game Over ao pegar 1 moeda", () => {
    const state = createInitialState(42);
    startNewRun(state, 42);
    state.obstacles = [];
    state.coins = [{ id: 99, lane: 0, x: 0, y: 0.9, z: -0.4, phase: 0 }];

    const events = stepSimulation(state, 0.03);
    expect(events).toContain("coin_hit");
    expect(state.phase).toBe("gameover");
    expect(state.reason).toBe("coin");
    const frozenTime = state.elapsed;
    expect(frozenTime).toBeGreaterThan(0);

    // Passos extras não podem avançar o cronômetro após pegar a moeda
    stepSimulation(state, 0.05);
    stepSimulation(state, 0.05);
    expect(state.elapsed).toBe(frozenTime);
  });

  it("dá Game Over por batida ao colidir com trem no mesmo trilho", () => {
    const state = createInitialState(7);
    startNewRun(state, 7);
    state.coins = [];
    state.obstacles = [
      {
        id: 1,
        kind: "train_red",
        lane: 0,
        z: -0.5,
        length: 10,
        width: 1.95,
        minY: 0,
        maxY: 2.95,
      },
    ];

    const events = stepSimulation(state, 0.03);
    expect(events).toContain("crash");
    expect(state.phase).toBe("gameover");
    expect(state.reason).toBe("crash");
  });

  it("permite pular barreira baixa e abaixar sob barreira alta", () => {
    // 1) Pular barreira baixa
    const jumpState = createInitialState(11);
    startNewRun(jumpState, 11);
    jumpState.coins = [];
    jumpState.obstacles = [
      {
        id: 10,
        kind: "barrier_jump",
        lane: 0,
        z: -4.2,
        length: 0.75,
        width: 2.0,
        minY: 0,
        maxY: 1.05,
      },
    ];
    expect(applyInput(jumpState, "jump")).toBe("jump");
    for (let i = 0; i < 20; i++) stepSimulation(jumpState, 0.025);
    expect(jumpState.phase).toBe("playing");

    // 2) Abaixar sob barreira alta
    const duckState = createInitialState(12);
    startNewRun(duckState, 12);
    duckState.coins = [];
    duckState.obstacles = [
      {
        id: 11,
        kind: "barrier_duck",
        lane: 0,
        z: -2.0,
        length: 0.75,
        width: 2.0,
        minY: 1.18,
        maxY: 2.35,
      },
    ];
    expect(applyInput(duckState, "duck")).toBe("duck");
    for (let i = 0; i < 12; i++) stepSimulation(duckState, 0.025);
    expect(duckState.phase).toBe("playing");
  });

  it("aumenta velocidade e nível de dificuldade a cada 15 segundos", () => {
    const state = createInitialState(100);
    startNewRun(state, 100);
    const initialSpeed = state.speed;
    let tierUpCount = 0;

    for (let i = 0; i < 31 * 40; i++) {
      state.obstacles = [];
      state.coins = [];
      const ev = stepSimulation(state, 0.025);
      if (ev.includes("tier_up")) tierUpCount++;
    }

    expect(state.difficultyTier).toBe(Math.floor(state.elapsed / SIM_CONFIG.DIFFICULTY_STEP_SEC));
    expect(tierUpCount).toBe(2);
    expect(state.speed).toBeGreaterThan(initialSpeed);
  });

  it("permite pular e pousar em cima de um trem, correr no teto e cair ao sair dele", () => {
    const state = createInitialState(55);
    startNewRun(state, 55);
    state.coins = [];
    state.obstacles = [
      {
        id: 50,
        kind: "train_red",
        lane: 0,
        z: -12,
        length: 12,
        width: 1.95,
        minY: 0,
        maxY: 2.75,
      },
    ];

    expect(applyInput(state, "jump")).toBe("jump");
    let landedOnRoof = false;
    for (let i = 0; i < 60; i++) {
      stepSimulation(state, 1 / 60);
      if (state.isGrounded && Math.abs(state.playerY - 2.75) < 0.01) {
        landedOnRoof = true;
        break;
      }
    }

    expect(state.phase).toBe("playing");
    expect(landedOnRoof).toBe(true);

    // Consegue pular novamente de cima do trem
    expect(applyInput(state, "jump")).toBe("jump");
    stepSimulation(state, 1 / 60);
    expect(state.playerY).toBeGreaterThan(2.75);

    // Ao passar do final do trem, volta para o chão y = 0 sem bater
    for (let i = 0; i < 120; i++) {
      state.coins = [];
      state.obstacles = state.obstacles.filter((o) => o.id === 50);
      stepSimulation(state, 1 / 60);
    }
    expect(state.phase).toBe("playing");
    expect(state.playerY).toBe(0);
    expect(state.isGrounded).toBe(true);
  });

  it("permite pular e pousar em cima de uma barreira baixa sem bater", () => {
    const state = createInitialState(77);
    startNewRun(state, 77);
    state.coins = [];
    state.obstacles = [
      {
        id: 70,
        kind: "barrier_jump",
        lane: 0,
        z: -10.8,
        length: 1.8,
        width: 2.0,
        minY: 0,
        maxY: 1.05,
      },
    ];

    expect(applyInput(state, "jump")).toBe("jump");
    let landedOnBarrier = false;
    for (let i = 0; i < 60; i++) {
      stepSimulation(state, 1 / 60);
      if (state.isGrounded && Math.abs(state.playerY - 1.05) < 0.01) {
        landedOnBarrier = true;
        break;
      }
    }

    expect(state.phase).toBe("playing");
    expect(landedOnBarrier).toBe(true);
  });
});