import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { MapThemeDef } from "../catalog";
import { SIM_CONFIG, type GameState } from "../sim/types";
import type { VoxelTextures } from "./textures";

const MAX_TRAINS = 14;
const MAX_JUMP_BARRIERS = 12;
const MAX_DUCK_BARRIERS = 12;
const MAX_COINS = 64;

interface EntitiesMeshProps {
  stateRef: React.MutableRefObject<GameState>;
  textures: VoxelTextures;
  theme: MapThemeDef;
}

export function EntitiesMesh({ stateRef, textures, theme }: EntitiesMeshProps) {
  const trainRefs = useRef<(THREE.Group | null)[]>([]);
  const trainBodyMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const jumpRefs = useRef<(THREE.Group | null)[]>([]);
  const duckRefs = useRef<(THREE.Group | null)[]>([]);
  const coinRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const s = stateRef.current;
    const t = clock.getElapsedTime();

    let trainIdx = 0;
    let jumpIdx = 0;
    let duckIdx = 0;

    for (const obs of s.obstacles) {
      const x = obs.lane * SIM_CONFIG.LANE_WIDTH;
      if (obs.kind === "train_red" || obs.kind === "train_brown") {
        if (trainIdx < MAX_TRAINS) {
          const grp = trainRefs.current[trainIdx];
          const mat = trainBodyMatRefs.current[trainIdx];
          if (grp) {
            grp.visible = true;
            grp.position.set(x, 0, obs.z);
            grp.scale.set(1, 1, obs.length / 10);
          }
          if (mat) {
            mat.color.set(obs.kind === "train_red" ? theme.trainPrimary : theme.trainSecondary);
          }
          trainIdx++;
        }
      } else if (obs.kind === "barrier_jump") {
        if (jumpIdx < MAX_JUMP_BARRIERS) {
          const grp = jumpRefs.current[jumpIdx];
          if (grp) {
            grp.visible = true;
            grp.position.set(x, 0, obs.z);
          }
          jumpIdx++;
        }
      } else if (obs.kind === "barrier_duck") {
        if (duckIdx < MAX_DUCK_BARRIERS) {
          const grp = duckRefs.current[duckIdx];
          if (grp) {
            grp.visible = true;
            grp.position.set(x, 0, obs.z);
          }
          duckIdx++;
        }
      }
    }

    for (let i = trainIdx; i < MAX_TRAINS; i++) {
      const grp = trainRefs.current[i];
      if (grp) grp.visible = false;
    }
    for (let i = jumpIdx; i < MAX_JUMP_BARRIERS; i++) {
      const grp = jumpRefs.current[i];
      if (grp) grp.visible = false;
    }
    for (let i = duckIdx; i < MAX_DUCK_BARRIERS; i++) {
      const grp = duckRefs.current[i];
      if (grp) grp.visible = false;
    }

    // Moedas douradas brilhando e girando
    let coinIdx = 0;
    for (const coin of s.coins) {
      if (coinIdx >= MAX_COINS) break;
      const grp = coinRefs.current[coinIdx];
      if (grp) {
        grp.visible = true;
        const bob = Math.sin(t * 5.2 + coin.phase) * 0.14;
        grp.position.set(coin.x, coin.y + bob, coin.z);
        grp.rotation.y = t * 4.4 + coin.phase;
      }
      coinIdx++;
    }
    for (let i = coinIdx; i < MAX_COINS; i++) {
      const grp = coinRefs.current[i];
      if (grp) grp.visible = false;
    }
  });

  return (
    <group>
      {/* Pool de Trens Vermelhos e Marrons */}
      {Array.from({ length: MAX_TRAINS }).map((_, i) => (
        <group
          key={`train-${i}`}
          visible={false}
          ref={(el) => {
            trainRefs.current[i] = el;
          }}
        >
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 2.28, 10]} />
            <meshStandardMaterial
              ref={(el) => {
                trainBodyMatRefs.current[i] = el;
              }}
              color={theme.trainPrimary}
              roughness={0.65}
            />
          </mesh>
          {/* Teto plano (altura 2.75) onde o jogador pode pousar e correr */}
          <mesh position={[0, 2.64, 0]} receiveShadow>
            <boxGeometry args={[2.06, 0.22, 10.05]} />
            <meshStandardMaterial color={theme.trainRoof} roughness={0.55} />
          </mesh>
          {/* Base / rodas */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[1.86, 0.44, 9.7]} />
            <meshStandardMaterial color="#212633" roughness={0.85} />
          </mesh>
          {/* Janelas iluminadas nas laterais */}
          <mesh position={[1.01, 1.78, 0]}>
            <boxGeometry args={[0.04, 0.85, 8.6]} />
            <meshStandardMaterial map={textures.trainWindow} emissive="#ffcf66" emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[-1.01, 1.78, 0]}>
            <boxGeometry args={[0.04, 0.85, 8.6]} />
            <meshStandardMaterial map={textures.trainWindow} emissive="#ffcf66" emissiveIntensity={0.45} />
          </mesh>
          {/* Para-brisa e faróis frontais (voltados para o jogador em +Z) */}
          <mesh position={[0, 1.95, 5.02]}>
            <boxGeometry args={[1.5, 0.8, 0.06]} />
            <meshStandardMaterial color="#182235" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[-0.62, 0.95, 5.03]}>
            <boxGeometry args={[0.34, 0.34, 0.06]} />
            <meshStandardMaterial color="#fff8c4" emissive="#ffe066" emissiveIntensity={2.0} />
          </mesh>
          <mesh position={[0.62, 0.95, 5.03]}>
            <boxGeometry args={[0.34, 0.34, 0.06]} />
            <meshStandardMaterial color="#fff8c4" emissive="#ffe066" emissiveIntensity={2.0} />
          </mesh>
        </group>
      ))}

      {/* Pool de Barreiras para Pular */}
      {Array.from({ length: MAX_JUMP_BARRIERS }).map((_, i) => (
        <group
          key={`jump-${i}`}
          visible={false}
          ref={(el) => {
            jumpRefs.current[i] = el;
          }}
        >
          <mesh position={[-0.85, 0.5, 0]} castShadow>
            <boxGeometry args={[0.24, 1.0, 0.34]} />
            <meshStandardMaterial color="#2f3747" roughness={0.8} />
          </mesh>
          <mesh position={[0.85, 0.5, 0]} castShadow>
            <boxGeometry args={[0.24, 1.0, 0.34]} />
            <meshStandardMaterial color="#2f3747" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[2.1, 0.52, 0.24]} />
            <meshStandardMaterial map={textures.hazardStripe} roughness={0.55} />
          </mesh>
        </group>
      ))}

      {/* Pool de Barreiras Altas para Abaixar */}
      {Array.from({ length: MAX_DUCK_BARRIERS }).map((_, i) => (
        <group
          key={`duck-${i}`}
          visible={false}
          ref={(el) => {
            duckRefs.current[i] = el;
          }}
        >
          <mesh position={[-0.95, 1.2, 0]} castShadow>
            <boxGeometry args={[0.24, 2.4, 0.28]} />
            <meshStandardMaterial color="#2f3747" roughness={0.8} />
          </mesh>
          <mesh position={[0.95, 1.2, 0]} castShadow>
            <boxGeometry args={[0.24, 2.4, 0.28]} />
            <meshStandardMaterial color="#2f3747" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.82, 0]} castShadow>
            <boxGeometry args={[2.2, 0.92, 0.34]} />
            <meshStandardMaterial map={textures.hazardStripe} roughness={0.55} />
          </mesh>
          {/* Faixa amarela inferior indicando passe por baixo */}
          <mesh position={[0, 1.32, 0.04]}>
            <boxGeometry args={[2.16, 0.14, 0.32]} />
            <meshStandardMaterial color="#ffd43b" emissive="#fab005" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Pool de Moedas Douradas Brilhantes */}
      {Array.from({ length: MAX_COINS }).map((_, i) => (
        <group
          key={`coin-${i}`}
          visible={false}
          ref={(el) => {
            coinRefs.current[i] = el;
          }}
        >
          {/* Aro externo dourado voxel */}
          <mesh castShadow>
            <boxGeometry args={[0.82, 0.82, 0.22]} />
            <meshStandardMaterial
              color="#ffd93b"
              emissive="#ffae00"
              emissiveIntensity={1.15}
              metalness={0.55}
              roughness={0.22}
            />
          </mesh>
          {/* Centro brilhante em relevo */}
          <mesh>
            <boxGeometry args={[0.46, 0.56, 0.28]} />
            <meshStandardMaterial
              color="#fff3a1"
              emissive="#ffd43b"
              emissiveIntensity={1.5}
              metalness={0.35}
              roughness={0.18}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}