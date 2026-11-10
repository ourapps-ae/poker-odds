# Source mapping

Reference revision: `19905b75dbea89fbfd424d67fe26c81aaed0e018`. Extraction source: `OurPoker/recipe/` (read-only).

- `implementation/server/odds.ts` <- `OurPoker/recipe/server/src/odds.ts` lines 1-303 (`odds`, `compute`, `choose`, `chance`, `seeded`, `shownCards`, `made`, `readingOrder`, `makeup`; `patternCards` and `bestFive` at lines 261-303 now live in poker-hand-ranking) and `OurPoker/recipe/server/src/bot.ts` lines 29-79 (`chen`, `equity`).
  - Generalised: module functions became `createOdds(ranking, settings)`; card codes, deck and evaluation come from the hand-ranking interface; `odds` is `rows`; Chen's `chen` is `startingScore`; `equity` is `winChance`; the fixed 2000 pre-flop boards and the 500-entry cache became the settings `sampleBoards` and `cacheSize` (defaults unchanged). The wire types `OddsCard` and `OddsRow` (from `server/src/contract.ts` lines 159-175) are in `implementation/server/types.ts`. Results are identical to the recipe: 60 random spots across all streets compared on rows, starting score and win chance with the same random sequence, no difference.
  - Left behind: nothing of the odds logic. The display of rows (web `table.ts` odds panel, `ios/.../TableScreen.swift` 1089-1130, `android/.../ui/TableScreen.kt` 561-640) is user interface and belongs to the recipe; those clients only draw rows the server sends, so there is no Apple or Android code.
- `implementation/server/types.ts`: new, the slice of the hand-ranking interface read here plus the `OddsCard`, `OddsRow` and `Needed` shapes.
- `implementation/server/index.ts`, `examples/consumer.ts`, `tests/server.test.ts`: new.
- `tests/support/hand-ranking/*.ts`: copies of the current poker-hand-ranking `codes.ts` and `ranking.ts`, used only to give the tests a real hand-ranking; not packaged as implementation.
- `interfaces/required-hand-ranking.json`, `interfaces/required-card-deck.json`: byte copies of the providers' documents. The members of the hand ranking `createOdds` reads are the `HandRanking` schema of `interfaces/poker-odds.json`; card-deck is reached only through `ranking.codes`.
