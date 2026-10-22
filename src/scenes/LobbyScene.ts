import Phaser from 'phaser';
import { MAPS, type MapId } from '../game/map';
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
    this.add.text(62, 594, 'GOOFY DEFENSE  •  1.1.2', { fontFamily: 'Arial', fontSize: '13px', color: C.muted, lineSpacing: 7 });

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
  }
}
