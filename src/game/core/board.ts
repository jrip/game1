import { GRID_COLS, GRID_ROWS } from '../constants';
import type { CellPosition } from '../types';

export function cellKey(cell: CellPosition): string {
  return `${cell.row}:${cell.col}`;
}

export function isInsideGrid(cell: CellPosition): boolean {
  return cell.row >= 0 && cell.row < GRID_ROWS && cell.col >= 0 && cell.col < GRID_COLS;
}
