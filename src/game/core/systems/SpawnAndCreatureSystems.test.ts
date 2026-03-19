import { World } from '../ecs/World';
import { CollectCreatureSystem } from './CollectCreatureSystem';
import { CreatureLifetimeSystem } from './CreatureLifetimeSystem';
import { SpawnCreatureSystem } from './SpawnCreatureSystem';

describe('SpawnCreatureSystem + Creature systems', () => {
  it('spawns creature into free cells', () => {
    const world = new World();
    const sequence = [0, 0, 0, 0, 0.15, 0.15];
    let index = 0;
    const random = () => {
      const value = sequence[index] ?? 0.4;
      index += 1;
      return value;
    };
    const spawnSystem = new SpawnCreatureSystem(world, random);

    const first = spawnSystem.spawn('slime', 1200);
    const second = spawnSystem.spawn('beetle', 1200);

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    if (first && second) {
      expect(first.row === second.row && first.col === second.col).toBe(false);
    }
  });

  it('collect gives score and removes creature', () => {
    const world = new World();
    const spawnSystem = new SpawnCreatureSystem(world, () => 0.2);
    const collectSystem = new CollectCreatureSystem(world);

    const spawned = spawnSystem.spawn('beetle', 1200);
    expect(spawned).not.toBeNull();
    if (!spawned) {
      return;
    }

    const gained = collectSystem.collect(spawned.entityId);
    expect(gained).toBeGreaterThan(0);
    expect(world.getCreature(spawned.entityId)).toBeUndefined();
  });

  it('lifetime expires creatures by ttl', () => {
    const world = new World();
    const spawnSystem = new SpawnCreatureSystem(world, () => 0.3);
    const lifetimeSystem = new CreatureLifetimeSystem(world);

    const spawned = spawnSystem.spawn('slime', 100);
    expect(spawned).not.toBeNull();
    if (!spawned) {
      return;
    }

    const expired = lifetimeSystem.update(150);
    expect(expired).toContain(spawned.entityId);
    expect(world.getCreature(spawned.entityId)).toBeUndefined();
  });
});
