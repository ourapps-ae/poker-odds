# Poker odds component

## Purpose and facilities
Answers three questions about a player's two hole cards and the board. `rows`: what the hand is now and every better hand it can still become, each with the exact chance that the cards it needs arrive by the river, in the order a learner reads them (a straight low to high, pairs grouped, kickers last); counted exactly from the flop on and from a fixed sample of boards before it, and cached. `winChance`: the chance of holding the best hand at the river against some opponents, by simulation, where each opponent can be assumed to hold at least a given starting score (a raiser is not on a random hand). `startingScore`: Chen's pre-flop score. `shownCards`: a shown hand's combination in reading order with the kickers asked for.

Facilities: `poker-odds` (Hand improvement and winning chances).

## User inputs
The installer collects two optional integers:

- `sampleBoards` (integer; optional; default `2000`)
- `cacheSize` (integer; optional; default `500`)

## Artefacts and dependencies
`component.json` maps every `implementation/` source into `components/poker-odds/`:

- `implementation/server/index.ts` -> `components/poker-odds/server/index.ts`
- `implementation/server/odds.ts` -> `components/poker-odds/server/odds.ts`
- `implementation/server/types.ts` -> `components/poker-odds/server/types.ts`

Dependencies: none.
`tools.lock.json` pins verification tools: node 26.5.0. Licence wording remains deferred.

## Provided interfaces
- `interfaces/poker-odds.json` defines `poker-odds` (ae/poker-odds) version 1.0.0.

## Required interfaces
- `hand-ranking` (ae/hand-ranking) version 1.0.0, supplied by the recipe or application.
- `card-deck` (ae/card-deck) version 1.0.0, supplied by the recipe or application.

## Integration
Create it with `createOdds(ranking, settings)`, passing the hand-ranking interface (poker-hand-ranking) which carries the card codes and deck of the connected card-deck. A table shows `rows` to a player who asked for odds; poker-strategy calls `winChance` and `startingScore`; a replay screen calls `shownCards`. TypeScript only: the Swift and Kotlin apps display rows the server sends, they do not compute them.

## Visual definition and connected examples
`visual/definition.json` maps its ports to the provided and required interfaces. `visual/examples/connected.json` connects the component to an illustrative application consumer. Both image formats and a text description are retained under `visual/output/`.

## Infrastructure
No deployed service, account or key. CPU only: exact counting for river and turn is a few milliseconds; the pre-flop sample of 2000 boards takes a few tens of milliseconds on this machine, then is served from the cache.

## Verification
`node --test tests/server.test.ts` checks river, flop and pre-flop rows, the exact flush-draw probability against the closed form, `chance` against enumeration of every board that can follow, straight-flush and flush cases, the cache and its size setting, Chen's scores, known matchups within sampling error (aces against a random hand about 85 percent) and the effect of opponent ranges. The extraction was compared with the recipe's odds.ts and bot.ts equity on 60 random spots: rows, scores and win chances identical.

- `node --test tests/server.test.ts` (web, required-local; tools: node 26.5.0)

## Scenarios and presentation
A learner taps 'my chances' on the flop and sees a flush at 35 percent and a pair at 100. A coach shows the chance of winning against three opponents before the flop. A computer player prices a call.

## Updates and removal
The seeded pre-flop sample determines the pre-flop rows. Removing the component removes the files; nothing is stored.
