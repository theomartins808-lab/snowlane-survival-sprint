import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { signInWithNick, signUpWithNick, type PlayerProfile } from "../account";

interface AuthGateProps {
  onAuthenticated: (profile: PlayerProfile) => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const profile =
        mode === "register"
          ? await signUpWithNick(nick, password)
          : await signInWithNick(nick, password);
      onAuthenticated(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar na conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-background/55 p-4 backdrop-blur-[2px]">
      <div className="hud-panel my-auto flex w-full max-w-sm flex-col items-center rounded-md px-5 py-6 text-center">
        <span className="rounded bg-primary/25 px-3 py-1 font-display text-[11px] tracking-widest text-gold uppercase">
          NÃO PEGUE A MOEDA!
        </span>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground drop-shadow-[0_4px_0_rgba(8,14,32,0.9)]">
          thzinkkj
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Entre com seu Nick e senha para salvar personagem, mapa e recorde.
        </p>

        <div className="mt-4 grid w-full grid-cols-2 gap-1.5 rounded bg-secondary/70 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`rounded py-2 font-display text-xs transition ${
              mode === "login"
                ? "bg-pine text-pine-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ENTRAR
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`rounded py-2 font-display text-xs transition ${
              mode === "register"
                ? "bg-pine text-pine-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CRIAR CONTA
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex w-full flex-col gap-3 text-left">
          <div>
            <label htmlFor="player-nick" className="mb-1 block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Nick
            </label>
            <input
              id="player-nick"
              type="text"
              autoComplete="username"
              maxLength={20}
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Ex: thzin_pro"
              className="w-full rounded border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="player-pass" className="mb-1 block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Senha
            </label>
            <input
              id="player-pass"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
            />
          </div>

          {mode === "register" && (
            <p className="text-[11px] leading-snug text-muted-foreground">
              Guarde sua senha: o acesso usa só Nick e senha (sem recuperação por e-mail).
            </p>
          )}

          {error && <p className="rounded bg-destructive/20 px-3 py-2 text-xs font-semibold text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="voxel-btn mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm text-gold-foreground disabled:opacity-60"
          >
            {mode === "register" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading ? "ENTRANDO..." : mode === "register" ? "CRIAR CONTA" : "ENTRAR NO JOGO"}
          </button>
        </form>
      </div>
    </div>
  );
}