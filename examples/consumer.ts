// A teaching display without the game: list what a hand can become and the chance to win.
import { createOdds, type Card, type HandRanking } from "../implementation/server/index.ts";

export function teachingLines(ranking: HandRanking, hole: Card[], board: Card[]): string[] {
  const odds = createOdds(ranking);
  return odds.rows(hole, board).map((row) => `${row.category}: ${Math.round(row.probability * 100)}%`);
}

export function chanceToWin(ranking: HandRanking, hole: Card[], board: Card[], opponents: number, rng: () => number): number {
  return createOdds(ranking).winChance(hole, board, opponents, 1000, rng);
}
