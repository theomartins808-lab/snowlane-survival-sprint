import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MapThemeDef } from "../catalog";
import { SIM_CONFIG, type GameState } from "../sim/types";
import type { VoxelTextures } from "./textures";

const CHUNK_LEN = 24;
const DESKTOP_CHUNKS = 5;
const MOBILE_CHUNKS = 4;
const DESKTOP_PARTICLES = 90;
const MOBILE_PARTICLES = 36;

interface WorldSceneryProps {
  stateRef: React.MutableRefObject<GameState>;
  textures: VoxelTextures;
  theme: MapThemeDef;
  isMobile: boolean;
}

interface BoxInstance {
  chunk: number;
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: string;
}

function buildSceneryInstances(themeId: MapThemeDef["id"], chunkCount: number) {
  const solid: BoxInstance[] = [];
  const glow: BoxInstance[] = [];
  const facade: BoxInstance[] = [];

  const addBox = (
    list: BoxInstance[],
    chunk: number,
    ox: number,
    oy: number,
    oz: number,
    px: number,
    py: number,
    pz: number,
    sx: number,
    sy: number,
    sz: number,
    color: string,
    scale = 1,
  ) => {
    list.push({
      chunk,
      x: ox + px * scale,
      y: oy + py * scale,
      z: oz + pz * scale,
      sx: sx * scale,
      sy: sy * scale,
      sz: sz * scale,
      color,
    });
  };

  for (let i = 0; i < chunkCount; i++) {
    const h1 = 10 + (i % 3) * 3.5;
    const h2 = 12 + ((i + 1) % 3) * 3;

    if (themeId === "natal") {
      const trees: [number, number, number][] = [
        [-7.2, -6, 1.05],
        [7.4, -10, 1.12],
        [-8.8, 5, 0.92],
        [8.2, 4, 0.98],
      ];
      for (const [tx, tz, sc] of trees) {
        addBox(solid, i, tx, 0, tz, 0, 0.55, 0, 0.55, 1.1, 0.55, "#6b4226", sc);
        addBox(solid, i, tx, 0, tz, 0, 1.6, 0, 2.1, 1.1, 2.1, "#1f6339", sc);
        addBox(solid, i, tx, 0, tz, 0, 2.18, 0, 2.14, 0.16, 2.14, "#eef6ff", sc);
        addBox(solid, i, tx, 0, tz, 0, 2.75, 0, 1.5, 1.0, 1.5, "#267343", sc);
        addBox(solid, i, tx, 0, tz, 0, 3.28, 0, 1.54, 0.16, 1.54, "#eef6ff", sc);
        addBox(solid, i, tx, 0, tz, 0, 3.8, 0, 0.85, 0.85, 0.85, "#2e854e", sc);
        addBox(solid, i, tx, 0, tz, 0, 4.26, 0, 0.88, 0.16, 0.88, "#ffffff", sc);
      }

      // Postes
      for (const [lx, lz, side] of [
        [-5.35, 0, -1],
        [5.35, -12, 1],
      ] as const) {
        addBox(solid, i, lx, 0, lz, 0, 2.1, 0, 0.24, 4.2, 0.24, "#273042");
        addBox(solid, i, lx, 0, lz, -side * 0.55, 4.05, 0, 1.2, 0.2, 0.2, "#273042");
        addBox(glow, i, lx, 0, lz, -side * 1.0, 3.82, 0, 0.38, 0.42, 0.38, "#ffeb99");
      }

      // Boneco de neve + presentes
      const sx = i % 2 === 0 ? -6.4 : 6.5;
      const sz = i % 2 === 0 ? -1 : 2;
      addBox(solid, i, sx, 0, sz, 0, 0.5, 0, 1.0, 1.0, 1.0, "#eef6ff");
      addBox(solid, i, sx, 0, sz, 0, 1.32, 0, 0.74, 0.72, 0.74, "#f5faff");
      addBox(solid, i, sx, 0, sz, 0, 1.92, 0, 0.52, 0.52, 0.52, "#ffffff");
      addBox(solid, i, sx, 0, sz, 0, 1.65, 0, 0.62, 0.14, 0.62, "#d92b2b");
      addBox(solid, i, sx, 0, sz, 0, 1.92, 0.34, 0.12, 0.12, 0.28, "#ff7a1a");
      addBox(solid, i, sx, 0, sz, 0, 2.24, 0, 0.64, 0.1, 0.64, "#1f2430");
      addBox(solid, i, sx, 0, sz, 0, 2.48, 0, 0.42, 0.4, 0.42, "#1f2430");

      const presents: [number, number, string, string][] =
        i % 2 === 0
          ? [
              [6.1, -2, "#e03131", "#ffd43b"],
              [7.0, -1.2, "#2f9e44", "#ffffff"],
            ]
          : [
              [-6.0, 3, "#1c7ed6", "#ffd43b"],
              [-6.9, 2.2, "#e03131", "#ffffff"],
            ];
      for (const [px, pz, col, rib] of presents) {
        addBox(solid, i, px, 0, pz, 0, 0.4, 0, 0.8, 0.8, 0.8, col);
        addBox(solid, i, px, 0, pz, 0, 0.4, 0, 0.84, 0.84, 0.18, rib);
        addBox(solid, i, px, 0, pz, 0, 0.4, 0, 0.18, 0.84, 0.84, rib);
      }

      // Prédios ao fundo
      addBox(facade, i, -15.5, 0, -3, 0, h1 / 2, 0, 6.5, h1, 8.5, "#ffffff");
      addBox(solid, i, -15.5, 0, -3, 0, h1 + 0.25, 0, 6.7, 0.5, 8.7, "#e6f0ff");
      addBox(facade, i, 15.8, 0, -5, 0, h2 / 2, 0, 6.8, h2, 9.0, "#ffffff");
      addBox(solid, i, 15.8, 0, -5, 0, h2 + 0.25, 0, 7.0, 0.5, 9.2, "#e6f0ff");
    } else if (themeId === "deserto") {
      const cacti: [number, number, number][] = [
        [-7.1, -5, 1.1],
        [7.3, -9, 0.95],
        [-8.5, 4, 0.85],
        [8.0, 5, 1.05],
      ];
      for (const [cx, cz, sc] of cacti) {
        addBox(solid, i, cx, 0, cz, 0, 1.5, 0, 0.62, 3.0, 0.62, "#3b8c47", sc);
        addBox(solid, i, cx, 0, cz, -0.65, 1.85, 0, 0.7, 0.45, 0.48, "#3b8c47", sc);
        addBox(solid, i, cx, 0, cz, -0.9, 2.35, 0, 0.45, 0.9, 0.48, "#469e53", sc);
        addBox(solid, i, cx, 0, cz, 0.65, 1.4, 0, 0.65, 0.45, 0.48, "#3b8c47", sc);
        addBox(solid, i, cx, 0, cz, 0.88, 1.9, 0, 0.45, 0.9, 0.48, "#469e53", sc);
      }
      for (const [tx, tz] of [
        [-5.4, 0],
        [5.4, -12],
      ] as const) {
        addBox(solid, i, tx, 0, tz, 0, 1.6, 0, 0.52, 3.2, 0.52, "#c99757");
        addBox(glow, i, tx, 0, tz, 0, 3.42, 0, 0.42, 0.44, 0.42, "#ff922b");
      }
      for (const [px, pz, sz] of [
        [-16.5, -4, 10 + (i % 2) * 2.5],
        [16.8, -7, 11 + ((i + 1) % 2) * 2],
      ] as const) {
        for (let step = 0; step < 5; step++) {
          const w = sz * (1 - step * 0.18);
          addBox(solid, i, px, 0, pz, 0, step * 1.9 + 0.95, 0, w, 1.9, w, step % 2 === 0 ? "#d9a659" : "#cc9547");
        }
      }
    } else {
      const jtrees: [number, number, number][] = [
        [-7.5, -6, 1.08],
        [7.6, -10, 1.15],
        [-8.6, 5, 0.94],
        [8.4, 4, 1.0],
      ];
      for (const [jx, jz, sc] of jtrees) {
        addBox(solid, i, jx, 0, jz, 0, 2.2, 0, 0.72, 4.4, 0.72, "#5c3a21", sc);
        addBox(solid, i, jx, 0, jz, 0, 4.5, 0, 3.1, 1.2, 3.1, "#1b7a3d", sc);
        addBox(solid, i, jx, 0, jz, 0.4, 5.4, -0.3, 2.2, 1.0, 2.2, "#2b9e4b", sc);
        addBox(solid, i, jx, 0, jz, -1.2, 3.4, 0.8, 0.2, 1.6, 0.2, "#37b24d", sc);
      }
      for (const [tx, tz] of [
        [-5.5, -1],
        [5.5, -12],
      ] as const) {
        addBox(solid, i, tx, 0, tz, 0, 1.7, 0, 0.85, 3.4, 0.85, "#4f5e52");
        addBox(glow, i, tx, 0, tz, -0.18, 2.5, 0.44, 0.18, 0.18, 0.06, "#96f2d7");
        addBox(glow, i, tx, 0, tz, 0.18, 2.5, 0.44, 0.18, 0.18, 0.06, "#96f2d7");
      }
      addBox(facade, i, -15.5, 0, -3, 0, h1 * 0.35, 0, 6.8, h1 * 0.7, 8.2, "#ffffff");
      addBox(solid, i, -15.5, 0, -3, 0, h1 * 0.7 + 0.3, 0, 7.1, 0.6, 8.5, "#2f9e44");
      addBox(facade, i, 15.8, 0, -5, 0, h2 * 0.35, 0, 7.0, h2 * 0.7, 8.6, "#ffffff");
      addBox(solid, i, 15.8, 0, -5, 0, h2 * 0.7 + 0.3, 0, 7.3, 0.6, 8.9, "#2b8a3e");
    }
  }

  return { solid, glow, facade };
}

