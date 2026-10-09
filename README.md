# 2D Games — Engine Foundation

The project currently contains the engine foundation and an internal Engine Test only. Public game implementations are intentionally excluded until the browser test is approved.

## Engine layers

- `framework/` — engine core and reusable systems
- `ui/` — optional shell/UI helpers only; game logic does not depend on them
- `games/_engine-test/` — internal engine validation game
- `tests/browser-smoke/` — browser runtime smoke test

## Engine score

The prior 86/100 rating is provisional and not considered validated until the deployed browser tests pass.

## Required gate before game development

1. Deploy this build.
2. Open `/tests/browser-smoke/` and confirm every check reports PASS.
3. Open `/games/_engine-test/` and test Start, movement, Pause/Resume, Restart, score/lives, mouse and audio.
4. If a browser check fails, save the detailed error from the page and fix it before creating a game.
5. Only then start the first real game.

Run automated source checks locally with `node tests/run-all.mjs`. See `TESTING_AND_FIXES.md` for the recent fixes and known browser-testing limitation.
