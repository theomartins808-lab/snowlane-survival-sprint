import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIM_CONFIG, type GameState } from "../sim/types";
import type { VoxelTextures } from "./textures";

const CHUNK_LEN = 24;
const CHUNK_COUNT = 6;
const TOTAL_SPAN = CHUNK_LEN * CHUNK_COUNT;
const SNOW_COUNT = 260;

interface WorldSceneryProps {
  stateRef: React.MutableRefObject<GameState>;
  textures: VoxelTextures;
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

function TrackChunk({
  index,
  textures,
  chunkRef,
}: {
  index: number;
  textures: VoxelTextures;
  chunkRef: (el: THREE.Group | null) => void;
}) {
  const buildingH1 = 10 + (index % 3) * 3.5;
  const buildingH2 = 12 + ((index + 1) % 3) * 3;

  return (
    <group ref={chunkRef} position={[0, 0, -index * CHUNK_LEN]}>
      {/* Chão cinza dos 3 trilhos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[9.4, CHUNK_LEN]} />
        <meshStandardMaterial map={textures.trackBed} roughness={0.95} />
      </mesh>

      {/* Laterais de neve */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13.7, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, CHUNK_LEN]} />
        <meshStandardMaterial map={textures.snowGround} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.7, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, CHUNK_LEN]} />
        <meshStandardMaterial map={textures.snowGround} roughness={0.85} />
      </mesh>

      {/* 3 trilhos paralelos metálicos sobre os dormentes marrons */}
      {SIM_CONFIG.LANES.map((lane) => {
        const lx = lane * SIM_CONFIG.LANE_WIDTH;
        return (
          <group key={lane} position={[lx, 0, 0]}>
            <mesh position={[-0.68, 0.06, 0]}>
              <boxGeometry args={[0.12, 0.08, CHUNK_LEN]} />
              <meshStandardMaterial color="#b2becf" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0.68, 0.06, 0]}>
              <boxGeometry args={[0.12, 0.08, CHUNK_LEN]} />
              <meshStandardMaterial color="#b2becf" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Pinheiros com neve nas laterais */}
      <PineTree position={[-7.2, 0, -6]} scale={1.05} />
      <PineTree position={[7.4, 0, -10]} scale={1.12} />
      <PineTree position={[-8.8, 0, 5]} scale={0.92} />
      <PineTree position={[8.2, 0, 4]} scale={0.98} />

      {/* Postes de luz de Natal */}
      <StreetLamp position={[-5.35, 0, 0]} side={-1} />
      <StreetLamp position={[5.35, 0, -12]} side={1} />

      {/* Bonecos de neve e presentes */}
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

      {/* Prédios blocky ao fundo com neve no telhado */}
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
    </group>
  );
}

export function WorldScenery({ stateRef, textures }: WorldSceneryProps) {
  const chunkRefs = useRef<(THREE.Group | null)[]>([]);
  const snowRef = useRef<THREE.Points>(null);

  const snowPositions = useMemo(() => {
    const arr = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
      const seed = (i + 1) * 9301;
      arr[i * 3] = (((seed * 17) % 1000) / 1000 - 0.5) * 32;
      arr[i * 3 + 1] = (((seed * 29) % 1000) / 1000) * 16 + 0.5;
      arr[i * 3 + 2] = -(((seed * 43) % 1000) / 1000) * 58 + 10;
    }
    return arr;
  }, []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const scroll = stateRef.current.worldScroll;

    for (let i = 0; i < CHUNK_COUNT; i++) {
      const grp = chunkRefs.current[i];
      if (!grp) continue;
      const base = -i * CHUNK_LEN;
      const shifted = ((base + scroll) % TOTAL_SPAN + TOTAL_SPAN) % TOTAL_SPAN;
      grp.position.z = shifted > CHUNK_LEN ? shifted - TOTAL_SPAN : shifted;
    }

    const snow = snowRef.current;
    if (snow) {
      const posAttr = snow.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const forwardWind = stateRef.current.phase === "playing" ? stateRef.current.speed * 0.45 : 3;
      for (let i = 0; i < SNOW_COUNT; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;
        arr[iy] = (arr[iy] ?? 0) - dt * (2.6 + (i % 5) * 0.35);
        arr[ix] = (arr[ix] ?? 0) + Math.sin(scroll * 0.25 + i) * dt * 0.6;
        arr[iz] = (arr[iz] ?? 0) + dt * forwardWind;
        if ((arr[iy] ?? 0) < 0.2) arr[iy] = 16;
        if ((arr[iz] ?? 0) > 12) arr[iz] = -48;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {Array.from({ length: CHUNK_COUNT }).map((_, i) => (
        <TrackChunk
          key={i}
          index={i}
          textures={textures}
          chunkRef={(el) => {
            chunkRefs.current[i] = el;
          }}
        />
      ))}

      {/* Neve caindo */}
      <points ref={snowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[snowPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.26} sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  );
}