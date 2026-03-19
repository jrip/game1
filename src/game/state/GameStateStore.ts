import Phaser from 'phaser';
import { GAME_EVENTS } from '../events';
import { MATCH_TIME_SECONDS } from '../constants';
import type { PlaceableKind } from '../types';

export class GameStateStore extends Phaser.Events.EventEmitter {
  private score = 0;
  private timeLeft = MATCH_TIME_SECONDS;
  private selectedPlaceable: PlaceableKind | null = 'flower';
  private finished = false;

  public reset(): void {
    this.score = 0;
    this.timeLeft = MATCH_TIME_SECONDS;
    this.selectedPlaceable = 'flower';
    this.finished = false;
    this.emit(GAME_EVENTS.scoreChanged, this.score);
    this.emit(GAME_EVENTS.timeChanged, this.timeLeft);
    this.emit(GAME_EVENTS.selectedPlaceableChanged, this.selectedPlaceable);
  }

  public addScore(value: number): void {
    this.score += value;
    this.emit(GAME_EVENTS.scoreChanged, this.score);
  }

  public spendScore(value: number): boolean {
    if (this.score < value) {
      return false;
    }

    this.score -= value;
    this.emit(GAME_EVENTS.scoreChanged, this.score);
    return true;
  }

  public tick(deltaSeconds: number): void {
    if (this.finished) {
      return;
    }

    this.timeLeft = Math.max(0, this.timeLeft - deltaSeconds);
    this.emit(GAME_EVENTS.timeChanged, this.timeLeft);

    if (this.timeLeft <= 0) {
      this.finished = true;
      this.emit(GAME_EVENTS.gameOver);
    }
  }

  public setSelectedPlaceable(kind: PlaceableKind | null): void {
    this.selectedPlaceable = kind;
    this.emit(GAME_EVENTS.selectedPlaceableChanged, kind);
  }

  public isFinished(): boolean {
    return this.finished;
  }

  public getScore(): number {
    return this.score;
  }

  public getTimeLeft(): number {
    return this.timeLeft;
  }

  public getSelectedPlaceable(): PlaceableKind | null {
    return this.selectedPlaceable;
  }
}

export const gameStateStore = new GameStateStore();
