# Testing and Fixes — Foundation v3.2

## Root causes found

- **Blank Engine Test:** ES module syntax error in `games/_engine-test/game.js` (missing closing brace in the `GameEngine` constructor options). The prior checker did not enforce module parsing, so it missed this syntax error.
- **Browser Smoke pointer failure:** fixed scale of `1` was used for a 640×360 display of a 960×540 logical canvas; expected scale was about 0.667. The keyboard regression test also dispatched a key before `start()`, which intentionally resets input.

## Additional issues found and fixed

- Mouse pointer could remain active after leaving the canvas, causing stale pointer-follow behavior.
- Canvas resize had a 320×180 minimum that could desynchronize mouse coordinates from small display sizes.
- Capped substeps could still allow extreme horizontal/vertical velocity to tunnel through thin colliders; replaced with continuous axis sweeps.
- Grounded state could clear while a stationary zero-gravity body remained on a surface.
- Engine Test failures during module loading were silent; added dynamic-import error reporting and a loading timeout.

## Tests not previously requested but now included

- ES-module grammar syntax checks (not just default Node parsing)
- HTML/module relative asset/import path audit
- Framework and UI import graph validation
- Input regression tests for letterboxed coordinates, pointer leave, blur, hidden tab, key-up and just-pressed clearing
- Engine Test startup integration with mock DOM plus wired Start/Pause/Resume/Restart control invocations
- Browser Smoke suite for pointer, touch, keyboard/Arabic layout, game-state transitions, timer expiry, persistence, collision boundaries, fast body sweeps, audio mute, particles, and narrow viewport resize

## Results and caveat

`node tests/run-all.mjs` passes all automated checks. Chromium page navigation is blocked by the current build environment (`ERR_BLOCKED_BY_ADMINISTRATOR`), so a complete browser run is not claimed from this environment. The deployed Browser Smoke page must be run after this package is uploaded.
