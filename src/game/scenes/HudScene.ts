import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants';
import { GAME_EVENTS } from '../events';
import { gameStateStore } from '../state/GameStateStore';

function formatTime(seconds: number): string {
  const safeSeconds = Math.ceil(seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const left = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${left}`;
}

export class HudScene extends Phaser.Scene {
  private scoreText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private nextMobLabel?: Phaser.GameObjects.Text;
  private nextMobIcon?: Phaser.GameObjects.Image;

  constructor() {
    super({ key: 'HudScene' });
  }

  public create(): void {
    // Overlay scene: do not clear the frame, otherwise Canvas renderer can hide lower scenes.
    (this.cameras.main as Phaser.Cameras.Scene2D.Camera & { clearBeforeRender?: boolean }).clearBeforeRender = false;
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    this.scoreText = this.addLabel(24, 24, `Score: ${gameStateStore.getScore()}`);
    this.timerText = this.addLabel(GAME_WIDTH - 24, 24, `Time: ${formatTime(gameStateStore.getTimeLeft())}`).setOrigin(1, 0);

    this.createNextMobPanel();
    this.attachStoreListeners();
  }

  private addLabel(x: number, y: number, value: string): Phaser.GameObjects.Text {
    return this.add.text(x, y, value, {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#e2e8f0',
      fontStyle: 'bold',
    });
  }

  private createNextMobPanel(): void {
    const panelWidth = 260;
    const panelHeight = 80;
    const x = GAME_WIDTH - panelWidth / 2 - 18;
    const y = 84;

    this.add.rectangle(x, y, panelWidth, panelHeight, 0x0f172a, 0.92).setStrokeStyle(2, 0x64748b, 1);

    this.add
      .text(x - 78, y - 20, 'Следующий моб', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#e2e8f0',
      })
      .setOrigin(0, 0.5);

    const mobId = gameStateStore.getNextMob();
    this.nextMobIcon = this.add.image(x + 86, y, `mob-${mobId}`).setDisplaySize(36, 36);
    this.nextMobLabel = this.add
      .text(x - 78, y + 17, `ID: ${mobId}`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
  }

  private updateNextMobPanel(mobId: number): void {
    this.nextMobLabel?.setText(`ID: ${mobId}`);
    this.nextMobIcon?.setTexture(`mob-${mobId}`);
  }

  private attachStoreListeners(): void {
    gameStateStore.on(GAME_EVENTS.scoreChanged, (score: number) => {
      this.scoreText?.setText(`Score: ${score}`);
    });

    gameStateStore.on(GAME_EVENTS.timeChanged, (timeLeft: number) => {
      this.timerText?.setText(`Time: ${formatTime(timeLeft)}`);
    });

    gameStateStore.on(GAME_EVENTS.nextMobChanged, (mobId: number) => this.updateNextMobPanel(mobId));

    gameStateStore.on(GAME_EVENTS.gameOver, () => {
      // HUD stays visible in game over state.
    });
  }
}
