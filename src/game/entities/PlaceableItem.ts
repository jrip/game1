import Phaser from 'phaser';
import type { PlaceableKind } from '../types';

const textureByKind: Record<PlaceableKind, string> = {
  flower: 'item-flower',
  totem: 'item-totem',
};

export class PlaceableItem extends Phaser.GameObjects.Container {
  public readonly kind: PlaceableKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: PlaceableKind) {
    super(scene, x, y);
    this.kind = kind;

    const shadow = scene.add.ellipse(0, 10, 34, 12, 0x0f172a, 0.2);
    const sprite = scene.add.image(0, 0, textureByKind[kind]).setDisplaySize(30, 30);
    this.add([shadow, sprite]);

    scene.tweens.add({
      targets: sprite,
      scale: 1.08,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    scene.add.existing(this);
  }
}
