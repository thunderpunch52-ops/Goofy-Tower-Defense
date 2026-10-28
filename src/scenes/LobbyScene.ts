import Phaser from 'phaser';
import { BOARD_COLUMNS, BOARD_ROWS, CAMPAIGN_MAPS, createMapRoutes, MAPS, type MapId } from '../game/map';
import { initializeProgress } from '../state/progression';

const W = 1280;
const H = 720;
const C = { ink: '#17152f', panel: '#201e40', panel2: '#2b2856', cream: '#fff5d7', muted: '#c4c3e5', mint: '#75efc1', gold: '#ffd15e', pink: '#ff6d9e', blue: '#63dcff' };

export class LobbyScene extends Phaser.Scene {
  constructor() { super('Lobby'); }

  create(): void {
    initializeProgress(this.registry);
    this.cameras.main.setBackgroundColor(C.ink);
    const g = this.add.graphics();
    g.fillStyle(0x201e40, 1).lineStyle(2, 0x57558d, 1).fillRoundedRect(20, 20, W - 40, H - 40, 24).strokeRoundedRect(20, 20, W - 40, H - 40, 24);
    // The profile and map-preview columns need enough width for their labels
    // and descriptions; keep the campaign card centered in the remaining space.
    g.fillStyle(0x2b2856, 1).fillRoundedRect(40, 40, 280, H - 80, 18);
    g.fillStyle(0x2b2856, 1).fillRoundedRect(960, 40, 280, H - 80, 18);
    g.fillStyle(0x17152f, 1).lineStyle(2, 0x63dcff, 0.8).fillRoundedRect(330, 40, 620, H - 80, 18).strokeRoundedRect(330, 40, 620, H - 80, 18);
    g.fillStyle(0xff6d9e, 1).fillRoundedRect(42, 52, 6, 96, 3);
    g.fillStyle(0x75efc1, 1).fillRoundedRect(1232, 52, 6, 96, 3);
    g.fillStyle(0xffd15e, 0.85);
    [[352, 62], [925, 62], [352, 654], [928, 654], [54, 654], [1226, 654]].forEach(([x, y]) => g.fillCircle(x!, y!, 4));

    this.add.text(70, 67, 'SNACK\nSENTINEL', { fontFamily: 'Trebuchet MS', fontSize: '18px', color: C.blue, fontStyle: 'bold', lineSpacing: 8, letterSpacing: 2 });
    this.add.text(70, 150, 'Ready to save\nthe snacks?', { fontFamily: 'Trebuchet MS', fontSize: '27px', color: C.cream, fontStyle: 'bold', lineSpacing: 8 });
    const profileProgress = this.add.text(62, 260, '', { fontFamily: 'Arial', fontSize: '15px', color: C.muted, lineSpacing: 6, wordWrap: { width: 235 } });
    const refreshProfile = () => {
      const masteryXp = Number(this.registry.get('lastRunMasteryXp') ?? 0);
      const playerXp = Number(this.registry.get('lastRunPlayerXp') ?? 0);
      profileProgress.setText(`Player Level ${Number(this.registry.get('playerLevel') ?? 1)}\n${Number(this.registry.get('playerXP') ?? 0).toLocaleString()} player XP\n${(this.registry.get('bestiaryUnlocks') as string[]).length} Bestiary entries\nLast run: +${playerXp.toLocaleString()} Player XP\n+${masteryXp.toLocaleString()} Tower Mastery XP\nProgress saves here between runs. A code is optional for a new page session.`);
    };
    refreshProfile();
    const openProgression = (y: number, label: string, tab: 'mastery' | 'bestiary' | 'save') => {
      const nav = this.add.rectangle(165, y, 205, 42, 0x182733).setStrokeStyle(1, 0x6fc8e8).setInteractive({ useHandCursor: true });
      this.add.text(165, y, label, { fontFamily: 'Arial', fontSize: '14px', color: C.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
      nav.on('pointerdown', () => { this.registry.set('requestedProgressionTab', tab); this.scene.start('Progression'); });
    };
    openProgression(466, 'TOWER MASTERY', 'mastery');
    openProgression(520, 'BESTIARY & SAVE CODE', 'bestiary');
    this.add.text(62, 594, 'GOOFY DEFENSE  •  3.5.0', { fontFamily: 'Arial', fontSize: '13px', color: C.muted, lineSpacing: 7 });

    this.add.text(W / 2, 88, 'THE GREAT SNACK DEFENSE', { fontFamily: 'Trebuchet MS', fontSize: '17px', color: C.mint, fontStyle: 'bold', letterSpacing: 3 }).setOrigin(0.5);
    this.add.text(W / 2, 165, 'Save the snacks!', { fontFamily: 'Trebuchet MS', fontSize: '44px', color: C.cream, fontStyle: 'bold', stroke: '#ff6d9e', strokeThickness: 2, shadow: { offsetX: 0, offsetY: 3, color: '#0c0a20', blur: 5, fill: true } }).setOrigin(0.5);
    this.add.text(W / 2, 220, 'Tiny towers. Ridiculous enemies. Big snack energy.', { fontFamily: 'Trebuchet MS', fontSize: '18px', color: C.muted }).setOrigin(0.5);

    const card = this.add.container(W / 2, 390);
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x242148, 1).lineStyle(2, 0x63dcff, 1).fillRoundedRect(-205, -92, 410, 184, 20).strokeRoundedRect(-205, -92, 410, 184, 20);
    cardBg.fillStyle(0xff6d9e, 1).fillRoundedRect(-205, -92, 410, 7, 4);
    card.add(cardBg);
    card.add(this.add.text(-165, -56, 'CAMPAIGN', { fontFamily: 'Arial', fontSize: '15px', color: C.gold, fontStyle: 'bold', letterSpacing: 2 }));
    const stageTitle = this.add.text(-165, -22, '', { fontFamily: 'Arial', fontSize: '25px', color: C.cream, fontStyle: 'bold' });
    const stageDetail = this.add.text(-165, 18, '', { fontFamily: 'Arial', fontSize: '15px', color: C.muted });
    card.add(stageTitle);
    card.add(stageDetail);
    const button = this.add.rectangle(0, 62, 330, 48, 0x75efc1).setStrokeStyle(2, 0xf7f1ff).setInteractive({ useHandCursor: true });
    card.add(button);
    card.add(this.add.text(0, 62, 'START NEW RUN', { fontFamily: 'Arial', fontSize: '16px', color: C.ink, fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5));
    button.on('pointerover', () => button.setFillStyle(0xa5ffda));
    button.on('pointerout', () => button.setFillStyle(0x75efc1));
    let selectedStage = Math.max(1, Math.min(5, Number(this.registry.get('campaignStage') ?? 1)));
    let selectedStar = Math.max(1, Math.min(3, Number(this.registry.get('selectedStar') ?? 1)));
    const campaignGems = () => (this.registry.get('mapProgress') as { gems: number }).gems;
    const wavesFor = (stage: number, star: number) => stage <= 3 ? stage * 5 : stage === 4 && star < 3 ? 10 : 15;
    const clearKey = (stage: number, star: number) => `stage${stage}Star${star}Cleared`;
    const stageUnlocked = (stage: number, star: number) => stage === 1 || Boolean(this.registry.get(clearKey(stage - 1, star)));
    const tierComplete = (star: number) => Array.from({ length: 5 }, (_, i) => i + 1).every((stage) => Boolean(this.registry.get(clearKey(stage, star))));
    const starUnlocked = (star: number) => star === 1 || Boolean(this.registry.get(`campaignStar${star}Unlocked`));
    const stageButtons = Array.from({ length: 5 }, (_, index) => {
      const x = W / 2 - 232 + index * 116;
      const rect = this.add.rectangle(x, 529, 104, 42, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, 529, '', { fontFamily: 'Arial', fontSize: '12px', color: C.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
      rect.on('pointerdown', () => {
        const nextStage = index + 1;
        if (stageUnlocked(nextStage, selectedStar)) { selectedStage = nextStage; refreshCampaignChoice(); }
      });
      label.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        const nextStage = index + 1;
        if (stageUnlocked(nextStage, selectedStar)) { selectedStage = nextStage; refreshCampaignChoice(); }
      });
      return { rect, label, stage: index + 1 };
    });
    const starButtons = Array.from({ length: 3 }, (_, index) => {
      const x = W / 2 - 155 + index * 155;
      const rect = this.add.rectangle(x, 590, 136, 38, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, 590, '', { fontFamily: 'Arial', fontSize: '12px', color: C.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
      const chooseStar = () => {
        const tier = index + 1;
        if (starUnlocked(tier)) { selectedStar = tier; if (!stageUnlocked(selectedStage, tier)) selectedStage = 1; refreshCampaignChoice(); return; }
        const previousTier = tier - 1;
        if (tierComplete(previousTier)) {
          if (campaignGems() < 20) { stageDetail.setText(`Need 20 gems to unlock Star ${tier}.`); return; }
          const progress = this.registry.get('mapProgress') as { gems: number; unlockedMaps: MapId[] };
          progress.gems -= 20;
          this.registry.set('mapProgress', progress);
          this.registry.set(`campaignStar${tier}Unlocked`, true);
          selectedStar = tier;
          selectedStage = 1;
          refreshCampaignChoice();
        } else { stageDetail.setText(`Clear all five Star ${previousTier} stages to unlock Star ${tier}.`); }
      };
      rect.on('pointerdown', chooseStar);
      label.setInteractive({ useHandCursor: true }).on('pointerdown', chooseStar);
      return { rect, label, star: index + 1 };
    });
    const campaignHint = this.add.text(W / 2, 626, '', { fontFamily: 'Arial', fontSize: '13px', color: '#9ed9eb', align: 'center', wordWrap: { width: 590 } }).setOrigin(0.5);
    const refreshCampaignChoice = () => {
      const waves = wavesFor(selectedStage, selectedStar);
      stageTitle.setText(`Stage ${selectedStage}  ·  ${selectedStar} Star`);
      stageDetail.setText(`${waves} waves · ${MAPS.find((map) => map.campaignStage === selectedStage)?.name ?? 'Assigned campaign map'}`);
      const canStart = stageUnlocked(selectedStage, selectedStar) && starUnlocked(selectedStar);
      button.setAlpha(canStart ? 1 : 0.45);
      const clearXp = selectedStar === 1 ? 500 : selectedStar === 2 ? 800 : 1200;
      campaignHint.setText(canStart ? `First clear: +${clearXp} Player XP · Stages unlock in order · Clear all five to unlock the next Star tier for 20 gems` : `🔒 Clear the previous stage in Star ${selectedStar} first`);
      stageButtons.forEach(({ rect, label, stage }) => {
        const unlocked = stageUnlocked(stage, selectedStar);
        const active = stage === selectedStage;
        rect.setFillStyle(active ? 0x315b60 : 0x182733).setStrokeStyle(1, active ? 0xa9e7c2 : unlocked ? 0x607c82 : 0x493044);
        label.setText(`${unlocked ? '' : '🔒 '}${stage === 1 ? 'STAGE' : 'STAGE'} ${stage}${active ? '  ✓' : ''}`).setColor(unlocked ? C.cream : '#b9a5b0');
      });
      starButtons.forEach(({ rect, label, star }) => {
        const unlocked = starUnlocked(star);
        const eligible = star > 1 && tierComplete(star - 1);
        const active = star === selectedStar;
        rect.setFillStyle(active ? 0x315b60 : 0x182733).setStrokeStyle(1, active ? 0xf4c86a : unlocked || eligible ? 0x607c82 : 0x493044);
        label.setText(unlocked ? `${star} STAR` : eligible ? `${star} STAR · UNLOCK 20 G` : `🔒 ${star} STAR`).setColor(unlocked ? C.cream : eligible ? C.gold : '#b9a5b0');
      });
    };
    button.on('pointerdown', () => {
      if (!stageUnlocked(selectedStage, selectedStar) || !starUnlocked(selectedStar)) return;
      this.registry.set('runMode', 'campaign');
      this.registry.set('campaignStage', selectedStage);
      this.registry.set('selectedStar', selectedStar);
      this.scene.start('Game');
    });
    refreshCampaignChoice();

    this.add.text(980, 67, 'UP NEXT', { fontFamily: 'Arial', fontSize: '18px', color: C.muted, fontStyle: 'bold' });
    this.add.text(980, 150, '15 Waves\n23 Enemy Types', { fontFamily: 'Arial', fontSize: '24px', color: C.cream, fontStyle: 'bold', lineSpacing: 7 });
    this.add.text(980, 240, 'Mouse controls\n15 scripted waves\nNo account needed', { fontFamily: 'Arial', fontSize: '16px', color: C.muted, lineSpacing: 10 });
    this.add.text(980, 332, 'MAP PREVIEW', { fontFamily: 'Arial', fontSize: '14px', color: C.gold, fontStyle: 'bold', letterSpacing: 2 });
    const mapName = this.add.text(W - 170, 369, '', { fontFamily: 'Arial', fontSize: '15px', color: C.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5);
    const mapMeta = this.add.text(W - 170, 410, '', { fontFamily: 'Arial', fontSize: '13px', color: C.muted, align: 'center', wordWrap: { width: 235 } }).setOrigin(0.5);
    const progressText = this.add.text(W - 170, 433, '', { fontFamily: 'Arial', fontSize: '12px', color: '#9ed9eb', align: 'center' }).setOrigin(0.5);
    let mapIndex = Math.max(0, MAPS.findIndex((map) => map.id === this.registry.get('selectedMapId')));
    const progress = this.registry.get('mapProgress') as { gems: number; unlockedMaps: MapId[] };
    const prev = this.add.rectangle(W - 255, 478, 34, 32, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    const prevText = this.add.text(W - 255, 478, '‹', { fontFamily: 'Arial', fontSize: '24px', color: C.cream }).setOrigin(0.5);
    const next = this.add.rectangle(W - 75, 478, 34, 32, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    const nextText = this.add.text(W - 75, 478, '›', { fontFamily: 'Arial', fontSize: '24px', color: C.cream }).setOrigin(0.5);
    const preview = this.add.rectangle(W - 165, 478, 160, 32, 0x2d4b58).setStrokeStyle(1, 0xa9e7c2).setInteractive({ useHandCursor: true });
    this.add.text(W - 165, 478, 'PLAY MAP', { fontFamily: 'Arial', fontSize: '13px', color: C.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
    const endlessButton = this.add.rectangle(W - 165, 520, 210, 34, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    const endlessLabel = this.add.text(W - 165, 520, '', { fontFamily: 'Arial', fontSize: '11px', color: C.muted, fontStyle: 'bold', align: 'center', letterSpacing: 1 }).setOrigin(0.5);
    const mysteryToggle = this.add.rectangle(W - 223, 565, 110, 32, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    const mysteryLabel = this.add.text(W - 223, 565, '', { fontFamily: 'Arial', fontSize: '10px', color: C.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    const modifiersToggle = this.add.rectangle(W - 107, 565, 110, 32, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    const modifiersLabel = this.add.text(W - 107, 565, '', { fontFamily: 'Arial', fontSize: '10px', color: C.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    let mysteryEnabled = Boolean(this.registry.get('endlessMysteryEnabled'));
    let modifiersEnabled = Boolean(this.registry.get('endlessModifiersEnabled'));
    const endlessStatus = this.add.text(W - 165, 590, '', { fontFamily: 'Arial', fontSize: '10px', color: C.muted, align: 'center', wordWrap: { width: 236 }, lineSpacing: 2 }).setOrigin(0.5, 0);
    const startEndless = this.add.rectangle(W - 165, 646, 210, 34, 0xf4c86a).setStrokeStyle(1, 0xfff5d7).setInteractive({ useHandCursor: true });
    const startEndlessLabel = this.add.text(W - 165, 646, 'START ENDLESS', { fontFamily: 'Arial', fontSize: '12px', color: C.ink, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);

    const refreshMapChoice = () => {
      const map = MAPS[mapIndex]!;
      const owned = progress.unlockedMaps.includes(map.id);
      const selected = (this.registry.get('endlessMapSelection') ?? 'simple-loop') === map.id;
      mapName.setText(map.name);
      mapMeta.setText(`${map.category.toUpperCase()}  ·  ${map.theme}`);
      progressText.setText(`MAP ${map.number} OF ${MAPS.length}  ·  ${progress.gems} GEMS`);
      endlessLabel.setText(selected ? 'SELECTED FOR ENDLESS' : owned ? 'SELECT FOR ENDLESS' : `UNLOCK FOR ${map.unlockCost} GEMS`);
      endlessButton.setFillStyle(owned ? 0x2d4b58 : 0x182733).setStrokeStyle(1, owned ? 0xa9e7c2 : 0x607c82);
      endlessLabel.setColor(owned ? C.cream : C.muted);
      endlessStatus.setText(`${mysteryEnabled ? 'Mystery Towers ON' : 'Mystery Towers OFF'} · ${modifiersEnabled ? 'Random Modifiers ON' : 'Random Modifiers OFF'}\n${modifiersEnabled ? 'Modifier Endless earns no progression rewards (XP, gems, or mastery).' : 'Endless progression rewards continue after Wave 15.'}`);
      mysteryLabel.setText(`MYSTERY ${mysteryEnabled ? 'ON' : 'OFF'}`);
      mysteryToggle.setFillStyle(mysteryEnabled ? 0x31584d : 0x182733).setStrokeStyle(1, mysteryEnabled ? 0xa9e7c2 : 0x607c82);
      modifiersLabel.setText(`MODIFIERS ${modifiersEnabled ? 'ON' : 'OFF'}`);
      modifiersToggle.setFillStyle(modifiersEnabled ? 0x62404b : 0x182733).setStrokeStyle(1, modifiersEnabled ? 0xef7e9c : 0x607c82);
      endlessLabel.setText(selected ? 'MAP SELECTED FOR ENDLESS' : owned ? 'SELECT MAP FOR ENDLESS' : `UNLOCK FOR ${map.unlockCost} GEMS`);
    };
    prev.on('pointerdown', () => { mapIndex = (mapIndex + MAPS.length - 1) % MAPS.length; refreshMapChoice(); });
    prevText.setInteractive({ useHandCursor: true }).on('pointerdown', () => { mapIndex = (mapIndex + MAPS.length - 1) % MAPS.length; refreshMapChoice(); });
    next.on('pointerdown', () => { mapIndex = (mapIndex + 1) % MAPS.length; refreshMapChoice(); });
    nextText.setInteractive({ useHandCursor: true }).on('pointerdown', () => { mapIndex = (mapIndex + 1) % MAPS.length; refreshMapChoice(); });
    preview.on('pointerdown', () => {
      this.registry.set('runMode', 'map-preview');
      this.registry.set('selectedMapId', MAPS[mapIndex]!.id);
      this.scene.start('Game');
    });
    endlessButton.on('pointerdown', () => {
      const map = MAPS[mapIndex]!;
      if (!progress.unlockedMaps.includes(map.id) && progress.gems >= map.unlockCost) {
        progress.gems -= map.unlockCost;
        progress.unlockedMaps.push(map.id);
      }
      if (progress.unlockedMaps.includes(map.id)) this.registry.set('endlessMapSelection', map.id);
      refreshMapChoice();
    });
    mysteryToggle.on('pointerdown', () => { mysteryEnabled = !mysteryEnabled; this.registry.set('endlessMysteryEnabled', mysteryEnabled); refreshMapChoice(); });
    mysteryLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => { mysteryEnabled = !mysteryEnabled; this.registry.set('endlessMysteryEnabled', mysteryEnabled); refreshMapChoice(); });
    modifiersToggle.on('pointerdown', () => { modifiersEnabled = !modifiersEnabled; this.registry.set('endlessModifiersEnabled', modifiersEnabled); refreshMapChoice(); });
    modifiersLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => { modifiersEnabled = !modifiersEnabled; this.registry.set('endlessModifiersEnabled', modifiersEnabled); refreshMapChoice(); });
    startEndless.on('pointerdown', () => {
      const selectedId = (this.registry.get('endlessMapSelection') ?? 'simple-loop') as MapId;
      if (!progress.unlockedMaps.includes(selectedId)) { endlessStatus.setText('Select or unlock a map for Endless first.'); return; }
      this.registry.set('runMode', 'endless');
      this.registry.set('selectedMapId', selectedId);
      this.registry.set('selectedStar', Number(this.registry.get('selectedStar') ?? 1));
      this.scene.start('Game');
    });
    startEndlessLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => startEndless.emit('pointerdown'));
    refreshMapChoice();

    // The center of the lobby is the mode selector. Each choice opens its
    // setup here, leaving the profile and map preview columns in place.
    const centerMask = this.add.rectangle(640, 360, 620, 640, 0x17152f, 1).setStrokeStyle(2, 0x63dcff, 0.8);
    centerMask.setDepth(20).setInteractive();
    const modeTitle = this.add.text(640, 91, 'PICK YOUR ADVENTURE', { fontFamily: 'Trebuchet MS', fontSize: '25px', color: C.mint, fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setDepth(21);
    const modeHint = this.add.text(640, 130, 'Three ways to make a mess of the enemy plan.', { fontFamily: 'Arial', fontSize: '15px', color: C.muted }).setOrigin(0.5).setDepth(21);
    const modeButtons: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
    const setupObjects: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text | Phaser.GameObjects.Graphics> = [];
    const hideSetup = () => { setupObjects.forEach((object) => object.setVisible(false)); modeButtons.forEach((object) => object.setVisible(true)); modeTitle.setText('PICK YOUR ADVENTURE'); modeHint.setText('Three ways to make a mess of the enemy plan.'); };
    const addModeCard = (y: number, title: string, detail: string, color: string, open: () => void) => {
      const bg = this.add.rectangle(640, y, 500, 132, 0x201e40).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color).setDepth(21).setInteractive({ useHandCursor: true });
      const name = this.add.text(640, y - 22, title, { fontFamily: 'Trebuchet MS', fontSize: '30px', color, fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setDepth(22);
      const desc = this.add.text(640, y + 24, detail, { fontFamily: 'Arial', fontSize: '14px', color: C.muted, align: 'center', wordWrap: { width: 455 } }).setOrigin(0.5).setDepth(22);
      [bg, name, desc].forEach((object) => { modeButtons.push(object); object.setInteractive({ useHandCursor: true }).on('pointerdown', open); });
    };
    const setupHeader = (heading: string, subtitle: string, backAction: () => void = hideSetup) => {
      modeButtons.forEach((object) => object.setVisible(false));
      modeTitle.setText(heading); modeHint.setText(subtitle);
      const back = this.add.rectangle(415, 91, 90, 34, 0x2b2856).setStrokeStyle(1, 0x63dcff).setDepth(23).setInteractive({ useHandCursor: true });
      const backText = this.add.text(415, 91, '‹ BACK', { fontFamily: 'Arial', fontSize: '13px', color: C.cream, fontStyle: 'bold' }).setOrigin(0.5).setDepth(24).setInteractive({ useHandCursor: true });
      back.on('pointerdown', backAction); backText.on('pointerdown', backAction); setupObjects.push(back, backText);
    };
    const setupButton = (x: number, y: number, width: number, label: string, color: number, callback: () => void) => {
      const bg = this.add.rectangle(x, y, width, 48, color).setStrokeStyle(1, 0xfff5d7).setDepth(23).setInteractive({ useHandCursor: true });
      const text = this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '14px', color: C.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: width - 14 } }).setOrigin(0.5).setDepth(24).setInteractive({ useHandCursor: true });
      bg.on('pointerdown', callback); text.on('pointerdown', callback); setupObjects.push(bg, text); return { bg, text };
    };
    const launch = (runMode: string, extra: Record<string, unknown> = {}) => {
      this.registry.remove('odysseyState');
      if (runMode.startsWith('draft')) { this.registry.set('campaignStage', 1); this.registry.set('selectedStar', 1); }
      if (runMode === 'odyssey' || runMode === 'endless-odyssey') this.registry.set('selectedStar', 1);
      this.registry.set('runMode', runMode);
      Object.entries(extra).forEach(([key, value]) => this.registry.set(key, value));
      this.scene.start('Game');
    };
    addModeCard(232, 'CAMPAIGN', 'Choose a stage and star level. Build your permanent progress.', C.gold, () => {
      setupHeader('CAMPAIGN SETUP', 'Pick a stage and star level, then jump into the fight.');
      let stage = Math.max(1, Math.min(5, Number(this.registry.get('campaignStage') ?? 1)));
      let star = Math.max(1, Math.min(3, Number(this.registry.get('selectedStar') ?? 1)));
      const stageLabel = this.add.text(640, 244, '', { fontFamily: 'Trebuchet MS', fontSize: '30px', color: C.cream, fontStyle: 'bold' }).setOrigin(0.5).setDepth(22); setupObjects.push(stageLabel);
      const info = this.add.text(640, 290, '', { fontFamily: 'Arial', fontSize: '15px', color: C.muted, align: 'center' }).setOrigin(0.5).setDepth(22); setupObjects.push(info);
      const stageAllowed = (value: number) => value === 1 || Boolean(this.registry.get(`stage${value - 1}Star${star}Cleared`));
      const starAllowed = (value: number) => value === 1 || Boolean(this.registry.get(`campaignStar${value}Unlocked`));
      const refresh = () => {
        const waves = stage <= 3 ? stage * 5 : stage === 4 && star < 3 ? 10 : 15;
        stageLabel.setText(`${stageAllowed(stage) ? '' : '🔒 ' }STAGE ${stage}  ·  ${star} STAR`);
        info.setText(`${waves} waves  ·  ${MAPS.find((m) => m.campaignStage === stage)?.name ?? 'Campaign map'}${stageAllowed(stage) ? '' : `\nClear Stage ${stage - 1} at ${star} Star to unlock this stage.`}`);
      };
      setupButton(485, 354, 64, '‹', 0x2b2856, () => { stage = Math.max(1, stage - 1); refresh(); });
      setupButton(795, 354, 64, '›', 0x2b2856, () => { stage = Math.min(5, stage + 1); refresh(); });
      [1, 2, 3].forEach((value, index) => setupButton(500 + index * 140, 430, 118, `${value} STAR`, 0x2b2856, () => {
        if (starAllowed(value)) { star = value; refresh(); return; }
        const complete = Array.from({ length: 5 }, (_, i) => i + 1).every((s) => Boolean(this.registry.get(`stage${s}Star${value - 1}Cleared`)));
        const progress = this.registry.get('mapProgress') as { gems: number; unlockedMaps: MapId[] };
        if (complete && progress.gems >= 20) { progress.gems -= 20; this.registry.set('mapProgress', progress); this.registry.set(`campaignStar${value}Unlocked`, true); star = value; stage = 1; refresh(); }
        else info.setText(complete ? `Need 20 gems to unlock Star ${value}.` : `Clear all five Star ${value - 1} stages to unlock Star ${value}.`);
      }));
      setupButton(640, 526, 300, 'START CAMPAIGN', 0x315b60, () => {
        if (!starAllowed(star) || !stageAllowed(stage)) { info.setText('Clear the previous stage in this Star tier to unlock this stage.'); return; }
        this.registry.set('campaignStage', stage); this.registry.set('selectedStar', star); launch('campaign');
      });
      refresh();
    });
    addModeCard(390, 'DRAFT', 'Choose a fresh tower roster as the run unfolds.', C.blue, () => {
      setupHeader('DRAFT MODE', 'Draft three starter towers. New picks arrive as you clear waves.');
      setupButton(640, 290, 420, 'STANDARD DRAFT CAMPAIGN  ·  15 WAVES', 0x315b60, () => launch('draft-campaign', { draftRoster: [] }));
      const standardInfo = this.add.text(640, 329, 'Pick 3 starter towers, then draft after Waves 5 and 10.\nFirst clear: +10 gems and +500 Player XP.', { fontFamily: 'Arial', fontSize: '12px', color: C.muted, align: 'center', lineSpacing: 4, wordWrap: { width: 470 } }).setOrigin(0.5).setDepth(22); setupObjects.push(standardInfo);
      setupButton(640, 390, 420, 'DRAFT ENDLESS  ·  KEEP DRAFTING', 0x315b60, () => launch('draft-endless', { draftRoster: [] }));
      const endlessInfo = this.add.text(640, 429, 'Pick 3 starters; draft at Waves 5, 10, 15, then every 5 waves.\nAfter 6 towers, replace one or skip for $500.', { fontFamily: 'Arial', fontSize: '12px', color: C.muted, align: 'center', lineSpacing: 4, wordWrap: { width: 470 } }).setOrigin(0.5).setDepth(22); setupObjects.push(endlessInfo);
      const note = this.add.text(640, 493, 'Drafted tower types stay available for the rest of the run.\nEndless gives the usual endless XP and gem rewards.', { fontFamily: 'Arial', fontSize: '13px', color: C.muted, align: 'center', lineSpacing: 6 }).setOrigin(0.5).setDepth(22); setupObjects.push(note);
    });
    addModeCard(548, 'TOWER ODYSSEY', 'Travel through connected maps. Heal, prepare, or extract between nodes.', C.gold, () => {
      const clearSetup = () => setupObjects.forEach((object) => object.setVisible(false));
      const showLengthPicker = () => {
        clearSetup();
        setupHeader('TOWER ODYSSEY', 'Your base health and choices carry across every map.');
        setupButton(640, 290, 420, 'MINI ODYSSEY  ·  3 MAPS', 0x315b60, () => showRoutePreview(3));
        const miniInfo = this.add.text(640, 329, '3 maps: Beginner, Advanced, then Expert.\nClear all 3 for +15 gems and +1,000 Player XP.', { fontFamily: 'Arial', fontSize: '12px', color: C.muted, align: 'center', lineSpacing: 4, wordWrap: { width: 470 } }).setOrigin(0.5).setDepth(22); setupObjects.push(miniInfo);
        setupButton(640, 390, 420, 'GRAND ODYSSEY  ·  5 MAPS', 0x315b60, () => showRoutePreview(5));
        const grandInfo = this.add.text(640, 429, '5 maps with rising wave counts and route choices.\nClear all 5 for +40 gems and +2,500 Player XP.', { fontFamily: 'Arial', fontSize: '12px', color: C.muted, align: 'center', lineSpacing: 4, wordWrap: { width: 470 } }).setOrigin(0.5).setDepth(22); setupObjects.push(grandInfo);
        setupButton(640, 490, 420, 'ENDLESS ODYSSEY  ·  INFINITE SECTORS', 0x493d60, () => showRoutePreview(3, true));
        const endlessInfo = this.add.text(640, 529, 'Explore an endless branching expedition. Every 3 maps, choose a route at a sector waypoint.', { fontFamily: 'Arial', fontSize: '12px', color: C.muted, align: 'center', lineSpacing: 4, wordWrap: { width: 475 } }).setOrigin(0.5).setDepth(22); setupObjects.push(endlessInfo);
        const note = this.add.text(640, 586, 'Between sectors, heal, reinforce, scout, or extract with 75% of your vault. A wipeout loses it.', { fontFamily: 'Arial', fontSize: '12px', color: C.muted, align: 'center', lineSpacing: 5, wordWrap: { width: 490 } }).setOrigin(0.5).setDepth(22); setupObjects.push(note);
      };
      const showRoutePreview = (length: number, endless = false) => {
        const count = length === 5 ? 5 : 3;
        const progress = this.registry.get('mapProgress') as { unlockedMaps: MapId[]; gems: number };
        const campaignIds = new Set(Object.values(CAMPAIGN_MAPS));
        const eligibleMaps = endless ? MAPS : MAPS.filter((map) => campaignIds.has(map.id) || progress.unlockedMaps.includes(map.id) || map.category === 'Expert');
        const categories = endless ? ['Beginner', 'Beginner', 'Beginner'] : count === 3 ? ['Beginner', 'Advanced', 'Expert'] : ['Beginner', 'Beginner', 'Advanced', 'Advanced', 'Expert'];
        const waves = endless ? [10, 11, 12] : count === 3 ? [10, 12, 15] : [10, 11, 12, 13, 15];
        const mutationChoices = ['sluggishMechanisms', 'rapidFire', 'crowdedWaves', 'extendedReach', 'dulledImpact', 'bountySurge'];
        const nodes = categories.map((category, index) => {
          const choices = eligibleMaps.filter((map) => map.category === category);
          const map = choices[Math.floor(Math.random() * choices.length)] ?? MAPS.find((entry) => entry.category === category) ?? MAPS[0]!;
          const flexible = mutationChoices.filter((id) => !['sluggishMechanisms', 'crowdedWaves', 'dulledImpact'].includes(id));
          const bad = mutationChoices.filter((id) => ['sluggishMechanisms', 'crowdedWaves', 'dulledImpact'].includes(id));
          const sector = 1;
          const sides: Array<'flex' | 'bad'> = !endless ? ['flex'] : sector === 1 ? ['flex'] : [];
          const mutationIds = sides.map((side) => {
            const pool = side === 'bad' ? bad : side === 'flex' ? flexible.concat(bad) : flexible;
            return pool[Math.floor(Math.random() * pool.length)]!;
          });
          if (!mutationIds.length) mutationIds.push(mutationChoices[Math.floor(Math.random() * mutationChoices.length)]!);
          return { mapId: map.id, waves: waves[index]!, mutationId: mutationIds[0]!, mutationIds };
        });
        const odysseyState = { length: count, nodeIndex: 0, nodes, baseHealth: 100, carryCoins: 0, vaultXp: 0, vaultGems: 0, vaultMastery: {}, nextDamageBoost: 1, nextRangeBoost: 1, scoutUntil: -1, endless, sector: 1 };
        clearSetup();
        setupHeader(endless ? 'ENDLESS ODYSSEY · SECTOR 1' : `${length === 3 ? 'MINI' : 'GRAND'} ODYSSEY ROUTE`, endless ? 'Pick a map for the first sector. Routes and mutators keep branching as you survive.' : 'Follow the expedition map from the first node to the finish.', showLengthPicker);
        let firstNode = 0;
        const leftCardX = 495;
        const rightCardX = 790;
        const cardY = 325;
        const cardWidth = 230;
        const cardHeight = 154;
        const mapArt: Phaser.GameObjects.Graphics[] = [];
        const firstLabel = this.add.text(leftCardX, 194, '', { fontFamily: 'Arial', fontSize: '16px', color: C.gold, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(23); setupObjects.push(firstLabel);
        const secondLabel = this.add.text(rightCardX, 194, '', { fontFamily: 'Arial', fontSize: '16px', color: C.gold, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(23); setupObjects.push(secondLabel);
        const firstFrame = this.add.rectangle(leftCardX, cardY, cardWidth, cardHeight, 0x25234a).setStrokeStyle(2, 0xffd15e).setDepth(22); setupObjects.push(firstFrame);
        const secondFrame = this.add.rectangle(rightCardX, cardY, cardWidth, cardHeight, 0x25234a).setStrokeStyle(2, 0x63dcff).setDepth(22); setupObjects.push(secondFrame);
        const firstName = this.add.text(leftCardX, 421, '', { fontFamily: 'Arial', fontSize: '15px', color: C.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 238 } }).setOrigin(0.5).setDepth(23); setupObjects.push(firstName);
        const secondName = this.add.text(rightCardX, 421, '', { fontFamily: 'Arial', fontSize: '15px', color: C.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 238 } }).setOrigin(0.5).setDepth(23); setupObjects.push(secondName);
        const firstMeta = this.add.text(leftCardX, 456, '', { fontFamily: 'Arial', fontSize: '11px', color: C.muted, align: 'center', wordWrap: { width: 240 }, lineSpacing: 3 }).setOrigin(0.5).setDepth(23); setupObjects.push(firstMeta);
        const secondMeta = this.add.text(rightCardX, 456, '', { fontFamily: 'Arial', fontSize: '11px', color: C.muted, align: 'center', wordWrap: { width: 240 }, lineSpacing: 3 }).setOrigin(0.5).setDepth(23); setupObjects.push(secondMeta);
        const arrow = this.add.text(642, cardY, '➜', { fontFamily: 'Arial', fontSize: '36px', color: C.gold, fontStyle: 'bold' }).setOrigin(0.5).setDepth(24); setupObjects.push(arrow);
        const progressLabel = this.add.text(640, 505, '', { fontFamily: 'Arial', fontSize: '12px', color: '#9ed9eb', fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(23); setupObjects.push(progressLabel);
        const scrollTrack = this.add.rectangle(640, 536, 430, 12, 0x090c19).setStrokeStyle(1, 0x607c82).setDepth(23).setInteractive({ useHandCursor: true }); setupObjects.push(scrollTrack);
        const handleWidth = Math.max(78, 430 * 2 / count);
        const scrollHandle = this.add.rectangle(640, 536, handleWidth, 10, 0x75efc1).setDepth(24).setInteractive({ useHandCursor: true }); setupObjects.push(scrollHandle);
        const prev = setupButton(390, 325, 40, '‹', 0x2b2856, () => { firstNode = Math.max(0, firstNode - 1); refreshRoute(); });
        const next = setupButton(890, 325, 40, '›', 0x2b2856, () => { firstNode = Math.min(count - 2, firstNode + 1); refreshRoute(); });
        const startButton = setupButton(640, 613, 300, endless ? 'START ENDLESS ODYSSEY' : `START ${length === 3 ? 'MINI' : 'GRAND'} ODYSSEY`, 0x315b60, () => launch(endless ? 'endless-odyssey' : 'odyssey', { odysseyLength: count, odysseyState }));
        const mutationName = (id: string) => ({ sluggishMechanisms: 'Sluggish Mechanisms', rapidFire: 'Rapid Fire', crowdedWaves: 'Crowded Waves', extendedReach: 'Extended Reach', dulledImpact: 'Dulled Impact', bountySurge: 'Bounty Surge' } as Record<string, string>)[id] ?? id;
        const paintMap = (nodeIndex: number, x: number) => {
          const map = MAPS.find((entry) => entry.id === nodes[nodeIndex]!.mapId)!;
          const art = this.add.graphics().setDepth(23);
          art.fillStyle(map.ground, 1).fillRoundedRect(x - 108, cardY - 69, 216, 138, 9);
          const drawRoute = (route: ReturnType<typeof createMapRoutes>[number]) => {
            art.lineStyle(9, map.road, 1);
            for (let i = 1; i < route.length; i += 1) {
              const a = route[i - 1]!; const b = route[i]!;
              const px = (tileX: number) => x - 98 + tileX / (BOARD_COLUMNS - 1) * 196;
              const py = (tileY: number) => cardY - 59 + tileY / (BOARD_ROWS - 1) * 118;
              art.lineBetween(px(a.x), py(a.y), px(b.x), py(b.y));
            }
          };
          for (const route of createMapRoutes(map.id)) drawRoute(route);
          mapArt.push(art); setupObjects.push(art);
        };
        const refreshRoute = () => {
          firstNode = Phaser.Math.Clamp(firstNode, 0, count - 2);
          mapArt.splice(0).forEach((art) => {
            const position = setupObjects.indexOf(art);
            if (position >= 0) setupObjects.splice(position, 1);
            art.destroy();
          });
          const details = (index: number) => {
            const node = nodes[index]!; const map = MAPS.find((entry) => entry.id === node.mapId)!;
            return { map, node };
          };
          const one = details(firstNode); const two = details(firstNode + 1);
          firstLabel.setText(firstNode === 0 ? 'NODE 1 · START' : `NODE ${firstNode + 1}`);
          secondLabel.setText(`NODE ${firstNode + 2}${!endless && firstNode + 2 === count ? ' · FINISH' : ''}`);
          firstName.setText(one.map.name); secondName.setText(two.map.name);
          firstMeta.setText(`${one.map.category.toUpperCase()} · ${one.map.theme}\n${one.node.waves} waves · ${(one.node.mutationIds ?? [one.node.mutationId]).map(mutationName).join(' + ')}`);
          secondMeta.setText(`${two.map.category.toUpperCase()} · ${two.map.theme}\n${two.node.waves} waves · ${(two.node.mutationIds ?? [two.node.mutationId]).map(mutationName).join(' + ')}`);
          paintMap(firstNode, leftCardX); paintMap(firstNode + 1, rightCardX);
          progressLabel.setText(endless ? `SECTOR 1 · SHOWING NODES ${firstNode + 1}–${firstNode + 2} OF ∞` : `SHOWING NODES ${firstNode + 1}–${firstNode + 2} OF ${count}`);
          const travel = Math.max(0, firstNode / (count - 2));
          scrollHandle.setX(640 - (430 - handleWidth) / 2 + travel * (430 - handleWidth));
          prev.bg.setAlpha(firstNode === 0 ? 0.4 : 1); next.bg.setAlpha(firstNode >= count - 2 ? 0.4 : 1);
        };
        const seekTrack = (pointer: Phaser.Input.Pointer) => {
          const ratio = Phaser.Math.Clamp((pointer.x - 425) / 430, 0, 1);
          firstNode = Math.round(ratio * (count - 2)); refreshRoute();
        };
        scrollTrack.on('pointerdown', seekTrack);
        scrollHandle.on('pointerdown', (pointer: Phaser.Input.Pointer) => { seekTrack(pointer); this.input.setDraggable(scrollHandle); });
        scrollHandle.on('drag', (pointer: Phaser.Input.Pointer) => seekTrack(pointer));
        this.input.setDraggable(scrollHandle);
        prev.text.setAlpha(1); next.text.setAlpha(1); startButton.text.setAlpha(1);
        refreshRoute();
      };
      showLengthPicker();
    });
    // Keep the legacy campaign picker below the mask for its progression
    // state; the new central setup opens the same choices in a larger layout.
    centerMask.setDepth(20);
  }
}
