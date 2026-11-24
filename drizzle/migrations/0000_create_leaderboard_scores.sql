CREATE TABLE public.leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL CHECK (char_length(trim(player_name)) BETWEEN 1 AND 20),
  survival_seconds NUMERIC(10, 2) NOT NULL CHECK (survival_seconds > 0 AND survival_seconds <= 86400),
  distance_meters INTEGER NOT NULL DEFAULT 0 CHECK (distance_meters >= 0 AND distance_meters <= 1000000),
  end_reason TEXT NOT NULL DEFAULT 'coin' CHECK (end_reason IN ('coin', 'crash')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leaderboard_scores_best
  ON public.leaderboard_scores (survival_seconds DESC, distance_meters DESC, created_at ASC);

GRANT SELECT, INSERT ON public.leaderboard_scores TO anon, authenticated;
GRANT ALL ON public.leaderboard_scores TO service_role;

ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard scores"
  ON public.leaderboard_scores
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit a valid score"
  ON public.leaderboard_scores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(player_name)) BETWEEN 1 AND 20
    AND survival_seconds > 0
    AND survival_seconds <= 86400
    AND distance_meters >= 0
  );