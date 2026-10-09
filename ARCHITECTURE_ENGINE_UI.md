# Engine / UI Separation

The engine is framework-only: game state, loop, input, collision, audio, particles, persistence, events, entities, camera, assets, timers, scenes, fixed-step support, debugging, and advanced gameplay systems.

The UI layer lives under `ui/` and is optional. `ui/game-shell.*` is only the internal Engine Test presentation and is not exported from `framework/index.js`.

A real game can provide its own HTML/CSS/HUD without importing `ui/game-shell.js`.
