import { useEffect, useState } from "react";
import { Trophy, X, RefreshCw } from "lucide-react";
import { fetchTopLeaderboard, type LeaderboardEntry } from "../leaderboard";
import { formatTimer } from "../sim/types";
import type { LocalRecord } from "../storage";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  localRecord: LocalRecord;
  highlightId?: string | null;
}

export function LeaderboardModal({ open, onClose, localRecord, highlightId }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchTopLeaderboard(15);
      setEntries(rows);
    } catch {
      setError("Não foi possível carregar o ranking online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4">
      <div className="hud-panel flex max-h-[85vh] w-full max-w-md flex-col rounded-md p-5 text-foreground">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="font-display text-base tracking-wide text-gold">RANKING ONLINE</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void load()}
              aria-label="Atualizar ranking"
              className="rounded border border-border bg-secondary/80 p-1.5 text-foreground transition-colors hover:bg-secondary"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar ranking"
              className="rounded border border-border bg-secondary/80 p-1.5 text-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded bg-secondary/70 px-3 py-2 text-xs sm:text-sm">
          <span className="text-muted-foreground">Seu melhor tempo local</span>
          <span className="font-display text-gold">
            {formatTimer(localRecord.bestTime)} · {localRecord.bestDistance}m
          </span>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          {loading && entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando ranking...</p>
          ) : error ? (
            <p className="py-6 text-center text-sm text-destructive">{error}</p>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Ainda ninguém entrou no ranking. Jogue e salve o primeiro recorde!
            </p>
          ) : (
            <ol className="space-y-1.5">
              {entries.map((entry, idx) => {
                const isMine = highlightId === entry.id;
                return (
                  <li
                    key={entry.id}
                    className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
                      isMine
                        ? "border border-gold bg-gold/20"
                        : idx === 0
                          ? "bg-gold/15"
                          : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`w-6 text-center font-display text-xs ${
                          idx === 0 ? "text-gold" : "text-muted-foreground"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="truncate font-bold">{entry.player_name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">{entry.distance_meters}m</span>
                      <span className="font-display text-sm text-foreground">
                        {formatTimer(entry.survival_seconds)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}