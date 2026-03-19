import { PLACEABLE_COST } from '../../constants';
import { World } from '../ecs/World';
import { PlaceItemSystem } from './PlaceItemSystem';

describe('PlaceItemSystem', () => {
  it('places item when cell is empty and score is enough', () => {
    const world = new World();
    const system = new PlaceItemSystem(world);
    const cost = PLACEABLE_COST.flower;

    const result = system.tryPlace('flower', { row: 1, col: 1 }, cost);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cost).toBe(cost);
      expect(world.getPlaceableAt({ row: 1, col: 1 })).toBe(result.entityId);
    }
  });

  it('rejects placement on occupied cell', () => {
    const world = new World();
    const system = new PlaceItemSystem(world);

    system.tryPlace('flower', { row: 2, col: 2 }, 999);
    const second = system.tryPlace('totem', { row: 2, col: 2 }, 999);

    expect(second).toEqual({ ok: false, reason: 'occupied' });
  });

  it('rejects placement when score is not enough', () => {
    const world = new World();
    const system = new PlaceItemSystem(world);

    const result = system.tryPlace('totem', { row: 1, col: 1 }, 0);
    expect(result).toEqual({ ok: false, reason: 'not_enough_score' });
  });
});
