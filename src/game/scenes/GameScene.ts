import Phaser from 'phaser';
import { CELL_SIZE } from '../constants';
import { PlaceableItem } from '../entities/PlaceableItem';
import { cellKey } from '../core/board';
import { World } from '../core/ecs/World';
import { MobMergeSystem } from '../core/systems/MobMergeSystem';
import { PlaceItemSystem } from '../core/systems/PlaceItemSystem';
import { MERGE_EFFECT_SETTINGS } from '../effectsSettings';
import { GAME_EVENTS } from '../events';
import { MOB_DEFINITIONS, MOB_MERGE_CONFIG, calculateMergeScore, pickWeightedMob } from '../mobSettings';
import { gameStateStore } from '../state/GameStateStore';
import { GridSystem } from '../systems/GridSystem';
import type { CellPosition } from '../types';

export class GameScene extends Phaser.Scene {
  private readonly grid = new GridSystem();
  private readonly world = new World();
  private readonly placeItemSystem = new PlaceItemSystem(this.world);
  private readonly mergeSystem = new MobMergeSystem(this.world, {
    minConnectedToMerge: MOB_MERGE_CONFIG.minConnectedToMerge,
    maxMobLevel: MOB_DEFINITIONS.length,
    getScore: calculateMergeScore,
  });
  private readonly placedItems = new Map<string, PlaceableItem>();
  private isMergeAnimating = false;
  private audioContext?: AudioContext;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(0x17212f);
    this.addPlayAreaBackdrop();
    this.grid.draw(this);
    this.add
      .text(24, 76, 'Click a cell to place the next mob', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#cbd5e1',
      })
      .setDepth(1000);
    this.ensureHudIsRunning();
    this.attachInput();
    this.attachStoreListeners();
    this.setRandomNextMob();
  }

  public update(_time: number, delta: number): void {
    gameStateStore.tick(delta / 1000);
  }

  private addPlayAreaBackdrop(): void {
    this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2 + 24, this.scale.width - 16, this.scale.height - 24, 0x243447, 0.75)
      .setStrokeStyle(2, 0x7aa2cf, 0.85);
  }

  private ensureHudIsRunning(): void {
    if (this.scene.isActive('HudScene')) {
      return;
    }

    this.scene.launch('HudScene');
  }

  private attachInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (gameStateStore.isFinished() || this.isMergeAnimating) {
        return;
      }

      const cell = this.grid.worldToCell(pointer.worldX, pointer.worldY);
      if (!cell) {
        return;
      }

      void this.tryPlaceItem(cell);
    });
  }

  private attachStoreListeners(): void {
    gameStateStore.on(GAME_EVENTS.gameOver, () => {
      this.add
        .rectangle(this.scale.width / 2, this.scale.height / 2, 320, 120, 0x020617, 0.82)
        .setStrokeStyle(2, 0x64748b, 1);

      this.add
        .text(this.scale.width / 2, this.scale.height / 2, 'Game Over', {
          fontFamily: 'Arial',
          fontSize: '42px',
          color: '#f8fafc',
        })
        .setOrigin(0.5);
    });
  }

  private async tryPlaceItem(cell: CellPosition): Promise<void> {
    const selected = gameStateStore.getNextMob();

    const placement = this.placeItemSystem.tryPlace(selected, cell);
    if (!placement.ok) {
      return;
    }

    const placedItem = this.createPlaceableView(cell, selected);
    await this.playSpawnAnimation(placedItem);
    await this.resolveMergesFrom(cell);
    this.setRandomNextMob();
  }

  private setRandomNextMob(): void {
    const nextMob = pickWeightedMob(MOB_DEFINITIONS).id;
    gameStateStore.setNextMob(nextMob);
  }

  private createPlaceableView(cell: CellPosition, mobId: number): PlaceableItem {
    const key = cellKey(cell);
    const world = this.grid.cellToWorldCenter(cell);
    const item = new PlaceableItem(this, world.x, world.y, mobId);
    this.placedItems.set(key, item);
    return item;
  }

  private removePlaceableView(cell: CellPosition): void {
    const key = cellKey(cell);
    const existing = this.placedItems.get(key);
    if (!existing) {
      return;
    }

    existing.destroy();
    this.placedItems.delete(key);
  }

  private async resolveMergesFrom(startCell: CellPosition): Promise<void> {
    this.isMergeAnimating = true;
    try {
      let origin = startCell;

      while (true) {
        const result = this.mergeSystem.resolveFrom(origin);
        if (!result.merged) {
          break;
        }

        await this.playMergeOutAnimation(result.removedCells);
        result.removedCells.forEach((cell) => this.removePlaceableView(cell));

        await this.playUpgradeFlash(result.upgradedCell);
        this.spawnMergeParticles(result.upgradedCell);
        this.playMergeSound(result.upgradedMobId);

        const upgraded = this.createPlaceableView(result.upgradedCell, result.upgradedMobId);
        await this.playSpawnAnimation(upgraded);
        gameStateStore.addScore(result.score);

        // Chain reaction: check newly upgraded cell again.
        origin = result.upgradedCell;
      }
    } finally {
      this.isMergeAnimating = false;
    }
  }

  private playSpawnAnimation(item: PlaceableItem): Promise<void> {
    item.setScale(0.3);
    item.setAlpha(0.6);

    return new Promise((resolve) => {
      this.tweens.add({
        targets: item,
        scale: 1,
        alpha: 1,
        duration: MERGE_EFFECT_SETTINGS.spawnPopDurationMs,
        ease: 'Back.Out',
        onComplete: () => resolve(),
      });
    });
  }

  private playMergeOutAnimation(cells: CellPosition[]): Promise<void> {
    const targets = cells
      .map((cell) => this.placedItems.get(cellKey(cell)))
      .filter((item): item is PlaceableItem => Boolean(item));

    if (targets.length === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.tweens.add({
        targets,
        scale: 0.1,
        alpha: 0,
        y: `-=${MERGE_EFFECT_SETTINGS.mergeOutYOffsetPx}`,
        duration: MERGE_EFFECT_SETTINGS.mergeOutDurationMs,
        ease: 'Quad.In',
        onComplete: () => resolve(),
      });
    });
  }

  private playUpgradeFlash(cell: CellPosition): Promise<void> {
    if (!MERGE_EFFECT_SETTINGS.flash.enabled) {
      return Promise.resolve();
    }

    const world = this.grid.cellToWorldCenter(cell);
    const flash = this.add
      .rectangle(
        world.x,
        world.y,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        MERGE_EFFECT_SETTINGS.flash.color,
        MERGE_EFFECT_SETTINGS.flash.alpha,
      )
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1500);

    return new Promise((resolve) => {
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: MERGE_EFFECT_SETTINGS.flash.scaleTo,
        duration: MERGE_EFFECT_SETTINGS.flash.durationMs,
        ease: 'Sine.Out',
        onComplete: () => {
          flash.destroy();
          resolve();
        },
      });
    });
  }

  private spawnMergeParticles(cell: CellPosition): void {
    if (!MERGE_EFFECT_SETTINGS.particles.enabled) {
      return;
    }

    const world = this.grid.cellToWorldCenter(cell);

    for (let i = 0; i < MERGE_EFFECT_SETTINGS.particles.count; i += 1) {
      const particle = this.add
        .circle(
          world.x,
          world.y,
          Phaser.Math.Between(MERGE_EFFECT_SETTINGS.particles.minRadius, MERGE_EFFECT_SETTINGS.particles.maxRadius),
          MERGE_EFFECT_SETTINGS.particles.color,
          1,
        )
        .setDepth(1400);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(
        MERGE_EFFECT_SETTINGS.particles.minDistance,
        MERGE_EFFECT_SETTINGS.particles.maxDistance,
      );
      const targetX = world.x + Math.cos(angle) * distance;
      const targetY = world.y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.5,
        duration: Phaser.Math.Between(
          MERGE_EFFECT_SETTINGS.particles.minDurationMs,
          MERGE_EFFECT_SETTINGS.particles.maxDurationMs,
        ),
        ease: 'Quad.Out',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private playMergeSound(upgradedMobId: number): void {
    if (!MERGE_EFFECT_SETTINGS.sound.enabled) {
      return;
    }

    const AudioCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioCtor();
    }
    const context = this.audioContext;
    const now = context.currentTime;
    const attackSeconds = MERGE_EFFECT_SETTINGS.sound.attackMs / 1000;
    const releaseSeconds = MERGE_EFFECT_SETTINGS.sound.releaseMs / 1000;
    const endAt = now + attackSeconds + releaseSeconds;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(MERGE_EFFECT_SETTINGS.sound.peakGain, now + attackSeconds);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    gain.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = MERGE_EFFECT_SETTINGS.sound.oscillatorType;
    oscillator.frequency.setValueAtTime(
      MERGE_EFFECT_SETTINGS.sound.baseFrequencyHz + upgradedMobId * MERGE_EFFECT_SETTINGS.sound.frequencyByMobLevelHz,
      now,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      MERGE_EFFECT_SETTINGS.sound.targetBaseFrequencyHz + upgradedMobId * MERGE_EFFECT_SETTINGS.sound.targetFrequencyByMobLevelHz,
      endAt,
    );
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(endAt + 0.01);
  }
}
