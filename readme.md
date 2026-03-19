# Browser + Mobile 2D Game Starter

Стартовый проект для 2D-игры на TypeScript с упором на чистую архитектуру:

- движок: `Phaser 3`
- сборка: `Vite`
- строгая типизация: `TypeScript (strict)`
- сцены + ECS core (entities/components/systems) + state разделены по слоям

## Запуск

```bash
npm install
npm run dev
```

Сборка production:

```bash
npm run build
```

Запуск unit-тестов:

```bash
npm test
```

## Текущая механика

- поле `15 x 20` клеток
- спавн существ (`slime`, `beetle`) на поле
- клик/тап по существу дает очки
- установка объектов (`flower`, `totem`) в клетки (с тратой очков)
- HUD: очки, таймер, выбор объекта
- окончание игры по таймеру

## Архитектура

```text
src/
  game/
    config.ts               # общая конфигурация игры
    constants.ts            # размеры, тайминги, балансы
    events.ts               # централизованные имена событий
    types.ts                # доменные типы
    core/
      board.ts              # координатные утилиты поля
      gridMath.ts           # чистая математика world <-> cell
      ecs/
        World.ts            # ECS-мир (entities + component stores)
      systems/
        SpawnCreatureSystem.ts
        CreatureLifetimeSystem.ts
        CollectCreatureSystem.ts
        PlaceItemSystem.ts
    state/
      GameStateStore.ts     # единый store состояния матча
    systems/
      GridSystem.ts         # перевод world <-> cell, отрисовка сетки
    entities/
      Creature.ts           # сущность существа
      PlaceableItem.ts      # сущность размещаемого объекта
    scenes/
      BootScene.ts          # подготовка ресурсов
      GameScene.ts          # геймплей
      HudScene.ts           # UI / управление
```

## Что расширять дальше

- добавить реальные sprite sheets и frame-анимации вместо procedural-текстур
- добавить movement/AI systems в ECS (pathing, атаки, эффекты)
- добавить сохранение прогресса, уровни, баланс и экономику
- расширить тесты на `GameStateStore` и интеграционные сценарии матча
