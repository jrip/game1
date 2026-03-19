import type { CellPosition, CreatureKind, PlaceableKind } from '../../types';

export type EntityId = number;

export type CreatureComponent = {
  kind: CreatureKind;
  ttlMs: number;
};

export type PlaceableComponent = {
  kind: PlaceableKind;
};

export type PositionComponent = CellPosition;
