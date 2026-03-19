import { World } from '../ecs/World';
import { MobMergeSystem } from './MobMergeSystem';

function placeMob(world: World, row: number, col: number, mobId: number): void {
  const entity = world.createEntity();
  world.addPlaceable(entity, mobId, { row, col });
}

describe('MobMergeSystem', () => {
  it('merges 3 connected mobs and upgrades one cell', () => {
    const world = new World();
    placeMob(world, 2, 2, 1);
    placeMob(world, 2, 3, 1);
    placeMob(world, 2, 4, 1);

    const system = new MobMergeSystem(world, {
      minConnectedToMerge: 3,
      maxMobLevel: 10,
      getScore: (mobId, count) => mobId * 10 * count,
    });

    const result = system.resolveFrom({ row: 2, col: 3 });
    expect(result.merged).toBe(true);
    if (!result.merged) {
      return;
    }

    expect(result.removedCells).toHaveLength(3);
    expect(result.upgradedMobId).toBe(2);
    expect(result.score).toBe(30);

    const upgradedEntity = world.getPlaceableAt(result.upgradedCell);
    expect(upgradedEntity).toBeDefined();
    if (upgradedEntity === undefined) {
      return;
    }

    expect(world.getPlaceable(upgradedEntity)?.kind).toBe(2);
  });

  it('does not merge if less than 3 connected', () => {
    const world = new World();
    placeMob(world, 1, 1, 4);
    placeMob(world, 1, 2, 4);

    const system = new MobMergeSystem(world, {
      minConnectedToMerge: 3,
      maxMobLevel: 10,
      getScore: () => 0,
    });

    expect(system.resolveFrom({ row: 1, col: 1 })).toEqual({ merged: false });
  });
});
