import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { gameAudio } from "@/game/audio/sound";
import { GameScene, type HudSnapshot } from "@/game/scene/GameScene";
import { applyInput, createInitialState, startNewRun, stepSimulation } from "@/game/sim/engine";
import type { GameState, InputAction } from "@/game/sim/types";
import { loadLocalRecord, saveLocalRecord, type LocalRecord } from "@/game/storage";
import { GameHud } from "@/game/ui/GameHud";
import { LeaderboardModal } from "@/game/ui/LeaderboardModal";
import { Overlays } from "@/game/ui/Overlays";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "thzinkkj — NÃO PEGUE A MOEDA!" },
      {
        name: "description",
        content:
          "Jogue thzinkkj: desvie de todas as moedas douradas nos trilhos de Natal e entre no ranking online de maior tempo!",
      },
      { property: "og:title", content: "thzinkkj — NÃO PEGUE A MOEDA!" },
      {
        property: "og:description",
        content:
          "Jogue thzinkkj: desvie de todas as moedas douradas nos trilhos de Natal e entre no ranking online de maior tempo!",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const stateRef = useRef<GameState>(createInitialState());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const keyFlashTimerRef = useRef<number | null>(null);
  const savedThisRunRef = useRef(false);

  const [sceneReady, setSceneReady] = useState(false);
  const [localRecord, setLocalRecord] = useState<LocalRecord>(() => loadLocalRecord());
  const [isNewBest, setIsNewBest] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [highlightScoreId, setHighlightScoreId] = useState<string | null>(null);
  const [hud, setHud] = useState<HudSnapshot>({
    phase: "menu",
    reason: null,
    elapsed: 0,
    distance: 0,
    difficultyTier: 0,
    coinFlashActive: false,
  });

  const triggerAction = useCallback((action: InputAction) => {
    gameAudio.unlock();
    const ev = applyInput(stateRef.current, action);
    if (ev) gameAudio.play(ev);
    setActiveKey(action);
    if (keyFlashTimerRef.current !== null) window.clearTimeout(keyFlashTimerRef.current);
    keyFlashTimerRef.current = window.setTimeout(() => setActiveKey(null), 160);
  }, []);

  const startGame = useCallback(() => {
    gameAudio.unlock();
    savedThisRunRef.current = false;
    setIsNewBest(false);
    setLeaderboardOpen(false);
    startNewRun(stateRef.current);
    setHud({
      phase: "playing",
      reason: null,
      elapsed: 0,
      distance: 0,
      difficultyTier: 0,
      coinFlashActive: false,
    });
  }, []);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "playing") {
      s.phase = "paused";
      setHud((prev) => ({ ...prev, phase: "paused" }));
    } else if (s.phase === "paused") {
      s.phase = "playing";
      setHud((prev) => ({ ...prev, phase: "playing" }));
    }
  }, []);

  const handleHudSync = useCallback((snap: HudSnapshot) => {
    if (snap.phase === "gameover" && !savedThisRunRef.current) {
      savedThisRunRef.current = true;
      const { record, isNewBest: beat } = saveLocalRecord(snap.elapsed, snap.distance);
      setLocalRecord(record);
      setIsNewBest(beat);
    }
    setHud(snap);
  }, []);

  // Keyboard controls: WASD, Arrow keys, Space, Pause (P / Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const code = e.code;
      if (code === "ArrowLeft" || code === "KeyA") {
        e.preventDefault();
        triggerAction("left");
      } else if (code === "ArrowRight" || code === "KeyD") {
        e.preventDefault();
        triggerAction("right");
      } else if (code === "ArrowUp" || code === "KeyW" || code === "Space") {
        e.preventDefault();
        if (stateRef.current.phase === "menu") {
          startGame();
        } else {
          triggerAction("jump");
        }
      } else if (code === "ArrowDown" || code === "KeyS") {
        e.preventDefault();
        triggerAction("duck");
      } else if (code === "Escape" || code === "KeyP") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [startGame, togglePause, triggerAction]);

  // Dev-only debug hooks for automated verification
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w["__game"] = {
      get state() {
        const s = stateRef.current;
        return {
          phase: s.phase,
          reason: s.reason,
          elapsed: Number(s.elapsed.toFixed(2)),
          distance: Math.floor(s.distance),
          lane: s.targetLane,
          speed: Number(s.speed.toFixed(1)),
          difficultyTier: s.difficultyTier,
          coinsCount: s.coins.length,
          obstaclesCount: s.obstacles.length,
        };
      },
      start: startGame,
      action: triggerAction,
      sim: (seconds: number) => {
        const steps = Math.max(1, Math.round(seconds * 60));
        for (let i = 0; i < steps; i++) stepSimulation(stateRef.current, 1 / 60);
        const s = stateRef.current;
        handleHudSync({
          phase: s.phase,
          reason: s.reason,
          elapsed: s.elapsed,
          distance: s.distance,
          difficultyTier: s.difficultyTier,
          coinFlashActive: s.coinFlashTimer > 0,
        });
      },
      audio: () => gameAudio.getMeters(),
    };
    return () => {
      delete w["__game"];
    };
  }, [handleHudSync, startGame, triggerAction]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    const touch = e.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const threshold = 28;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      triggerAction(dx > 0 ? "right" : "left");
    } else {
      triggerAction(dy < 0 ? "jump" : "duck");
    }
  };

  return (
    <main
      data-scene-ready={sceneReady ? "1" : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative h-dvh w-screen overflow-hidden bg-background"
    >
      <GameScene
        stateRef={stateRef}
        onHudSync={handleHudSync}
        onSceneReady={() => setSceneReady(true)}
      />

      <GameHud
        phase={hud.phase}
        reason={hud.reason}
        elapsed={hud.elapsed}
        distance={hud.distance}
        bestTime={localRecord.bestTime}
        coinFlashActive={hud.coinFlashActive}
        activeKey={activeKey}
        onTogglePause={togglePause}
      />

      <Overlays
        phase={hud.phase}
        reason={hud.reason}
        elapsed={hud.elapsed}
        distance={hud.distance}
        isNewBest={isNewBest}
        localRecord={localRecord}
        onStart={startGame}
        onResume={togglePause}
        onRestart={startGame}
        onOpenLeaderboard={(id) => {
          setHighlightScoreId(id ?? null);
          setLeaderboardOpen(true);
        }}
      />

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        localRecord={localRecord}
        highlightId={highlightScoreId}
      />
    </main>
  );
}
