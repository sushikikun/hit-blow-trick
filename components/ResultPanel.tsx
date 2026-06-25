import { CardTile } from "@/components/CardTile";
import { GuessHistory } from "@/components/GuessHistory";
import { THEME_LABELS } from "@/lib/game";
import type { Card, GuessRecord, Theme, Winner } from "@/lib/types";

type ResultPanelProps = {
  winner: Winner;
  round: number;
  theme: Theme;
  player1Answer: Card[];
  player2Answer: Card[];
  records: GuessRecord[];
  copied: boolean;
  onCopy: () => void;
  onPlayAgain: () => void;
  onBackHome: () => void;
};

function resultText(winner: Winner) {
  if (winner === "player1") {
    return "Player 1の勝利！";
  }

  if (winner === "player2") {
    return "Player 2の勝利！";
  }

  return "引き分け。同じラウンドで解読しました";
}

export function ResultPanel({
  winner,
  round,
  theme,
  player1Answer,
  player2Answer,
  records,
  copied,
  onCopy,
  onPlayAgain,
  onBackHome,
}: ResultPanelProps) {
  const player1Records = records.filter((record) => record.player === "player1");
  const player2Records = records.filter((record) => record.player === "player2");
  const safeRound = Math.max(1, round);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-zinc-950 px-3 py-4 text-white sm:py-7">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(220,38,38,0.34),transparent_11rem),radial-gradient(circle_at_84%_18%,rgba(37,99,235,0.28),transparent_10rem),radial-gradient(circle_at_20%_82%,rgba(22,163,74,0.24),transparent_11rem),radial-gradient(circle_at_86%_78%,rgba(147,51,234,0.24),transparent_10rem),#06060a]" />
      <section className="mx-auto w-full max-w-[430px] rounded-[14px] border border-white/10 bg-black/65 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.55)] backdrop-blur sm:p-6">
        <p className="text-xs font-black uppercase text-zinc-400">Result</p>
        <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
          {resultText(winner)}
        </h1>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-zinc-300">
            お題: <span className="text-white">{THEME_LABELS[theme]}</span>
          </p>
          <p className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-zinc-300">
            Round: <span className="text-white">{safeRound}</span>
          </p>
        </div>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            className="rounded-[10px] border border-red-200/20 bg-red-600 px-4 py-3 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_20px_rgba(220,38,38,0.28)] transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
            onClick={onCopy}
          >
            {copied ? "コピー済み" : "結果をコピー"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={onPlayAgain}
          >
            もう一度遊ぶ
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={onBackHome}
          >
            トップに戻る
          </button>
        </div>
      </section>

      <section className="mx-auto mt-5 grid w-full max-w-[430px] gap-4">
        <div className="rounded-[14px] border border-white/10 bg-black/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur sm:p-5">
          <h2 className="mb-3 text-lg font-black text-white">Player 1 の正解カード</h2>
          <div className="grid grid-cols-4 gap-2">
            {player1Answer.map((card) => (
              <CardTile key={card.id} card={card} size="mini" />
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border border-white/10 bg-black/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur sm:p-5">
          <h2 className="mb-3 text-lg font-black text-white">Player 2 の正解カード</h2>
          <div className="grid grid-cols-4 gap-2">
            {player2Answer.map((card) => (
              <CardTile key={card.id} card={card} size="mini" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid w-full max-w-[430px] gap-4">
        <div className="rounded-[14px] border border-white/10 bg-black/60 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur sm:p-5">
          <h2 className="mb-1 text-lg font-black text-white">Player 1 の予想履歴</h2>
          <GuessHistory records={player1Records} />
        </div>

        <div className="rounded-[14px] border border-white/10 bg-black/60 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur sm:p-5">
          <h2 className="mb-1 text-lg font-black text-white">Player 2 の予想履歴</h2>
          <GuessHistory records={player2Records} />
        </div>
      </section>
    </main>
  );
}
