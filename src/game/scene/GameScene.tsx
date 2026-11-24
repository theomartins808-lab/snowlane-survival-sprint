import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { gameAudio } from "../audio/sound";
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
  onHudSync: (snap: HudSnapshot) => void;
  onSceneReady: () => void;
}

function SceneContent({ stateRef, onHudSync, onSceneReady }: GameSceneProps) {
  const textures = useMemo(() => createVoxelTextures(), []);
  const readySentRef = useRef(false);
  const hudThrottleRef = useRef(0);
  const lastPhaseRef = useRef<GamePhase>(stateRef.current.phase);

  useEffect(() => {
    return () => textures.dispose();
  }, [textures]);

  useFrame(({ camera }, rawDelta) => {
    if (!readySentRef.current) {
      readySentRef.current = true;
      onSceneReady();
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
    const targetCamY = 4.65 + state.playerY * 0.28 + sy;
    camera.position.x += (targetCamX - camera.position.x) * 0.16;
    camera.position.y += (targetCamY - camera.position.y) * 0.16;
    camera.position.z = 7.4;
    camera.lookAt(state.laneX * 0.42, 1.45 + state.playerY * 0.15, -14);

    hudThrottleRef.current += rawDelta;
    const phaseChanged = state.phase !== lastPhaseRef.current;
    if (phaseChanged || hudThrottleRef.current >= 0.08) {
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
      {/* Céu azul escuro anoitecendo + névoa de inverno */}
      <color attach="background" args={["#0f1c3d"]} />
      <fog attach="fog" args={["#0f1c3d", 28, 98]} />

      {/* IBL local sem CDN */}
      <Environment resolution={128}>
        <Lightformer intensity={1.8} color="#9ec5ff" position={[0, 8, 2]} scale={[14, 14, 1]} />
        <Lightformer intensity={1.2} color="#ffd9a0" position={[6, 4, -8]} scale={[8, 6, 1]} />
        <Lightformer intensity={0.9} color="#6b8fd4" position={[-8, 3, -4]} scale={[10, 6, 1]} />
      </Environment>

      <hemisphereLight args={["#9bc2ff", "#253459", 0.95]} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.55}
        color="#fff3dc"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={1}
        shadow-camera-far={75}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      <WorldScenery stateRef={stateRef} textures={textures} />
      <EntitiesMesh stateRef={stateRef} textures={textures} />
      <PlayerMesh stateRef={stateRef} />
    </>
  );
}

export function GameScene(props: GameSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 4.65, 7.4], fov: 56, near: 0.2, far: 140 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="h-full w-full"
    >
      <SceneContent {...props} />
    </Canvas>
  );
}