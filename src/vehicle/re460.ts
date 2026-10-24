import type { Source } from '../core/assumptions';

/**
 * Belegte Grunddaten der Re 460. Werte ohne Quelle gehören nicht hierher,
 * sondern als Annahme in das jeweilige Modul.
 */
const wikipedia: Source = { title: 'SBB Re 460 (Wikipedia, en)', url: 'https://en.wikipedia.org/wiki/SBB_Re_460' };

export const RE460 = {
  massKg: { value: 84_000, source: wikipedia },
  lengthM: { value: 18.5, source: wikipedia },
  maxPowerW: { value: 6_100_000, source: wikipedia },
  continuousPowerW: { value: 5_600_000, source: wikipedia },
  continuousTractiveEffortN: { value: 230_000, atKmh: 88, source: wikipedia },
  maxOperatingSpeedKmh: { value: 200, source: wikipedia },
  catenary: { voltageV: 15_000, frequencyHz: 50 / 3, source: wikipedia },
} as const;
