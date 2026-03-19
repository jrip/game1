import type { CreatureKind } from '../../types';
import { GRID_COLS, GRID_ROWS } from '../../constants';
import type { EntityId } from '../ecs/types';
import { World } from '../ecs/World';

export type SpawnResult = {
  entityId: EntityId;
  row: number;
  col: number;
  kind: CreatureKind;
};

export type RandomSource = () => number;

export class SpawnCreatureSystem {
  constructor(
    private readonly world: World,
    private readonly random: RandomSource = Math.random,
  ) {}

  public spawn(kind: CreatureKind, ttlMs: number): SpawnResult | null {
    const maxAttempts = GRID_ROWS * GRID_COLS;
    for (let i = 0; i < maxAttempts; i += 1) {
      const row = Math.floor(this.random() * GRID_ROWS);
      const col = Math.floor(this.random() * GRID_COLS);
      const occupied = this.world.getCreatureAt({ row, col });
      if (occupied !== undefined) {
        continue;
      }

      const entityId = this.world.createEntity();
      this.world.addCreature(entityId, kind, { row, col }, ttlMs);
      return { entityId, row, col, kind };
    }

    return null;
  }
}
