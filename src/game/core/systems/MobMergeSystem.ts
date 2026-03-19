import type { CellPosition, PlaceableKind } from '../../types';
import { isInsideGrid } from '../board';
import type { EntityId } from '../ecs/types';
import { World } from '../ecs/World';

export type MergeConfig = {
  minConnectedToMerge: number;
  maxMobLevel: number;
  getScore: (mobId: PlaceableKind, mergedCount: number) => number;
};

export type MergeResult =
  | {
      merged: true;
      removedEntities: EntityId[];
      removedCells: CellPosition[];
      upgradedCell: CellPosition;
      upgradedMobId: PlaceableKind;
      score: number;
    }
  | { merged: false };

export class MobMergeSystem {
  constructor(
    private readonly world: World,
    private readonly config: MergeConfig,
  ) {}

  public resolveFrom(startCell: CellPosition): MergeResult {
    const startEntity = this.world.getPlaceableAt(startCell);
    if (startEntity === undefined) {
      return { merged: false };
    }

    const startPlaceable = this.world.getPlaceable(startEntity);
    if (!startPlaceable) {
      return { merged: false };
    }

    const targetMob = startPlaceable.kind;
    const connected = this.getConnectedCluster(startCell, targetMob);
    if (connected.length < this.config.minConnectedToMerge) {
      return { merged: false };
    }

    const removedEntities: EntityId[] = [];
    const removedCells: CellPosition[] = [];
    for (const cell of connected) {
      const id = this.world.getPlaceableAt(cell);
      if (id === undefined) {
        continue;
      }

      removedEntities.push(id);
      removedCells.push(cell);
      this.world.removeEntity(id);
    }

    const upgradedCell = this.pickUpgradeCell(startCell, removedCells);
    const upgradedMobId = Math.min(targetMob + 1, this.config.maxMobLevel);
    const upgradedEntity = this.world.createEntity();
    this.world.addPlaceable(upgradedEntity, upgradedMobId, upgradedCell);

    return {
      merged: true,
      removedEntities,
      removedCells,
      upgradedCell,
      upgradedMobId,
      score: this.config.getScore(targetMob, removedCells.length),
    };
  }

  private getConnectedCluster(startCell: CellPosition, targetMob: PlaceableKind): CellPosition[] {
    const queue: CellPosition[] = [startCell];
    const visited = new Set<string>();
    const result: CellPosition[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }

      const key = `${current.row}:${current.col}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      const entityId = this.world.getPlaceableAt(current);
      if (entityId === undefined) {
        continue;
      }

      const placeable = this.world.getPlaceable(entityId);
      if (!placeable || placeable.kind !== targetMob) {
        continue;
      }

      result.push(current);
      queue.push(
        { row: current.row - 1, col: current.col },
        { row: current.row + 1, col: current.col },
        { row: current.row, col: current.col - 1 },
        { row: current.row, col: current.col + 1 },
      );
    }

    return result.filter(isInsideGrid);
  }

  private pickUpgradeCell(startCell: CellPosition, removedCells: CellPosition[]): CellPosition {
    const exact = removedCells.find((cell) => cell.row === startCell.row && cell.col === startCell.col);
    return exact ?? removedCells[0] ?? startCell;
  }
}
