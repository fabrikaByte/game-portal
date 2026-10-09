# Engine Validation Report — Foundation v3.2 Browser Hardening

## Summary

The previous deployed Engine Test was blank because `games/_engine-test/game.js` had a missing closing brace in the `GameEngine` options object. The file passed the old syntax check because `.js` was checked under Node's default CommonJS interpretation; the browser loads this file as an ES module. All source files are now parsed explicitly as ES modules by `tests/run-all.mjs`.

The previous Browser Smoke failure was a test defect: the canvas used a 960x540 logical space but the test hard-coded pointer scale 1 while its displayed canvas was 640x360. The old test also dispatched keyboard input before `engine.start()`, but start/reset correctly clears input. Both tests were corrected.

## Fixes

1. Rewrote the Engine Test boot entry to use dynamic imports inside a `try/catch`; module import/startup errors are now displayed as a diagnostic panel rather than leaving an empty page.
2. Added a visible loading fallback, script/module error handling, unhandled rejection reporting, and a startup timeout to `games/_engine-test/index.html`.
3. Corrected Browser Smoke pointer scale and letterbox offset calculations.
4. Corrected input test order so keyboard events are delivered after the engine reset/start.
5. Added mouse `pointerleave` cleanup so stale pointer coordinates cannot keep moving a player after the cursor leaves the canvas.
6. Removed the artificial 320x180 minimum from `GameEngine.resize()` so its logical scale reflects the actual CSS canvas size, including narrow mobile layouts.
7. Replaced capped collision substeps with continuous axis sweeps in `moveAndCollide`, including horizontal and vertical high-speed tunneling regression cases.
8. Stabilized `Body2D.onGround` when a zero-velocity body rests on a surface.
9. Exposed a test-only `window.__ENGINE_TEST__` diagnostic handle on the internal test page so test automation can inspect state and controls.
10. Added automated entry integration checks that boot Engine Test with a mock DOM and invoke the Start, Pause/Resume, and Restart controls.

## Automated results

Run from the project root:

```sh
node tests/run-all.mjs
```

Latest result:

- ES-module syntax: PASS (46 JS/MJS files)
- Inline Browser Smoke module syntax: PASS
- Local relative imports and links: PASS (103 references)
- Framework/UI runtime import graph: PASS
- Core tests: PASS
- Advanced systems tests: PASS
- Architecture/foundation tests: PASS
- Input regressions: PASS
- Engine Test entry/control integration: PASS
- Overall automated suite: PASS

## Browser execution limitation

The Chromium automation available in the build environment rejects navigation to local `http://` and `file://` pages with `ERR_BLOCKED_BY_ADMINISTRATOR`. A standalone inline Chromium probe passed for DOM creation, Canvas 2D context, canvas layout measurement, Pointer Events, and requestAnimationFrame. LocalStorage could not be verified from the `about:blank` origin. This is not equivalent to running the complete module-based Engine Test in Chromium. Therefore a full target-browser run is **not claimed as passed**.

After deploying this package, open `/tests/browser-smoke/` and confirm the page reports all checks passed, then open `/games/_engine-test/`. If a failure remains, the pages now show specific errors rather than failing silently.

## Readiness score

The prior 86/100 figure was provisional and should not be treated as validated browser readiness. Re-score only after the deployed Browser Smoke and manual Engine Test pass in the target browser.
