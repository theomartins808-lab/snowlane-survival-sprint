import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MapThemeDef } from "../catalog";
import { SIM_CONFIG, type GameState } from "../sim/types";
import type { VoxelTextures } from "./textures";

const CHUNK_LEN = 24;
const CHUNK_COUNT = 6;
const TOTAL_SPAN = CHUNK_LEN * CHUNK_COUNT;
const DESKTOP_PARTICLES = 240;
const MOBILE_PARTICLES = 85;

interface WorldSceneryProps {
  stateRef: React.MutableRefObject<GameState>;
  textures: VoxelTextures;
  theme: MapThemeDef;
  isMobile: boolean;
}

function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.55, 1.1, 0.55]} />
        <meshStandardMaterial color="#6b4226" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[2.1, 1.1, 2.1]} />
        <meshStandardMaterial color="#1f6339" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.18, 0]}>
        <boxGeometry args={[2.14, 0.16, 2.14]} />
        <meshStandardMaterial color="#eef6ff" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.75, 0]} castShadow>
        <boxGeometry args={[1.5, 1.0, 1.5]} />
        <meshStandardMaterial color="#267343" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.28, 0]}>
        <boxGeometry args={[1.54, 0.16, 1.54]} />
        <meshStandardMaterial color="#eef6ff" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[0.85, 0.85, 0.85]} />
        <meshStandardMaterial color="#2e854e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.26, 0]}>
        <boxGeometry args={[0.88, 0.16, 0.88]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Snowman({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <meshStandardMaterial color="#eef6ff" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.32, 0]} castShadow>
        <boxGeometry args={[0.74, 0.72, 0.74]} />
        <meshStandardMaterial color="#f5faff" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.92, 0]} castShadow>
        <boxGeometry args={[0.52, 0.52, 0.52]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* Cachecol vermelho */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[0.62, 0.14, 0.62]} />
        <meshStandardMaterial color="#d92b2b" roughness={0.7} />
      </mesh>
      {/* Nariz de cenoura */}
      <mesh position={[0, 1.92, 0.34]}>
        <boxGeometry args={[0.12, 0.12, 0.28]} />
        <meshStandardMaterial color="#ff7a1a" roughness={0.6} />
      </mesh>
      {/* Cartola */}
      <mesh position={[0, 2.24, 0]}>
        <boxGeometry args={[0.64, 0.1, 0.64]} />
        <meshStandardMaterial color="#1f2430" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.48, 0]}>
        <boxGeometry args={[0.42, 0.4, 0.42]} />
        <meshStandardMaterial color="#1f2430" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PresentBox({
  position,
  color,
  ribbon,
}: {
  position: [number, number, number];
  color: string;
  ribbon: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.84, 0.84, 0.18]} />
        <meshStandardMaterial color={ribbon} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.18, 0.84, 0.84]} />
        <meshStandardMaterial color={ribbon} roughness={0.45} />
      </mesh>
    </group>
  );
}

function StreetLamp({ position, side }: { position: [number, number, number]; side: -1 | 1 }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[0.24, 4.2, 0.24]} />
        <meshStandardMaterial color="#273042" roughness={0.7} />
      </mesh>
      <mesh position={[-side * 0.55, 4.05, 0]}>
        <boxGeometry args={[1.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#273042" roughness={0.7} />
      </mesh>
      <mesh position={[-side * 1.0, 3.82, 0]}>
        <boxGeometry args={[0.38, 0.42, 0.38]} />
        <meshStandardMaterial color="#fff1b8" emissive="#ffcb5c" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

function Cactus({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.62, 3.0, 0.62]} />
        <meshStandardMaterial color="#3b8c47" roughness={0.85} />
      </mesh>
      <mesh position={[-0.65, 1.85, 0]} castShadow>
        <boxGeometry args={[0.7, 0.45, 0.48]} />
        <meshStandardMaterial color="#3b8c47" roughness={0.85} />
      </mesh>
      <mesh position={[-0.9, 2.35, 0]} castShadow>
        <boxGeometry args={[0.45, 0.9, 0.48]} />
        <meshStandardMaterial color="#469e53" roughness={0.85} />
      </mesh>
      <mesh position={[0.65, 1.4, 0]} castShadow>
        <boxGeometry args={[0.65, 0.45, 0.48]} />
        <meshStandardMaterial color="#3b8c47" roughness={0.85} />
      </mesh>
      <mesh position={[0.88, 1.9, 0]} castShadow>
        <boxGeometry args={[0.45, 0.9, 0.48]} />
        <meshStandardMaterial color="#469e53" roughness={0.85} />
      </mesh>
    </group>
  );
}

function DesertTorch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.52, 3.2, 0.52]} />
        <meshStandardMaterial color="#c99757" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.42, 0]}>
        <boxGeometry args={[0.42, 0.44, 0.42]} />
        <meshStandardMaterial color="#ff922b" emissive="#ff6b00" emissiveIntensity={1.9} />
      </mesh>
    </group>
  );
}

