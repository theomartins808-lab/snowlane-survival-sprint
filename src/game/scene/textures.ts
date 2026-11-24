import * as THREE from "three";

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
  snowGround: THREE.CanvasTexture;
  hazardStripe: THREE.CanvasTexture;
  buildingFacade: THREE.CanvasTexture;
  trainWindow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createVoxelTextures(): VoxelTextures {
  // Grey gravel track bed with voxel speckle
  const trackBed = makePixelTexture(
    64,
    (ctx, s) => {
      ctx.fillStyle = "#5c6270";
      ctx.fillRect(0, 0, s, s);
      const shades = ["#505663", "#676d7c", "#4b515e", "#767d8e"];
      for (let y = 0; y < s; y += 2) {
        for (let x = 0; x < s; x += 2) {
          const idx = (x * 7 + y * 13 + ((x ^ y) % 5)) % shades.length;
          ctx.fillStyle = shades[idx] ?? "#5c6270";
          ctx.fillRect(x, y, 2, 2);
        }
      }
      // Brown wooden sleepers painted cleanly into each track tile
      for (let y = 4; y < s; y += 16) {
        ctx.fillStyle = "#5a351c";
        ctx.fillRect(6, y, s - 12, 7);
        ctx.fillStyle = "#76492a";
        ctx.fillRect(8, y + 1, s - 16, 4);
      }
      // Subtle snow dust along edges
      ctx.fillStyle = "rgba(232, 242, 255, 0.22)";
      for (let i = 0; i < 18; i++) {
        ctx.fillRect((i * 17) % s, (i * 11) % s, 2, 2);
      }
    },
    3,
    8,
  );

  // Crisp snowy side ground with pixel variation
  const snowGround = makePixelTexture(
    32,
    (ctx, s) => {
      ctx.fillStyle = "#dce8f8";
      ctx.fillRect(0, 0, s, s);
      const shades = ["#e9f2ff", "#cfe0f5", "#c2d6ef", "#f4f9ff"];
      for (let y = 0; y < s; y += 4) {
        for (let x = 0; x < s; x += 4) {
          const idx = (x * 3 + y * 5) % shades.length;
          ctx.fillStyle = shades[idx] ?? "#dce8f8";
          ctx.fillRect(x, y, 4, 4);
        }
      }
    },
    4,
    16,
  );

  // Red & white Christmas hazard barrier stripe
  const hazardStripe = makePixelTexture(32, (ctx, s) => {
    ctx.fillStyle = "#f5f7fa";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#d92b2b";
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

  // Nighttime city building facade with glowing warm voxel windows
  const buildingFacade = makePixelTexture(
    32,
    (ctx, s) => {
      ctx.fillStyle = "#1d2948";
      ctx.fillRect(0, 0, s, s);
      for (let y = 3; y < s - 3; y += 7) {
        for (let x = 3; x < s - 3; x += 7) {
          const lit = (x * 5 + y * 3) % 4 !== 0;
          ctx.fillStyle = lit ? "#ffd97a" : "#131b33";
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
    snowGround,
    hazardStripe,
    buildingFacade,
    trainWindow,
    dispose: () => {
      trackBed.dispose();
      snowGround.dispose();
      hazardStripe.dispose();
      buildingFacade.dispose();
      trainWindow.dispose();
    },
  };
}