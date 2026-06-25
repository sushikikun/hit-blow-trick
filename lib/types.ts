export type ColorId = "red" | "blue" | "yellow" | "green" | "purple" | "brown";

export type Theme = "backgroundColor" | "textColor" | "label";

export type Player = "player1" | "player2";

export type GameMode = "solo" | "battle";

export type Card = {
  id: string;
  label: ColorId;
  textColor: ColorId;
  backgroundColor: ColorId;
};

export type GuessResult = {
  hit: number;
  blow: number;
};

export type GuessMarker = "hit" | "blow" | "miss";

export type GuessRecord = {
  player: Player;
  round: number;
  values: ColorId[];
  displayCards: Card[];
  markers: GuessMarker[];
  result: GuessResult;
};

export type Winner = "player1" | "player2" | "draw" | null;
