import Phaser from 'phaser';
import { gameStateStore } from '../state/GameStateStore';

function makeCircleTexture(scene: Phaser.Scene, key: string, color: number, ringColor: number): void {
  const size = 64;
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(color, 1);
  graphics.fillCircle(size / 2, size / 2, 24);
  graphics.lineStyle(6, ringColor, 1);
  graphics.strokeCircle(size / 2, size / 2, 24);
  graphics.generateTexture(key, size, size);
  graphics.destroy();
}

function makeDiamondTexture(scene: Phaser.Scene, key: string, color: number): void {
  const size = 64;
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(color, 1);
  graphics.fillPoints(
    [
      new Phaser.Geom.Point(size / 2, 8),
      new Phaser.Geom.Point(size - 10, size / 2),
      new Phaser.Geom.Point(size / 2, size - 8),
      new Phaser.Geom.Point(10, size / 2),
    ],
    true,
  );
  graphics.generateTexture(key, size, size);
  graphics.destroy();
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    makeCircleTexture(this, 'creature-slime', 0x4ade80, 0x14532d);
    makeCircleTexture(this, 'creature-beetle', 0xfbbf24, 0x78350f);
    makeDiamondTexture(this, 'item-flower', 0xc084fc);
    makeDiamondTexture(this, 'item-totem', 0xfb7185);

    gameStateStore.reset();

    this.scene.start('GameScene');
    this.scene.start('HudScene');
  }
}
