CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nick TEXT NOT NULL,
  nick_normalized TEXT NOT NULL UNIQUE,
  character_id TEXT NOT NULL DEFAULT 'thzin',
  map_id TEXT NOT NULL DEFAULT 'natal',
  best_time DOUBLE PRECISION NOT NULL DEFAULT 0,
  best_distance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_player_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nick TEXT;
  v_norm TEXT;
BEGIN
  v_nick := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nick'), ''), split_part(NEW.email, '@', 1));
  v_norm := COALESCE(NULLIF(LOWER(TRIM(NEW.raw_user_meta_data->>'nick_normalized')), ''), LOWER(REGEXP_REPLACE(v_nick, '[^a-zA-Z0-9_]', '', 'g')));
  IF v_norm = '' THEN
    v_norm := 'player_' || LEFT(NEW.id::text, 8);
  END IF;
  INSERT INTO public.profiles (id, nick, nick_normalized)
  VALUES (LEFT(v_nick, 20), LEFT(v_nick, 20), v_norm)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_player_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_player_profile();