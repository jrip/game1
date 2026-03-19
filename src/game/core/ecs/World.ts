import type { CellPosition, CreatureKind, PlaceableKind } from '../../types';
import { cellKey } from '../board';
import type { CreatureComponent, EntityId, PlaceableComponent, PositionComponent } from './types';

export class World {
  private nextId = 1;
  private readonly entities = new Set<EntityId>();

  private readonly positions = new Map<EntityId, PositionComponent>();
  private readonly creatures = new Map<EntityId, CreatureComponent>();
  private readonly placeables = new Map<EntityId, PlaceableComponent>();

  private readonly creatureByCell = new Map<string, EntityId>();
  private readonly placeableByCell = new Map<string, EntityId>();

  public createEntity(): EntityId {
    const id = this.nextId;
    this.nextId += 1;
    this.entities.add(id);
    return id;
  }

  public removeEntity(id: EntityId): void {
    const pos = this.positions.get(id);
    if (pos) {
      const key = cellKey(pos);
      if (this.creatureByCell.get(key) === id) {
        this.creatureByCell.delete(key);
      }
      if (this.placeableByCell.get(key) === id) {
        this.placeableByCell.delete(key);
      }
    }

    this.positions.delete(id);
    this.creatures.delete(id);
    this.placeables.delete(id);
    this.entities.delete(id);
  }

  public addCreature(id: EntityId, kind: CreatureKind, position: CellPosition, ttlMs: number): void {
    this.positions.set(id, position);
    this.creatures.set(id, { kind, ttlMs });
    this.creatureByCell.set(cellKey(position), id);
  }

  public addPlaceable(id: EntityId, kind: PlaceableKind, position: CellPosition): void {
    this.positions.set(id, position);
    this.placeables.set(id, { kind });
    this.placeableByCell.set(cellKey(position), id);
  }

  public getPosition(id: EntityId): CellPosition | undefined {
    return this.positions.get(id);
  }

  public getCreature(id: EntityId): CreatureComponent | undefined {
    return this.creatures.get(id);
  }

  public getCreatureAt(cell: CellPosition): EntityId | undefined {
    return this.creatureByCell.get(cellKey(cell));
  }

  public getPlaceableAt(cell: CellPosition): EntityId | undefined {
    return this.placeableByCell.get(cellKey(cell));
  }

  public getPlaceable(id: EntityId): PlaceableComponent | undefined {
    return this.placeables.get(id);
  }

  public getCreatureEntities(): EntityId[] {
    return [...this.creatures.keys()];
  }

  public setCreatureTtl(id: EntityId, ttlMs: number): void {
    const creature = this.creatures.get(id);
    if (!creature) {
      return;
    }

    creature.ttlMs = ttlMs;
    this.creatures.set(id, creature);
  }
}
