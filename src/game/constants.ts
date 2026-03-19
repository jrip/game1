import type { CreatureKind } from './types';

export const GRID_ROWS = 15;
export const GRID_COLS = 20;
export const CELL_SIZE = 48;

export const PLAYFIELD_WIDTH = GRID_COLS * CELL_SIZE;
export const PLAYFIELD_HEIGHT = GRID_ROWS * CELL_SIZE;

export const SIDE_PANEL = 16;
export const TOP_PANEL = 72;
export const BOTTOM_PANEL = 96;

export const GAME_WIDTH = PLAYFIELD_WIDTH + SIDE_PANEL * 2;
export const GAME_HEIGHT = PLAYFIELD_HEIGHT + TOP_PANEL + BOTTOM_PANEL;

export const MATCH_TIME_SECONDS = 120;
export const CREATURE_SPAWN_MS = 1500;
export const CREATURE_TTL_MS = 3500;

export const CREATURE_SCORE: Record<CreatureKind, number> = {
  slime: 5,
  beetle: 8,
};
