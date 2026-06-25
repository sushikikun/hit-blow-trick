"use client";

import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { CardTile } from "@/components/CardTile";
import { GuessHistory } from "@/components/GuessHistory";
import { GuessSlots } from "@/components/GuessSlots";
import { ResultPanel } from "@/components/ResultPanel";
import { COLOR_LABELS } from "@/lib/cards";
import {
  COLOR_THEME_IDS,
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  type ColorTheme,
  type RgbColor,
  clampRgbChannel,
  colorThemeToCssVariables,
  getReadableTextColor,
  normalizeColorTheme,
  rgbToCss,
  rgbToHex,
} from "@/lib/color-theme";
import {
  ANSWER_LENGTH,
  THEME_LABELS,
  calculateGuessMarkersByValues,
  calculateHitBlowByValues,
  determineRoundResult,
  generateRandomAnswerCards,
  getAttributeValues,
  pickDisplayCardForThemeValue,
  validateGuessValues,
} from "@/lib/game";
import type { Card, ColorId, GameMode, GuessRecord, GuessResult, Player, Theme, Winner } from "@/lib/types";

type Phase = "home" | "theme-select" | "turn" | "result";

type DraftItem = {
  value: ColorId;
  displayCard: Card;
};

const THEME_OPTIONS: Theme[] = ["backgroundColor", "textColor", "label"];
const MODE_OPTIONS: GameMode[] = ["solo", "battle"];
const COLOR_OPTIONS: ColorId[] = ["red", "blue", "yellow", "green", "purple", "brown"];
const TITLE_DOT_COLORS: ColorId[] = ["red", "blue", "brown", "yellow", "green", "purple"];

const BACKGROUND_DOTS = [
  { color: "red", left: "5%", top: "12%", size: 5, opacity: 0.4 },
  { color: "green", left: "11%", top: "19%", size: 8, opacity: 0.25 },
  { color: "yellow", left: "18%", top: "8%", size: 4, opacity: 0.45 },
  { color: "blue", left: "88%", top: "16%", size: 7, opacity: 0.34 },
  { color: "purple", left: "82%", top: "28%", size: 5, opacity: 0.3 },
  { color: "brown", left: "94%", top: "36%", size: 9, opacity: 0.26 },
  { color: "red", left: "14%", top: "45%", size: 10, opacity: 0.24 },
  { color: "blue", left: "6%", top: "58%", size: 5, opacity: 0.32 },
  { color: "yellow", left: "24%", top: "70%", size: 7, opacity: 0.32 },
  { color: "green", left: "91%", top: "66%", size: 6, opacity: 0.32 },
  { color: "purple", left: "78%", top: "82%", size: 9, opacity: 0.22 },
  { color: "brown", left: "8%", top: "86%", size: 6, opacity: 0.34 },
  { color: "red", left: "3%", top: "31%", size: 4, opacity: 0.3 },
  { color: "blue", left: "13%", top: "34%", size: 3, opacity: 0.28 },
  { color: "yellow", left: "4%", top: "41%", size: 5, opacity: 0.26 },
  { color: "green", left: "96%", top: "48%", size: 4, opacity: 0.26 },
  { color: "purple", left: "87%", top: "55%", size: 4, opacity: 0.24 },
  { color: "brown", left: "93%", top: "73%", size: 5, opacity: 0.24 },
  { color: "yellow", left: "16%", top: "92%", size: 4, opacity: 0.28 },
  { color: "blue", left: "86%", top: "92%", size: 3, opacity: 0.3 },
] satisfies Array<{ color: ColorId; left: string; top: string; size: number; opacity: number }>;

const PLAYER_LABELS: Record<Player, string> = {
  player1: "Player 1",
  player2: "Player 2",
};

const THEME_COPY: Record<Theme, string> = {
  backgroundColor: "カード背景色の並びを当てます",
  textColor: "文字そのものの色の並びを当てます",
  label: "書かれている色名の並びを当てます",
};

const MODE_LABELS: Record<GameMode, string> = {
  solo: "ひとりで遊ぶ",
  battle: "ふたりで遊ぶ",
};

const MODE_COPY: Record<GameMode, string> = {
  solo: "自動生成された4枚の並びを解読します",
  battle: "同じお題で交互に答える1対1対戦です",
};

