# Poker odds instructions

## For the agent
Select this component when the application teaches or displays hand chances, and always when poker-strategy is selected. Connect its hand-ranking input to poker-hand-ranking and its card-deck input to the application's card-deck. Leave the settings at their defaults unless the pre-flop rows are too slow or too coarse.

- Select package `ourapps-ae/poker-odds` version `0.4.0`.
- Settings to configure:
  - `sampleBoards` (integer; optional; default `2000`)
  - `cacheSize` (integer; optional; default `500`)
- Connect the provided `poker-odds` (ae/poker-odds 1.0.0) to the consumer that needs it.
- Supply `hand-ranking` (ae/hand-ranking 1.0.0) from the component that provides it.
- Supply `card-deck` (ae/card-deck 1.0.0) from the component that provides it.
- No accounts or keys are needed.

## For the developer
No accounts or keys. `sampleBoards` (default 2000) is the number of pre-flop boards sampled for the rows; more is smoother and slower. `cacheSize` (default 500) is how many card sets are remembered. Call `createOdds(handRanking)` once and reuse it.

## How to check
From the component directory:

- `node --test tests/server.test.ts` (web, required-local; tools: node 26.5.0)
- `python3.12 -B /Users/george/Projects/com/my/tools/check_component.py components/poker-odds` validates the manifest, sidecars and runs the required-local suite.
