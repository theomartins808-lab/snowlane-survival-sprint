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
  VALUES (NEW.id, LEFT(v_nick, 20), v_norm)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;