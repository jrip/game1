import type { EntityId } from '../ecs/types';
import { World } from '../ecs/World';

export class CreatureLifetimeSystem {
  constructor(private readonly world: World) {}

  public update(deltaMs: number): EntityId[] {
    const expired: EntityId[] = [];

    for (const entityId of this.world.getCreatureEntities()) {
      const creature = this.world.getCreature(entityId);
      if (!creature) {
        continue;
      }

      const nextTtl = creature.ttlMs - deltaMs;
      if (nextTtl <= 0) {
        expired.push(entityId);
        continue;
      }

      this.world.setCreatureTtl(entityId, nextTtl);
    }

    for (const id of expired) {
      this.world.removeEntity(id);
    }

    return expired;
  }
}
