<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Game architecture & debug hooks

- Pure simulation lives in `src/game/sim/` with zero React or Three.js imports so rules and collisions are verified via Vitest (`src/game/sim/engine.test.ts`).
- `src/routes/index.tsx` mounts with `ssr: false` and drives one `<Canvas>` via a single `useFrame` stepper in `src/game/scene/GameScene.tsx`, keeping per-frame state in refs and entity pools to avoid React re-renders.
- Ready signal: `main[data-scene-ready="1"]` is set after the first rendered 3D frame.
- Dev-only `window.__game` exposes `{ state, start(), action(dir), sim(seconds), audio() }` for deterministic scripted verification.
- Online leaderboard scores are stored in `public.leaderboard_scores` via Lovable Cloud (`src/game/leaderboard.ts`) alongside local best records in `localStorage` (`src/game/storage.ts`).
