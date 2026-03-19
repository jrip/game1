import Phaser from 'phaser';
import { MOB_DEFINITIONS } from '../mobSettings';
import { gameStateStore } from '../state/GameStateStore';

function makeCircleTexture(scene: Phaser.Scene, key: string, color: number, ringColor: number): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const size = 64;
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(color, 1);
  graphics.fillCircle(size / 2, size / 2, 24);
  graphics.lineStyle(6, ringColor, 1);
  graphics.strokeCircle(size / 2, size / 2, 24);
  graphics.generateTexture(key, size, size);
  graphics.destroy();
}

function makeMobTexture(scene: Phaser.Scene, mobId: number, maxMobId: number): void {
  const key = `mob-${mobId}`;
  if (scene.textures.exists(key)) {
    return;
  }

  const hue = (mobId - 1) / Math.max(maxMobId, 1);
  const base = Phaser.Display.Color.HSVToRGB(hue, 0.7, 0.95).color;
  const ring = Phaser.Display.Color.HSVToRGB(hue, 0.85, 0.45).color;
  makeCircleTexture(scene, key, base, ring);
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    makeCircleTexture(this, 'creature-slime', 0x4ade80, 0x14532d);
    makeCircleTexture(this, 'creature-beetle', 0xfbbf24, 0x78350f);
    const maxMobId = MOB_DEFINITIONS[MOB_DEFINITIONS.length - 1]?.id ?? 1;
    MOB_DEFINITIONS.forEach((mob) => makeMobTexture(this, mob.id, maxMobId));

    gameStateStore.reset();

    this.scene.start('GameScene');
  }
}
