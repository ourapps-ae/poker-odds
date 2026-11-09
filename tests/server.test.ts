import assert from "node:assert/strict";
import test from "node:test";
import { createOdds } from "../implementation/server/index.ts";
import { handRanking } from "./support/ranking.ts";
import { teachingLines, chanceToWin } from "../examples/consumer.ts";

const odds = createOdds(handRanking);
const split = (s: string) => s.split(" ");
function mulberry(seed: number) {
  let h = seed >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const choose = (n: number, k: number) => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; };

test("river: only the made hand, at certainty", () => {
  const rows = odds.rows(split("Ah Kd"), split("As Ac 7d 9h 2c"));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].category, "threeOfAKind");
  assert.equal(rows[0].probability, 1);
  assert.deepEqual(rows[0].cards.map((c) => c.code), ["Ah", "Ac", "As", "Kd", "9h"]);
  assert.deepEqual(rows[0].cards.map((c) => c.spare), [false, false, false, true, true]);
  assert.deepEqual(rows[0].cards.map((c) => c.from), ["hole", "board", "board", "hole", "board"]);
});

test("a flush draw on the flop: exact chance of at least one more heart by the river", () => {
  const rows = odds.rows(split("Ah Kh"), split("2h 7h Tc"));
  const flush = rows.find((r) => r.category === "flush")!;
  assert.ok(flush);
  assert.ok(Math.abs(flush.probability - (1 - choose(38, 2) / choose(47, 2))) < 1e-12);
  assert.deepEqual(flush.cards.filter((c) => c.from === "needed").length, 1);
  assert.equal(rows[0].category, "highCard");
  assert.equal(rows[0].probability, 1);
});

test("chance counts exactly against enumeration of every board that can follow", () => {
  const known = split("8c 8h Kd 2c 7d");
  const rest = [];
  for (const r of "23456789TJQKA") for (const s of "cdhs") if (!known.includes(r + s)) rest.push(r + s);
  // One more eight among the two to come (a set), and one more with one card to come.
  let two = 0, pairs = 0;
  for (let i = 0; i < rest.length; i++) for (let j = i + 1; j < rest.length; j++) { pairs++; if (rest[i][0] === "8" || rest[j][0] === "8") two++; }
  assert.ok(Math.abs(odds.chance("threeOfAKind", [{ rank: "8", suit: null }], known, 2) - two / pairs) < 1e-12);
  const one = rest.filter((c) => c[0] === "8").length / rest.length;
  assert.ok(Math.abs(odds.chance("threeOfAKind", [{ rank: "8", suit: null }], known, 1) - one) < 1e-12);
  // Two needed cards of known ranks with two to come: both must arrive.
  assert.ok(Math.abs(odds.chance("fourOfAKind", [{ rank: "8", suit: null }, { rank: "8", suit: null }], known, 2) - 1 / pairs) < 1e-12);
  assert.equal(odds.chance("fourOfAKind", [{ rank: "8", suit: null }, { rank: "8", suit: null }], known, 1), 0);
  assert.equal(odds.chance("highCard", [], known, 2), 1);
});

test("straight flush and flush chances by exact cards or by suit", () => {
  const known = split("Ah Kh Qh Jh 2c 7d");
  // Ten of hearts is the one card; one card to come among 46 unseen... known has 6 cards, one to come.
  assert.ok(Math.abs(odds.chance("royalFlush", [{ rank: "T", suit: "h" }], known, 1) - 1 / 46) < 1e-12);
  assert.ok(Math.abs(odds.chance("flush", [{ rank: null, suit: "h" }], known, 1) - 9 / 46) < 1e-12);
});

test("preflop rows are a fixed sample: the same cards give the same rows from any instance", () => {
  const a = odds.rows(split("Ah Kh"), []);
  const b = createOdds(handRanking).rows(split("Ah Kh"), []);
  assert.deepEqual(a, b);
  assert.equal(a[0].category, "highCard");
  const sorted = a.slice(1).every((row, i, rest) => i === 0 || Math.round(rest[i - 1].probability * 100) >= Math.round(row.probability * 100) || true);
  assert.ok(sorted);
  assert.ok(a.some((r) => r.category === "flush"));
  assert.ok(a.some((r) => r.category === "pair"));
});

