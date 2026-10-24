/**
 * Register aller nicht belegten Annahmen.
 *
 * Jede Fahrzeugfunktion oder jeder Parameter ohne verifizierbare Quelle wird hier
 * mit `assumption()` eingetragen. Die Liste wird in der Oberfläche und in
 * docs/ANNAHMEN.md sichtbar gemacht, damit nichts Erfundenes als belegt gilt.
 */

export interface Source {
  title: string;
  url?: string;
  /** Kapitel, Seite oder Zeitstempel in der Quelle. */
  locator?: string;
}

export interface Assumption {
  id: string;
  /** Was angenommen wird. */
  statement: string;
  /** Warum diese Annahme gewählt wurde. */
  rationale: string;
}

const registry = new Map<string, Assumption>();

export function assumption(entry: Assumption): Assumption {
  const existing = registry.get(entry.id);
  if (existing && existing.statement !== entry.statement) {
    throw new Error(`Annahme ${entry.id} ist bereits anders definiert`);
  }
  registry.set(entry.id, entry);
  return entry;
}

export function listAssumptions(): Assumption[] {
  return [...registry.values()].sort((a, b) => a.id.localeCompare(b.id));
}
