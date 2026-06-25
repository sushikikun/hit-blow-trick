import { CardTile } from "@/components/CardTile";
import type { Card, GuessMarker } from "@/lib/types";

type GuessMarkerGridProps = {
  cards: Card[];
  markers: GuessMarker[];
  compact?: boolean;
};

const markerLabel: Record<GuessMarker, string> = {
  hit: "HIT",
  blow: "BLOW",
  miss: "MISS",
};

const markerClass: Record<GuessMarker, string> = {
  hit: "border-red-300 bg-red-500 text-white shadow-red-950/25",
  blow: "border-yellow-200 bg-yellow-300 text-zinc-950 shadow-yellow-950/20",
  miss: "border-zinc-500 bg-zinc-700 text-zinc-100 shadow-zinc-950/20",
};

export function GuessMarkerGrid({ cards, markers, compact = false }: GuessMarkerGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {cards.map((card, index) => {
        const marker = markers[index] ?? "miss";

        return (
          <div key={`${card.id}-${index}`} className="min-w-0">
            <p className="mb-1 text-center text-[11px] font-black text-zinc-300">
              {index + 1}
            </p>
            <CardTile card={card} size="mini" />
            <p
              className={[
                "mt-1 rounded-full border px-1.5 py-1 text-center text-[10px] font-black shadow-sm",
                compact ? "tracking-normal" : "",
                markerClass[marker],
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {markerLabel[marker]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
