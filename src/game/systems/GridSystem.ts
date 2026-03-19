import Phaser from 'phaser';
import { CELL_SIZE, GRID_COLS, GRID_ROWS, SIDE_PANEL, TOP_PANEL } from '../constants';
import type { CellPosition } from '../types';
import { cellToWorldCenter as toWorldCenter, worldToCell as toCell } from '../core/gridMath';

export class GridSystem {
  public isInside(row: number, col: number): boolean {
    return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
  }

  public worldToCell(x: number, y: number): CellPosition | null {
    return toCell(x, y);
  }

  public cellToWorldCenter(cell: CellPosition): Phaser.Math.Vector2 {
    const world = toWorldCenter(cell);
    return new Phaser.Math.Vector2(world.x, world.y);
  }

  public draw(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, 0x273043, 1);

    for (let r = 0; r <= GRID_ROWS; r += 1) {
      const y = TOP_PANEL + r * CELL_SIZE;
      graphics.lineBetween(SIDE_PANEL, y, SIDE_PANEL + GRID_COLS * CELL_SIZE, y);
    }

    for (let c = 0; c <= GRID_COLS; c += 1) {
      const x = SIDE_PANEL + c * CELL_SIZE;
      graphics.lineBetween(x, TOP_PANEL, x, TOP_PANEL + GRID_ROWS * CELL_SIZE);
    }
  }
}
