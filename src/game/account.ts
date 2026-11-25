import { supabase } from "@/integrations/supabase/client";
import type { CharacterId, MapId } from "./catalog";

export interface PlayerProfile {
  id: string;
  nick: string;
  characterId: CharacterId;
  mapId: MapId;
  bestTime: number;
  bestDistance: number;
}

const VALID_CHARS: readonly CharacterId[] = ["thzin", "noel", "explorador", "robo"];
const VALID_MAPS: readonly MapId[] = ["natal", "deserto", "selva"];

export function normalizeNick(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

export function validateCredentials(nick: string, password: string): string | null {
  const trimmed = nick.trim();
  const norm = normalizeNick(trimmed);
  if (norm.length < 3 || norm.length > 20) {
    return "O Nick precisa ter entre 3 e 20 letras, números ou _.";
  }
  if (norm !== trimmed.toLowerCase()) {
    return "Use apenas letras, números e _ no Nick (sem espaços).";
  }
  if (password.length < 6) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  return null;
}

function nickToEmail(nick: string): string {
  return `${normalizeNick(nick)}@thzinkkj.app`;
}

function parseProfileRow(row: {
  id: string;
  nick: string;
  character_id: string;
  map_id: string;
  best_time: number;
  best_distance: number;
}): PlayerProfile {
  const characterId = VALID_CHARS.includes(row.character_id as CharacterId)
    ? (row.character_id as CharacterId)
    : "thzin";
  const mapId = VALID_MAPS.includes(row.map_id as MapId) ? (row.map_id as MapId) : "natal";
  return {
    id: row.id,
    nick: row.nick,
    characterId,
    mapId,
    bestTime: Number(row.best_time) || 0,
    bestDistance: Number(row.best_distance) || 0,
  };
}

export async function fetchProfileById(userId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nick, character_id, map_id, best_time, best_distance")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return parseProfileRow(data);
}

export async function fetchCurrentProfile(): Promise<PlayerProfile | null> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) return null;
  return fetchProfileById(userRes.user.id);
}

export async function signUpWithNick(nick: string, password: string): Promise<PlayerProfile> {
  const validationError = validateCredentials(nick, password);
  if (validationError) throw new Error(validationError);

  const cleanNick = nick.trim();
  const norm = normalizeNick(cleanNick);
  const { data, error } = await supabase.auth.signUp({
    email: nickToEmail(cleanNick),
    password,
    options: {
      data: {
        nick: cleanNick,
        nick_normalized: norm,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("duplicate")) {
      throw new Error("Esse Nick já está em uso. Tente outro ou clique em Entrar.");
    }
    if (msg.includes("password") || msg.includes("weak") || msg.includes("pwned") || msg.includes("leaked")) {
      throw new Error("Essa senha é muito comum ou fraca. Use uma senha mais forte (misture letras e números).");
    }
    throw new Error("Não foi possível criar a conta. Tente outro Nick.");
  }
  if (!data.session || !data.user) {
    throw new Error("Conta criada, mas não foi possível iniciar a sessão.");
  }

  const profile = await fetchProfileById(data.user.id);
  if (!profile) {
    return {
      id: data.user.id,
      nick: cleanNick,
      characterId: "thzin",
      mapId: "natal",
      bestTime: 0,
      bestDistance: 0,
    };
  }
  return profile;
}

export async function signInWithNick(nick: string, password: string): Promise<PlayerProfile> {
  const validationError = validateCredentials(nick, password);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: nickToEmail(nick),
    password,
  });

  if (error || !data.user) {
    throw new Error("Nick ou senha incorretos.");
  }

  const profile = await fetchProfileById(data.user.id);
  if (!profile) {
    return {
      id: data.user.id,
      nick: nick.trim(),
      characterId: "thzin",
      mapId: "natal",
      bestTime: 0,
      bestDistance: 0,
    };
  }
  return profile;
}

export async function signOutAccount(): Promise<void> {
  await supabase.auth.signOut();
}

export async function updateProfilePrefs(
  userId: string,
  characterId: CharacterId,
  mapId: MapId,
): Promise<void> {
  await supabase
    .from("profiles")
    .update({
      character_id: characterId,
      map_id: mapId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function updateProfileRecord(
  userId: string,
  bestTime: number,
  bestDistance: number,
): Promise<void> {
  await supabase
    .from("profiles")
    .update({
      best_time: Math.round(bestTime * 100) / 100,
      best_distance: Math.floor(bestDistance),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}