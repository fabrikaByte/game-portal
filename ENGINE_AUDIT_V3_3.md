# Engine v3.3 Foundation Audit

- Removed `dragons-keep` from the public game set because it combined too many systems and would delay the practical game-by-game development plan.
- Fixed the TileMap runtime bug in `advanced-arcade-game.js` where `sx`/`sp` were referenced outside their scope.
- TileMap now supports cell lookup, AABB solid-rectangle checks, and axis resolution.
- Metadata is regenerated from the actual `games/` directories; the public set and metadata are synchronized.
- Added reusable `GridNavigator` pathfinding for future AI-heavy games.
- Static validation must be rerun before release. Browser gameplay still requires manual browser testing.
