import Phaser from 'phaser';
import { Creature } from '../entities/Creature';
import { PlaceableItem } from '../entities/PlaceableItem';
import { CREATURE_SPAWN_MS, CREATURE_TTL_MS } from '../constants';
import { cellKey } from '../core/board';
import { World } from '../core/ecs/World';
import { CollectCreatureSystem } from '../core/systems/CollectCreatureSystem';
import { CreatureLifetimeSystem } from '../core/systems/CreatureLifetimeSystem';
import { PlaceItemSystem } from '../core/systems/PlaceItemSystem';
import { SpawnCreatureSystem } from '../core/systems/SpawnCreatureSystem';
import { GAME_EVENTS } from '../events';
import { gameStateStore } from '../state/GameStateStore';
import { GridSystem } from '../systems/GridSystem';
import type { CellPosition, CreatureKind } from '../types';
import type { EntityId } from '../core/ecs/types';

function randomCreatureKind(): CreatureKind {
  return Math.random() > 0.5 ? 'slime' : 'beetle';
}

export class GameScene extends Phaser.Scene {
  private readonly grid = new GridSystem();
  private readonly world = new World();
  private readonly spawnSystem = new SpawnCreatureSystem(this.world);
  private readonly lifetimeSystem = new CreatureLifetimeSystem(this.world);
  private readonly collectSystem = new CollectCreatureSystem(this.world);
  private readonly placeItemSystem = new PlaceItemSystem(this.world);
  private readonly creatureViews = new Map<EntityId, Creature>();
  private readonly placedItems = new Map<string, PlaceableItem>();
  private spawnEvent?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(0x0b1220);
    this.addPlayAreaBackdrop();
    this.grid.draw(this);
    this.attachInput();
    this.attachStoreListeners();
    this.startSpawning();
  }

  public update(_time: number, delta: number): void {
    gameStateStore.tick(delta / 1000);
    this.expireCreatures(delta);
  }

  private addPlayAreaBackdrop(): void {
    this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2 + 24, this.scale.width - 16, this.scale.height - 24, 0x1f2937, 0.38)
      .setStrokeStyle(2, 0x334155, 1);
  }

  private attachInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (gameStateStore.isFinished()) {
        return;
      }

      const cell = this.grid.worldToCell(pointer.worldX, pointer.worldY);
      if (!cell) {
        return;
      }

      this.tryPlaceItem(cell);
    });
  }

  private attachStoreListeners(): void {
    gameStateStore.on(GAME_EVENTS.gameOver, () => {
      this.spawnEvent?.remove(false);
      this.spawnEvent = undefined;

      this.add
        .rectangle(this.scale.width / 2, this.scale.height / 2, 320, 120, 0x020617, 0.82)
        .setStrokeStyle(2, 0x64748b, 1);

      this.add
        .text(this.scale.width / 2, this.scale.height / 2, 'Game Over', {
          fontFamily: 'Arial',
          fontSize: '42px',
          color: '#f8fafc',
        })
        .setOrigin(0.5);
    });
  }

  private startSpawning(): void {
    this.spawnEvent = this.time.addEvent({
      delay: CREATURE_SPAWN_MS,
      loop: true,
      callback: () => this.spawnCreature(),
    });
  }

  private spawnCreature(): void {
    if (gameStateStore.isFinished()) {
      return;
    }

    const spawned = this.spawnSystem.spawn(randomCreatureKind(), CREATURE_TTL_MS);
    if (!spawned) {
      return;
    }

    const worldPos = this.grid.cellToWorldCenter({ row: spawned.row, col: spawned.col });
    const creature = new Creature(this, worldPos.x, worldPos.y, spawned.kind);
    this.creatureViews.set(spawned.entityId, creature);

    creature.on('pointerdown', () => {
      if (gameStateStore.isFinished()) {
        return;
      }

      const score = this.collectSystem.collect(spawned.entityId);
      if (score <= 0) {
        return;
      }

      creature.collect();
      this.creatureViews.delete(spawned.entityId);
      gameStateStore.addScore(score);
    });
  }

  private tryPlaceItem(cell: CellPosition): void {
    const selected = gameStateStore.getSelectedPlaceable();
    if (!selected) {
      return;
    }

    const placement = this.placeItemSystem.tryPlace(selected, cell, gameStateStore.getScore());
    if (!placement.ok) {
      return;
    }

    const isSpent = gameStateStore.spendScore(placement.cost);
    if (!isSpent) {
      this.world.removeEntity(placement.entityId);
      return;
    }

    const key = cellKey(cell);
    const world = this.grid.cellToWorldCenter(cell);
    const item = new PlaceableItem(this, world.x, world.y, selected);
    this.placedItems.set(key, item);
  }

  private expireCreatures(deltaMs: number): void {
    const expired = this.lifetimeSystem.update(deltaMs);

    for (const id of expired) {
      const creature = this.creatureViews.get(id);
      if (!creature || !creature.active) {
        this.creatureViews.delete(id);
        continue;
      }

      this.tweens.add({
        targets: creature,
        alpha: 0,
        duration: 240,
        onComplete: () => creature.destroy(),
      });
      this.creatureViews.delete(id);
    }
  }
}