function opponentOf(player: Player): Player {
  return player === "player1" ? "player2" : "player1";
}

function getResultText(winner: Winner) {
  if (winner === "player1") {
    return "Player 1の勝利！";
  }

  if (winner === "player2") {
    return "Player 2の勝利！";
  }

  return "引き分け。同じラウンドで解読しました";
}

function ScreenShell({ children, colorTheme, style }: { children: ReactNode; colorTheme: ColorTheme; style: CSSProperties }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-zinc-950 px-2.5 py-2 text-white sm:py-5" style={style}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(220,38,38,0.22),transparent_10rem),radial-gradient(circle_at_86%_12%,rgba(37,99,235,0.2),transparent_11rem),radial-gradient(circle_at_20%_78%,rgba(22,163,74,0.16),transparent_12rem),radial-gradient(circle_at_84%_82%,rgba(147,51,234,0.18),transparent_10rem),#020204]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:17px_17px]" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        {BACKGROUND_DOTS.map((dot, index) => (
          <span
            key={`${dot.color}-${index}`}
            className="absolute rounded-full blur-[0.2px]"
            style={{
              backgroundColor: rgbToCss(colorTheme[dot.color]),
              height: dot.size,
              left: dot.left,
              opacity: dot.opacity,
              top: dot.top,
              width: dot.size,
            }}
          />
        ))}
      </div>
      <div className="mx-auto w-full max-w-[430px]">{children}</div>
    </main>
  );
}

