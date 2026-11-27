import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gameAudio } from "../audio/sound";
import { getMapTheme, type CharacterId, type MapId } from "../catalog";
import { stepSimulation } from "../sim/engine";
import type { GameOverReason, GamePhase, GameState } from "../sim/types";
import { EntitiesMesh } from "./EntitiesMesh";
import { PlayerMesh } from "./PlayerMesh";
import { createVoxelTextures } from "./textures";
import { WorldScenery } from "./WorldScenery";

export interface HudSnapshot {
  phase: GamePhase;
  reason: GameOverReason;
  elapsed: number;
  distance: number;
  difficultyTier: number;
  coinFlashActive: boolean;
}

interface GameSceneProps {
  stateRef: React.MutableRefObject<GameState>;
  character: CharacterId;
  mapId: MapId;
  isMobile: boolean;
  onHudSync: (snap: HudSnapshot) => void;
  onSceneReady: () => void;
  renderStatsRef?: React.MutableRefObject<{ calls: number; triangles: number; geometries: number; dpr: number }>;
}

const DESKTOP_DPR_TIERS = [1.25, 1.0, 0.85, 0.72] as const;
const MOBILE_DPR_TIERS = [0.85, 0.72, 0.62] as const;

function SceneContent({
  stateRef,
  character,
  mapId,
  isMobile,
  onHudSync,
  onSceneReady,
  renderStatsRef,
}: GameSceneProps) {
  const theme = useMemo(() => getMapTheme(mapId), [mapId]);
  const textures = useMemo(() => createVoxelTextures(mapId), [mapId]);
  const readySentRef = useRef(false);
  const hudThrottleRef = useRef(0);
  const lastPhaseRef = useRef<GamePhase>(stateRef.current.phase);
  const dprTierRef = useRef(0);
  const perfWindowRef = useRef({ frames: 0, totalMs: 0, goodWindows: 0 });

  useEffect(() => {
    return () => textures.dispose();
  }, [textures]);

  useFrame(({ camera, gl }, rawDelta) => {
    if (!readySentRef.current) {
      readySentRef.current = true;
      onSceneReady();
    }

    // Adaptive resolution scaling: drops DPR smoothly if frame times exceed budget
    const dtMs = rawDelta * 1000;
    if (!document.hidden && dtMs > 0 && dtMs < 250) {
      const perf = perfWindowRef.current;
      perf.frames += 1;
      perf.totalMs += dtMs;
      if (perf.totalMs >= 1500 && perf.frames >= 10) {
        const avgMs = perf.totalMs / perf.frames;
        const tiers = isMobile ? MOBILE_DPR_TIERS : DESKTOP_DPR_TIERS;
        const deviceCap = Math.min(window.devicePixelRatio || 1, tiers[0]);
        if (avgMs > 22 && dprTierRef.current < tiers.length - 1) {
          dprTierRef.current += 1;
          perf.goodWindows = 0;
          gl.setPixelRatio(Math.min(deviceCap, tiers[dprTierRef.current] ?? 0.72));
        } else if (avgMs < 14 && dprTierRef.current > 0) {
          perf.goodWindows += 1;
          if (perf.goodWindows >= 2) {
            dprTierRef.current -= 1;
            perf.goodWindows = 0;
            gl.setPixelRatio(Math.min(deviceCap, tiers[dprTierRef.current] ?? 1));
          }
        } else {
          perf.goodWindows = 0;
        }
        perf.frames = 0;
        perf.totalMs = 0;
      }
    }

    if (renderStatsRef) {
      renderStatsRef.current = {
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        dpr: Number(gl.getPixelRatio().toFixed(2)),
      };
    }

    const state = stateRef.current;
    const events = stepSimulation(state, rawDelta);
    for (const ev of events) {
      gameAudio.play(ev);
    }

    // Câmera 2.5D em 3a pessoa atrás do personagem com leve acompanhamento e tremor no impacto
    const shakeAmt = state.shakeTimer > 0 ? state.shakeTimer * 0.45 : 0;
    const sx = shakeAmt > 0 ? Math.sin(state.shakeTimer * 65) * shakeAmt : 0;
    const sy = shakeAmt > 0 ? Math.cos(state.shakeTimer * 52) * shakeAmt * 0.6 : 0;

    const targetCamX = state.laneX * 0.58 + sx;
    const targetCamY = 4.65 + state.playerY * 0.65 + sy;
    camera.position.x += (targetCamX - camera.position.x) * 0.16;
    camera.position.y += (targetCamY - camera.position.y) * 0.16;
    camera.position.z = 7.4;
    camera.lookAt(state.laneX * 0.42, 1.45 + state.playerY * 0.45, -14);

    hudThrottleRef.current += rawDelta;
    const phaseChanged = state.phase !== lastPhaseRef.current;
    const hudInterval = isMobile ? 0.12 : 0.1;
    if (phaseChanged || hudThrottleRef.current >= hudInterval) {
      hudThrottleRef.current = 0;
      lastPhaseRef.current = state.phase;
      onHudSync({
        phase: state.phase,
        reason: state.reason,
        elapsed: state.elapsed,
        distance: state.distance,
        difficultyTier: state.difficultyTier,
        coinFlashActive: state.coinFlashTimer > 0,
      });
    }
  });

  return (
    <>
      <color attach="background" args={[theme.skyColor]} />
      <fog attach="fog" args={[theme.fogColor, isMobile ? 18 : 24, isMobile ? 62 : 78]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight args={[theme.hemiSky, theme.hemiGround, theme.hemiIntensity]} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={theme.sunIntensity}
        color={theme.sunColor}
      />

      <WorldScenery stateRef={stateRef} textures={textures} theme={theme} isMobile={isMobile} />
      <EntitiesMesh stateRef={stateRef} textures={textures} theme={theme} />
      <PlayerMesh stateRef={stateRef} character={character} />
    </>
  );
}

export function GameScene(props: GameSceneProps) {
  const { isMobile } = props;
  return (
    <Canvas
      shadows={false}
      dpr={isMobile ? 0.85 : [0.85, 1.25]}
      camera={{ position: [0, 4.65, 7.4], fov: isMobile ? 62 : 56, near: 0.2, far: isMobile ? 80 : 95 }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false, depth: true }}
      className="h-full w-full"
    >
      <SceneContent {...props} />
    </Canvas>
  );
}