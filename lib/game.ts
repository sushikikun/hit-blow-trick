import { CARDS } from "@/lib/cards";
import type { Card, ColorId, GuessMarker, GuessResult, Theme, Winner } from "@/lib/types";

export const ANSWER_LENGTH = 4;

export const THEME_LABELS: Record<Theme, string> = {
  backgroundColor: "背景の色",
  textColor: "文字の色",
  label: "文字の意味",
};

export function getCardAttribute(card: Card, theme: Theme): ColorId {
  return card[theme];
}

export function getAttributeValues(cards: readonly Card[], theme: Theme): ColorId[] {
  return cards.map((card) => getCardAttribute(card, theme));
}

export function hasDuplicateCardIds(cards: readonly Card[]) {
  return new Set(cards.map((card) => card.id)).size !== cards.length;
}

export function hasDuplicateThemeAttribute(cards: readonly Card[], theme: Theme) {
  return new Set(getAttributeValues(cards, theme)).size !== cards.length;
}

export function validateGuessSelection(cards: readonly Card[]) {
  return cards.length === ANSWER_LENGTH && !hasDuplicateCardIds(cards);
}

export function validateGuessValues(values: readonly ColorId[]) {
  return values.length === ANSWER_LENGTH;
}

export function validateAnswerSelection(cards: readonly Card[], theme: Theme) {
  return (
    cards.length === ANSWER_LENGTH &&
    !hasDuplicateCardIds(cards) &&
    !hasDuplicateThemeAttribute(cards, theme)
  );
}

export function shuffleCards<T>(cards: readonly T[]): T[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function generateRandomAnswerCards(theme: Theme) {
  const groups = new Map<ColorId, Card[]>();

  for (const card of CARDS) {
    const value = getCardAttribute(card, theme);
    groups.set(value, [...(groups.get(value) ?? []), card]);
  }

  const values = shuffleCards([...groups.keys()]).slice(0, ANSWER_LENGTH);
  const answer = values.map((value) => {
    const options = groups.get(value) ?? [];
    return options[Math.floor(Math.random() * options.length)];
  });

  return shuffleCards(answer);
}

export function getCardsMatchingThemeValue(theme: Theme, value: ColorId) {
  return CARDS.filter((card) => getCardAttribute(card, theme) === value);
}

export function pickDisplayCardForThemeValue(
  theme: Theme,
  value: ColorId,
  usedCardIds: ReadonlySet<string> = new Set<string>(),
) {
  const candidates = getCardsMatchingThemeValue(theme, value);
  const unusedCandidates = candidates.filter((card) => !usedCardIds.has(card.id));
  const pool = unusedCandidates.length > 0 ? unusedCandidates : candidates;
  const card = pool[Math.floor(Math.random() * pool.length)];

  if (!card) {
    throw new Error(`No cards found for ${theme}:${value}`);
  }

  return card;
}

export function createDisplayCardsForGuess(theme: Theme, guessValues: readonly ColorId[]) {
  const usedCardIds = new Set<string>();

  return guessValues.map((value) => {
    const card = pickDisplayCardForThemeValue(theme, value, usedCardIds);
    usedCardIds.add(card.id);
    return card;
  });
}

export function calculateHitBlow(
  answerCards: readonly Card[],
  guessCards: readonly Card[],
  theme: Theme,
): GuessResult {
  return calculateHitBlowByValues(
    getAttributeValues(answerCards, theme),
    getAttributeValues(guessCards, theme),
  );
}

export function calculateHitBlowByValues(
  answerValues: readonly ColorId[],
  guessValues: readonly ColorId[],
): GuessResult {
  const markers = calculateGuessMarkersByValues(answerValues, guessValues);

  return markers.reduce<GuessResult>(
    (result, marker) => {
      if (marker === "hit") {
        result.hit += 1;
      }

      if (marker === "blow") {
        result.blow += 1;
      }

      return result;
    },
    { hit: 0, blow: 0 },
  );
}

export function calculateGuessMarkers(
  answerCards: readonly Card[],
  guessCards: readonly Card[],
  theme: Theme,
): GuessMarker[] {
  return calculateGuessMarkersByValues(
    getAttributeValues(answerCards, theme),
    getAttributeValues(guessCards, theme),
  );
}

export function calculateGuessMarkersByValues(
  answerValues: readonly ColorId[],
  guessValues: readonly ColorId[],
): GuessMarker[] {
  const usedAnswerIndexes = new Set<number>();
  const usedGuessIndexes = new Set<number>();
  const markers: GuessMarker[] = guessValues.map(() => "miss");

  for (let index = 0; index < guessValues.length; index += 1) {
    if (answerValues[index] && answerValues[index] === guessValues[index]) {
      markers[index] = "hit";
      usedAnswerIndexes.add(index);
      usedGuessIndexes.add(index);
    }
  }

  for (let guessIndex = 0; guessIndex < guessValues.length; guessIndex += 1) {
    if (usedGuessIndexes.has(guessIndex)) {
      continue;
    }

    const guessValue = guessValues[guessIndex];
    const answerIndex = answerValues.findIndex((answerValue, index) => {
      return !usedAnswerIndexes.has(index) && answerValue === guessValue;
    });

    if (answerIndex >= 0) {
      markers[guessIndex] = "blow";
      usedAnswerIndexes.add(answerIndex);
      usedGuessIndexes.add(guessIndex);
    }
  }

  return markers;
}

export function isCorrectGuess(result: GuessResult) {
  return result.hit === ANSWER_LENGTH;
}

export function determineRoundResult(
  player1Result: GuessResult,
  player2Result: GuessResult,
): Winner {
  const player1Correct = isCorrectGuess(player1Result);
  const player2Correct = isCorrectGuess(player2Result);

  if (player1Correct && player2Correct) {
    return "draw";
  }

  if (player1Correct) {
    return "player1";
  }

  if (player2Correct) {
    return "player2";
  }

  return null;
}
