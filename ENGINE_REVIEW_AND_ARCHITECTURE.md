# Engine Review & Architecture

## Separation

`framework/` is independent of `ui/`. A game may use the UI shell or replace it entirely.

## Core systems

Game loop/states, input, collision, audio, particles, save, events, entities, camera, assets, timers, debug/error reporting, tweens, scenes, fixed-step support, AI, tilemaps, A*, inventory, quests, dialogue, bosses, vehicle physics, sprite-sheet animation, procedural generation, multiplayer adapters, leaderboards, 2D physics, spatial hashing, object pooling, input mapping, and config validation.

## Readiness gate

The first real game is blocked until the Engine Test and browser smoke test pass in the target deployment.