function Pyramid({ position, size = 10 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3, 4].map((step) => {
        const w = size * (1 - step * 0.18);
        return (
          <mesh key={step} position={[0, step * 1.9 + 0.95, 0]}>
            <boxGeometry args={[w, 1.9, w]} />
            <meshStandardMaterial color={step % 2 === 0 ? "#d9a659" : "#cc9547"} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function JungleTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.72, 4.4, 0.72]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[3.1, 1.2, 3.1]} />
        <meshStandardMaterial color="#1b7a3d" roughness={0.85} />
      </mesh>
      <mesh position={[0.4, 5.4, -0.3]} castShadow>
        <boxGeometry args={[2.2, 1.0, 2.2]} />
        <meshStandardMaterial color="#2b9e4b" roughness={0.8} />
      </mesh>
      <mesh position={[-1.2, 3.4, 0.8]}>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshStandardMaterial color="#37b24d" roughness={0.8} />
      </mesh>
    </group>
  );
}

function JungleTotem({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.85, 3.4, 0.85]} />
        <meshStandardMaterial color="#4f5e52" roughness={0.9} />
      </mesh>
      <mesh position={[-0.18, 2.5, 0.44]}>
        <boxGeometry args={[0.18, 0.18, 0.06]} />
        <meshStandardMaterial color="#96f2d7" emissive="#20c997" emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0.18, 2.5, 0.44]}>
        <boxGeometry args={[0.18, 0.18, 0.06]} />
        <meshStandardMaterial color="#96f2d7" emissive="#20c997" emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

