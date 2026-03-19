export type MobKind = number;

export type MobBalanceConfig = {
  mobCount: number;
  baseWeight: number;
  defaultRarityDivider: number;
  mobOverrides?: Partial<Record<number, { weight?: number; rarityDividerFromPrevious?: number }>>;
};

export type MobDefinition = {
  id: MobKind;
  label: string;
  weight: number;
};

export type MobMergeConfig = {
  minConnectedToMerge: number;
  scoreMultiplier: number;
  scorePerEachMergedMob: boolean;
};

// Main gameplay tuning file:
// - mobCount controls total mob types
// - defaultRarityDivider controls "next mob is N times rarer"
// - mobOverrides allows per-mob custom formulas
export const MOB_BALANCE_CONFIG: MobBalanceConfig = {
  mobCount: 10,
  baseWeight: 1,
  defaultRarityDivider: 4,
  mobOverrides: {},
};

export const MOB_MERGE_CONFIG: MobMergeConfig = {
  minConnectedToMerge: 3,
  scoreMultiplier: 10,
  scorePerEachMergedMob: false,
};

export function buildMobDefinitions(config: MobBalanceConfig = MOB_BALANCE_CONFIG): MobDefinition[] {
  const mobs: MobDefinition[] = [];

  for (let id = 1; id <= config.mobCount; id += 1) {
    const override = config.mobOverrides?.[id];
    const previous = mobs[mobs.length - 1];

    let weight = override?.weight;
    if (weight === undefined) {
      if (!previous) {
        weight = config.baseWeight;
      } else {
        const divider = override?.rarityDividerFromPrevious ?? config.defaultRarityDivider;
        weight = previous.weight / divider;
      }
    }

    mobs.push({
      id,
      label: String(id),
      weight: Math.max(weight, Number.EPSILON),
    });
  }

  return mobs;
}

export function pickWeightedMob(mobs: MobDefinition[], random = Math.random): MobDefinition {
  if (mobs.length === 0) {
    throw new Error('Mob definition list is empty.');
  }

  const totalWeight = mobs.reduce((sum, mob) => sum + mob.weight, 0);
  const roll = random() * totalWeight;

  let cursor = 0;
  for (const mob of mobs) {
    cursor += mob.weight;
    if (roll <= cursor) {
      return mob;
    }
  }

  return mobs[mobs.length - 1];
}

export const MOB_DEFINITIONS = buildMobDefinitions();

export function calculateMergeScore(mobId: MobKind, mergedCount: number): number {
  if (MOB_MERGE_CONFIG.scorePerEachMergedMob) {
    return mobId * MOB_MERGE_CONFIG.scoreMultiplier * mergedCount;
  }

  return mobId * MOB_MERGE_CONFIG.scoreMultiplier;
}
