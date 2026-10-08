# 2D Games Portal — Project Handoff

## Current state
- Public site: https://game-portal.2dgames.workers.dev
- GitHub repo: fabrіkaByte/game-portal (use the existing connected repo; do not invent credentials).
- Cloudflare Workers/Pages is connected to the repo.
- Foundation Engine + shared Game Template are the current focus.

## User workflow preference
- User is non-programmer and wants the assistant to do the coding.
- One batch of fixes at a time: collect issues -> implement all -> user copies -> Commit -> Push -> test. Avoid repeated tiny patches.
- After this batch, user wants to test COMPUTER ONLY first, then do a separate mobile pass.
- Never claim browser testing unless it was actually performed.

## Foundation tests already passed before this batch
- Desktop: Enter/click start, arrows, WASD, Arabic ش س ص ي, score, lives, 3-hit Game Over, R restart, Space pause/resume, best score persistence, resize.
- Mobile: touch start, swipe movement, coin collection, collision, restart, responsive portal.
- Known issue observed repeatedly: rare/recurring case where the player visually seems to pass the red obstacle but collision still removes a life / reset behavior is not visually correct.

## Requested fixes in this batch
1. Shared mouse movement for desktop games.
2. More accurate obstacle collision hitbox / reset handling.
3. Responsive game sizing so portrait phones do not make the obstacle effectively too fast/large relative to the player.
4. Landscape mobile should reduce chrome/vertical overhead and keep the play area visible with minimal/no scroll.
5. Shorter game instructions: show arrows/WASD; keep Arabic keyboard support hidden but working.
6. Pause: Space and P; Arabic P key counterpart ح.
7. Shared audio: coin sound; obstacle hit/life-loss same sound; light pause/resume sound; mute button; persist mute setting. No win/game-over/start sounds currently.
8. Use shared template/audio so future games inherit these features.

## Important design preference
- Keep the polished dark-blue 2D Games portal look.
- Do not redesign the portal unnecessarily while fixing the engine.

## Next step after this batch
- User copies the new ZIP into the local game-portal repo, replaces files without deleting .git, then Commit + Push.
- User tests COMPUTER ONLY first, focusing on collision, mouse, keyboard, pause, restart, audio/mute, resize, and best score.
- Collect all desktop notes before another batch. Do not ask for mobile testing in the same round.
- Only after desktop is stable, run a dedicated mobile test pass.
- Then begin Coin Dash on the finalized shared template.
