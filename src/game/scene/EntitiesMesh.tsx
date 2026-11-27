import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MapThemeDef } from "../catalog";
import { SIM_CONFIG, type GameState } from "../sim/types";
import type { VoxelTextures } from "./textures";

const MAX_TRAINS = 14;
const MAX_BARRIERS = 24;
const MAX_COINS = 64;

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

interface EntitiesMeshProps {
  stateRef: React.MutableRefObject<GameState>;
  textures: VoxelTextures;
  theme: MapThemeDef;
}

function setBox(
  mesh: THREE.InstancedMesh,
  index: number,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  colorHex?: string,
  rotY = 0,
) {
  _dummy.position.set(x, y, z);
  _dummy.rotation.set(0, rotY, 0);
  _dummy.scale.set(sx, sy, sz);
  _dummy.updateMatrix();
  mesh.setMatrixAt(index, _dummy.matrix);
  if (colorHex) {
    _color.set(colorHex);
    mesh.setColorAt(index, _color);
  }
}

export function EntitiesMesh({ stateRef, textures, theme }: EntitiesMeshProps) {
  const trainBodyRef = useRef<THREE.InstancedMesh>(null);
  const trainTrimRef = useRef<THREE.InstancedMesh>(null);
  const trainWinRef = useRef<THREE.InstancedMesh>(null);
  const trainLightRef = useRef<THREE.InstancedMesh>(null);
  const barrierPostRef = useRef<THREE.InstancedMesh>(null);
  const barrierBoardRef = useRef<THREE.InstancedMesh>(null);
  const coinOuterRef = useRef<THREE.InstancedMesh>(null);
  const coinInnerRef = useRef<THREE.InstancedMesh>(null);

  const unitBox = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => unitBox.dispose(), [unitBox]);

  useFrame(({ clock }) => {
    const s = stateRef.current;
    const t = clock.getElapsedTime();

    const trainBody = trainBodyRef.current;
    const trainTrim = trainTrimRef.current;
    const trainWin = trainWinRef.current;
    const trainLight = trainLightRef.current;
    const barrierPost = barrierPostRef.current;
    const barrierBoard = barrierBoardRef.current;
    const coinOuter = coinOuterRef.current;
    const coinInner = coinInnerRef.current;

    let trainIdx = 0;
    let trimIdx = 0;
    let winIdx = 0;
    let lightIdx = 0;
    let postIdx = 0;
    let boardIdx = 0;

    for (const obs of s.obstacles) {
      const x = obs.lane * SIM_CONFIG.LANE_WIDTH;
      if (obs.kind === "train_red" || obs.kind === "train_brown") {
        if (trainIdx >= MAX_TRAINS) continue;
        const len = obs.length;
        const halfLen = len * 0.5;
        const bodyColor = obs.kind === "train_red" ? theme.trainPrimary : theme.trainSecondary;
        if (trainBody) {
          setBox(trainBody, trainIdx, x, 1.4, obs.z, 2.0, 2.28, len, bodyColor);
        }
        if (trainTrim) {
          setBox(trainTrim, trimIdx++, x, 2.64, obs.z, 2.06, 0.22, len + 0.05, theme.trainRoof);
          setBox(trainTrim, trimIdx++, x, 0.22, obs.z, 1.86, 0.44, len * 0.97, "#212633");
          setBox(trainTrim, trimIdx++, x, 1.95, obs.z + halfLen + 0.02, 1.5, 0.8, 0.06, "#182235");
        }
        if (trainWin) {
          setBox(trainWin, winIdx++, x + 1.01, 1.78, obs.z, 0.04, 0.85, len * 0.86);
          setBox(trainWin, winIdx++, x - 1.01, 1.78, obs.z, 0.04, 0.85, len * 0.86);
        }
        if (trainLight) {
          setBox(trainLight, lightIdx++, x - 0.62, 0.95, obs.z + halfLen + 0.03, 0.34, 0.34, 0.06);
          setBox(trainLight, lightIdx++, x + 0.62, 0.95, obs.z + halfLen + 0.03, 0.34, 0.34, 0.06);
        }
        trainIdx++;
      } else if (obs.kind === "barrier_jump") {
        if (boardIdx >= MAX_BARRIERS) continue;
        if (barrierPost) {
          setBox(barrierPost, postIdx++, x - 0.85, 0.5, obs.z, 0.24, 1.0, 0.34, "#2f3747");
          setBox(barrierPost, postIdx++, x + 0.85, 0.5, obs.z, 0.24, 1.0, 0.34, "#2f3747");
        }
        if (barrierBoard) {
          setBox(barrierBoard, boardIdx++, x, 0.72, obs.z, 2.1, 0.52, 0.24);
        }
      } else if (obs.kind === "barrier_duck") {
        if (boardIdx >= MAX_BARRIERS) continue;
        if (barrierPost) {
          setBox(barrierPost, postIdx++, x - 0.95, 1.2, obs.z, 0.24, 2.4, 0.28, "#2f3747");
          setBox(barrierPost, postIdx++, x + 0.95, 1.2, obs.z, 0.24, 2.4, 0.28, "#2f3747");
          setBox(barrierPost, postIdx++, x, 1.32, obs.z + 0.04, 2.16, 0.14, 0.32, "#ffd43b");
        }
        if (barrierBoard) {
          setBox(barrierBoard, boardIdx++, x, 1.82, obs.z, 2.2, 0.92, 0.34);
        }
      }
    }

    if (trainBody) {
      trainBody.count = trainIdx;
      trainBody.instanceMatrix.needsUpdate = true;
      if (trainBody.instanceColor) trainBody.instanceColor.needsUpdate = true;
    }
    if (trainTrim) {
      trainTrim.count = trimIdx;
      trainTrim.instanceMatrix.needsUpdate = true;
      if (trainTrim.instanceColor) trainTrim.instanceColor.needsUpdate = true;
    }
    if (trainWin) {
      trainWin.count = winIdx;
      trainWin.instanceMatrix.needsUpdate = true;
    }
    if (trainLight) {
      trainLight.count = lightIdx;
      trainLight.instanceMatrix.needsUpdate = true;
    }
    if (barrierPost) {
      barrierPost.count = postIdx;
      barrierPost.instanceMatrix.needsUpdate = true;
      if (barrierPost.instanceColor) barrierPost.instanceColor.needsUpdate = true;
    }
    if (barrierBoard) {
      barrierBoard.count = boardIdx;
      barrierBoard.instanceMatrix.needsUpdate = true;
    }

    // Moedas douradas brilhando e girando (apenas 2 draw calls para todas as moedas)
    let coinIdx = 0;
    for (const coin of s.coins) {
      if (coinIdx >= MAX_COINS) break;
      const bob = Math.sin(t * 5.2 + coin.phase) * 0.14;
      const rotY = t * 4.4 + coin.phase;
      if (coinOuter) setBox(coinOuter, coinIdx, coin.x, coin.y + bob, coin.z, 0.82, 0.82, 0.22, undefined, rotY);
      if (coinInner) setBox(coinInner, coinIdx, coin.x, coin.y + bob, coin.z, 0.46, 0.56, 0.28, undefined, rotY);
      coinIdx++;
    }
    if (coinOuter) {
      coinOuter.count = coinIdx;
      coinOuter.instanceMatrix.needsUpdate = true;
    }
    if (coinInner) {
      coinInner.count = coinIdx;
      coinInner.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Trens (4 draw calls no total para todos os trens) */}
      <instancedMesh
        ref={trainBodyRef}
        args={[unitBox, undefined, MAX_TRAINS]}
        count={0}
        frustumCulled={false}
      >
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh
        ref={trainTrimRef}
        args={[unitBox, undefined, MAX_TRAINS * 3]}
        count={0}
        frustumCulled={false}
      >
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh
        ref={trainWinRef}
        args={[unitBox, undefined, MAX_TRAINS * 2]}
        count={0}
        frustumCulled={false}
      >
        <meshBasicMaterial map={textures.trainWindow} />
      </instancedMesh>
      <instancedMesh
        ref={trainLightRef}
        args={[unitBox, undefined, MAX_TRAINS * 2]}
        count={0}
        frustumCulled={false}
      >
        <meshBasicMaterial color="#fff3a8" />
      </instancedMesh>

      {/* Barreiras de pular e abaixar (2 draw calls no total) */}
      <instancedMesh
        ref={barrierPostRef}
        args={[unitBox, undefined, MAX_BARRIERS * 3]}
        count={0}
        frustumCulled={false}
      >
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh
        ref={barrierBoardRef}
        args={[unitBox, undefined, MAX_BARRIERS]}
        count={0}
        frustumCulled={false}
      >
        <meshLambertMaterial map={textures.hazardStripe} />
      </instancedMesh>

      {/* Moedas douradas (2 draw calls no total para até 64 moedas) */}
      <instancedMesh
        ref={coinOuterRef}
        args={[unitBox, undefined, MAX_COINS]}
        count={0}
        frustumCulled={false}
      >
        <meshLambertMaterial color="#ffd93b" emissive="#ffae00" emissiveIntensity={0.95} />
      </instancedMesh>
      <instancedMesh
        ref={coinInnerRef}
        args={[unitBox, undefined, MAX_COINS]}
        count={0}
        frustumCulled={false}
      >
        <meshBasicMaterial color="#fff3a1" />
      </instancedMesh>
    </group>
  );
}