import type { CSSProperties } from "react";
import { COLOR_LABELS } from "@/lib/cards";
import { colorVar } from "@/lib/color-theme";
import type { Card } from "@/lib/types";

type CardTileSize = "normal" | "slot" | "mini" | "history" | "historyCompact" | "historyTiny" | "historyMicro";

type CardTileProps = {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
  size?: CardTileSize;
  className?: string;
  onSelect?: (card: Card) => void;
};

const tileSizeClass: Record<CardTileSize, string> = {
  normal: "min-h-24 text-[2.65rem] sm:min-h-28 sm:text-5xl",
  slot: "min-h-[4.15rem] text-[2.75rem] sm:min-h-[4.35rem] sm:text-[2.9rem]",
  mini: "min-h-12 text-xl sm:min-h-14 sm:text-2xl",
  history: "min-h-[2.65rem] text-[1.55rem]",
  historyCompact: "min-h-[2.25rem] text-[1.25rem]",
  historyTiny: "min-h-[1.9rem] text-[1.02rem]",
  historyMicro: "min-h-[1.58rem] text-[0.82rem]",
};

export function CardTile({
  card,
  selected = false,
  disabled = false,
  size = "normal",
  className = "",
  onSelect,
}: CardTileProps) {
  const style: CSSProperties = {
    backgroundColor: colorVar(card.backgroundColor),
    backgroundImage: "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.28), transparent 28%), linear-gradient(145deg, rgba(255,255,255,0.3), rgba(255,255,255,0.02) 44%, rgba(0,0,0,0.22))",
    color: colorVar(card.textColor),
  };
  const ariaLabel = `${COLOR_LABELS[card.label]}、文字色${COLOR_LABELS[card.textColor]}、背景色${COLOR_LABELS[card.backgroundColor]}`;
  const classes = [
    "card-surface relative grid aspect-square w-full place-items-center overflow-hidden rounded-[11px] border border-white/35 shadow-[0_7px_12px_rgba(0,0,0,0.38)] transition",
    tileSizeClass[size],
    selected ? "brightness-90 ring-2 ring-white ring-offset-2 ring-offset-black shadow-[0_0_18px_rgba(255,255,255,0.45)]" : "",
    disabled ? "cursor-not-allowed opacity-45" : "hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_18px_rgba(0,0,0,0.45)]",
    onSelect
      ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <span className="color-card-label relative z-10 translate-y-0.5">
      {COLOR_LABELS[card.label]}
    </span>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={selected}
        className={classes}
        data-background-color={card.backgroundColor}
        data-card-id={card.id}
        data-card-size={size}
        data-label={card.label}
        data-text-color={card.textColor}
        disabled={disabled}
        style={style}
        onClick={() => onSelect(card)}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      aria-label={ariaLabel}
      className={classes}
      data-background-color={card.backgroundColor}
      data-card-id={card.id}
      data-card-size={size}
      data-label={card.label}
      data-text-color={card.textColor}
      role="img"
      style={style}
    >
      {content}
    </div>
  );
}
