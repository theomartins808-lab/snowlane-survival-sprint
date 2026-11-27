import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
  const unitBox = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => unitBox.dispose(), [unitBox]);

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
          <mesh geometry={unitBox} scale={[0.56, 0.56, 0.56]}>
            <meshLambertMaterial color={p.skin} />
          </mesh>
          {character === "thzin" && (
            <>
              <mesh geometry={unitBox} position={[0, 0.22, 0.04]} scale={[0.59, 0.16, 0.59]}>
                <meshLambertMaterial color={p.hair} />
              </mesh>
              <mesh geometry={unitBox} position={[0, 0.02, 0.25]} scale={[0.58, 0.36, 0.08]}>
                <meshLambertMaterial color={p.hair} />
              </mesh>
            </>
          )}
          {character === "noel" && (
            <>
              <mesh geometry={unitBox} position={[0, 0.26, 0]} scale={[0.64, 0.14, 0.64]}>
                <meshLambertMaterial color="#ffffff" />
              </mesh>
              <mesh geometry={unitBox} position={[0, 0.48, 0.06]} scale={[0.46, 0.32, 0.46]}>
                <meshLambertMaterial color="#d92b2b" />
              </mesh>
              <mesh geometry={unitBox} position={[0, 0.62, 0.26]} scale={[0.18, 0.18, 0.18]}>
                <meshLambertMaterial color="#ffffff" />
              </mesh>
              <mesh geometry={unitBox} position={[0, -0.14, -0.26]} scale={[0.46, 0.28, 0.12]}>
                <meshLambertMaterial color="#ffffff" />
              </mesh>
            </>
          )}
          {character === "explorador" && (
            <>
              <mesh geometry={unitBox} position={[0, 0.28, 0]} scale={[0.82, 0.09, 0.82]}>
                <meshLambertMaterial color="#c49a5c" />
              </mesh>
              <mesh geometry={unitBox} position={[0, 0.44, 0]} scale={[0.52, 0.26, 0.52]}>
                <meshLambertMaterial color="#b08448" />
              </mesh>
              <mesh geometry={unitBox} position={[0, 0.34, 0]} scale={[0.55, 0.08, 0.55]}>
                <meshLambertMaterial color="#5c3a1e" />
              </mesh>
            </>
          )}
          {character === "robo" && (
            <>
              <mesh geometry={unitBox} position={[0, 0.04, -0.29]} scale={[0.44, 0.16, 0.04]}>
                <meshBasicMaterial color="#7dd3fc" />
              </mesh>
              <mesh geometry={unitBox} position={[0, 0.42, 0]} scale={[0.08, 0.3, 0.08]}>
                <meshLambertMaterial color="#475569" />
              </mesh>
              <mesh geometry={unitBox} position={[0, 0.6, 0]} scale={[0.16, 0.16, 0.16]}>
                <meshBasicMaterial color="#7dd3fc" />
              </mesh>
            </>
          )}
        </group>

        {/* Torso + emblema/mochila */}
        <group position={[0, 0.98, 0]}>
          <mesh geometry={unitBox} scale={[0.62, 0.66, 0.34]}>
            <meshLambertMaterial color={p.shirt} />
          </mesh>
          {character === "explorador" ? (
            <mesh geometry={unitBox} position={[0, 0.04, 0.25]} scale={[0.46, 0.5, 0.22]}>
              <meshLambertMaterial color="#8c5828" />
            </mesh>
          ) : character === "noel" ? (
            <mesh geometry={unitBox} position={[0, -0.18, 0]} scale={[0.65, 0.14, 0.37]}>
              <meshLambertMaterial color="#1e222b" />
            </mesh>
          ) : (
            <mesh geometry={unitBox} position={[0, 0.02, 0.175]} scale={[0.28, 0.28, 0.02]}>
              {character === "robo" ? (
                <meshBasicMaterial color={p.badge} />
              ) : (
                <meshLambertMaterial color={p.badge} />
              )}
            </mesh>
          )}
          <mesh geometry={unitBox} position={[0, 0.02, -0.175]} scale={[0.28, 0.28, 0.02]}>
            {character === "robo" ? (
              <meshBasicMaterial color={p.badge} />
            ) : (
              <meshLambertMaterial color={p.badge} />
            )}
          </mesh>
        </group>

        {/* Braço esquerdo */}
        <group ref={leftArmRef} position={[-0.43, 1.24, 0]}>
          <mesh geometry={unitBox} position={[0, -0.14, 0]} scale={[0.22, 0.28, 0.24]}>
            <meshLambertMaterial color={p.shirt} />
          </mesh>
          <mesh geometry={unitBox} position={[0, -0.4, 0]} scale={[0.2, 0.28, 0.22]}>
            <meshLambertMaterial color={p.skin} />
          </mesh>
        </group>

        {/* Braço direito */}
        <group ref={rightArmRef} position={[0.43, 1.24, 0]}>
          <mesh geometry={unitBox} position={[0, -0.14, 0]} scale={[0.22, 0.28, 0.24]}>
            <meshLambertMaterial color={p.shirt} />
          </mesh>
          <mesh geometry={unitBox} position={[0, -0.4, 0]} scale={[0.2, 0.28, 0.22]}>
            <meshLambertMaterial color={p.skin} />
          </mesh>
        </group>

        {/* Perna esquerda */}
        <group ref={leftLegRef} position={[-0.17, 0.64, 0]}>
          <mesh geometry={unitBox} position={[0, -0.26, 0]} scale={[0.26, 0.48, 0.28]}>
            <meshLambertMaterial color={p.pants} />
          </mesh>
          <mesh geometry={unitBox} position={[0, -0.56, -0.04]} scale={[0.27, 0.16, 0.36]}>
            <meshLambertMaterial color={p.shoes} />
          </mesh>
        </group>

        {/* Perna direita */}
        <group ref={rightLegRef} position={[0.17, 0.64, 0]}>
          <mesh geometry={unitBox} position={[0, -0.26, 0]} scale={[0.26, 0.48, 0.28]}>
            <meshLambertMaterial color={p.pants} />
          </mesh>
          <mesh geometry={unitBox} position={[0, -0.56, -0.04]} scale={[0.27, 0.16, 0.36]}>
            <meshLambertMaterial color={p.shoes} />
          </mesh>
        </group>
      </group>
    </group>
  );
}