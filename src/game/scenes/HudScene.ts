import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PLACEABLE_COST } from '../constants';
import { GAME_EVENTS } from '../events';
import { gameStateStore } from '../state/GameStateStore';
import type { PlaceableKind } from '../types';

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
  private readonly buttonMap = new Map<PlaceableKind, Phaser.GameObjects.Container>();

  constructor() {
    super({ key: 'HudScene' });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(0x00000000);

    this.scoreText = this.addLabel(24, 24, `Score: ${gameStateStore.getScore()}`);
    this.timerText = this.addLabel(GAME_WIDTH - 24, 24, `Time: ${formatTime(gameStateStore.getTimeLeft())}`).setOrigin(1, 0);

    this.createSelectionButtons();
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

  private createSelectionButtons(): void {
    const y = GAME_HEIGHT - 48;
    this.addLabel(24, y - 40, 'Place items:');

    this.createButton('flower', 240, y, '#d8b4fe');
    this.createButton('totem', 430, y, '#fb7185');
  }

  private createButton(kind: PlaceableKind, x: number, y: number, color: string): void {
    const width = 170;
    const height = 58;
    const cost = PLACEABLE_COST[kind];

    const bg = this.add.rectangle(0, 0, width, height, 0x0f172a, 0.95).setStrokeStyle(2, 0x64748b, 1);
    const label = this.add
      .text(0, 0, `${kind} (${cost})`, {
        fontFamily: 'Arial',
        fontSize: '21px',
        color,
      })
      .setOrigin(0.5);

    const button = this.add.container(x, y, [bg, label]).setSize(width, height).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => gameStateStore.setSelectedPlaceable(kind));
    this.buttonMap.set(kind, button);
    this.applyButtonSelectionState(kind, gameStateStore.getSelectedPlaceable() === kind);
  }

  private applyButtonSelectionState(kind: PlaceableKind, isSelected: boolean): void {
    const button = this.buttonMap.get(kind);
    if (!button) {
      return;
    }

    const scale = isSelected ? 1.04 : 1;
    button.setScale(scale);
    button.first?.setData('selected', isSelected);

    const childBg = button.first as Phaser.GameObjects.Rectangle | undefined;
    if (childBg) {
      childBg.setStrokeStyle(3, isSelected ? 0xf8fafc : 0x64748b, 1);
    }
  }

  private attachStoreListeners(): void {
    gameStateStore.on(GAME_EVENTS.scoreChanged, (score: number) => {
      this.scoreText?.setText(`Score: ${score}`);
    });

    gameStateStore.on(GAME_EVENTS.timeChanged, (timeLeft: number) => {
      this.timerText?.setText(`Time: ${formatTime(timeLeft)}`);
    });

    gameStateStore.on(GAME_EVENTS.selectedPlaceableChanged, (selected: PlaceableKind | null) => {
      this.buttonMap.forEach((_value, key) => this.applyButtonSelectionState(key, selected === key));
    });

    gameStateStore.on(GAME_EVENTS.gameOver, () => {
      this.buttonMap.forEach((button) => button.disableInteractive());
    });
  }
}
