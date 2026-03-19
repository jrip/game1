import Phaser, { type Types } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { HudScene } from './scenes/HudScene';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';

export const GAME_CONFIG: Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  transparent: true,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0b1220',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
  scene: [BootScene, GameScene, HudScene],
};