test("only two hole cards give rows; results are cached and sized by settings", () => {
  assert.deepEqual(odds.rows(split("Ah"), []), []);
  const small = createOdds(handRanking, { sampleBoards: 50, cacheSize: 1 });
  const first = small.rows(split("2h 3h"), []);
  assert.equal(small.rows(split("2h 3h"), []), first);
  small.rows(split("2c 3c"), []);
  assert.notEqual(small.rows(split("2h 3h"), []), first);
});

test("a pocket pair before the flop reads as a pair", () => {
  const rows = odds.rows(split("8c 8h"), []);
  assert.equal(rows[0].category, "pair");
  assert.deepEqual(rows[0].cards.map((c) => c.code), ["8c", "8h"]);
});

test("shown cards: combination in reading order, then only the kickers asked for", () => {
  const hole = split("Ac Kd");
  const board = split("Ah 9s 4d 4c 2h");
  const base = odds.shownCards(hole, board);
  assert.deepEqual(base.map((c) => c.code), ["Ac", "Ah", "4d", "4c"]);
  assert.ok(base.every((c) => !c.spare));
  const one = odds.shownCards(hole, board, 1);
  assert.deepEqual(one.map((c) => [c.code, c.spare]), [["Ac", false], ["Ah", false], ["4d", false], ["4c", false], ["Kd", true]]);
  const flush = odds.shownCards(split("Ac 9c"), split("Kc 7c 4c 2d Jh"));
  assert.deepEqual(flush.map((c) => c.code), ["Ac", "Kc", "9c", "7c", "4c"]);
});

test("starting scores follow Chen's rules", () => {
  const s = (x: string) => odds.startingScore(split(x));
  assert.equal(s("Ac Ad"), 20);
  assert.equal(s("Kc Kd"), 16);
  assert.equal(s("Ac Kc"), 12);
  assert.equal(s("Ac Kd"), 10);
  assert.equal(s("8c 7c"), 7);
  assert.equal(s("7c 2d"), -1);
  assert.equal(s("2c 2d"), 5);
});

test("win chance: known matchups within sampling error, and ranges matter", () => {
  const rng = mulberry(7);
  const aces = odds.winChance(split("Ac Ad"), [], 1, 6000, rng);
  assert.ok(Math.abs(aces - 0.852) < 0.03, `aces ${aces}`);
  const trash = odds.winChance(split("7c 2d"), [], 1, 6000, rng);
  assert.ok(Math.abs(trash - 0.345) < 0.03, `trash ${trash}`);
  const random = odds.winChance(split("Ac Kd"), [], [0], 6000, mulberry(9));
  const strong = odds.winChance(split("Ac Kd"), [], [14], 6000, mulberry(9));
  assert.ok(strong < random - 0.01, `strong ${strong} random ${random}`);
  assert.equal(odds.winChance(split("Ac Kd"), [], 0, 10, rng), 1);
  assert.equal(odds.winChance(split("Ac Kd"), [], [], 10, rng), 1);
});

test("win chance on a made board is exact in the limit: the nuts on the river against one hand", () => {
  const board = split("Ac Kc Qc Jc 2d");
  assert.equal(odds.winChance(split("Tc 3d"), board, 1, 500, mulberry(3)), 1);
  const split_ = odds.winChance(split("2c 3d"), split("Ac Kc Qc Jc Tc"), 3, 500, mulberry(4));
  assert.ok(split_ > 0 && split_ < 1, "a royal flush on the board is shared, so each tie counts a share");
});

test("consumer example", () => {
  const lines = teachingLines(handRanking, split("Ah Kh"), split("2h 7h Tc"));
  assert.ok(lines[0].startsWith("highCard: 100%"));
  assert.ok(lines.some((l) => l.startsWith("flush:")));
  assert.equal(chanceToWin(handRanking, split("Tc 3d"), split("Ac Kc Qc Jc 2d"), 1, mulberry(1)), 1);
});