function initInstancedBoxes(mesh: THREE.InstancedMesh | null, items: BoxInstance[]) {
  if (!mesh || items.length === 0) return;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < items.length; i++) {
    const b = items[i]!;
    dummy.position.set(b.x, b.y, b.z - b.chunk * CHUNK_LEN);
    dummy.scale.set(b.sx, b.sy, b.sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.set(b.color);
    mesh.setColorAt(i, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function shiftInstancedZ(mesh: THREE.InstancedMesh | null, items: BoxInstance[], chunkZs: number[]) {
  if (!mesh || items.length === 0) return;
  const arr = mesh.instanceMatrix.array as Float32Array;
  for (let i = 0; i < items.length; i++) {
    const b = items[i]!;
    arr[i * 16 + 14] = b.z + (chunkZs[b.chunk] ?? 0);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export function WorldScenery({ stateRef, textures, theme, isMobile }: WorldSceneryProps) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const facadeRef = useRef<THREE.InstancedMesh>(null);
  const railsRef = useRef<THREE.InstancedMesh>(null);
  const particleRef = useRef<THREE.Points>(null);

  const activeChunks = isMobile ? MOBILE_CHUNKS : DESKTOP_CHUNKS;
  const activeSpan = CHUNK_LEN * activeChunks;
  const groundLen = activeSpan;
  const groundCenterZ = CHUNK_LEN - groundLen / 2;
  const particleCount = isMobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES;

  const unitBox = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => unitBox.dispose(), [unitBox]);

  const { solid, glow, facade } = useMemo(
    () => buildSceneryInstances(theme.id, activeChunks),
    [theme.id, activeChunks],
  );

  // Ajusta o repeat da textura para o plano contínuo do chão
  useEffect(() => {
    textures.trackBed.repeat.set(3, 8 * activeChunks);
    textures.sideGround.repeat.set(4, 16 * activeChunks);
  }, [textures, activeChunks]);

  useEffect(() => {
    initInstancedBoxes(solidRef.current, solid);
    initInstancedBoxes(glowRef.current, glow);
    initInstancedBoxes(facadeRef.current, facade);
  }, [solid, glow, facade]);

  // Inicializa os 6 trilhos metálicos em um único InstancedMesh
  useEffect(() => {
    const mesh = railsRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (const lane of SIM_CONFIG.LANES) {
      const lx = lane * SIM_CONFIG.LANE_WIDTH;
      for (const offset of [-0.68, 0.68]) {
        dummy.position.set(lx + offset, 0.06, groundCenterZ);
        dummy.scale.set(0.12, 0.08, groundLen);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [groundCenterZ, groundLen]);

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

  const chunkZsRef = useRef<number[]>([]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const scroll = stateRef.current.worldScroll;

    // Rola o chão e dormentes via UV offset (0 custo de geometria)
    const scrollChunks = scroll / CHUNK_LEN;
    textures.trackBed.offset.y = (scrollChunks * 8) % 1;
    textures.sideGround.offset.y = (scrollChunks * 16) % 1;

    const chunkZs = chunkZsRef.current;
    for (let i = 0; i < activeChunks; i++) {
      const base = -i * CHUNK_LEN;
      const shifted = ((base + scroll) % activeSpan + activeSpan) % activeSpan;
      chunkZs[i] = shifted > CHUNK_LEN ? shifted - activeSpan : shifted;
    }

    shiftInstancedZ(solidRef.current, solid, chunkZs);
    shiftInstancedZ(glowRef.current, glow, chunkZs);
    shiftInstancedZ(facadeRef.current, facade, chunkZs);

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
      {/* Chão contínuo com UV scrolling (3 draw calls no total) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, groundCenterZ]}>
        <planeGeometry args={[9.4, groundLen]} />
        <meshLambertMaterial map={textures.trackBed} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13.7, -0.01, groundCenterZ]}>
        <planeGeometry args={[18, groundLen]} />
        <meshLambertMaterial map={textures.sideGround} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.7, -0.01, groundCenterZ]}>
        <planeGeometry args={[18, groundLen]} />
        <meshLambertMaterial map={textures.sideGround} />
      </mesh>

      {/* 6 trilhos metálicos em 1 draw call */}
      <instancedMesh ref={railsRef} args={[unitBox, undefined, 6]} frustumCulled={false}>
        <meshLambertMaterial color={theme.railColor} />
      </instancedMesh>

      {/* Todos os objetos sólidos das laterais em 1 draw call */}
      {solid.length > 0 && (
        <instancedMesh
          key={`solid-${theme.id}-${solid.length}`}
          ref={solidRef}
          args={[unitBox, undefined, solid.length]}
          frustumCulled={false}
        >
          <meshLambertMaterial />
        </instancedMesh>
      )}

      {/* Luzes dos postes / tochas / totens em 1 draw call */}
      {glow.length > 0 && (
        <instancedMesh
          key={`glow-${theme.id}-${glow.length}`}
          ref={glowRef}
          args={[unitBox, undefined, glow.length]}
          frustumCulled={false}
        >
          <meshBasicMaterial />
        </instancedMesh>
      )}

      {/* Fachadas de prédios/ruínas em 1 draw call */}
      {facade.length > 0 && (
        <instancedMesh
          key={`facade-${theme.id}-${facade.length}`}
          ref={facadeRef}
          args={[unitBox, undefined, facade.length]}
          frustumCulled={false}
        >
          <meshLambertMaterial map={textures.buildingFacade} />
        </instancedMesh>
      )}

      <points key={particleCount} ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={theme.particleColor} size={0.26} sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  );
}