import { CardTile } from "@/components/CardTile";
import type { GuessRecord } from "@/lib/types";

type GuessHistoryProps = {
  records: GuessRecord[];
  showCards?: boolean;
  emptyText?: string;
};

function displayRound(round: number) {
  return Math.max(1, round);
}

function historyVariant(index: number) {
  if (index === 0) {
    return "latest";
  }

  if (index <= 2) {
    return "standard";
  }

  if (index <= 5) {
    return "compact";
  }

  return "tiny";
}

const historyStyles = {
  latest: {
    row: "min-h-[66px] p-1.5 border-red-300/70 shadow-[0_0_20px_rgba(220,38,38,0.34)]",
    columns: "grid-cols-[2.7rem_minmax(0,1fr)_4rem]",
    gap: "gap-1",
    roundLabel: "text-[0.66rem]",
    roundNumber: "text-2xl",
    cardSize: "history",
    cardBox: "w-[2.65rem]",
    resultBox: "px-1 py-0.5",
    resultText: "text-[0.66rem]",
    resultNumber: "text-lg",
    divider: "my-0.5",
    resultMode: "full",
  },
  standard: {
    row: "min-h-[48px] p-1 border-white/10",
    columns: "grid-cols-[2.35rem_minmax(0,1fr)_3.55rem]",
    gap: "gap-1",
    roundLabel: "text-[0.58rem]",
    roundNumber: "text-xl",
    cardSize: "historyCompact",
    cardBox: "w-[2.25rem]",
    resultBox: "px-1 py-0.5",
    resultText: "text-[0.6rem]",
    resultNumber: "text-base",
    divider: "my-0.5",
    resultMode: "short",
  },
  compact: {
    row: "min-h-[38px] p-1 border-white/10 opacity-[0.88]",
    columns: "grid-cols-[2.05rem_minmax(0,1fr)_3.15rem]",
    gap: "gap-0.5",
    roundLabel: "text-[0.5rem]",
    roundNumber: "text-lg",
    cardSize: "historyTiny",
    cardBox: "w-[1.9rem]",
    resultBox: "px-1 py-0.5",
    resultText: "text-[0.54rem]",
    resultNumber: "text-sm",
    divider: "my-0",
    resultMode: "short",
  },
  tiny: {
    row: "min-h-[32px] p-[3px] border-white/10 opacity-75",
    columns: "grid-cols-[1.85rem_minmax(0,1fr)_2.8rem]",
    gap: "gap-0.5",
    roundLabel: "text-[0.46rem]",
    roundNumber: "text-base",
    cardSize: "historyMicro",
    cardBox: "w-[1.58rem]",
    resultBox: "px-0.5 py-0.5",
    resultText: "text-[0.48rem]",
    resultNumber: "text-xs",
    divider: "my-0",
    resultMode: "micro",
  },
} as const;

export function GuessHistory({
  records,
  showCards = true,
  emptyText = "まだ予想はありません",
}: GuessHistoryProps) {
  if (records.length === 0) {
    if (!showCards) {
      return (
        <div className="rounded-md border border-dashed border-white/15 bg-white/5 px-2 py-2 text-center text-[0.7rem] font-bold text-zinc-300">
          {emptyText}
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-4 py-4 text-center text-sm text-zinc-300">
        {emptyText}
      </div>
    );
  }

  const orderedRecords = [...records].reverse();

  if (!showCards) {
    const visibleRecords = orderedRecords.slice(0, 3);
    const extraCount = Math.max(0, orderedRecords.length - visibleRecords.length);

    return (
      <div className="grid gap-1" data-opponent-summary>
        {visibleRecords.map((record, index) => (
          <div
            key={`${record.player}-${record.round}-${index}`}
            className="grid grid-cols-[1.65rem_1fr] items-center gap-1 rounded-md border border-white/10 bg-black/55 px-1 py-1 text-[0.68rem] font-black text-zinc-100 shadow-inner shadow-black/25"
          >
            <span className="rounded bg-white/15 px-0.5 py-0.5 text-center text-white">
              R{displayRound(record.round)}
            </span>
            <span className="whitespace-nowrap text-right">
              <span className="text-red-400">{record.result.hit}H</span>
              <span className="mx-1 text-white/45">/</span>
              <span className="text-yellow-300">{record.result.blow}B</span>
            </span>
          </div>
        ))}
        {extraCount > 0 ? (
          <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-center text-[0.66rem] font-black text-zinc-300">
            他{extraCount}件
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <ol className="space-y-1.5" data-own-history>
      {orderedRecords.map((record, index) => {
        const variant = historyVariant(index);
        const styles = historyStyles[variant];
        const isLatest = variant === "latest";

        return (
          <li
            key={`${record.player}-${record.round}-${index}`}
            className={[
              "history-row-surface relative rounded-lg border text-white backdrop-blur",
              isLatest ? "history-new" : "",
              styles.row,
            ]
              .filter(Boolean)
              .join(" ")}
            data-history-row
            data-history-size={variant}
          >
            <div className={["grid items-center gap-2", styles.columns].join(" ")}>
              {isLatest ? (
                <span className="absolute left-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[0.54rem] font-black leading-none text-white shadow-[0_0_12px_rgba(239,68,68,0.55)]">
                  最新
                </span>
              ) : null}
              <div className="text-center">
                <p className={[styles.roundLabel, "font-black text-zinc-300"].join(" ")}>
                  Round
                </p>
                <p className={[styles.roundNumber, "font-black leading-none"].join(" ")}>
                  {displayRound(record.round)}
                </p>
              </div>

              <div className={["grid grid-cols-4 justify-items-center", styles.gap].join(" ")}>
                {record.displayCards.map((card, cardIndex) => (
                  <div key={`${card.id}-${cardIndex}`} className={["max-w-full", styles.cardBox].join(" ")}>
                    <CardTile
                      card={card}
                      className={variant === "tiny" ? "opacity-85" : ""}
                      size={styles.cardSize}
                    />
                  </div>
                ))}
              </div>

              <div className={["rounded-lg border border-white/15 bg-black/50 text-center shadow-inner shadow-black/30", styles.resultBox].join(" ")}>
                {styles.resultMode === "full" ? (
                  <>
                    <p className={[styles.resultText, "font-black leading-tight"].join(" ")}>
                      <span className={[styles.resultNumber, "text-red-400"].join(" ")}>
                        {record.result.hit}
                      </span>{" "}
                      HIT
                    </p>
                    <div className={[styles.divider, "h-px bg-white/15"].join(" ")} />
                    <p className={[styles.resultText, "font-black leading-tight"].join(" ")}>
                      <span className={[styles.resultNumber, "text-yellow-300"].join(" ")}>
                        {record.result.blow}
                      </span>{" "}
                      BLOW
                    </p>
                  </>
                ) : (
                  <p className={[styles.resultText, "whitespace-nowrap font-black leading-tight"].join(" ")}>
                    <span className={[styles.resultNumber, "text-red-400"].join(" ")}>{record.result.hit}H</span>
                    <span className="mx-0.5 text-white/45">/</span>
                    <span className={[styles.resultNumber, "text-yellow-300"].join(" ")}>{record.result.blow}B</span>
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
