# Engine v3.3 architecture

## Existing systems
Core loop/state, input + Arabic mappings, mouse/touch/swipe, movement, collision, save/best score, lives, timer, levels/difficulty, power-ups, audio, particles, screen shake, combo, metadata, entity manager, event bus, object pooling, animation state machine, level manager, physics, camera, capability profiles, AI, tilemaps, sprite animation, dialogue, inventory, quests, bosses, vehicle physics.

## Added in v3.3
- `combat.js`: reusable hit/damage/hitbox helpers.
- `input-map.js`: per-game action mapping on top of shared input.
- `status-effects.js`: timed effects and stacking.
- `spawn-manager.js`: bounded enemy/wave/object spawning.
- `asset-manager.js`: image caching/preload primitive.
- `animation-events.js`: animation event bus.
- `platformer-physics.js`: acceleration, coyote time, jump buffering, fall clamp, grounded state.
- `debug-tools.js`: optional FPS/entity/hitbox diagnostics.

These are reusable engine modules; game-specific rules remain in each game.
