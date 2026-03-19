import Phaser from 'phaser';
import type { CreatureKind } from '../types';

const textureByKind: Record<CreatureKind, string> = {
  slime: 'creature-slime',
  beetle: 'creature-beetle',
};

export class Creature extends Phaser.GameObjects.Container {
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow: Phaser.GameObjects.Ellipse;
  public readonly kind: CreatureKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: CreatureKind) {
    super(scene, x, y);
    this.kind = kind;

    this.glow = scene.add.ellipse(0, 10, 30, 12, 0x67e8f9, 0.22);
    this.sprite = scene.add.image(0, 0, textureByKind[kind]).setDisplaySize(30, 30);
    this.add([this.glow, this.sprite]);

    scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: Phaser.Math.Between(700, 1100),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    scene.tweens.add({
      targets: this.sprite,
      angle: kind === 'slime' ? 8 : -8,
      duration: Phaser.Math.Between(600, 900),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.setSize(34, 34);
    this.setInteractive({ useHandCursor: true });
    scene.add.existing(this);
  }

  public collect(): void {
    this.scene.tweens.add({
      targets: [this, this.sprite],
      scale: 0.1,
      alpha: 0,
      duration: 220,
      ease: 'Back.In',
      onComplete: () => this.destroy(),
    });
  }
}
