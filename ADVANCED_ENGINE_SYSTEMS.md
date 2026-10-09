# Advanced Engine Systems

The engine now exposes optional, game-agnostic modules for:

1. AI — state controller, steering, patrol/chase/flee helpers, weighted choices.
2. Tilemaps — grid layers, tile/world conversion, solid tiles, neighbors, rendering hooks.
3. Pathfinding — A* grid pathfinding with orthogonal/diagonal modes.
4. Inventory — capacity, stack limits, add/remove/consume, serialization.
5. Quests — locked/active/completed/failed states and objective progress.
6. Dialogue — nodes, lines, branching choices, conditions, flags and events.
7. Boss system — health, phases, enrage, phase callbacks and death handling.
8. Vehicle physics — acceleration, braking, steering, grip, drag and boost.
9. Sprite-sheet animation — frame extraction and animation playback.
10. Procedural generation — seeded RNG, value noise and dungeon generation.
11. Multiplayer — transport abstraction, WebSocket transport, loopback transport and state session.
12. Leaderboards — REST endpoint adapter with localStorage fallback.

## Backend note
Multiplayer networking needs a real WebSocket server or relay endpoint. Leaderboard cloud persistence needs a server endpoint. The engine includes browser-side adapters and local fallbacks; it does not pretend that a client-only site is a secure authoritative multiplayer or leaderboard backend.

All modules are optional. A game imports only the systems it needs and does not inherit a visual shell or HUD from the engine core.
