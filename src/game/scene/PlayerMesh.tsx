import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { CharacterId } from "../catalog";
import type { GameState } from "../sim/types";

interface PlayerMeshProps {
  stateRef: React.MutableRefObject<GameState>;
  character: CharacterId;
}

const CHAR_PALETTES: Record<
  CharacterId,
  { skin: string; hair: string; shirt: string; badge: string; pants: string; shoes: string; metal?: boolean }
> = {
  thzin: { skin: "#8d5a3b", hair: "#4a2c1a", shirt: "#1f6fe5", badge: "#ff7a1a", pants: "#27477a", shoes: "#f4f6fa" },
  noel: { skin: "#f0c2a0", hair: "#f4f6fa", shirt: "#d92b2b", badge: "#ffd43b", pants: "#b82020", shoes: "#1f2430" },
  explorador: { skin: "#c98b5b", hair: "#3d2616", shirt: "#4d7c3f", badge: "#a86b32", pants: "#9c7e4e", shoes: "#4a3220" },
  robo: { skin: "#94a3b8", hair: "#475569", shirt: "#64748b", badge: "#38bdf8", pants: "#334155", shoes: "#0f172a", metal: true },
};

export function PlayerMesh({ stateRef, character }: PlayerMeshProps) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const p = CHAR_PALETTES[character];
  const metalness = p.metal ? 0.55 : 0;
  const roughness = p.metal ? 0.35 : 0.82;

  useFrame(() => {
    const s = stateRef.current;
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return;

    root.position.set(s.laneX, s.playerY, 0);

    // Slight tilt toward lane change direction
    const laneDelta = s.targetLane * 2.6 - s.laneX;
    root.rotation.z = -laneDelta * 0.08;

    const isDucking = s.duckTimer > 0 && s.isGrounded;
    const targetScaleY = isDucking ? 0.56 : 1;
    body.scale.y += (targetScaleY - body.scale.y) * 0.28;
    body.rotation.x = isDucking ? 0.42 : !s.isGrounded ? -0.14 : 0.08;

    // Running stride animation
    const swing = s.isGrounded ? Math.sin(s.runCycle) * 0.85 : 0.55;
    const bob = s.isGrounded && !isDucking ? Math.abs(Math.cos(s.runCycle)) * 0.08 : 0;
    body.position.y = bob;

    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.9;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.9;
  });

  return (
    <group ref={rootRef}>
      <group ref={bodyRef}>
        {/* Cabeça quadrada estilo voxel */}
        <group position={[0, 1.56, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.56, 0.56, 0.56]} />
            <meshStandardMaterial color={p.skin} roughness={roughness} metalness={metalness} />
          </mesh>
          {character === "thzin" && (
            <>
              <mesh position={[0, 0.22, 0.04]} castShadow>
                <boxGeometry args={[0.59, 0.16, 0.59]} />
                <meshStandardMaterial color={p.hair} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.02, 0.25]}>
                <boxGeometry args={[0.58, 0.36, 0.08]} />
                <meshStandardMaterial color={p.hair} roughness={0.9} />
              </mesh>
            </>
          )}
          {character === "noel" && (
            <>
              <mesh position={[0, 0.26, 0]}>
                <boxGeometry args={[0.64, 0.14, 0.64]} />
                <meshStandardMaterial color="#ffffff" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.48, 0.06]} castShadow>
                <boxGeometry args={[0.46, 0.32, 0.46]} />
                <meshStandardMaterial color="#d92b2b" roughness={0.75} />
              </mesh>
              <mesh position={[0, 0.62, 0.26]}>
                <boxGeometry args={[0.18, 0.18, 0.18]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
              </mesh>
              <mesh position={[0, -0.14, -0.26]}>
                <boxGeometry args={[0.46, 0.28, 0.12]} />
                <meshStandardMaterial color="#ffffff" roughness={0.7} />
              </mesh>
            </>
          )}
          {character === "explorador" && (
            <>
              <mesh position={[0, 0.28, 0]} castShadow>
                <boxGeometry args={[0.82, 0.09, 0.82]} />
                <meshStandardMaterial color="#c49a5c" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.44, 0]} castShadow>
                <boxGeometry args={[0.52, 0.26, 0.52]} />
                <meshStandardMaterial color="#b08448" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.34, 0]}>
                <boxGeometry args={[0.55, 0.08, 0.55]} />
                <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
              </mesh>
            </>
          )}
          {character === "robo" && (
            <>
              <mesh position={[0, 0.04, -0.29]}>
                <boxGeometry args={[0.44, 0.16, 0.04]} />
                <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={1.6} />
              </mesh>
              <mesh position={[0, 0.42, 0]}>
                <boxGeometry args={[0.08, 0.3, 0.08]} />
                <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.16, 0.16, 0.16]} />
                <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={1.8} />
              </mesh>
            </>
          )}
        </group>

        {/* Torso + emblema/mochila */}
        <group position={[0, 0.98, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.66, 0.34]} />
            <meshStandardMaterial color={p.shirt} roughness={roughness} metalness={metalness} />
          </mesh>
          {character === "explorador" ? (
            <mesh position={[0, 0.04, 0.25]} castShadow>
              <boxGeometry args={[0.46, 0.5, 0.22]} />
              <meshStandardMaterial color="#8c5828" roughness={0.85} />
            </mesh>
          ) : character === "noel" ? (
            <mesh position={[0, -0.18, 0]}>
              <boxGeometry args={[0.65, 0.14, 0.37]} />
              <meshStandardMaterial color="#1e222b" roughness={0.7} />
            </mesh>
          ) : (
            <mesh position={[0, 0.02, 0.175]}>
              <boxGeometry args={[0.28, 0.28, 0.02]} />
              <meshStandardMaterial
                color={p.badge}
                emissive={character === "robo" ? "#38bdf8" : "#000000"}
                emissiveIntensity={character === "robo" ? 1.2 : 0}
                roughness={0.55}
              />
            </mesh>
          )}
          <mesh position={[0, 0.02, -0.175]}>
            <boxGeometry args={[0.28, 0.28, 0.02]} />
            <meshStandardMaterial
              color={p.badge}
              emissive={character === "robo" ? "#38bdf8" : "#000000"}
              emissiveIntensity={character === "robo" ? 1.2 : 0}
              roughness={0.55}
            />
          </mesh>
        </group>

        {/* Braço esquerdo */}
        <group ref={leftArmRef} position={[-0.43, 1.24, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.24]} />
            <meshStandardMaterial color={p.shirt} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.28, 0.22]} />
            <meshStandardMaterial color={p.skin} roughness={roughness} metalness={metalness} />
          </mesh>
        </group>

        {/* Braço direito */}
        <group ref={rightArmRef} position={[0.43, 1.24, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.24]} />
            <meshStandardMaterial color={p.shirt} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.28, 0.22]} />
            <meshStandardMaterial color={p.skin} roughness={roughness} metalness={metalness} />
          </mesh>
        </group>

        {/* Perna esquerda */}
        <group ref={leftLegRef} position={[-0.17, 0.64, 0]}>
          <mesh position={[0, -0.26, 0]} castShadow>
            <boxGeometry args={[0.26, 0.48, 0.28]} />
            <meshStandardMaterial color={p.pants} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, -0.56, -0.04]} castShadow>
            <boxGeometry args={[0.27, 0.16, 0.36]} />
            <meshStandardMaterial color={p.shoes} roughness={0.55} />
          </mesh>
        </group>

        {/* Perna direita */}
        <group ref={rightLegRef} position={[0.17, 0.64, 0]}>
          <mesh position={[0, -0.26, 0]} castShadow>
            <boxGeometry args={[0.26, 0.48, 0.28]} />
            <meshStandardMaterial color={p.pants} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, -0.56, -0.04]} castShadow>
            <boxGeometry args={[0.27, 0.16, 0.36]} />
            <meshStandardMaterial color={p.shoes} roughness={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
}