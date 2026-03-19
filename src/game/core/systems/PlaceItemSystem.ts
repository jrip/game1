import { isInsideGrid } from '../board';
import type { EntityId } from '../ecs/types';
import { World } from '../ecs/World';
import type { CellPosition, PlaceableKind } from '../../types';

export type PlaceResult =
  | { ok: true; entityId: EntityId }
  | { ok: false; reason: 'outside' | 'occupied' };

export class PlaceItemSystem {
  constructor(private readonly world: World) {}

  public tryPlace(kind: PlaceableKind, cell: CellPosition): PlaceResult {
    if (!isInsideGrid(cell)) {
      return { ok: false, reason: 'outside' };
    }

    if (this.world.getPlaceableAt(cell) !== undefined) {
      return { ok: false, reason: 'occupied' };
    }

    const entityId = this.world.createEntity();
    this.world.addPlaceable(entityId, kind, cell);
    return { ok: true, entityId };
  }
}
