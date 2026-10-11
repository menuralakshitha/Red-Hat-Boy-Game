RED HAT BOY - FIXED 2D GAME

How to play
1. Extract the entire ZIP into a folder.
2. Open index.html in Chrome, Edge, Firefox, or Safari.
3. Press Enter / Space or click Start Game.
4. Press Up Arrow or click/tap Jump to avoid the flames.
5. After Game Over, click Restart Game or press Enter to return to the start screen.

Keep the HTML, JavaScript, CSS, images, GIF, and audio files together.
No installation, internet connection, or build step is required.

Fixes
- Correct start screen IDs/classes and keyboard controls.
- Correct animation filenames, spacing, and capitalization.
- Use the available Idle frames (2-10); Idle (1).png was absent in the original ZIP.
- Show the flame obstacles with the correct CSS class.
- Correct jump ascent/descent, landing, and background scrolling.
- Stop previous animation timers on each state change and restart.
- Prevent repeated jumps and controls during the death animation.
- Stop scoring and running audio when the player hits an obstacle.
- Reset score, player position, obstacles, sounds, and overlays on restart.
- Recycle passed obstacles so the game can continue beyond the first 20.
- Handle blocked audio playback without interrupting gameplay.
- Add clickable Start and Jump controls and readable overlay layouts.
