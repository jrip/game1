import { CELL_SIZE, SIDE_PANEL, TOP_PANEL } from '../constants';
import { cellToWorldCenter, worldToCell } from './gridMath';

describe('gridMath', () => {
  it('converts cell center to the same cell', () => {
    const world = cellToWorldCenter({ row: 4, col: 7 });
    const cell = worldToCell(world.x, world.y);
    expect(cell).toEqual({ row: 4, col: 7 });
  });

  it('returns null for coordinates outside the playfield', () => {
    expect(worldToCell(SIDE_PANEL - 2, TOP_PANEL + 20)).toBeNull();
    expect(worldToCell(SIDE_PANEL + CELL_SIZE * 2, TOP_PANEL - 1)).toBeNull();
  });
});
