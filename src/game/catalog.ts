export type CharacterId = "thzin" | "noel" | "explorador" | "robo";
export type MapId = "natal" | "deserto" | "selva";

export interface CharacterDef {
  id: CharacterId;
  name: string;
  accent: string;
}

export interface MapThemeDef {
  id: MapId;
  name: string;
  accent: string;
  skyColor: string;
  fogColor: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sunColor: string;
  sunIntensity: number;
  lightformerTop: string;
  lightformerWarm: string;
  lightformerSide: string;
  railColor: string;
  trainPrimary: string;
  trainSecondary: string;
  trainRoof: string;
  particleColor: string;
}

export const CHARACTERS: readonly CharacterDef[] = [
  { id: "thzin", name: "Thzin", accent: "#1f6fe5" },
  { id: "noel", name: "Noel", accent: "#d92b2b" },
  { id: "explorador", name: "Explorador", accent: "#4d7c3f" },
  { id: "robo", name: "Robô-X", accent: "#0ea5e9" },
];

export const MAPS: readonly MapThemeDef[] = [
  {
    id: "natal",
    name: "Vila de Natal",
    accent: "#2f9e44",
    skyColor: "#0f1c3d",
    fogColor: "#0f1c3d",
    hemiSky: "#9bc2ff",
    hemiGround: "#253459",
    hemiIntensity: 0.95,
    sunColor: "#fff3dc",
    sunIntensity: 1.55,
    lightformerTop: "#9ec5ff",
    lightformerWarm: "#ffd9a0",
    lightformerSide: "#6b8fd4",
    railColor: "#b2becf",
    trainPrimary: "#c92a2a",
    trainSecondary: "#7c4a26",
    trainRoof: "#e9f3ff",
    particleColor: "#ffffff",
  },
  {
    id: "deserto",
    name: "Deserto Dourado",
    accent: "#e67700",
    skyColor: "#e8a254",
    fogColor: "#e8a254",
    hemiSky: "#fff1c9",
    hemiGround: "#9e632b",
    hemiIntensity: 1.15,
    sunColor: "#fff6d6",
    sunIntensity: 1.85,
    lightformerTop: "#ffe8b0",
    lightformerWarm: "#ffbe73",
    lightformerSide: "#d9924c",
    railColor: "#9c7a4c",
    trainPrimary: "#1d8a8a",
    trainSecondary: "#b86b28",
    trainRoof: "#f0d399",
    particleColor: "#ffe5a8",
  },
  {
    id: "selva",
    name: "Selva Tropical",
    accent: "#12b886",
    skyColor: "#1a4a4e",
    fogColor: "#1a4a4e",
    hemiSky: "#9bf2d7",
    hemiGround: "#1e3d28",
    hemiIntensity: 1.05,
    sunColor: "#fff8cc",
    sunIntensity: 1.65,
    lightformerTop: "#a6f4dc",
    lightformerWarm: "#ffe794",
    lightformerSide: "#3c8c6e",
    railColor: "#8b9b8e",
    trainPrimary: "#2b8a3e",
    trainSecondary: "#79502b",
    trainRoof: "#51a351",
    particleColor: "#d8ff7a",
  },
];

export function getMapTheme(id: MapId): MapThemeDef {
  return MAPS.find((m) => m.id === id) ?? MAPS[0]!;
}