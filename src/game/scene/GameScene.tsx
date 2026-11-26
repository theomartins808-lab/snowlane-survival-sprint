import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
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
  renderStatsRef?: React.MutableRefObject<{ calls: number; triangles: number; geometries: number }>;
}

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

  useEffect(() => {
    return () => textures.dispose();
  }, [textures]);

  useFrame(({ camera, gl }, rawDelta) => {
    if (!readySentRef.current) {
      readySentRef.current = true;
      onSceneReady();
    }
    if (renderStatsRef) {
      renderStatsRef.current = {
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
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
    const hudInterval = isMobile ? 0.12 : 0.08;
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
      <fog attach="fog" args={[theme.fogColor, isMobile ? 18 : 28, isMobile ? 62 : 98]} />

      {isMobile && <ambientLight intensity={0.55} />}
      {/* IBL local sem CDN */}
      {!isMobile && <Environment resolution={isMobile ? 64 : 128}>
        <Lightformer intensity={1.8} color={theme.lightformerTop} position={[0, 8, 2]} scale={[14, 14, 1]} />
        <Lightformer intensity={1.2} color={theme.lightformerWarm} position={[6, 4, -8]} scale={[8, 6, 1]} />
        <Lightformer intensity={0.9} color={theme.lightformerSide} position={[-8, 3, -4]} scale={[10, 6, 1]} />
      </Environment>}

      <hemisphereLight args={[theme.hemiSky, theme.hemiGround, theme.hemiIntensity]} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={theme.sunIntensity}
        color={theme.sunColor}
        castShadow={!isMobile}
        shadow-mapSize={[512, 512]}
        shadow-camera-near={1}
        shadow-camera-far={75}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      <WorldScenery stateRef={stateRef} textures={textures} theme={theme} isMobile={isMobile} />
      <EntitiesMesh stateRef={stateRef} textures={textures} theme={theme} isMobile={isMobile} />
      <PlayerMesh stateRef={stateRef} character={character} isMobile={isMobile} />
    </>
  );
}

export function GameScene(props: GameSceneProps) {
  const { isMobile } = props;
  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? 0.85 : [1, 1.75]}
      camera={{ position: [0, 4.65, 7.4], fov: isMobile ? 62 : 56, near: 0.2, far: isMobile ? 80 : 140 }}
      gl={{ antialias: !isMobile, powerPreference: "high-performance", stencil: false, depth: true }}
      className="h-full w-full"
    >
      <SceneContent {...props} />
    </Canvas>
  );
}