# Browser Smoke Test

Deploy the project as a static site, then open `/tests/browser-smoke/` in the target browser.

The page runs a series of real-browser checks and reports each line as PASS/FAIL. It verifies:

- Browser ES-module loading
- Pointer-to-logical coordinate mapping at normal size and with letterboxing
- Pointer press consumption and mouse-leave cleanup
- Touch swipe detection
- Keyboard input, one-frame input clearing, Arabic-layout controls, and key release
- GameEngine start/pause/resume/restart/win/game-over/timer lifecycle
- No duplicate animation loop after calling start twice
- Rectangle/circle/point collisions and AABB overlap
- High-speed horizontal and vertical collision (no tunneling)
- Stable grounded state
- SaveStore persistence between instances
- Particles and audio mute toggle
- Actual-size resize handling at narrow mobile dimensions

If a module or assertion fails, the page captures the error and continues reporting the other checks. Fix failures before beginning a new game.

The internal Engine Test is at `/games/_engine-test/`. Its startup page now shows module errors rather than remaining blank. Test Start, movement, Pause/Resume, Restart, score/lives, mouse movement and audio on the deployed target browser.

For local non-browser tests, run `node tests/run-all.mjs` from the project root.
