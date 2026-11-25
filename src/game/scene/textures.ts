import * as THREE from "three";
import type { MapId } from "../catalog";

function makePixelTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  return tex;
}

export interface VoxelTextures {
  trackBed: THREE.CanvasTexture;
  sideGround: THREE.CanvasTexture;
  hazardStripe: THREE.CanvasTexture;
  buildingFacade: THREE.CanvasTexture;
  trainWindow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createVoxelTextures(mapId: MapId): VoxelTextures {
  const trackPalette =
    mapId === "deserto"
      ? { base: "#a37c4d", shades: ["#946d40", "#b28b5b", "#8a6338", "#bf9969"], sleeper: "#6b4423", sleeperHi: "#855730", dust: "rgba(255, 228, 168, 0.28)" }
      : mapId === "selva"
        ? { base: "#4c594b", shades: ["#3f4c3e", "#576656", "#3a4539", "#62735f"], sleeper: "#4d321c", sleeperHi: "#664326", dust: "rgba(124, 196, 114, 0.25)" }
        : { base: "#5c6270", shades: ["#505663", "#676d7c", "#4b515e", "#767d8e"], sleeper: "#5a351c", sleeperHi: "#76492a", dust: "rgba(232, 242, 255, 0.22)" };

  const trackBed = makePixelTexture(
    64,
    (ctx, s) => {
      ctx.fillStyle = trackPalette.base;
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 2) {
        for (let x = 0; x < s; x += 2) {
          const idx = (x * 7 + y * 13 + ((x ^ y) % 5)) % trackPalette.shades.length;
          ctx.fillStyle = trackPalette.shades[idx] ?? trackPalette.base;
          ctx.fillRect(x, y, 2, 2);
        }
      }
      for (let y = 4; y < s; y += 16) {
        ctx.fillStyle = trackPalette.sleeper;
        ctx.fillRect(6, y, s - 12, 7);
        ctx.fillStyle = trackPalette.sleeperHi;
        ctx.fillRect(8, y + 1, s - 16, 4);
      }
      ctx.fillStyle = trackPalette.dust;
      for (let i = 0; i < 18; i++) {
        ctx.fillRect((i * 17) % s, (i * 11) % s, 2, 2);
      }
    },
    3,
    8,
  );

  const groundShades =
    mapId === "deserto"
      ? ["#e8c17a", "#ddb164", "#f0cf8e", "#d4a455"]
      : mapId === "selva"
        ? ["#2d6e3e", "#255e34", "#367d47", "#1f522c"]
        : ["#e9f2ff", "#cfe0f5", "#c2d6ef", "#f4f9ff"];

  const sideGround = makePixelTexture(
    32,
    (ctx, s) => {
      ctx.fillStyle = groundShades[0] ?? "#dce8f8";
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 4) {
        for (let x = 0; x < s; x += 4) {
          const idx = (x * 3 + y * 5) % groundShades.length;
          ctx.fillStyle = groundShades[idx] ?? "#dce8f8";
          ctx.fillRect(x, y, 4, 4);
        }
      }
    },
    4,
    16,
  );

  const hazardStripe = makePixelTexture(32, (ctx, s) => {
    ctx.fillStyle = mapId === "deserto" ? "#fff3c4" : "#f5f7fa";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = mapId === "deserto" ? "#d9480f" : mapId === "selva" ? "#e67700" : "#d92b2b";
    for (let i = -s; i < s * 2; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 6, 0);
      ctx.lineTo(i - 6, s);
      ctx.lineTo(i - 12, s);
      ctx.closePath();
      ctx.fill();
    }
  });

  const buildingFacade = makePixelTexture(
    32,
    (ctx, s) => {
      ctx.fillStyle = mapId === "deserto" ? "#c99757" : mapId === "selva" ? "#4a5c4e" : "#1d2948";
      ctx.fillRect(0, 0, s, s);
      for (let y = 3; y < s - 3; y += 7) {
        for (let x = 3; x < s - 3; x += 7) {
          const lit = (x * 5 + y * 3) % 4 !== 0;
          ctx.fillStyle =
            mapId === "deserto"
              ? lit ? "#a8763b" : "#dfb173"
              : mapId === "selva"
                ? lit ? "#37473a" : "#628258"
                : lit ? "#ffd97a" : "#131b33";
          ctx.fillRect(x, y, 4, 4);
        }
      }
    },
    1,
    2,
  );

  // Warm glowing train windows strip
  const trainWindow = makePixelTexture(32, (ctx, s) => {
    ctx.fillStyle = "#202736";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#ffe596";
    ctx.fillRect(3, 4, 10, 24);
    ctx.fillRect(19, 4, 10, 24);
  });

  return {
    trackBed,
    sideGround,
    hazardStripe,
    buildingFacade,
    trainWindow,
    dispose: () => {
      trackBed.dispose();
      sideGround.dispose();
      hazardStripe.dispose();
      buildingFacade.dispose();
      trainWindow.dispose();
    },
  };
}