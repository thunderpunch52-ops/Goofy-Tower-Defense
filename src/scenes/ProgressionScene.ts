import Phaser from 'phaser';
import { ENEMIES, type EnemyKey } from '../game/content';
import { ENDLESS_ELITES, endlessThreatForEnemy, type EndlessEliteId } from '../game/endless';
import { TOWERS } from '../game/towers';
import { exportProgressCode, importProgressCode, initializeProgress, saveTowerMastery, towerGemUnlockCost, towerMastery, towerUnlocked, towerUnlockRequirement, xpToEnterLevel } from '../state/progression';

const W = 1280;
const C = { ink: '#17152f', panel: '#201e40', panel2: '#2b2856', cream: '#fff5d7', muted: '#c4c3e5', mint: '#75efc1', gold: '#ffd15e', pink: '#ff6d9e', blue: '#63dcff' };
const RARITY_ORDER = ['Common', 'Rare', 'Epic', 'Legendary'] as const;
const COLLECTION_TOWERS = [...TOWERS].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
type Tab = 'mastery' | 'bestiary' | 'save';
type BestiaryCategory = 'Normal' | 'Fast' | 'Strong' | 'Unique' | 'Boss' | 'Megaboss' | 'Elite Types';
const BESTIARY_CATEGORIES: BestiaryCategory[] = ['Normal', 'Fast', 'Strong', 'Unique', 'Boss', 'Megaboss', 'Elite Types'];

export class ProgressionScene extends Phaser.Scene {
  private tab: Tab = 'mastery';
  private selectedTower = 'angryPigeon';
  private selectedEnemy: EnemyKey = 'sock';
  private bestiaryCategory: BestiaryCategory = 'Normal';
  private selectedBestiaryElite: EndlessEliteId = 'midas';
  private tabObjects: Phaser.GameObjects.GameObject[] = [];
  private tabControls: Phaser.GameObjects.GameObject[] = [];
  private status?: Phaser.GameObjects.Text;
  private masteryDetail?: Phaser.GameObjects.Text;
  private bestiaryDetail?: Phaser.GameObjects.Text;
  private towerLabels: Phaser.GameObjects.Text[] = [];
  private towerLevelUpAlerts: Phaser.GameObjects.Text[] = [];
  private towerCardContainer?: Phaser.GameObjects.Container;
  private towerScrollThumb?: Phaser.GameObjects.Rectangle;
  private towerScrollOffset = 0;
  private towerScrollMax = 0;
  private enemyLabels: Phaser.GameObjects.Text[] = [];
  private enemyButtons: Phaser.GameObjects.Rectangle[] = [];
  private eliteLabels: Phaser.GameObjects.Text[] = [];
  private eliteButtons: Phaser.GameObjects.Rectangle[] = [];
  private bestiaryCategoryButtons: Array<{ category: BestiaryCategory; button: Phaser.GameObjects.Rectangle }> = [];
  private pathButtons: Phaser.GameObjects.Rectangle[] = [];
  private pathLabels: Phaser.GameObjects.Text[] = [];
  private selectedMasteryPath?: number;
  private masteryUpgradeOpen = false;
  private masteryUpgradeButton?: Phaser.GameObjects.Rectangle;
  private masteryUpgradeLabel?: Phaser.GameObjects.Text;
  private masteryUpgradeDescription?: Phaser.GameObjects.Text;
  private masteryUpgradeConfirm?: Phaser.GameObjects.Rectangle;
  private masteryUpgradeConfirmLabel?: Phaser.GameObjects.Text;
  private masteryUpgradeDeny?: Phaser.GameObjects.Rectangle;
  private masteryUpgradeDenyLabel?: Phaser.GameObjects.Text;
  private gemButton?: Phaser.GameObjects.Rectangle;
  private gemLabel?: Phaser.GameObjects.Text;
  private codeArea?: Phaser.GameObjects.DOMElement;
  private importField?: Phaser.GameObjects.DOMElement;
  private importCodeDraft = '';

  constructor() { super('Progression'); }

