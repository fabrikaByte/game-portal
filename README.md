# 2D Games — Engine Foundation

The project currently contains the engine foundation and an internal Engine Test only. Public game implementations are intentionally excluded until the browser test is approved.

## Engine layers

- `framework/` — engine core and reusable systems
- `ui/` — optional shell/UI helpers only; game logic does not depend on them
- `games/_engine-test/` — internal engine validation game
- `tests/browser-smoke/` — browser runtime smoke test

## Engine score

Current foundation readiness: **86 / 100**.

## Required gate before game development

1. Deploy this build.
2. Open `/games/_engine-test/` and run the interactive checks.
3. Open `/tests/browser-smoke/` and confirm every line reports PASS.
4. Only then start the first real game.
