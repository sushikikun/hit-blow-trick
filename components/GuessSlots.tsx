import { CardTile } from "@/components/CardTile";
import type { Card } from "@/lib/types";

type GuessSlotsProps = {
  cards: Card[];
  locked?: boolean;
  onRemove: (index: number) => void;
};

export function GuessSlots({ cards, locked = false, onRemove }: GuessSlotsProps) {
  return (
    <div className="grid grid-cols-4 justify-items-center gap-2">
      {Array.from({ length: 4 }).map((_, index) => {
        const card = cards[index];

        if (!card) {
          return (
            <div
              key={index}
              className="relative grid size-[4.15rem] place-items-center overflow-hidden rounded-[12px] border border-white/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.025)_44%,rgba(0,0,0,0.36))] text-2xl font-black text-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_0_20px_rgba(0,0,0,0.46),0_8px_16px_rgba(0,0,0,0.3)] sm:size-[4.35rem]"
            >
              <span className="pointer-events-none absolute inset-x-2 top-1 h-px bg-white/20" aria-hidden="true" />
              <span className="absolute left-2 top-1.5 text-[0.62rem] font-black text-white/50">
                {index + 1}
              </span>
              <span aria-hidden="true">-</span>
            </div>
          );
        }

        return (
          <div key={`${card.id}-${index}`} className="relative w-[4.15rem] sm:w-[4.35rem]">
            <span className="absolute left-1.5 top-1.5 z-20 rounded-full bg-black/65 px-1.5 py-0.5 text-[0.6rem] font-black text-white shadow-sm">
              {index + 1}
            </span>
            <CardTile
              card={card}
              className="ring-1 ring-white/35 shadow-[0_0_16px_rgba(255,255,255,0.14),0_8px_16px_rgba(0,0,0,0.35)] active:translate-y-0.5"
              size="slot"
              onSelect={locked ? undefined : () => onRemove(index)}
            />
          </div>
        );
      })}
    </div>
  );
}
