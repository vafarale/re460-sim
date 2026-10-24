import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
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
    const refs = readFileSync('docs/referenz/README.md', 'utf8');
    for (const e of CAB_ELEMENTS) {
      expect(e.evidence.length, e.id).toBeGreaterThan(0);
      for (const ev of e.evidence) {
        if (ev.kind === 'annahme') expect(known.has(ev.assumptionId), `${e.id}: ${ev.assumptionId}`).toBe(true);
        else expect(refs.includes(`| ${ev.ref} |`), `${e.id}: ${ev.ref}`).toBe(true);
      }
    }
  });

  it('eine Funktion gilt nur mit Bildbeleg als belegt', () => {
    for (const e of CAB_ELEMENTS.filter((x) => x.confidence === 'belegt')) {
      expect(e.evidence.some((ev) => ev.kind === 'bild'), e.id).toBe(true);
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

describe('Pultlayout', () => {
  it('zeichnet nur Elemente aus dem Katalog', async () => {
    const { DESK, BOUND } = await import('../src/ui/deskLayout');
    const ids = new Set(CAB_ELEMENTS.map((e) => e.id));
    for (const item of DESK) expect(ids.has(item.catalogId), item.catalogId).toBe(true);
    for (const b of Object.values(BOUND)) expect(ids.has(b.catalogId), b.catalogId).toBe(true);
  });
});
