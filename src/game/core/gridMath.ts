import { CELL_SIZE, SIDE_PANEL, TOP_PANEL } from '../constants';
import type { CellPosition } from '../types';
import { isInsideGrid } from './board';

export function worldToCell(x: number, y: number): CellPosition | null {
  const col = Math.floor((x - SIDE_PANEL) / CELL_SIZE);
  const row = Math.floor((y - TOP_PANEL) / CELL_SIZE);
  const cell = { row, col };
  return isInsideGrid(cell) ? cell : null;
}

export function cellToWorldCenter(cell: CellPosition): { x: number; y: number } {
  return {
    x: SIDE_PANEL + cell.col * CELL_SIZE + CELL_SIZE / 2,
    y: TOP_PANEL + cell.row * CELL_SIZE + CELL_SIZE / 2,
  };
}
