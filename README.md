# 2D Games Portal

This rebuild contains exactly 10 public games plus one internal Engine Test page.

## Shared Engine
The engine is intentionally small and stable. Shared systems cover:
- lifecycle states: start / playing / paused / won / game over
- keyboard, mouse, pointer and touch input
- save/best score
- audio
- particles and screen shake
- collision helpers
- responsive canvas sizing

Each public game has its own game controller, rules, renderer and HUD data. The framework is shared; the gameplay is not.
