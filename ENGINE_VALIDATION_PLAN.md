# Engine validation plan

This build treats the existing engine as the permanent foundation. The new shared systems
are tested in `_engine-test`, while the ten real games validate combinations of systems:

1. Coin Dash — runner/physics/jump/slide/camera
2. Jungle Run — platforms/jump/levels
3. Space Defender — shooting/projectiles/AI/waves
4. Ninja Escape — dash/melee/AI/platforms
5. Tower Climb — climb/platforms/checkpoints
6. Neon Racer — vehicle/steering/boost
7. Ocean Runner — swim/buoyancy
8. Zombie Road — vehicle + shooting + waves
9. Pirate Treasure — melee/triggers/collectibles
10. Robot Factory — platforms/triggers/switches/doors

The games are not intended to be clones of the lab. Each game keeps its own art, rules,
HUD and controls while consuming shared engine capabilities.
