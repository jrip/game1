import './style.css';
import Phaser from 'phaser';
import { GAME_CONFIG } from './game/config.ts';

const appElement = document.querySelector<HTMLDivElement>('#app');

if (!appElement) {
  throw new Error('Root #app element was not found.');
}

appElement.innerHTML = '<div id="game-root"></div>';

const gameRoot = document.querySelector<HTMLDivElement>('#game-root');

if (!gameRoot) {
  throw new Error('Game root container was not found.');
}

const game = new Phaser.Game({ ...GAME_CONFIG, parent: gameRoot });

// Keep a global reference for quick debugging in devtools.
(window as Window & { __GAME__?: Phaser.Game }).__GAME__ = game;
