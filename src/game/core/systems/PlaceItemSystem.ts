import { PLACEABLE_COST } from '../../constants';
import { isInsideGrid } from '../board';
import type { EntityId } from '../ecs/types';
import { World } from '../ecs/World';
import type { CellPosition, PlaceableKind } from '../../types';

export type PlaceResult =
  | { ok: true; entityId: EntityId; cost: number }
  | { ok: false; reason: 'outside' | 'occupied' | 'not_enough_score' };

export class PlaceItemSystem {
  constructor(private readonly world: World) {}

  public tryPlace(kind: PlaceableKind, cell: CellPosition, currentScore: number): PlaceResult {
    if (!isInsideGrid(cell)) {
      return { ok: false, reason: 'outside' };
    }

    if (this.world.getPlaceableAt(cell) !== undefined) {
      return { ok: false, reason: 'occupied' };
    }

    const cost = PLACEABLE_COST[kind];
    if (currentScore < cost) {
      return { ok: false, reason: 'not_enough_score' };
    }

    const entityId = this.world.createEntity();
    this.world.addPlaceable(entityId, kind, cell);
    return { ok: true, entityId, cost };
  }
}
