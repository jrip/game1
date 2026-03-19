# Browser + Mobile 2D Game Starter

[![Deploy status](https://github.com/jrip/game1/actions/workflows/deploy.yml/badge.svg)](https://github.com/jrip/game1/actions/workflows/deploy.yml)

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
- клик/тап по клетке ставит моба в поле
- справа сверху есть блок `Следующий моб` (какой ID появится при следующем клике)
- мобы `1..10` выпадают по редкости (каждый следующий в 4 раза реже предыдущего)
- если 3+ одинаковых моба соприкасаются (по стороне), они сливаются:
  - группа исчезает
  - начисляются очки
  - на одной из этих клеток появляется моб следующего уровня
- HUD: очки, таймер, следующий моб
- окончание игры по таймеру

## Архитектура

```text
src/
  game/
    config.ts               # общая конфигурация игры
    constants.ts            # размеры, тайминги, балансы
    events.ts               # централизованные имена событий
    types.ts                # доменные типы
    mobSettings.ts          # баланс мобов, количество, формулы редкости
    effectsSettings.ts      # настройки flash/частиц/звука слияния
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
