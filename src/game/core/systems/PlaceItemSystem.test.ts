import { World } from '../ecs/World';
import { PlaceItemSystem } from './PlaceItemSystem';

describe('PlaceItemSystem', () => {
  it('places item when cell is empty', () => {
    const world = new World();
    const system = new PlaceItemSystem(world);

    const result = system.tryPlace(1, { row: 1, col: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(world.getPlaceableAt({ row: 1, col: 1 })).toBe(result.entityId);
    }
  });

  it('rejects placement on occupied cell', () => {
    const world = new World();
    const system = new PlaceItemSystem(world);

    system.tryPlace(1, { row: 2, col: 2 });
    const second = system.tryPlace(2, { row: 2, col: 2 });

    expect(second).toEqual({ ok: false, reason: 'occupied' });
  });
});