function ModalShell({
  children,
  title,
  onClose,
  showCloseButton = true,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  showCloseButton?: boolean;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-lg border border-white/15 bg-zinc-950 p-5 text-white shadow-2xl shadow-black/40">
        <h2 className="text-xl font-black">{title}</h2>
        {children}
        {showCloseButton ? (
          <button
            type="button"
            className="mt-5 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
            onClick={onClose}
          >
            閉じる
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ColorValueButton({
  colorTheme,
  value,
  disabled = false,
  onSelect,
}: {
  colorTheme: ColorTheme;
  value: ColorId;
  disabled?: boolean;
  onSelect: (value: ColorId) => void;
}) {
  const buttonColor = colorTheme[value];
  const textColor = getReadableTextColor(buttonColor);

  return (
    <button
      type="button"
      className={[
        "relative min-h-[3.35rem] overflow-hidden rounded-[14px] border border-white/20 px-2 py-2 text-center text-[1.65rem] font-black leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-10px_18px_rgba(0,0,0,0.18),0_8px_14px_rgba(0,0,0,0.34)] transition active:translate-y-[1px] active:shadow-[inset_0_3px_10px_rgba(0,0,0,0.24),0_3px_8px_rgba(0,0,0,0.28)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[0.15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
      ].join(" ")}
      data-color-value={value}
      disabled={disabled}
      style={{
        backgroundColor: rgbToCss(buttonColor),
        backgroundImage:
          "radial-gradient(circle at 22% 0%, rgba(255,255,255,0.38), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.04) 44%, rgba(0,0,0,0.26))",
        color: textColor,
      }}
      onClick={() => onSelect(value)}
    >
      <span className="pointer-events-none absolute inset-x-3 top-1 h-px bg-white/35" aria-hidden="true" />
      <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.42)]">{COLOR_LABELS[value]}</span>
    </button>
  );
}

function TitleDots({ colorTheme, compact = false }: { colorTheme: ColorTheme; compact?: boolean }) {
  return (
    <div className={[compact ? "mt-1 gap-1.5" : "mt-2.5 gap-2.5", "flex justify-center"].join(" ")} aria-hidden="true">
      {TITLE_DOT_COLORS.map((color) => (
        <span
          key={color}
          className={[
            compact ? "size-2" : "size-3",
            "rounded-full shadow-[0_0_11px_rgba(255,255,255,0.3)]",
          ].join(" ")}
          style={{ backgroundColor: rgbToCss(colorTheme[color]) }}
        />
      ))}
    </div>
  );
}

function HomeScreen({
  colorTheme,
  onPlay,
  onSettings,
}: {
  colorTheme: ColorTheme;
  onPlay: () => void;
  onSettings: () => void;
}) {
  return (
    <section className="home-screen relative isolate -mx-2.5 min-h-[calc(100vh-1rem)] overflow-hidden bg-black px-3.5 py-5 text-center">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <span className="home-dot-field home-dot-field-left" />
        <span className="home-dot-field home-dot-field-right" />
        <span className="home-dot-cluster home-dot-red-tl" />
        <span className="home-dot-cluster home-dot-blue-tl" />
        <span className="home-dot-cluster home-dot-yellow-left" />
        <span className="home-dot-cluster home-dot-purple-bl" />
        <span className="home-dot-cluster home-dot-blue-bl" />
        <span className="home-dot-cluster home-dot-red-tr" />
        <span className="home-dot-cluster home-dot-yellow-tr" />
        <span className="home-dot-cluster home-dot-green-right" />
        <span className="home-dot-cluster home-dot-purple-br" />
        <span className="home-dot-cluster home-dot-brown-br" />
        <span className="home-dot-cluster home-dot-top-mist" />
        <span className="home-dot-cluster home-dot-bottom-mist" />
        <span className="home-floating-dot home-floating-dot-blue" />
        <span className="home-floating-dot home-floating-dot-green" />
        <span className="home-floating-dot home-floating-dot-purple" />
        <span className="home-floating-dot home-floating-dot-red" />
        <span className="home-floating-dot home-floating-dot-yellow" />
        <span className="home-floating-dot home-floating-dot-purple-top" />
        <span className="home-floating-dot home-floating-dot-blue-top" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-[414px] flex-col justify-start">
        <div className="pt-7">
          <p className="home-jp-title text-[3.32rem] font-black leading-none tracking-normal text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]">
            ヒット＆ブロー
          </p>
          <h1 className="home-trick-word mt-0.5 text-[6rem] font-black leading-[0.86] tracking-[0.01em] sm:text-[6.15rem]">
            TRICK
          </h1>
          <TitleDots colorTheme={colorTheme} />
        </div>

        <p className="mx-auto mt-6 inline-flex max-w-full flex-nowrap items-center justify-center rounded-full border border-white/22 bg-black/68 px-4 py-3 text-[1.16rem] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.36)]">
          <span className="bg-[linear-gradient(90deg,#ef4444,#2563eb,#facc15,#22c55e,#a855f7)] bg-clip-text text-transparent">
            色
          </span>
          <span>に惑わされる、1対1推理ゲーム。</span>
        </p>

        <div className="mt-7 grid gap-3.5">
          <button
            type="button"
            className="home-play-button rounded-[18px] border border-red-200/30 bg-red-600 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.03)_42%,rgba(0,0,0,0.2))] px-6 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_0_30px_rgba(220,38,38,0.52),0_15px_28px_rgba(0,0,0,0.44)] transition hover:brightness-110 active:translate-y-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
            onClick={onPlay}
          >
            遊ぶ
          </button>
          <button
            type="button"
            className="home-settings-button inline-flex items-center justify-center gap-3 rounded-[17px] border border-white/38 bg-black/55 px-6 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_10px_22px_rgba(0,0,0,0.35)] transition hover:bg-white/10 active:translate-y-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={onSettings}
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              ⚙
            </span>
            設定
          </button>
        </div>

        <article className="mt-7 rounded-[18px] border border-white/16 bg-black/70 p-4 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_28px_rgba(0,0,0,0.36)]">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-2xl font-black">
              ?
            </span>
            <div>
              <h2 className="text-xl font-black">ゲームの遊び方</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-zinc-200">
                お題に応じて、4つのカードを予想します。<br />
                ヒットとブローの数をヒントに、<br />
                相手の並びを推理しましょう。
              </p>
              <div className="mt-4 grid gap-2 text-sm font-black text-zinc-100">
                <p className="flex items-center gap-2">
                  <span className="size-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  ヒット：色も位置も一致
                </p>
                <p className="flex items-center gap-2">
                  <span className="size-4 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.45)]" />
                  ブロー：色は一致するが位置は違う
                </p>
              </div>
            </div>
          </div>
        </article>

        <p className="mt-5 text-sm font-bold text-zinc-500">© 2025 Hit &amp; Blow TRICK</p>
      </div>
    </section>
  );
}

const RGB_CONTROLS = [
  { key: "r", label: "R" },
  { key: "g", label: "G" },
  { key: "b", label: "B" },
] satisfies Array<{ key: keyof RgbColor; label: string }>;

function ColorSettingsModal({
  draftTheme,
  onChangeColor,
  onClose,
  onReset,
  onSave,
}: {
  draftTheme: ColorTheme;
  onChangeColor: (colorId: ColorId, channel: keyof RgbColor, value: number) => void;
  onClose: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <ModalShell title="色の設定" onClose={onClose} showCloseButton={false}>
      <div className="mt-3 max-h-[72vh] overflow-y-auto pr-1 text-sm text-zinc-200">
        <p className="leading-6 text-zinc-300">カードやボタンに使う色味をRGBで調整できます。</p>
        <div className="mt-4 grid gap-3">
          {COLOR_THEME_IDS.map((colorId) => {
            const rgb = draftTheme[colorId];
            const cssColor = rgbToCss(rgb);

            return (
              <section
                key={colorId}
                className="rounded-lg border border-white/10 bg-white/5 p-3 shadow-inner shadow-black/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/25 text-[0.6rem] font-black shadow-[0_0_16px_currentColor]"
                      style={{ backgroundColor: cssColor, color: getReadableTextColor(rgb) }}
                    >
                      {COLOR_LABELS[colorId]}
                    </span>
                    <div>
                      <h3 className="font-black text-white">{COLOR_LABELS[colorId]}</h3>
                      <p className="mt-0.5 font-mono text-[0.68rem] font-bold text-zinc-400">
                        {rgbToHex(rgb).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className="text-right font-mono text-[0.66rem] font-bold leading-4 text-zinc-300">
                    R {rgb.r}<br />G {rgb.g}<br />B {rgb.b}
                  </span>
                </div>

                <div className="mt-3 grid gap-2.5">
                  {RGB_CONTROLS.map((control) => (
                    <label
                      key={control.key}
                      className="grid grid-cols-[1.2rem_minmax(0,1fr)_4.2rem] items-center gap-2 text-xs font-black text-zinc-200"
                    >
                      <span>{control.label}</span>
                      <input
                        type="range"
                        min={0}
                        max={255}
                        step={1}
                        className="h-8 w-full accent-red-500"
                        value={rgb[control.key]}
                        onChange={(event) => onChangeColor(colorId, control.key, Number(event.target.value))}
                      />
                      <input
                        type="number"
                        min={0}
                        max={255}
                        step={1}
                        inputMode="numeric"
                        className="h-9 rounded-md border border-white/15 bg-black/45 px-2 text-right font-mono text-sm font-black text-white outline-none transition focus:border-white/55"
                        value={rgb[control.key]}
                        onChange={(event) => onChangeColor(colorId, control.key, Number(event.target.value))}
                      />
                    </label>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          className="rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
          onClick={onSave}
        >
          保存
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={onReset}
        >
          初期値に戻す
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </ModalShell>
  );
}

function ResultCardStrip({ cards }: { cards: Card[] }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {cards.map((card, index) => (
        <CardTile key={`${card.id}-${index}`} card={card} size="history" />
      ))}
    </div>
  );
}

function ResultSummary({ result, large = false }: { result: GuessResult; large?: boolean }) {
  return (
    <div
      className={[
        "rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-center shadow-inner shadow-black/25",
        large ? "text-base" : "text-xs",
      ].join(" ")}
    >
      <p className="font-black leading-tight">
        <span className={large ? "text-4xl text-red-400" : "text-2xl text-red-400"}>{result.hit}</span>{" "}
        HIT
      </p>
      <div className="my-2 h-px bg-white/15" />
      <p className="font-black leading-tight">
        <span className={large ? "text-4xl text-yellow-300" : "text-2xl text-yellow-300"}>{result.blow}</span>{" "}
        BLOW
      </p>
    </div>
  );
}

export function BattleBoard() {
  const [phase, setPhase] = useState<Phase>("home");
  const [gameMode, setGameMode] = useState<GameMode>("battle");
  const [selectedMode, setSelectedMode] = useState<GameMode>("battle");
  const [theme, setTheme] = useState<Theme>("label");
  const [selectedTheme, setSelectedTheme] = useState<Theme>("label");
  const [colorTheme, setColorTheme] = useState<ColorTheme>(DEFAULT_COLOR_THEME);
  const [draftColorTheme, setDraftColorTheme] = useState<ColorTheme>(DEFAULT_COLOR_THEME);
  const [player1Answer, setPlayer1Answer] = useState<Card[]>([]);
  const [player2Answer, setPlayer2Answer] = useState<Card[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("player1");
  const [round, setRound] = useState(1);
  const [selection, setSelection] = useState<DraftItem[]>([]);
  const [records, setRecords] = useState<GuessRecord[]>([]);
  const [turnResult, setTurnResult] = useState<GuessResult | null>(null);
  const [winner, setWinner] = useState<Winner>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);

    if (!storedTheme) {
      return;
    }

    let active = true;
    let normalizedTheme = DEFAULT_COLOR_THEME;

    try {
      normalizedTheme = normalizeColorTheme(JSON.parse(storedTheme));
    } catch {
      normalizedTheme = DEFAULT_COLOR_THEME;
    }

    window.requestAnimationFrame(() => {
      if (!active) {
        return;
      }

      setColorTheme(normalizedTheme);
      setDraftColorTheme(normalizedTheme);
    });

    return () => {
      active = false;
    };
  }, []);

  const colorThemeStyle = useMemo(
    () => colorThemeToCssVariables(colorTheme) as CSSProperties,
    [colorTheme],
  );
  const safeRound = Math.max(1, round);
  const isSoloMode = gameMode === "solo";
  const currentAnswer = isSoloMode
    ? player1Answer
    : currentPlayer === "player1"
      ? player2Answer
      : player1Answer;
  const selectionValues = selection.map((item) => item.value);
  const selectionCards = selection.map((item) => item.displayCard);
  const currentPlayerRecords = useMemo(
    () => records.filter((record) => record.player === currentPlayer),
    [currentPlayer, records],
  );
  const opponentRecords = useMemo(
    () => records.filter((record) => record.player === opponentOf(currentPlayer)),
    [currentPlayer, records],
  );
  const canGuess = validateGuessValues(selectionValues) && turnResult === null;
  const nextRoundWinner = useMemo(() => {
    if (isSoloMode || !turnResult || currentPlayer !== "player2") {
      return null;
    }

    const player1RoundRecord = records.find(
      (record) => record.player === "player1" && record.round === safeRound,
    );

    if (!player1RoundRecord) {
      return null;
    }

    return determineRoundResult(player1RoundRecord.result, turnResult);
  }, [currentPlayer, isSoloMode, records, safeRound, turnResult]);

  function resetBattleState() {
    setPlayer1Answer([]);
    setPlayer2Answer([]);
    setCurrentPlayer("player1");
    setRound(1);
    setSelection([]);
    setRecords([]);
    setTurnResult(null);
    setWinner(null);
    setCopied(false);
  }

  function clearTurnDraft() {
    setSelection([]);
    setTurnResult(null);
    setCopied(false);
  }

  function handleStart() {
    resetBattleState();
    setPhase("theme-select");
  }

  function handleThemeConfirmed() {
    resetBattleState();
    setGameMode(selectedMode);
    setTheme(selectedTheme);

    if (selectedMode === "solo") {
      setPlayer1Answer(generateRandomAnswerCards(selectedTheme));
      setPlayer2Answer([]);
    } else {
      setPlayer1Answer(generateRandomAnswerCards(selectedTheme));
      setPlayer2Answer(generateRandomAnswerCards(selectedTheme));
    }

    setPhase("turn");
  }

  function handleOpenSettings() {
    setDraftColorTheme(colorTheme);
    setShowSettings(true);
  }

  function handleChangeColorTheme(colorId: ColorId, channel: keyof RgbColor, value: number) {
    setDraftColorTheme((current) => ({
      ...current,
      [colorId]: {
        ...current[colorId],
        [channel]: clampRgbChannel(value),
      },
    }));
  }

  function handleSaveColorTheme() {
    const normalizedTheme = normalizeColorTheme(draftColorTheme);
    setColorTheme(normalizedTheme);
    setDraftColorTheme(normalizedTheme);
    window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, JSON.stringify(normalizedTheme));
    setShowSettings(false);
  }

  function handleResetColorTheme() {
    setColorTheme(DEFAULT_COLOR_THEME);
    setDraftColorTheme(DEFAULT_COLOR_THEME);
    window.localStorage.removeItem(COLOR_THEME_STORAGE_KEY);
  }

  function handleSelectValue(value: ColorId) {
    if (turnResult) {
      return;
    }

    setSelection((current) => {
      if (current.length >= ANSWER_LENGTH) {
        return current;
      }

      const usedCardIds = new Set(current.map((item) => item.displayCard.id));
      const displayCard = pickDisplayCardForThemeValue(theme, value, usedCardIds);

      return [...current, { value, displayCard }];
    });
  }

  function handleRemoveSlot(index: number) {
    if (turnResult) {
      return;
    }

    setSelection((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleUndoLast() {
    if (turnResult) {
      return;
    }

    setSelection((current) => current.slice(0, -1));
  }

  function handleGuess() {
    if (!canGuess) {
      return;
    }

    const answerValues = getAttributeValues(currentAnswer, theme);
    const result = calculateHitBlowByValues(answerValues, selectionValues);
    const markers = calculateGuessMarkersByValues(answerValues, selectionValues);
    const record: GuessRecord = {
      player: currentPlayer,
      round: safeRound,
      values: [...selectionValues],
      displayCards: [...selectionCards],
      markers,
      result,
    };

    setRecords((current) => [...current, record]);
    setTurnResult(result);

    if (isSoloMode && result.hit === ANSWER_LENGTH) {
      setWinner("player1");
      setPhase("result");
    }
  }

  function handleAfterResult() {
    if (!turnResult) {
      return;
    }

    if (isSoloMode) {
      setRound((current) => current + 1);
      clearTurnDraft();
      return;
    }

    if (currentPlayer === "player1") {
      setCurrentPlayer("player2");
      clearTurnDraft();
      return;
    }

    const player1RoundRecord = records.find(
      (record) => record.player === "player1" && record.round === safeRound,
    );
    const roundWinner = player1RoundRecord
      ? determineRoundResult(player1RoundRecord.result, turnResult)
      : null;

    if (roundWinner) {
      setWinner(roundWinner);
      setPhase("result");
      return;
    }

    setRound((current) => current + 1);
    setCurrentPlayer("player1");
    clearTurnDraft();
  }

  async function handleCopyResult() {
    const text = (isSoloMode
      ? [
          "ヒット＆ブロー TRICK",
          "ひとりで遊ぶ",
          `お題: ${THEME_LABELS[theme]}`,
          `Round ${safeRound}で解読！`,
          typeof window !== "undefined" ? window.location.origin : "",
        ]
      : [
          "ヒット＆ブロー TRICK",
          "ふたりで遊ぶ",
          `お題: ${THEME_LABELS[theme]}`,
          `結果: ${getResultText(winner)}`,
          `Round: ${safeRound}`,
          typeof window !== "undefined" ? window.location.origin : "",
        ])
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function handlePlayAgain() {
    resetBattleState();
    setPhase("theme-select");
  }

  function handleBackHome() {
    resetBattleState();
    setPhase("home");
  }

  const turnOwnerLabel = isSoloMode ? "あなたの挑戦" : PLAYER_LABELS[currentPlayer];
  const turnBadgeLabel = isSoloMode ? "ひとりで挑戦" : `${PLAYER_LABELS[currentPlayer]} の回答ターン`;

  if (phase === "result") {
    return (
      <ResultPanel
        colorThemeStyle={colorThemeStyle}
        copied={copied}
        gameMode={gameMode}
        player1Answer={player1Answer}
        player2Answer={player2Answer}
        records={records}
        round={safeRound}
        theme={theme}
        winner={winner}
        onBackHome={handleBackHome}
        onCopy={handleCopyResult}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return (
    <ScreenShell colorTheme={colorTheme} style={colorThemeStyle}>
      {phase === "home" ? (
        <HomeScreen colorTheme={colorTheme} onPlay={handleStart} onSettings={handleOpenSettings} />
      ) : null}

      {phase === "theme-select" ? (
        <section className="rounded-lg border border-white/10 bg-black/55 p-5 text-center shadow-2xl shadow-black/30 backdrop-blur">
          <p className="text-sm font-black text-zinc-400">色に惑わされる、1対1推理ゲーム。</p>
          <h1 className="mt-1 text-4xl font-black tracking-normal text-white">
            ヒット＆ブロー TRICK
          </h1>
          <TitleDots colorTheme={colorTheme} />
        </section>
      ) : null}

      {phase === "theme-select" ? (
        <section className="mt-4 rounded-lg border border-white/10 bg-black/55 p-5 shadow-xl shadow-black/25 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={handleBackHome}
            >
              戻る
            </button>
            <p className="text-xs font-black text-zinc-400">モード選択</p>
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">モードとお題を選ぶ</h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {MODE_OPTIONS.map((option) => {
              const active = selectedMode === option;

              return (
                <button
                  key={option}
                  type="button"
                  className={[
                    "min-h-[7rem] rounded-lg border px-3 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    active
                      ? "border-red-300 bg-red-600/95 text-white shadow-[0_0_22px_rgba(220,38,38,0.32)]"
                      : "border-white/10 bg-white/10 text-zinc-100 hover:bg-white/15",
                  ].join(" ")}
                  onClick={() => setSelectedMode(option)}
                >
                  <span className="block text-lg font-black">{MODE_LABELS[option]}</span>
                  <span className={active ? "mt-2 block text-xs font-bold text-red-50" : "mt-2 block text-xs font-bold text-zinc-400"}>
                    {MODE_COPY[option]}
                  </span>
                </button>
              );
            })}
          </div>

          <h3 className="mt-6 text-sm font-black text-zinc-300">お題</h3>
          <div className="mt-3 grid gap-3">
            {THEME_OPTIONS.map((option) => {
              const active = selectedTheme === option;

              return (
                <button
                  key={option}
                  type="button"
                  className={[
                    "rounded-lg border px-4 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    active
                      ? "border-red-300 bg-red-600 text-white shadow-lg shadow-red-950/25"
                      : "border-white/10 bg-white/10 text-zinc-100 hover:bg-white/15",
                  ].join(" ")}
                  onClick={() => setSelectedTheme(option)}
                >
                  <span className="block text-lg font-black">{THEME_LABELS[option]}</span>
                  <span className={active ? "mt-1 block text-sm text-red-50" : "mt-1 block text-sm text-zinc-400"}>
                    {THEME_COPY[option]}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-lg bg-red-600 px-5 py-4 text-sm font-black text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
            onClick={handleThemeConfirmed}
          >
            この内容で始める
          </button>
        </section>
      ) : null}

      {phase === "turn" ? (
        <div className="space-y-2 pb-3" data-game-phase="turn">
          <section className="relative overflow-hidden rounded-[14px] border border-white/10 bg-black/70 p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] backdrop-blur">
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_3rem] items-start gap-1.5">
              <button
                type="button"
                aria-label="トップへ戻る"
                className="grid size-[2.55rem] place-items-center rounded-full border border-white/15 bg-white/10 text-xl font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_7px_16px_rgba(0,0,0,0.38)] transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={handleBackHome}
              >
                ≡
              </button>
              <div className="text-center">
                <h1 className="whitespace-nowrap text-[1.12rem] font-black leading-tight tracking-normal text-white drop-shadow sm:text-[1.25rem]">
                  ヒット＆ブロー <span className="inline-block -skew-x-6">TRICK</span>
                </h1>
                <TitleDots colorTheme={colorTheme} compact />
              </div>
              <button
                type="button"
                aria-label="ヒント"
                className="grid size-[2.9rem] place-items-center rounded-full border border-white/15 bg-white/10 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_7px_16px_rgba(0,0,0,0.38)] transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => setShowHint(true)}
              >
                <span className="block text-xl font-black leading-none">?</span>
                <span className="-mt-2 block text-[0.58rem] font-black leading-none">ヒント</span>
              </button>
            </div>

            <div className={["mt-2 grid gap-2", isSoloMode ? "grid-cols-1" : "grid-cols-[minmax(0,1fr)_7.2rem]"].join(" ")}>
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-full bg-white text-xl text-zinc-950 shadow-[0_7px_14px_rgba(0,0,0,0.34)]">
                    {isSoloMode ? "挑" : currentPlayer === "player1" ? "1" : "2"}
                  </div>
                  <p className="text-xs font-black text-white">{turnOwnerLabel}</p>
                </div>

                <div className="mt-2 rounded-[10px] border border-red-200/25 bg-red-600 px-2 py-1.5 text-center text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_20px_rgba(220,38,38,0.4)] sm:text-sm">
                  {turnBadgeLabel}
                </div>

                <p className="mt-2 text-center text-[2.55rem] font-black leading-none text-white drop-shadow">
                  Round {safeRound}
                </p>

                <div className="mt-2 flex justify-center">
                  <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-black text-white shadow-inner shadow-black/25">
                    お題：{THEME_LABELS[theme]}
                  </span>
                </div>
              </div>

              {!isSoloMode ? (
                <aside
                  className="self-start rounded-[12px] border border-white/15 bg-black/60 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,0,0,0.3)]"
                  data-opponent-progress
                >
                  <h2 className="mb-1.5 text-center text-xs font-black text-white">相手の進行</h2>
                  <GuessHistory
                    emptyText="まだなし"
                    records={opponentRecords}
                    showCards={false}
                  />
                </aside>
              ) : null}
            </div>
          </section>

          <section className="rounded-[14px] border border-white/10 bg-black/62 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.4)] backdrop-blur">
            <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
              <h2 className="text-base font-black text-white">自分の予想履歴</h2>
              <span className="size-2 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.8)]" aria-hidden="true" />
            </div>
            <div>
              <GuessHistory emptyText="まだ自分の予想はありません" records={currentPlayerRecords} />
            </div>
          </section>

          <section
            className="rounded-[16px] border border-white/15 bg-black/78 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_16px_34px_rgba(0,0,0,0.48)] backdrop-blur"
            data-current-guess-panel
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-center text-base font-black text-white">今回の予想</h2>
                <p className="mt-1 text-xs font-bold text-zinc-400">{selection.length} / 4</p>
              </div>
              {!turnResult && selection.length > 0 ? (
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={handleUndoLast}
                >
                  1つ消す
                </button>
              ) : null}
            </div>

            <GuessSlots cards={selectionCards} locked={turnResult !== null} onRemove={handleRemoveSlot} />

            {turnResult ? (
              <div
                className="mt-4 rounded-lg border border-red-300/40 bg-red-950/30 px-4 py-4 shadow-[0_0_18px_rgba(220,38,38,0.18)]"
                data-turn-result
              >
                <p className="text-sm font-black text-red-100">今回の結果</p>
                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_5.4rem] items-center gap-3">
                  <ResultCardStrip cards={selectionCards} />
                  <ResultSummary large result={turnResult} />
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg bg-red-600 px-4 py-4 text-base font-black text-white shadow-lg shadow-red-950/35 transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
                  onClick={handleAfterResult}
                >
                  {isSoloMode
                    ? "次のラウンドへ"
                    : currentPlayer === "player1"
                      ? "Player 2 のターンへ"
                      : nextRoundWinner
                        ? "結果を見る"
                        : "次のラウンドへ"}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map((value) => (
                    <ColorValueButton
                      key={value}
                      colorTheme={colorTheme}
                      disabled={selection.length >= ANSWER_LENGTH}
                      value={value}
                      onSelect={handleSelectValue}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-[14px] border border-red-200/20 bg-red-600 px-5 py-3.5 text-[1.75rem] font-black leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_22px_rgba(220,38,38,0.3),0_10px_18px_rgba(0,0,0,0.36)] transition hover:bg-red-500 active:translate-y-[1px] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[linear-gradient(180deg,rgba(82,82,91,0.9),rgba(39,39,42,0.95))] disabled:text-zinc-400 disabled:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_14px_rgba(0,0,0,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
                  disabled={!canGuess}
                  onClick={handleGuess}
                >
                  予想する
                </button>
              </>
            )}
          </section>
        </div>
      ) : null}

      {showSettings ? (
        <ColorSettingsModal
          draftTheme={draftColorTheme}
          onChangeColor={handleChangeColorTheme}
          onClose={() => setShowSettings(false)}
          onReset={handleResetColorTheme}
          onSave={handleSaveColorTheme}
        />
      ) : null}

      {showHint ? (
        <ModalShell title="ヒント" onClose={() => setShowHint(false)}>
          <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            <p>今のお題は「{THEME_LABELS[theme]}」です。</p>
            <p>予想は6色から4つ選びます。同じ色を複数回選べます。</p>
            <p>HIT = 含まれていて位置も一致。BLOW = 含まれるが位置違い。</p>
            <p>履歴では位置別の結果を隠し、合計だけを表示します。</p>
          </div>
        </ModalShell>
      ) : null}
    </ScreenShell>
  );
}
