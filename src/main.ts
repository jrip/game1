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

function renderRuntimeError(message: string): void {
  const host = document.querySelector<HTMLDivElement>('#game-root');
  if (!host) {
    return;
  }

  host.innerHTML = `
    <div style="padding:16px;color:#fff;background:#450a0a;border:1px solid #f87171;font-family:Arial,sans-serif">
      <h3 style="margin:0 0 8px 0;">Game startup error</h3>
      <pre style="white-space:pre-wrap;margin:0;">${message}</pre>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  renderRuntimeError(event.error?.stack ?? event.message ?? 'Unknown error');
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason instanceof Error ? event.reason.stack ?? event.reason.message : String(event.reason);
  renderRuntimeError(reason);
});

try {
  const game = new Phaser.Game({ ...GAME_CONFIG, parent: gameRoot });

  // Keep a global reference for quick debugging in devtools.
  (window as Window & { __GAME__?: Phaser.Game }).__GAME__ = game;
} catch (error) {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  renderRuntimeError(message);
}
