import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { GameState } from "../sim/types";

interface PlayerMeshProps {
  stateRef: React.MutableRefObject<GameState>;
}

export function PlayerMesh({ stateRef }: PlayerMeshProps) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

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
        {/* Cabeça quadrada marrom estilo Minecraft */}
        <group position={[0, 1.56, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.56, 0.56, 0.56]} />
            <meshStandardMaterial color="#8d5a3b" roughness={0.85} />
          </mesh>
          {/* Cabelo blocky marrom escuro no topo e atrás */}
          <mesh position={[0, 0.22, 0.04]} castShadow>
            <boxGeometry args={[0.59, 0.16, 0.59]} />
            <meshStandardMaterial color="#4a2c1a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.02, 0.25]}>
            <boxGeometry args={[0.58, 0.36, 0.08]} />
            <meshStandardMaterial color="#4a2c1a" roughness={0.9} />
          </mesh>
        </group>

        {/* Camiseta azul com quadrado laranja (visível na frente e nas costas) */}
        <group position={[0, 0.98, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.66, 0.34]} />
            <meshStandardMaterial color="#1f6fe5" roughness={0.78} />
          </mesh>
          {/* Quadrado laranja nas costas (câmera em 3a pessoa) */}
          <mesh position={[0, 0.02, 0.175]}>
            <boxGeometry args={[0.28, 0.28, 0.02]} />
            <meshStandardMaterial color="#ff7a1a" roughness={0.6} />
          </mesh>
          {/* Quadrado laranja na frente */}
          <mesh position={[0, 0.02, -0.175]}>
            <boxGeometry args={[0.28, 0.28, 0.02]} />
            <meshStandardMaterial color="#ff7a1a" roughness={0.6} />
          </mesh>
        </group>

        {/* Braço esquerdo */}
        <group ref={leftArmRef} position={[-0.43, 1.24, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.24]} />
            <meshStandardMaterial color="#1f6fe5" roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.28, 0.22]} />
            <meshStandardMaterial color="#8d5a3b" roughness={0.85} />
          </mesh>
        </group>

        {/* Braço direito */}
        <group ref={rightArmRef} position={[0.43, 1.24, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.24]} />
            <meshStandardMaterial color="#1f6fe5" roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.28, 0.22]} />
            <meshStandardMaterial color="#8d5a3b" roughness={0.85} />
          </mesh>
        </group>

        {/* Perna esquerda: calça jeans + tênis branco */}
        <group ref={leftLegRef} position={[-0.17, 0.64, 0]}>
          <mesh position={[0, -0.26, 0]} castShadow>
            <boxGeometry args={[0.26, 0.48, 0.28]} />
            <meshStandardMaterial color="#27477a" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.56, -0.04]} castShadow>
            <boxGeometry args={[0.27, 0.16, 0.36]} />
            <meshStandardMaterial color="#f4f6fa" roughness={0.55} />
          </mesh>
        </group>

        {/* Perna direita: calça jeans + tênis branco */}
        <group ref={rightLegRef} position={[0.17, 0.64, 0]}>
          <mesh position={[0, -0.26, 0]} castShadow>
            <boxGeometry args={[0.26, 0.48, 0.28]} />
            <meshStandardMaterial color="#27477a" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.56, -0.04]} castShadow>
            <boxGeometry args={[0.27, 0.16, 0.36]} />
            <meshStandardMaterial color="#f4f6fa" roughness={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
}