import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { CAB_ELEMENTS } from '../src/ui/cabCatalog';
import { listAssumptions } from '../src/core/assumptions';
import '../src/vehicle/vehicle';

describe('Führerstand-Katalog', () => {
  it('hat eindeutige IDs', () => {
    const ids = CAB_ELEMENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('jedes Element hat einen Beleg, und jeder Beleg existiert', () => {
    const known = new Set(listAssumptions().map((a) => a.id));
    for (const e of CAB_ELEMENTS) {
      expect(e.evidence.length, e.id).toBeGreaterThan(0);
      for (const ev of e.evidence) {
        if (ev.kind === 'annahme') expect(known.has(ev.assumptionId), `${e.id}: ${ev.assumptionId}`).toBe(true);
        else expect(existsSync(`docs/referenz/${ev.file}`), `${e.id}: ${ev.file}`).toBe(true);
      }
    }
  });

  it('Positionen liegen im Bild', () => {
    for (const e of CAB_ELEMENTS) {
      if (!e.position) continue;
      expect(e.position.x).toBeGreaterThanOrEqual(0);
      expect(e.position.x).toBeLessThanOrEqual(1);
      expect(e.position.y).toBeGreaterThanOrEqual(0);
      expect(e.position.y).toBeLessThanOrEqual(1);
    }
  });
});