function TrackChunk({
  index,
  textures,
  theme,
  chunkRef,
}: {
  index: number;
  textures: VoxelTextures;
  theme: MapThemeDef;
  chunkRef: (el: THREE.Group | null) => void;
}) {
  const buildingH1 = 10 + (index % 3) * 3.5;
  const buildingH2 = 12 + ((index + 1) % 3) * 3;

  return (
    <group ref={chunkRef} position={[0, 0, -index * CHUNK_LEN]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[9.4, CHUNK_LEN]} />
        <meshStandardMaterial map={textures.trackBed} roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13.7, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, CHUNK_LEN]} />
        <meshStandardMaterial map={textures.sideGround} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.7, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, CHUNK_LEN]} />
        <meshStandardMaterial map={textures.sideGround} roughness={0.85} />
      </mesh>

      {SIM_CONFIG.LANES.map((lane) => {
        const lx = lane * SIM_CONFIG.LANE_WIDTH;
        return (
          <group key={lane} position={[lx, 0, 0]}>
            <mesh position={[-0.68, 0.06, 0]}>
              <boxGeometry args={[0.12, 0.08, CHUNK_LEN]} />
              <meshStandardMaterial color={theme.railColor} metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0.68, 0.06, 0]}>
              <boxGeometry args={[0.12, 0.08, CHUNK_LEN]} />
              <meshStandardMaterial color={theme.railColor} metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {theme.id === "natal" && (
        <>
          <PineTree position={[-7.2, 0, -6]} scale={1.05} />
          <PineTree position={[7.4, 0, -10]} scale={1.12} />
          <PineTree position={[-8.8, 0, 5]} scale={0.92} />
          <PineTree position={[8.2, 0, 4]} scale={0.98} />
          <StreetLamp position={[-5.35, 0, 0]} side={-1} />
          <StreetLamp position={[5.35, 0, -12]} side={1} />
          {index % 2 === 0 ? (
            <>
              <Snowman position={[-6.4, 0, -1]} />
              <PresentBox position={[6.1, 0, -2]} color="#e03131" ribbon="#ffd43b" />
              <PresentBox position={[7.0, 0, -1.2]} color="#2f9e44" ribbon="#ffffff" />
            </>
          ) : (
            <>
              <Snowman position={[6.5, 0, 2]} />
              <PresentBox position={[-6.0, 0, 3]} color="#1c7ed6" ribbon="#ffd43b" />
              <PresentBox position={[-6.9, 0, 2.2]} color="#e03131" ribbon="#ffffff" />
            </>
          )}
          <group position={[-15.5, 0, -3]}>
            <mesh position={[0, buildingH1 / 2, 0]}>
              <boxGeometry args={[6.5, buildingH1, 8.5]} />
              <meshStandardMaterial map={textures.buildingFacade} roughness={0.85} />
            </mesh>
            <mesh position={[0, buildingH1 + 0.25, 0]}>
              <boxGeometry args={[6.7, 0.5, 8.7]} />
              <meshStandardMaterial color="#e6f0ff" roughness={0.6} />
            </mesh>
          </group>
          <group position={[15.8, 0, -5]}>
            <mesh position={[0, buildingH2 / 2, 0]}>
              <boxGeometry args={[6.8, buildingH2, 9.0]} />
              <meshStandardMaterial map={textures.buildingFacade} roughness={0.85} />
            </mesh>
            <mesh position={[0, buildingH2 + 0.25, 0]}>
              <boxGeometry args={[7.0, 0.5, 9.2]} />
              <meshStandardMaterial color="#e6f0ff" roughness={0.6} />
            </mesh>
          </group>
        </>
      )}

      {theme.id === "deserto" && (
        <>
          <Cactus position={[-7.1, 0, -5]} scale={1.1} />
          <Cactus position={[7.3, 0, -9]} scale={0.95} />
          <Cactus position={[-8.5, 0, 4]} scale={0.85} />
          <Cactus position={[8.0, 0, 5]} scale={1.05} />
          <DesertTorch position={[-5.4, 0, 0]} />
          <DesertTorch position={[5.4, 0, -12]} />
          <Pyramid position={[-16.5, 0, -4]} size={10 + (index % 2) * 2.5} />
          <Pyramid position={[16.8, 0, -7]} size={11 + ((index + 1) % 2) * 2} />
        </>
      )}

      {theme.id === "selva" && (
        <>
          <JungleTree position={[-7.5, 0, -6]} scale={1.08} />
          <JungleTree position={[7.6, 0, -10]} scale={1.15} />
          <JungleTree position={[-8.6, 0, 5]} scale={0.94} />
          <JungleTree position={[8.4, 0, 4]} scale={1.0} />
          <JungleTotem position={[-5.5, 0, -1]} />
          <JungleTotem position={[5.5, 0, -12]} />
          <group position={[-15.5, 0, -3]}>
            <mesh position={[0, buildingH1 * 0.35, 0]}>
              <boxGeometry args={[6.8, buildingH1 * 0.7, 8.2]} />
              <meshStandardMaterial map={textures.buildingFacade} roughness={0.9} />
            </mesh>
            <mesh position={[0, buildingH1 * 0.7 + 0.3, 0]}>
              <boxGeometry args={[7.1, 0.6, 8.5]} />
              <meshStandardMaterial color="#2f9e44" roughness={0.85} />
            </mesh>
          </group>
          <group position={[15.8, 0, -5]}>
            <mesh position={[0, buildingH2 * 0.35, 0]}>
              <boxGeometry args={[7.0, buildingH2 * 0.7, 8.6]} />
              <meshStandardMaterial map={textures.buildingFacade} roughness={0.9} />
            </mesh>
            <mesh position={[0, buildingH2 * 0.7 + 0.3, 0]}>
              <boxGeometry args={[7.3, 0.6, 8.9]} />
              <meshStandardMaterial color="#2b8a3e" roughness={0.85} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}

export function WorldScenery({ stateRef, textures, theme, isMobile }: WorldSceneryProps) {
  const chunkRefs = useRef<(THREE.Group | null)[]>([]);
  const particleRef = useRef<THREE.Points>(null);
  const particleCount = isMobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
  const activeChunks = isMobile ? 4 : CHUNK_COUNT;
  const activeSpan = CHUNK_LEN * activeChunks;

  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const seed = (i + 1) * 9301;
      arr[i * 3] = (((seed * 17) % 1000) / 1000 - 0.5) * 32;
      arr[i * 3 + 1] = (((seed * 29) % 1000) / 1000) * 16 + 0.5;
      arr[i * 3 + 2] = -(((seed * 43) % 1000) / 1000) * 58 + 10;
    }
    return arr;
  }, [particleCount]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const scroll = stateRef.current.worldScroll;

    for (let i = 0; i < activeChunks; i++) {
      const grp = chunkRefs.current[i];
      if (!grp) continue;
      const base = -i * CHUNK_LEN;
      const shifted = ((base + scroll) % activeSpan + activeSpan) % activeSpan;
      grp.position.z = shifted > CHUNK_LEN ? shifted - activeSpan : shifted;
    }

    const pts = particleRef.current;
    if (pts) {
      const posAttr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const forwardWind = stateRef.current.phase === "playing" ? stateRef.current.speed * 0.45 : 3;
      const fallSpeed = theme.id === "natal" ? 2.6 : theme.id === "deserto" ? 0.55 : -0.45;
      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;
        arr[iy] = (arr[iy] ?? 0) - dt * (fallSpeed + (i % 5) * 0.18);
        arr[ix] = (arr[ix] ?? 0) + Math.sin(scroll * 0.25 + i) * dt * 0.8;
        arr[iz] = (arr[iz] ?? 0) + dt * forwardWind;
        if ((arr[iy] ?? 0) < 0.2) arr[iy] = 16;
        if ((arr[iy] ?? 0) > 16.5) arr[iy] = 0.6;
        if ((arr[iz] ?? 0) > 12) arr[iz] = -48;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {Array.from({ length: activeChunks }).map((_, i) => (
        <TrackChunk
          key={i}
          index={i}
          textures={textures}
          theme={theme}
          chunkRef={(el) => {
            chunkRefs.current[i] = el;
          }}
        />
      ))}

      <points key={particleCount} ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={theme.particleColor} size={0.26} sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  );
}