export type MergeFlashSettings = {
  enabled: boolean;
  color: number;
  alpha: number;
  scaleTo: number;
  durationMs: number;
};

export type MergeParticleSettings = {
  enabled: boolean;
  count: number;
  color: number;
  minRadius: number;
  maxRadius: number;
  minDistance: number;
  maxDistance: number;
  minDurationMs: number;
  maxDurationMs: number;
};

export type MergeSoundSettings = {
  enabled: boolean;
  oscillatorType: OscillatorType;
  baseFrequencyHz: number;
  frequencyByMobLevelHz: number;
  targetBaseFrequencyHz: number;
  targetFrequencyByMobLevelHz: number;
  attackMs: number;
  releaseMs: number;
  peakGain: number;
};

export type MergeEffectSettings = {
  spawnPopDurationMs: number;
  mergeOutDurationMs: number;
  mergeOutYOffsetPx: number;
  flash: MergeFlashSettings;
  particles: MergeParticleSettings;
  sound: MergeSoundSettings;
};

// All merge visual/audio tuning in one place.
export const MERGE_EFFECT_SETTINGS: MergeEffectSettings = {
  spawnPopDurationMs: 160,
  mergeOutDurationMs: 170,
  mergeOutYOffsetPx: 8,
  flash: {
    enabled: true,
    color: 0xf8fafc,
    alpha: 0.78,
    scaleTo: 1.15,
    durationMs: 130,
  },
  particles: {
    enabled: true,
    count: 12,
    color: 0xfde68a,
    minRadius: 2,
    maxRadius: 4,
    minDistance: 18,
    maxDistance: 36,
    minDurationMs: 180,
    maxDurationMs: 260,
  },
  sound: {
    enabled: true,
    oscillatorType: 'triangle',
    baseFrequencyHz: 220,
    frequencyByMobLevelHz: 18,
    targetBaseFrequencyHz: 320,
    targetFrequencyByMobLevelHz: 24,
    attackMs: 20,
    releaseMs: 200,
    peakGain: 0.1,
  },
};
