import { CREATURE_SCORE } from '../../constants';
import type { EntityId } from '../ecs/types';
import { World } from '../ecs/World';

export class CollectCreatureSystem {
  constructor(private readonly world: World) {}

  public collect(entityId: EntityId): number {
    const creature = this.world.getCreature(entityId);
    if (!creature) {
      return 0;
    }

    this.world.removeEntity(entityId);
    return CREATURE_SCORE[creature.kind];
  }
}
