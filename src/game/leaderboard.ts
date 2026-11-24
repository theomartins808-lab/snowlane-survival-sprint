import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  survival_seconds: number;
  distance_meters: number;
  end_reason: "coin" | "crash";
  created_at: string;
}

export async function fetchTopLeaderboard(limit = 15): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard_scores")
    .select("id, player_name, survival_seconds, distance_meters, end_reason, created_at")
    .order("survival_seconds", { ascending: false })
    .order("distance_meters", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    player_name: row.player_name,
    survival_seconds: Number(row.survival_seconds),
    distance_meters: Number(row.distance_meters),
    end_reason: row.end_reason === "crash" ? "crash" : "coin",
    created_at: row.created_at,
  }));
}

export async function submitLeaderboardScore(input: {
  playerName: string;
  survivalSeconds: number;
  distanceMeters: number;
  endReason: "coin" | "crash";
}): Promise<LeaderboardEntry> {
  const cleanName = input.playerName.trim().slice(0, 20);
  if (cleanName.length < 1) {
    throw new Error("Digite um apelido para entrar no ranking.");
  }
  const safeSeconds = Math.max(0.1, Number(input.survivalSeconds.toFixed(2)));
  const safeDistance = Math.max(0, Math.floor(input.distanceMeters));

  const { data, error } = await supabase
    .from("leaderboard_scores")
    .insert({
      player_name: cleanName,
      survival_seconds: safeSeconds,
      distance_meters: safeDistance,
      end_reason: input.endReason,
    })
    .select("id, player_name, survival_seconds, distance_meters, end_reason, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível salvar no ranking.");
  }

  return {
    id: data.id,
    player_name: data.player_name,
    survival_seconds: Number(data.survival_seconds),
    distance_meters: Number(data.distance_meters),
    end_reason: data.end_reason === "crash" ? "crash" : "coin",
    created_at: data.created_at,
  };
}