  create(): void {
    // Phaser reuses scene instances when returning from a run. Discard every
    // reference to the previous visit's destroyed display objects before
    // rebuilding the progression UI, or later visits update stale controls.
    this.removeSaveFields();
    this.input.off('wheel');
    this.tabObjects.length = 0;
    this.tabControls.length = 0;
    this.towerLabels.length = 0;
    this.towerLevelUpAlerts.length = 0;
    this.towerCardContainer = undefined;
    this.towerScrollThumb = undefined;
    this.towerScrollOffset = 0;
    this.towerScrollMax = 0;
    this.enemyLabels.length = 0;
    this.enemyButtons.length = 0;
    this.eliteLabels.length = 0;
    this.eliteButtons.length = 0;
    this.bestiaryCategoryButtons.length = 0;
    this.bestiaryCategory = 'Normal';
    this.selectedBestiaryElite = 'midas';
    this.pathButtons.length = 0;
    this.pathLabels.length = 0;
    this.status = undefined;
    this.masteryDetail = undefined;
    this.bestiaryDetail = undefined;
    this.masteryUpgradeButton = undefined;
    this.masteryUpgradeLabel = undefined;
    this.masteryUpgradeDescription = undefined;
    this.masteryUpgradeConfirm = undefined;
    this.masteryUpgradeConfirmLabel = undefined;
    this.masteryUpgradeDeny = undefined;
    this.masteryUpgradeDenyLabel = undefined;
    this.gemButton = undefined;
    this.gemLabel = undefined;
    this.selectedMasteryPath = undefined;
    this.masteryUpgradeOpen = false;

    initializeProgress(this.registry);
    // A lobby button may request a particular section once. Never remember the
    // save-code tab across visits or runs.
    const requestedTab = this.registry.get('requestedProgressionTab');
    this.tab = requestedTab === 'bestiary' || requestedTab === 'save' ? requestedTab : 'mastery';
    this.registry.set('requestedProgressionTab', undefined);
    this.cameras.main.setBackgroundColor(C.ink);
    const bg = this.add.graphics();
    bg.fillStyle(0x201e40, 1).lineStyle(2, 0x57558d, 1).fillRoundedRect(20, 20, W - 40, 680, 24).strokeRoundedRect(20, 20, W - 40, 680, 24);
    bg.fillStyle(0x2b2856, 1).fillRoundedRect(40, 146, 545, 527, 16);
    bg.fillStyle(0x2b2856, 1).fillRoundedRect(605, 146, 635, 527, 16);
    bg.fillStyle(0xff6d9e, 1).fillRoundedRect(40, 146, 7, 527, 4);
    bg.fillStyle(0x63dcff, 1).fillRoundedRect(1233, 146, 7, 527, 4);
    this.add.text(52, 48, 'DEFENDER PROGRESSION', { fontFamily: 'Trebuchet MS', fontSize: '28px', color: C.cream, fontStyle: 'bold', stroke: '#ff6d9e', strokeThickness: 1 });
    this.status = this.add.text(52, 84, '', { fontFamily: 'Arial', fontSize: '16px', color: C.mint, fontStyle: 'bold' });
    const back = this.add.rectangle(1160, 66, 120, 42, 0x2d4b58).setStrokeStyle(1, 0xa9e7c2).setInteractive({ useHandCursor: true });
    this.add.text(1160, 66, 'BACK', { fontFamily: 'Arial', fontSize: '13px', color: C.cream, fontStyle: 'bold' }).setOrigin(0.5);
    back.on('pointerdown', () => this.scene.start('Lobby'));
    this.makeTabs();
    this.makeMasteryPanel();
    this.makeBestiaryPanel();
    this.makeSavePanel();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.removeSaveFields();
    });
    this.showTab(this.tab);
  }

  private makeTabs(): void {
    const labels: Array<[Tab, string, number]> = [['mastery', 'TOWER MASTERY', 180], ['bestiary', 'BESTIARY', 380], ['save', 'SAVE CODE', 555]];
    labels.forEach(([tab, label, x]) => {
      const button = this.add.rectangle(x, 124, tab === 'mastery' ? 180 : 150, 34, 0x35336b).setStrokeStyle(1, 0x7775aa).setInteractive({ useHandCursor: true });
      const text = this.add.text(x, 124, label, { fontFamily: 'Arial', fontSize: '14px', color: C.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
      button.on('pointerdown', () => this.showTab(tab));
      text.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showTab(tab));
      this.tabControls.push(button, text);
    });
  }

  private makeMasteryPanel(): void {
    this.add.text(58, 151, 'TOWER COLLECTION', { fontFamily: 'Arial', fontSize: '15px', color: C.gold, fontStyle: 'bold', letterSpacing: 2 }).setData('tab', 'mastery');
    let playerLevelXp = Math.max(0, Number(this.registry.get('playerXP') ?? 0));
    let playerLevel = 1;
    while (playerLevelXp >= xpToEnterLevel(playerLevel + 1)) {
      playerLevelXp -= xpToEnterLevel(playerLevel + 1);
      playerLevel += 1;
    }
    const nextPlayerLevelXp = xpToEnterLevel(playerLevel + 1);
    this.add.text(632, 155, 'PLAYER LEVEL MILESTONES', { fontFamily: 'Arial', fontSize: '14px', color: C.gold, fontStyle: 'bold', letterSpacing: 1 }).setData('tab', 'mastery');
    this.add.text(1208, 155, `LEVEL ${playerLevel} · ${playerLevelXp.toLocaleString()} / ${nextPlayerLevelXp.toLocaleString()} XP`, { fontFamily: 'Arial', fontSize: '12px', color: C.mint, fontStyle: 'bold', align: 'right' }).setOrigin(1, 0).setData('tab', 'mastery');
    const milestoneLevels = [2, 3, 5, 6, 10, 12, 15];
    const milestoneRewards = [
      'L2 ANVIL\nTRAPDOOR', 'L3 SODA\nMACHINE MECH', 'L5 DISCO\nTURRET', 'L6 LASER OFFICE\nPRINTER',
      'L10 CAT LASER\nPOINTER', 'L12 SENTIENT\nTRAFFIC LIGHT', 'L15 COSMIC\nROOMBA',
    ];
    const trackStart = 650;
    const trackEnd = 1150;
    const trackY = 191;
    const levelPosition = (level: number) => trackStart + (Math.min(level, 15) - 1) / 14 * (trackEnd - trackStart);
    const levelProgress = Math.min(1, playerLevelXp / nextPlayerLevelXp);
    const progressPosition = trackStart + (Math.min(playerLevel - 1 + levelProgress, 14) / 14) * (trackEnd - trackStart);
    const milestones = this.add.graphics().setData('tab', 'mastery');
    milestones.lineStyle(4, 0x514f78, 1).lineBetween(trackStart, trackY, trackEnd, trackY);
    milestones.lineStyle(4, 0x75efc1, 1).lineBetween(trackStart, trackY, progressPosition, trackY);
    milestoneLevels.forEach((level, index) => {
      const x = levelPosition(level);
      const complete = playerLevel >= level;
      const upcoming = !complete && milestoneLevels.find((milestone) => playerLevel < milestone) === level;
      milestones.fillStyle(complete ? 0x75efc1 : upcoming ? 0xffd15e : 0x35336b, 1)
        .lineStyle(2, complete ? 0xb8ffe0 : upcoming ? 0xffe39c : 0x7775aa, 1)
        .fillCircle(x, trackY, 9).strokeCircle(x, trackY, 9);
      const labelY = index % 2 === 0 ? 204 : 226;
      this.add.text(x, labelY, milestoneRewards[index]!, { fontFamily: 'Arial', fontSize: '7px', color: complete ? C.mint : C.cream, fontStyle: 'bold', align: 'center', lineSpacing: 0 }).setOrigin(0.5, 0).setData('tab', 'mastery');
    });
    milestones.fillStyle(0xffd15e, 1).fillCircle(progressPosition, trackY, 4);
    this.towerCardContainer = this.add.container(0, 0).setData('tab', 'mastery').setDepth(5);
    const maskShape = this.make.graphics({ x: 0, y: 0 });
    maskShape.fillStyle(0xffffff).fillRect(48, 180, 515, 480);
    this.towerCardContainer.setMask(maskShape.createGeometryMask());
    maskShape.setVisible(false);
    const visibleHeight = 480;
    const rowCount = Math.ceil(COLLECTION_TOWERS.length / 2);
    const contentHeight = 188 + rowCount * 66 - 180;
    this.towerScrollMax = Math.max(0, contentHeight - visibleHeight);
    const scrollTrack = this.add.rectangle(574, 420, 10, visibleHeight, 0x17152f).setStrokeStyle(1, 0x7775aa).setData('tab', 'mastery').setDepth(6);
    const thumbHeight = Math.max(48, visibleHeight * visibleHeight / contentHeight);
    this.towerScrollThumb = this.add.rectangle(574, 180 + thumbHeight / 2, 8, thumbHeight, 0x63dcff).setStrokeStyle(1, 0xc8f6ff).setInteractive({ useHandCursor: true }).setData('tab', 'mastery').setDepth(7);
    this.add.text(574, 667, 'SCROLL', { fontFamily: 'Arial', fontSize: '7px', color: C.blue, fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setData('tab', 'mastery').setDepth(7);
    this.input.setDraggable(this.towerScrollThumb);
    this.towerScrollThumb.on('drag', (_pointer: Phaser.Input.Pointer, _dragX: number, dragY: number) => {
      const half = thumbHeight / 2;
      const top = 180 + half;
      const bottom = 660 - half;
      this.towerScrollThumb?.setY(Phaser.Math.Clamp(dragY, top, bottom));
      const ratio = (this.towerScrollThumb!.y - top) / Math.max(1, bottom - top);
      this.towerScrollOffset = ratio * this.towerScrollMax;
      this.towerCardContainer?.setY(-this.towerScrollOffset);
    });
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (this.tab !== 'mastery' || pointer.x < 40 || pointer.x > 585 || pointer.y < 175 || pointer.y > 670) return;
      this.towerScrollOffset = Phaser.Math.Clamp(this.towerScrollOffset + dy * 0.65, 0, this.towerScrollMax);
      this.towerCardContainer?.setY(-this.towerScrollOffset);
      const half = thumbHeight / 2;
      const top = 180 + half;
      const bottom = 660 - half;
      this.towerScrollThumb?.setY(top + this.towerScrollOffset / Math.max(1, this.towerScrollMax) * (bottom - top));
    });
    COLLECTION_TOWERS.forEach((tower, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 65 + col * 260;
      const y = 188 + row * 66;
      const card = this.add.rectangle(x + 120, y + 20, 238, 54, 0x201e40).setStrokeStyle(1, 0x625e9a).setInteractive({ useHandCursor: true }).setData('tab', 'mastery');
      const label = this.add.text(x + 14, y + 8, '', { fontFamily: 'Arial', fontSize: '12px', color: C.cream, fontStyle: 'bold', wordWrap: { width: 214 }, maxLines: 2, lineSpacing: 1 }).setData('tab', 'mastery');
      const levelUpAlert = this.add.text(x + 224, y + 4, '!', { fontFamily: 'Arial', fontSize: '18px', color: C.pink, fontStyle: 'bold', stroke: C.ink, strokeThickness: 3 }).setOrigin(0.5, 0).setVisible(false).setData('tab', 'mastery');
      const select = (pointer?: Phaser.Input.Pointer) => {
        if (pointer && (pointer.y < 180 || pointer.y > 660 || pointer.x < 48 || pointer.x > 563)) return;
        this.selectedTower = tower.id; this.selectedMasteryPath = undefined; this.masteryUpgradeOpen = false; this.updateMasteryDetails();
      };
      card.on('pointerdown', select);
      label.setInteractive({ useHandCursor: true }).on('pointerdown', select);
      this.towerCardContainer!.add([card, label, levelUpAlert]);
      this.towerLabels.push(label);
      this.towerLevelUpAlerts.push(levelUpAlert);
    });
    this.tabObjects.push(this.towerCardContainer, scrollTrack, this.towerScrollThumb);
    this.masteryDetail = this.add.text(632, 251, '', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: C.cream, lineSpacing: 5, wordWrap: { width: 570 } }).setData('tab', 'mastery');
    const pathNames = ['PATH 1', 'PATH 2', 'PATH 3'];
    pathNames.forEach((name, index) => {
      const x = 718 + index * 164;
      const button = this.add.rectangle(x, 518, 150, 44, 0x292750).setStrokeStyle(2, [0x63dcff, 0xc58bf0, 0xffd15e][index]!).setInteractive({ useHandCursor: true }).setData('tab', 'mastery');
      const label = this.add.text(x, 518, name, { fontFamily: 'Trebuchet MS', fontSize: '13px', color: C.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5).setData('tab', 'mastery');
      button.on('pointerdown', () => this.selectMasteryPath(index));
      label.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.selectMasteryPath(index));
      this.pathButtons.push(button);
      this.pathLabels.push(label);
      this.tabObjects.push(button, label);
    });
    this.masteryUpgradeButton = this.add.rectangle(930, 562, 345, 34, 0x292750).setStrokeStyle(2, 0xffd15e).setInteractive({ useHandCursor: true }).setData('tab', 'mastery');
    this.masteryUpgradeLabel = this.add.text(930, 562, 'CHOOSE A PATH', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: C.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 325 } }).setOrigin(0.5).setData('tab', 'mastery');
    this.masteryUpgradeButton.on('pointerdown', () => this.revealMasteryUpgrade());
    this.masteryUpgradeLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.revealMasteryUpgrade());
    this.masteryUpgradeDescription = this.add.text(923, 590, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: C.cream, align: 'center', wordWrap: { width: 560 }, lineSpacing: 2 }).setOrigin(0.5, 0).setData('tab', 'mastery');
    this.masteryUpgradeConfirm = this.add.rectangle(820, 647, 136, 36, 0x27714f).setStrokeStyle(2, 0x75efc1).setInteractive({ useHandCursor: true }).setVisible(false).setData('tab', 'mastery');
    this.masteryUpgradeConfirmLabel = this.add.text(820, 647, 'CONFIRM', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: C.cream, fontStyle: 'bold' }).setOrigin(0.5).setVisible(false).setData('tab', 'mastery');
    this.masteryUpgradeDeny = this.add.rectangle(1040, 647, 136, 36, 0x60304d).setStrokeStyle(2, 0xff6d9e).setInteractive({ useHandCursor: true }).setVisible(false).setData('tab', 'mastery');
    this.masteryUpgradeDenyLabel = this.add.text(1040, 647, 'DENY', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: C.cream, fontStyle: 'bold' }).setOrigin(0.5).setVisible(false).setData('tab', 'mastery');
    this.masteryUpgradeConfirm.on('pointerdown', () => this.confirmMasteryUpgrade());
    this.masteryUpgradeConfirmLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.confirmMasteryUpgrade());
    this.masteryUpgradeDeny.on('pointerdown', () => this.denyMasteryUpgrade());
    this.masteryUpgradeDenyLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.denyMasteryUpgrade());
    this.tabObjects.push(this.masteryUpgradeButton, this.masteryUpgradeLabel, this.masteryUpgradeDescription, this.masteryUpgradeConfirm, this.masteryUpgradeConfirmLabel, this.masteryUpgradeDeny, this.masteryUpgradeDenyLabel);
    this.gemButton = this.add.rectangle(930, 465, 345, 38, 0x514321).setStrokeStyle(2, 0xffd15e).setInteractive({ useHandCursor: true }).setData('tab', 'mastery');
    this.gemLabel = this.add.text(930, 465, 'SPEND 1 GEM · +100 XP', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: C.cream, fontStyle: 'bold' }).setOrigin(0.5).setData('tab', 'mastery');
    this.gemButton.on('pointerdown', () => this.spendGem());
    this.gemLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.spendGem());
    this.tabObjects.push(this.gemButton, this.gemLabel);
  }

  private updateMasteryDetails(): void {
    const tower = TOWERS.find((candidate) => candidate.id === this.selectedTower)!;
    const record = towerMastery(this.registry, tower.id);
    const unlocked = towerUnlocked(this.registry, tower.id);
    const xpForNextLevel = xpToEnterLevel(record.level + 2);
    const remaining = record.level < 15 ? xpForNextLevel - record.xp : 0;
    const levelUpStatus = record.pendingChoices === 1
      ? 'One level up available'
      : record.pendingChoices > 1 ? `${record.pendingChoices} level ups available` : 'No level up available yet';
    this.masteryDetail?.setText(`${unlocked ? 'UNLOCKED' : `LOCKED · ${towerUnlockRequirement(tower.id)}`}\n${tower.name} · ${tower.rarity}\nMASTERY ${record.level}/15 · ${record.level >= 15 ? 'MAX' : `${record.xp.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP · ${remaining.toLocaleString()} to next`}\nPATH RANKS  ${record.pathRanks[0]}/7 · ${record.pathRanks[1]}/7 · ${record.pathRanks[2]}/7\n${levelUpStatus}`);
    this.pathButtons.forEach((button, index) => {
      const enabled = unlocked && record.pendingChoices > 0 && record.pathRanks[index]! < 7;
      const selected = this.selectedMasteryPath === index;
      button.setFillStyle(selected ? 0x514321 : enabled ? 0x35336b : 0x201e40).setAlpha(enabled ? 1 : 0.58)
        .setStrokeStyle(2, selected ? 0xffd15e : [0x63dcff, 0xc58bf0, 0xffd15e][index]!);
      this.pathLabels[index]?.setText(`${['PATH 1', 'PATH 2', 'PATH 3'][index]}  ·  ${record.pathRanks[index]}/7`).setColor(enabled ? C.cream : C.muted);
    });
    const selectedPath = this.selectedMasteryPath;
    const nextTier = selectedPath === undefined ? undefined : tower.paths[selectedPath]?.tiers[record.pathRanks[selectedPath]!];
    const canChoose = unlocked && record.pendingChoices > 0 && selectedPath !== undefined && Boolean(nextTier);
    this.masteryUpgradeButton?.setVisible(Boolean(selectedPath !== undefined && canChoose));
    this.masteryUpgradeLabel?.setVisible(Boolean(selectedPath !== undefined && canChoose));
    this.masteryUpgradeLabel?.setText(nextTier ? `${nextTier.name}  ·  RANK ${record.pathRanks[selectedPath!]! + 1}` : 'CHOOSE A PATH');
    this.masteryUpgradeDescription?.setVisible(Boolean(canChoose && this.masteryUpgradeOpen));
    this.masteryUpgradeDescription?.setText(canChoose && this.masteryUpgradeOpen && nextTier
      ? `${nextTier.description}  ·  Unlocks mastery rank ${record.pathRanks[selectedPath!]! + 1} for this path.`
      : '');
    this.masteryUpgradeConfirm?.setVisible(Boolean(canChoose && this.masteryUpgradeOpen));
    this.masteryUpgradeConfirmLabel?.setVisible(Boolean(canChoose && this.masteryUpgradeOpen));
    this.masteryUpgradeDeny?.setVisible(Boolean(canChoose && this.masteryUpgradeOpen));
    this.masteryUpgradeDenyLabel?.setVisible(Boolean(canChoose && this.masteryUpgradeOpen));
    const progress = this.registry.get('mapProgress') as { gems: number };
    const canSpend = unlocked && progress.gems > 0 && record.level < 15;
    const gemUnlockCost = towerGemUnlockCost(tower.id);
    const showGemUnlock = !unlocked && gemUnlockCost > 0;
    const canUnlock = showGemUnlock && progress.gems >= gemUnlockCost;
    this.gemButton?.setVisible(showGemUnlock || canSpend).setFillStyle(showGemUnlock ? (canUnlock ? 0x514321 : 0x201e40) : (canSpend ? 0x514321 : 0x201e40)).setAlpha(showGemUnlock ? (canUnlock ? 1 : 0.6) : (canSpend ? 1 : 0.6));
    this.gemLabel?.setVisible(showGemUnlock || unlocked).setText(showGemUnlock
      ? `UNLOCK · ${gemUnlockCost} GEMS  (${progress.gems} available)`
      : `SPEND 1 GEM · +100 XP  (${progress.gems} available)`);
  }

  private selectMasteryPath(index: number): void {
    const tower = TOWERS.find((candidate) => candidate.id === this.selectedTower)!;
    const record = towerMastery(this.registry, tower.id);
    if (!towerUnlocked(this.registry, tower.id) || record.pendingChoices <= 0 || record.pathRanks[index]! >= 7) return;
    if (!tower.paths[index]?.tiers[record.pathRanks[index]!]) return;
    this.selectedMasteryPath = index;
    this.masteryUpgradeOpen = false;
    this.updateMasteryDetails();
  }

  private revealMasteryUpgrade(): void {
    if (this.selectedMasteryPath === undefined) return;
    this.masteryUpgradeOpen = true;
    this.updateMasteryDetails();
  }

  private confirmMasteryUpgrade(): void {
    if (this.selectedMasteryPath === undefined || !this.masteryUpgradeOpen) return;
    const index = this.selectedMasteryPath;
    const tower = TOWERS.find((candidate) => candidate.id === this.selectedTower)!;
    const record = towerMastery(this.registry, tower.id);
    if (!towerUnlocked(this.registry, tower.id) || record.pendingChoices <= 0 || record.pathRanks[index]! >= 7) return;
    record.pathRanks[index] += 1;
    record.pendingChoices -= 1;
    saveTowerMastery(this.registry, tower.id, record);
    this.status?.setText(`${tower.name}: PATH ${index + 1} ADVANCED`);
    this.updateMasteryDetails();
    this.refreshTowerCards();
  }

  private denyMasteryUpgrade(): void {
    this.selectedMasteryPath = undefined;
    this.masteryUpgradeOpen = false;
    this.updateMasteryDetails();
  }

  private spendGem(): void {
    const tower = TOWERS.find((candidate) => candidate.id === this.selectedTower)!;
    const record = towerMastery(this.registry, tower.id);
    const progress = this.registry.get('mapProgress') as { gems: number; unlockedMaps: string[] };
    const gemUnlockCost = towerGemUnlockCost(tower.id);
    if (!towerUnlocked(this.registry, tower.id) && gemUnlockCost > 0) {
      if (progress.gems < gemUnlockCost) return;
      progress.gems -= gemUnlockCost;
      this.registry.set('mapProgress', progress);
      const unlocks = new Set((this.registry.get('towerUnlocks') as string[] | undefined) ?? []);
      unlocks.add(tower.id);
      this.registry.set('towerUnlocks', [...unlocks]);
      this.status?.setText(`${tower.name.toUpperCase()} UNLOCKED`);
      this.updateMasteryDetails();
      this.refreshTowerCards();
      return;
    }
    if (!towerUnlocked(this.registry, tower.id) || progress.gems < 1 || record.level >= 15) return;
    progress.gems -= 1;
    this.registry.set('mapProgress', progress);
    const xp = 100;
    let current = record.xp + xp;
    while (record.level < 15 && current >= xpToEnterLevel(record.level + 2)) {
      current -= xpToEnterLevel(record.level + 2);
      record.level += 1;
      record.pendingChoices += 1;
    }
    record.xp = current;
    saveTowerMastery(this.registry, tower.id, record);
    this.status?.setText(`1 GEM SPENT · ${tower.name} RECEIVED 100 XP`);
    this.updateMasteryDetails();
    this.refreshTowerCards();
  }

  private refreshTowerCards(): void {
    COLLECTION_TOWERS.forEach((tower, index) => {
      const card = this.towerLabels[index];
      if (!card) return;
      const record = towerMastery(this.registry, tower.id);
      const unlocked = towerUnlocked(this.registry, tower.id);
      card.setText(`${unlocked ? '◆' : '🔒'} ${tower.name}\n${unlocked ? `M${record.level}/15 · ${record.xp.toLocaleString()} XP · P${record.pathRanks.join('/')}` : towerUnlockRequirement(tower.id)}`);
      card.setColor(unlocked ? C.cream : C.muted);
      this.towerLevelUpAlerts[index]?.setVisible(unlocked && record.pendingChoices > 0);
    });
  }

  private makeBestiaryPanel(): void {
    this.add.text(58, 151, 'ENEMY FIELD GUIDE', { fontFamily: 'Arial', fontSize: '13px', color: C.gold, fontStyle: 'bold', letterSpacing: 2 }).setData('tab', 'bestiary');
    BESTIARY_CATEGORIES.forEach((category, index) => {
      const row = index < 4 ? 0 : 1;
      const col = index < 4 ? index : index - 4;
      const columns = row === 0 ? 4 : 3;
      const buttonWidth = 122;
      const gap = 6;
      const left = row === 0 ? 51 : 40 + (545 - (columns * buttonWidth + (columns - 1) * gap)) / 2;
      const x = left + col * (buttonWidth + gap);
      const y = 181 + row * 31;
      const button = this.add.rectangle(x + buttonWidth / 2, y + 12, buttonWidth, 24, 0x182733)
        .setStrokeStyle(1, 0x526c75).setInteractive({ useHandCursor: true }).setData('tab', 'bestiary');
      const label = this.add.text(x + buttonWidth / 2, y + 12, category.toUpperCase(), {
        fontFamily: 'Arial', fontSize: '10px', color: C.cream, fontStyle: 'bold', letterSpacing: 0.5,
      }).setOrigin(0.5).setData('tab', 'bestiary');
      const select = () => this.selectBestiaryCategory(category);
      button.on('pointerdown', select);
      label.setInteractive({ useHandCursor: true }).on('pointerdown', select);
      this.bestiaryCategoryButtons.push({ category, button });
    });
    Object.keys(ENEMIES).forEach((id, index) => {
      const col = Math.floor(index / 6);
      const row = index % 6;
      const x = 58 + col * 260;
      const y = 244 + row * 58;
      const button = this.add.rectangle(x + 118, y + 20, 232, 42, 0x182733).setStrokeStyle(1, 0x526c75).setInteractive({ useHandCursor: true }).setData('tab', 'bestiary');
      const label = this.add.text(x + 11, y + 8, '', { fontFamily: 'Arial', fontSize: '12px', color: C.cream, fontStyle: 'bold', wordWrap: { width: 212 } }).setData('tab', 'bestiary');
      const select = () => { this.selectedEnemy = id as EnemyKey; this.updateBestiaryDetails(); };
      button.on('pointerdown', select);
      label.setInteractive({ useHandCursor: true }).on('pointerdown', select);
      this.enemyButtons.push(button);
      this.enemyLabels.push(label);
      this.tabObjects.push(button, label);
    });
    ENDLESS_ELITES.forEach((elite, index) => {
      const col = Math.floor(index / 4);
      const row = index % 4;
      const x = 58 + col * 260;
      const y = 244 + row * 78;
      const button = this.add.rectangle(x + 118, y + 27, 232, 58, 0x182733)
        .setStrokeStyle(1, elite.color).setInteractive({ useHandCursor: true }).setData('tab', 'bestiary');
      const label = this.add.text(x + 11, y + 10, '', {
        fontFamily: 'Arial', fontSize: '11px', color: C.cream, fontStyle: 'bold', wordWrap: { width: 212 }, lineSpacing: 3,
      }).setData('tab', 'bestiary');
      const select = () => { this.selectedBestiaryElite = elite.id; this.updateBestiaryDetails(); };
      button.on('pointerdown', select);
      label.setInteractive({ useHandCursor: true }).on('pointerdown', select);
      this.eliteButtons.push(button);
      this.eliteLabels.push(label);
      this.tabObjects.push(button, label);
    });
    this.bestiaryDetail = this.add.text(632, 190, '', { fontFamily: 'Arial', fontSize: '17px', color: C.cream, lineSpacing: 9, wordWrap: { width: 570 } }).setData('tab', 'bestiary');
  }

  private selectBestiaryCategory(category: BestiaryCategory): void {
    this.bestiaryCategory = category;
    if (category !== 'Elite Types') {
      const entries = this.bestiaryEnemies(category);
      if (!entries.includes(this.selectedEnemy) && entries[0]) this.selectedEnemy = entries[0];
    }
    this.updateBestiaryDetails();
  }

  private bestiaryEnemies(category: BestiaryCategory): EnemyKey[] {
    return (Object.keys(ENEMIES) as EnemyKey[]).filter((id) => {
      const enemy = ENEMIES[id];
      if (enemy.ability === 'doomsdayClockworkGoliath' || enemy.ability === 'abyssalJunkHydra') return category === 'Megaboss';
      if (enemy.boss) return category === 'Boss';
      if (enemy.miniboss) return category === 'Strong';
      const threat = endlessThreatForEnemy(id);
      if (threat === 'Fast') return category === 'Fast';
      if (threat === 'Heavy') return category === 'Strong';
      if (threat === 'Unique') return category === 'Unique';
      return category === 'Normal';
    });
  }

  private updateBestiaryDetails(): void {
    this.refreshBestiaryCards();
    if (this.bestiaryCategory === 'Elite Types') {
      const elite = ENDLESS_ELITES.find((item) => item.id === this.selectedBestiaryElite) ?? ENDLESS_ELITES[0]!;
      const color = `#${elite.color.toString(16).padStart(6, '0')}`;
      this.bestiaryDetail?.setText(`${elite.name}\n\nELITE TYPE · ${elite.points} ENDLESS POINTS\n\n${elite.description}\n\nThis trait is purchased for one selected enemy. Traits can be stacked on the same enemy.`).setColor(color);
      return;
    }
    const enemy = ENEMIES[this.selectedEnemy];
    const unlocked = new Set(this.registry.get('bestiaryUnlocks') as EnemyKey[]).has(this.selectedEnemy);
    this.bestiaryDetail?.setColor(C.cream);
    if (!unlocked) {
      const index = Object.keys(ENEMIES).indexOf(this.selectedEnemy);
      this.bestiaryDetail?.setText(`UNKNOWN ENTRY · ${index + 1}\n\nDefeat this enemy type in a run to add its name and stats to the Bestiary.`);
      return;
    }
    this.bestiaryDetail?.setText(`${enemy.name}\n\nHealth: ${enemy.hp.toLocaleString()}\nSpeed: ${enemy.speed}\nArmor: ${enemy.armor}\nHyperarmor: ${enemy.hyperarmor}\nLeak damage: ${enemy.leak}\nBounty: ${enemy.bounty}\n${enemy.boss ? 'BOSS' : enemy.miniboss ? 'STRONG · MINI-BOSS' : 'ENEMY'}${enemy.ability ? `\nAbility: ${enemy.ability}` : ''}`);
  }

  private refreshBestiaryCards(): void {
    const unlocked = new Set(this.registry.get('bestiaryUnlocks') as EnemyKey[]);
    this.bestiaryCategoryButtons.forEach(({ category, button }) => {
      const selected = this.bestiaryCategory === category;
      button.setFillStyle(selected ? 0x35336b : 0x182733)
        .setStrokeStyle(selected ? 2 : 1, selected ? 0xffd15e : 0x526c75);
    });
    const visibleEnemies = this.bestiaryCategory === 'Elite Types' ? [] : this.bestiaryEnemies(this.bestiaryCategory);
    Object.entries(ENEMIES).forEach(([id, enemy]) => {
      const index = visibleEnemies.indexOf(id as EnemyKey);
      const visible = index >= 0;
      this.enemyButtons[Object.keys(ENEMIES).indexOf(id)]?.setVisible(visible);
      this.enemyLabels[Object.keys(ENEMIES).indexOf(id)]?.setVisible(visible);
      if (!visible) return;
      const col = Math.floor(index / 6);
      const row = index % 6;
      const x = 58 + col * 260;
      const y = 244 + row * 58;
      this.enemyButtons[Object.keys(ENEMIES).indexOf(id)]?.setPosition(x + 118, y + 20);
      this.enemyLabels[Object.keys(ENEMIES).indexOf(id)]?.setPosition(x + 11, y + 8);
      const isUnlocked = unlocked.has(id as EnemyKey);
      const selected = id === this.selectedEnemy;
      this.enemyButtons[Object.keys(ENEMIES).indexOf(id)]?.setFillStyle(selected ? 0x35336b : 0x182733)
        .setStrokeStyle(selected ? 2 : 1, selected ? 0x63dcff : 0x526c75);
      this.enemyLabels[Object.keys(ENEMIES).indexOf(id)]?.setText(`${isUnlocked ? '◉' : '🔒'} ${isUnlocked ? enemy.name : 'Unknown enemy'}`)
        .setColor(unlocked.has(id as EnemyKey) ? C.cream : C.muted);
    });
    ENDLESS_ELITES.forEach((elite, index) => {
      const visible = this.bestiaryCategory === 'Elite Types';
      const col = Math.floor(index / 4);
      const row = index % 4;
      const x = 58 + col * 260;
      const y = 244 + row * 78;
      this.eliteButtons[index]?.setVisible(visible).setPosition(x + 118, y + 27)
        .setFillStyle(this.selectedBestiaryElite === elite.id ? 0x35336b : 0x182733)
        .setStrokeStyle(this.selectedBestiaryElite === elite.id ? 2 : 1, elite.color);
      this.eliteLabels[index]?.setVisible(visible).setPosition(x + 11, y + 10)
        .setText(elite.name)
        .setColor(this.selectedBestiaryElite === elite.id ? C.cream : C.muted);
    });
  }

  private makeSavePanel(): void {
    this.add.text(635, 156, 'OPTIONAL SAVE CODE', { fontFamily: 'Arial', fontSize: '16px', color: C.gold, fontStyle: 'bold', letterSpacing: 2 }).setData('tab', 'save');
    this.add.text(635, 183, 'Your progress already stays available between runs on this page. Export a code only if you want to carry it into another page session.', { fontFamily: 'Arial', fontSize: '15px', color: C.muted, wordWrap: { width: 565 } }).setData('tab', 'save');
    this.makeActionButton(770, 525, 250, 42, 'COPY SAVE CODE', () => this.copySaveCode());
    this.makeActionButton(1075, 525, 250, 42, 'PASTE FROM CLIPBOARD', () => this.pasteSaveCode());
    this.makeActionButton(925, 583, 320, 42, 'IMPORT PASTED CODE', () => this.importPastedCode());
  }

  private createSaveFields(): void {
    if (this.codeArea?.node && this.importField?.node) return;
    const codeElement = document.createElement('textarea');
    codeElement.readOnly = true;
    codeElement.setAttribute('aria-label', 'Exported save code');
    codeElement.style.cssText = 'width:560px;height:190px;resize:none;background:#101820;color:#cfe8df;border:1px solid #607c82;border-radius:8px;padding:12px;font:14px monospace;';
    this.codeArea = this.add.dom(925, 330, codeElement).setData('tab', 'save');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Paste a TD1 save code here';
    inputElement.setAttribute('aria-label', 'Save code to import');
    inputElement.style.cssText = 'width:560px;height:40px;box-sizing:border-box;background:#101820;color:#f6f1df;border:1px solid #607c82;border-radius:7px;padding:8px;font:14px monospace;';
    this.importField = this.add.dom(925, 480, inputElement).setData('tab', 'save');
    inputElement.value = this.importCodeDraft;
  }

  private removeSaveFields(): void {
    const input = this.importField?.node as HTMLInputElement | undefined;
    if (input) this.importCodeDraft = input.value;
    this.codeArea?.destroy();
    this.importField?.destroy();
    this.codeArea = undefined;
    this.importField = undefined;
  }

  private makeActionButton(x: number, y: number, width: number, height: number, label: string, action: () => void): void {
    const button = this.add.rectangle(x, y, width, height, 0x2d4b58).setStrokeStyle(1, 0x6fc8e8).setInteractive({ useHandCursor: true }).setData('tab', 'save');
    const text = this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '14px', color: C.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setData('tab', 'save');
    button.on('pointerdown', action);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', action);
    this.tabObjects.push(button, text);
  }

  private copySaveCode(): void {
    const code = exportProgressCode(this.registry);
    const field = this.codeArea?.node as HTMLTextAreaElement | undefined;
    if (field) field.value = code;
    if (!navigator.clipboard) { this.status?.setText('Select and copy the visible save code.'); return; }
    navigator.clipboard.writeText(code).then(() => this.status?.setText('SAVE CODE COPIED TO CLIPBOARD'))
      .catch(() => this.status?.setText('Select and copy the visible save code.'));
  }

  private async pasteSaveCode(): Promise<void> {
    const input = this.importField?.node as HTMLInputElement | undefined;
    if (!input) return;
    if (!navigator.clipboard) { this.status?.setText('Paste into the field above.'); input.focus(); return; }
    try {
      input.value = await navigator.clipboard.readText();
      this.status?.setText('CLIPBOARD CODE READY · CLICK IMPORT');
    } catch {
      this.status?.setText('Clipboard access unavailable · Paste into the field above.');
      input.focus();
    }
  }

  private importPastedCode(): void {
    const input = this.importField?.node as HTMLInputElement | undefined;
    if (!input?.value.trim()) { this.status?.setText('PASTE A SAVE CODE FIRST'); return; }
    try {
      importProgressCode(this.registry, input.value.trim());
      this.scene.start('Lobby');
    } catch (error) {
      this.status?.setText(error instanceof Error ? error.message.toUpperCase() : 'COULD NOT READ THAT SAVE CODE');
    }
  }

  private showTab(tab: Tab): void {
    this.tab = tab;
    if (tab === 'save') this.createSaveFields();
    else this.removeSaveFields();
    this.children.list.forEach((object) => {
      const objectTab = (object as Phaser.GameObjects.GameObject).getData('tab');
      if (objectTab) (object as Phaser.GameObjects.GameObject & { setVisible?: (value: boolean) => unknown }).setVisible?.(objectTab === tab);
    });
    this.tabControls.forEach((object) => (object as Phaser.GameObjects.GameObject & { setVisible?: (value: boolean) => unknown }).setVisible?.(true));
    this.status?.setText(`PLAYER LEVEL ${Number(this.registry.get('playerLevel') ?? 1)}  ·  ${Number(this.registry.get('playerXP') ?? 0).toLocaleString()} PLAYER XP`);
    if (tab === 'mastery') {
      this.refreshTowerCards();
      this.updateMasteryDetails();
    } else if (tab === 'bestiary') {
      this.refreshBestiaryCards();
      this.updateBestiaryDetails();
    } else {
      const field = this.codeArea?.node as HTMLTextAreaElement | undefined;
      if (field) field.value = exportProgressCode(this.registry);
      this.status?.setText('EXPORT OR IMPORT YOUR PROGRESSION CODE');
    }
  }
}
