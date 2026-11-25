import { useEffect, useState } from "react";
import { Play, RotateCcw, Trophy, Send, Check, LogOut } from "lucide-react";
import { CHARACTERS, MAPS, type CharacterId, type MapId } from "../catalog";
import { submitLeaderboardScore } from "../leaderboard";
import { formatTimer, type GameOverReason, type GamePhase } from "../sim/types";
import { loadSavedNickname, saveNickname, type LocalRecord } from "../storage";

interface OverlaysProps {
  phase: GamePhase;
  reason: GameOverReason;
  elapsed: number;
  distance: number;
  isNewBest: boolean;
  localRecord: LocalRecord;
  accountNick: string;
  character: CharacterId;
  mapId: MapId;
  onSelectCharacter: (id: CharacterId) => void;
  onSelectMap: (id: MapId) => void;
  onSignOut: () => void;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenLeaderboard: (highlightId?: string | null) => void;
}

export function Overlays({
  phase,
  reason,
  elapsed,
  distance,
  isNewBest,
  localRecord,
  accountNick,
  character,
  mapId,
  onSelectCharacter,
  onSelectMap,
  onSignOut,
  onStart,
  onResume,
  onRestart,
  onOpenLeaderboard,
}: OverlaysProps) {
  const [nickname, setNickname] = useState(() => accountNick || loadSavedNickname());
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (accountNick) setNickname(accountNick);
  }, [accountNick]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nickname.trim();
    if (!clean) {
      setSubmitError("Digite seu apelido.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      saveNickname(clean);
      const saved = await submitLeaderboardScore({
        playerName: clean,
        survivalSeconds: elapsed,
        distanceMeters: distance,
        endReason: reason === "crash" ? "crash" : "coin",
      });
      setSubmittedId(saved.id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar no ranking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "menu") {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-background/45 p-3 backdrop-blur-[1px]">
        <div className="hud-panel my-auto flex w-full max-w-md flex-col items-center rounded-md px-5 py-5 text-center sm:px-6 sm:py-6">
          <div className="mb-2 flex w-full items-center justify-between text-xs">
            <span className="truncate font-bold text-foreground">@{accountNick}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1 rounded bg-secondary/80 px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
          <span className="rounded bg-primary/25 px-3 py-1 font-display text-[11px] tracking-widest text-gold uppercase">
            NÃO PEGUE A MOEDA!
          </span>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground drop-shadow-[0_4px_0_rgba(8,14,32,0.9)] sm:text-5xl">
            thzinkkj
          </h1>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
            <strong className="text-foreground">Desvie de todas as moedas</strong> e pule em cima de trens e obstáculos!
          </p>

          <div className="mt-4 w-full text-left">
            <p className="mb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Personagem
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {CHARACTERS.map((c) => {
                const selected = c.id === character;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCharacter(c.id)}
                    className={`flex items-center justify-center gap-1.5 rounded border px-2 py-1.5 text-xs font-bold transition ${
                      selected
                        ? "border-gold bg-gold/20 text-foreground"
                        : "border-border/70 bg-secondary/75 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-xs" style={{ backgroundColor: c.accent }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 w-full text-left">
            <p className="mb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Mapa
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {MAPS.map((m) => {
                const selected = m.id === mapId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMap(m.id)}
                    className={`flex items-center justify-center gap-1.5 rounded border px-2 py-1.5 text-xs font-bold transition ${
                      selected
                        ? "border-gold bg-gold/20 text-foreground"
                        : "border-border/70 bg-secondary/75 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-xs" style={{ backgroundColor: m.accent }} />
                    <span className="truncate">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="voxel-btn mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-pine px-6 py-3 text-lg text-pine-foreground"
          >
            <Play className="h-5 w-5 fill-current" />
            JOGAR
          </button>

          <button
            type="button"
            onClick={() => onOpenLeaderboard(null)}
            className="voxel-btn mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-5 py-2.5 text-xs text-gold"
          >
            <Trophy className="h-4 w-4" />
            RANKING ONLINE
            {localRecord.bestTime > 0 ? ` · RECORDE ${formatTimer(localRecord.bestTime)}` : ""}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "paused") {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/65 p-4 backdrop-blur-xs">
        <div className="hud-panel flex w-full max-w-xs flex-col items-center rounded-md p-6 text-center">
          <h2 className="font-display text-2xl text-foreground">PAUSADO</h2>
          <p className="mt-1 text-xs text-muted-foreground">Tempo atual: {formatTimer(elapsed)}</p>
          <button
            type="button"
            onClick={onResume}
            className="voxel-btn mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-pine px-5 py-3 text-sm text-pine-foreground"
          >
            <Play className="h-4 w-4 fill-current" />
            CONTINUAR
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmittedId(null);
              onRestart();
            }}
            className="voxel-btn mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-5 py-2.5 text-xs text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            REINICIAR
          </button>
        </div>
      </div>
    );
  }

  if (phase === "gameover") {
    const isCoin = reason === "coin";
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/65 p-4 backdrop-blur-[2px]">
        <div className="hud-panel flex w-full max-w-md flex-col items-center rounded-md px-5 py-6 text-center">
          <h2
            className={`font-display text-xl leading-snug sm:text-2xl ${
              isCoin ? "text-destructive" : "text-gold"
            }`}
          >
            {isCoin ? "VOCÊ PEGOU UMA MOEDA! TEMPO PARADO!" : "VOCÊ BATEU!"}
          </h2>

          <div className="mt-4 flex w-full items-center justify-around rounded bg-secondary/70 py-3">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                TEMPO FINAL
              </p>
              <p className="font-display text-3xl text-foreground">{formatTimer(elapsed)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                DISTÂNCIA
              </p>
              <p className="font-display text-xl text-gold">{Math.floor(distance)} m</p>
            </div>
          </div>

          {isNewBest && elapsed >= 1 && (
            <p className="mt-2.5 rounded bg-gold/20 px-3 py-1 font-display text-xs text-gold">
              NOVO RECORDE PESSOAL!
            </p>
          )}

          {/* Enviar para o Ranking Online */}
          {elapsed >= 0.5 && (
            <form onSubmit={(e) => void handleSubmitScore(e)} className="mt-4 w-full">
              {submittedId ? (
                <div className="flex items-center justify-center gap-2 rounded bg-pine/25 px-3 py-2 text-xs font-bold text-pine-foreground">
                  <Check className="h-4 w-4 text-gold" />
                  Tempo salvo no Ranking Online!
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Seu apelido no ranking"
                    className="min-w-0 flex-1 rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="voxel-btn flex shrink-0 items-center gap-1.5 rounded bg-gold px-3.5 py-2 text-xs text-gold-foreground disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {submitting ? "..." : "SALVAR"}
                  </button>
                </div>
              )}
              {submitError && <p className="mt-1.5 text-xs text-destructive">{submitError}</p>}
            </form>
          )}

          <div className="mt-5 flex w-full gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSubmittedId(null);
                setSubmitError(null);
                onRestart();
              }}
              className="voxel-btn flex flex-1 items-center justify-center gap-2 rounded-md bg-pine px-4 py-3 text-xs text-pine-foreground sm:text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              JOGAR NOVAMENTE
            </button>
            <button
              type="button"
              onClick={() => onOpenLeaderboard(submittedId)}
              className="voxel-btn flex items-center justify-center gap-1.5 rounded-md bg-secondary px-4 py-3 text-xs text-gold sm:text-sm"
            >
              <Trophy className="h-4 w-4" />
              RECORDE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}