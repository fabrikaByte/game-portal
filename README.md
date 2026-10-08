# Game Portal — Foundation / Engine v1

This version keeps the existing website and game catalog, while adding a reusable 2D Game Engine foundation.

## Engine modules
- `framework/core.js` — lifecycle, game states, loop, score, lives, level, win/game-over.
- `framework/input.js` — keyboard + Arabic keyboard layout + touch state.
- `framework/collision.js` — reusable collision helpers.
- `framework/particles.js` — lightweight particles.
- `framework/audio.js` — small Web Audio effects.
- `framework/save.js` — safe localStorage wrapper.

## Internal test
Open `games/_engine-test/index.html` through VS Code Live Server.
This is NOT a production game. It verifies the engine lifecycle:
Start → Move → Collect → Score → Collision → Lose Life → Game Over → Restart.

## User test checklist
1. Start with click or Enter.
2. Move with arrows, WASD, and Arabic: ش/س/ص/ي.
3. Collect the yellow coin; score should increase.
4. Hit the red obstacle; lives should decrease, not instantly end the game.
5. After 3 hits, Game Over should appear.
6. Press R; the round resets to the START screen. Then press Enter or click to start the fresh round.
7. Press Space; game pauses/resumes.
8. Refresh the page; Best Score should remain.
9. Resize the browser; the canvas should continue to fit.
10. On a phone/touch device, verify the canvas accepts touch/start (full virtual controls are intentionally not added yet).

The website design is intentionally not redesigned in this stage.
