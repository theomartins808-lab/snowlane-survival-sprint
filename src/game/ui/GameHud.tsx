import { Pause, Play } from "lucide-react";
import { formatTimer, type GameOverReason, type GamePhase } from "../sim/types";

interface GameHudProps {
  phase: GamePhase;
  reason: GameOverReason;
  elapsed: number;
  distance: number;
  bestTime: number;
  coinFlashActive: boolean;
  activeKey: string | null;
  onTogglePause: () => void;
}

export function GameHud({
  phase,
  reason,
  elapsed,
  distance,
  bestTime,
  coinFlashActive,
  activeKey,
  onTogglePause,
}: GameHudProps) {
  const coinFrozen = phase === "gameover" && reason === "coin";
  const showHud = phase === "playing" || phase === "paused" || phase === "gameover";

  if (!showHud) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* Flash vermelho ao pegar moeda */}
      {coinFlashActive && <div className="coin-red-flash pointer-events-none fixed inset-0 z-30" />}

      {/* Topo: Pause | Cronômetro central | Recorde & Distância */}
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2">
        <button
          type="button"
          onClick={onTogglePause}
          disabled={phase === "gameover"}
          aria-label={phase === "paused" ? "Continuar jogo" : "Pausar jogo"}
          className="hud-panel pointer-events-auto flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-transform active:scale-95 disabled:opacity-40 sm:h-11 sm:w-11"
        >
          {phase === "paused" ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </button>

        {/* Cronômetro grande branco no topo centro */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`font-display text-4xl leading-none tracking-wider [text-shadow:0_4px_0_rgba(8,14,32,0.85)] sm:text-6xl ${
              coinFrozen ? "timer-frozen-shake text-destructive" : "text-foreground"
            }`}
          >
            {formatTimer(elapsed)}
          </div>
          <p
            className={`mt-1 rounded px-2.5 py-0.5 font-display text-[10px] tracking-wider sm:text-xs ${
              coinFrozen
                ? "bg-destructive text-destructive-foreground"
                : "bg-hud-surface text-gold"
            }`}
          >
            {coinFrozen ? "VOCÊ PEGOU UMA MOEDA! TEMPO PARADO!" : "NÃO PEGUE A MOEDA!"}
          </p>
        </div>

        {/* Canto superior direito: Melhor tempo salvo + Distância */}
        <div className="hud-panel flex flex-col items-end rounded-md px-2.5 py-1.5 text-right sm:px-3.5 sm:py-2">
          <span className="text-[10px] font-bold tracking-wider text-gold uppercase">
            RECORDE {formatTimer(Math.max(bestTime, elapsed))}
          </span>
          <span className="font-display text-xs text-foreground sm:text-sm">
            {Math.floor(distance)} m
          </span>
        </div>
      </div>

      {/* Canto inferior esquerdo: Guia WASD */}
      <div className="flex items-end justify-between">
        <div className="hud-panel flex flex-col items-center gap-1 rounded-md p-2 text-foreground">
          <KeyCap label="W" active={activeKey === "jump"} title="Pular" />
          <div className="flex gap-1">
            <KeyCap label="A" active={activeKey === "left"} title="Esquerda" />
            <KeyCap label="S" active={activeKey === "duck"} title="Abaixar" />
            <KeyCap label="D" active={activeKey === "right"} title="Direita" />
          </div>
          <span className="mt-0.5 text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
            WASD / SWIPE
          </span>
        </div>
      </div>
    </div>
  );
}

function KeyCap({ label, active, title }: { label: string; active: boolean; title: string }) {
  return (
    <span
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded border font-display text-xs transition-colors sm:h-8 sm:w-8 ${
        active
          ? "border-gold bg-gold text-gold-foreground"
          : "border-hud-border bg-secondary/80 text-foreground"
      }`}
    >
      {label}
    </span>
  );
}