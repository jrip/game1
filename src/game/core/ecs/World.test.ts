import { World } from './World';

describe('World', () => {
  it('cleans indexes when entity is removed', () => {
    const world = new World();
    const creatureId = world.createEntity();
    const placeableId = world.createEntity();

    world.addCreature(creatureId, 'slime', { row: 2, col: 3 }, 1000);
    world.addPlaceable(placeableId, 'flower', { row: 4, col: 5 });

    expect(world.getCreatureAt({ row: 2, col: 3 })).toBe(creatureId);
    expect(world.getPlaceableAt({ row: 4, col: 5 })).toBe(placeableId);

    world.removeEntity(creatureId);
    world.removeEntity(placeableId);

    expect(world.getCreatureAt({ row: 2, col: 3 })).toBeUndefined();
    expect(world.getPlaceableAt({ row: 4, col: 5 })).toBeUndefined();
  });
});
