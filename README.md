# Tower Defense

A desktop browser tower defense prototype built with Phaser and TypeScript. The playable campaign has five stages and three star difficulties, using the documented wave schedule, maps, stage locks, first-clear rewards, Stage 4 Mystery Box, and Stage 5 mutation events. Progress is held in page memory; export a save code from the lobby's progression screen to carry it across reloads.

## Run locally on Windows PowerShell

The commands below use the Node.js runtime bundled with Codex, so they work even when `node` is not installed on the Windows system PATH.

```powershell
Set-Location 'C:\Users\alons\OneDrive\Documents\ChatGPT\TD game 2'
$env:Path = 'C:\Users\alons\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:Path
& 'C:\Users\alons\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dev --host 127.0.0.1
```

Leave that PowerShell window running, then open [http://localhost:5173/](http://localhost:5173/) in desktop Chrome. Vite refreshes the page when the source changes. Press **Ctrl+C** in PowerShell to stop the server. If dependencies are missing, run this after setting the PATH line above:

```powershell
& 'C:\Users\alons\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' install
```

## Play the campaign

1. In the lobby, choose an unlocked **Stage** and **Star**, then click **Start New Run**. Stages unlock in order within a star tier. Stages 1–3 have 5, 10, and 15 waves; Stage 4 has 10 waves at Stars 1–2 and 15 at Star 3; Stage 5 has 15 waves. Each stage uses its assigned map. Wave 1 starts after a short countdown, and you begin with $450.
2. Click the tower card to open the 14-tower grid. Rarity colors distinguish Common, Rare, Epic, and Legendary towers. Locked cards show their campaign-clear or player-level requirement. Angry Pigeon is available initially; Lawn Dart Gnome unlocks after the Stage 1, 1-star clear. Select an unlocked tower to begin placing it, then click a clear tile beside the road. Large towers need a clear 2×2 area. Road tiles and occupied tiles are invalid.
3. Enemies move automatically. Towers attack automatically. Defeating enemies pays their bounty; clearing a wave pays the wave reward, shows a two-second intermission, then starts the next wave.
4. Select a placed tower and click **Target Priority** to cycle its own priority: First, Last, Weakest, or Strongest. Each tower keeps its setting independently. When no tower is selected, the control chooses the default for newly placed towers.
5. Click an enemy to inspect its name, current/maximum health, speed, armor, and hyperarmor in the bar below the board.
6. Use **Pause/Resume** and the main speed button to toggle freely between 1× and 2×. Unlock 3× for 30 gems first; then the 4× option appears and can be unlocked for 30 gems. Click an unlocked boost button to select it, or click the main speed button to return to 1×/2×. **Skip Wave** appears when the current wave's enemies have all spawned; it is unavailable while a boss/mini-boss is alive and has a 20-second cooldown after use. Skipping advances the wave without removing enemies that are still alive.
7. Survive the selected stage's waves to see its result screen. Each stage's first clear grants 500, 800, or 1,200 player XP at Star 1, 2, or 3. Completing all five stages at a star tier grants 20, 45, or 80 gems total, once for that tier. Replays do not grant another first-clear bonus. After clearing all five stages in a tier, spend 20 gems on the next Star button to unlock that difficulty. If base health reaches zero, the defeat screen offers a retry or return to the lobby.

8. Stage 4 adds one free Mystery Box per run alongside regular tower choices. Its identity is revealed when placed; this prototype treats “low-to-medium” as an equal chance of a Common or Rare attack tower. Stage 5 pauses for a mutation choice before Waves 5, 10, and 15. Chosen effects last for the run; after every three stackable choices, a forced event adds a random extra mutation.

## Tower upgrades

Select a placed tower to see its three upgrade paths in a row. Choose a path, select the centered upgrade name to read its description, then Confirm or Deny in the bottom bar. Confirm spends coins. A tower can only follow one upgrade path after its first upgrade. Use **Cancel Placement** to leave placement mode. Small towers occupy 2×2 tiles and large towers occupy 4×4 tiles; tracks are 2×2 tiles wide. Select a sellable placed tower to see its **Sell Tower** refund, which returns 50% of its placement and upgrade spending, rounded up. Mystery towers and towers affected by Overcharged Sells cannot be sold. Tower rank limits follow the path ranks shown in Tower Mastery. Tower priorities remain independent. Giant Mech-Teddy Bear's Cuddle Aura reaches six tiles and gives nearby towers +5% attack speed; its first two support-path upgrades improve aura radius and buff power.

## Tower Mastery and saves (Phase 8)

From the lobby, open **Tower Mastery** to review exact-type shared XP and rank caps. Each completed wave awards XP based on attack damage and qualifying support effects. Tower level-ups create path choices that you apply outside a run; spending one gem grants 100 XP to the selected unlocked tower type. Campaign first clears award player XP and unlock player-level towers. Defeating a new enemy type reveals its Bestiary entry. Progress is retained automatically between runs while the page remains open; a save code is only needed to carry progression into another page session. Use **Bestiary & Save Code** to inspect enemies, export/copy a visible `TD1` code, paste/import a code, or paste it from the clipboard. Save codes do not contain an active run or placed towers.

The board is a 64 × 80 grid. Zoom ranges from 100% to 220%. The Simple Loop route and empty-tile placement rules follow the design document. This prototype has no automatic save; reloads start a fresh page session. Save codes include the unlocked 3×/4× speeds.

## Campaign and enemy notes

All stages use their assigned campaign maps and the documented scripted schedule, truncated to the stage's wave count. Enemy HP, escape damage, and bounties apply the Star 1/2/3 multipliers (1×/1.5×/2×), rounded down; wave-clear rewards use the documented capped formula. Unique enemy and boss abilities are represented in the combat loop, including crowd-control bursts, nesting spawns, soap speed puddles, tower disables/freezes, and the Tape Roller’s slowed physical shots. Coin Burst Shatter uses the chosen 3-second deactivation effect without adding tower HP.

## Endless mode

In the lobby, choose or unlock an Endless map from the right panel, optionally turn on Mystery Towers and/or Random Modifiers, then click **Start Endless**. Endless begins with the same scripted Waves 1–15 and procedurally builds Wave 16 onward. The HUD shows **Wave N**. Mystery offers reveal their rarity and price before purchase; cancelling a paid placement refunds its full cost, and placed mystery towers cannot be sold. Random Modifiers offer three choices on their scheduled waves; their active effects are available by clicking the modifier status in the right panel. **Endless runs with Random Modifiers enabled grant no progression rewards (Player XP, gems, or tower mastery); in-run coins still work normally.** Without modifiers, Endless progression rewards are granted when the run ends in defeat.

## Publish with GitHub Pages

The project is configured for GitHub Pages using `.github/workflows/pages.yml`. It builds the game and deploys the `dist` output whenever a commit is pushed to `main`. Vite's relative asset base (`./`) supports the repository's project-page URL, so the repository can keep its source code and does not need a generated `gh-pages` branch.

Recommended GitHub repository: **`goofy-tower-defense`**, visibility **Public**, default branch **`main`**. A public repository supports Pages on GitHub Free; the published site itself is publicly accessible. GitHub Pages can also use a private repository on eligible paid plans, but the Pages website is still public.

To publish when you are ready:

1. Create a new GitHub repository named `goofy-tower-defense`. Choose **Public**, set the default branch to **`main`**, and do not initialize it with a README, `.gitignore`, or license (those files already exist here).
2. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. From PowerShell in this project folder, run the following commands. Replace `<your-username>` with your GitHub username. The `git push` is the step that starts the first deployment.

   ```powershell
   git branch -M main
   git add .
   git commit -m "Prepare game for GitHub Pages"
   git remote add origin https://github.com/<your-username>/goofy-tower-defense.git
   git push -u origin main
   ```

4. On GitHub, open **Actions** and wait for **Deploy to GitHub Pages** to finish. The site URL will be `https://<your-username>.github.io/goofy-tower-defense/`.

After that first deployment, pushing updates to `main` automatically rebuilds and republishes the site. Continue editing the source files in this project folder; do not edit generated files under `dist`. The workflow can also be run manually from **Actions → Deploy to GitHub Pages → Run workflow**.
