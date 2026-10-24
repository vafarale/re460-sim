/**
 * Katalog aller Elemente des Führerstands.
 *
 * Jedes Element, das im Pult gezeichnet wird, steht hier mit seiner Herkunft:
 * entweder einem Referenzbild in docs/referenz/ (mit Bildausschnitt) oder einer
 * registrierten Annahme. So bleibt nachvollziehbar, was belegt ist.
 */

export type CabElementKind = 'taster' | 'schalter' | 'drehschalter' | 'hebel' | 'instrument' | 'leuchte' | 'display';

/** Lage auf dem Pult, normiert auf 0..1 (links/oben = 0), gemessen am Referenzbild. */
export interface CabPosition {
  x: number;
  y: number;
}

export type CabEvidence =
  | {
      kind: 'bild';
      /** Dateiname in docs/referenz/. */
      file: string;
      /** Was auf dem Bild zu sehen ist, z. B. Beschriftung wörtlich. */
      observation: string;
    }
  | {
      kind: 'annahme';
      /** ID aus dem Annahmen-Register. */
      assumptionId: string;
    };

export interface CabElement {
  id: string;
  /** Beschriftung wie auf dem Pult, sonst funktionale Bezeichnung. */
  label: string;
  kind: CabElementKind;
  /** Pultbereich, z. B. 'links', 'mitte', 'rechts', 'oben'. */
  area: string;
  position?: CabPosition;
  /** Welche Fahrzeugfunktion das Element bedient oder anzeigt. */
  binds: string;
  evidence: CabEvidence[];
}

const unbelegt: CabEvidence = { kind: 'annahme', assumptionId: 'A-UI-01' };

/** Stand Prototyp: alle Elemente funktional, noch ohne Bildbeleg. */
export const CAB_ELEMENTS: CabElement[] = [
  { id: 'batterie', label: 'Batterie', kind: 'schalter', area: 'unbekannt', binds: 'setBattery', evidence: [unbelegt] },
  { id: 'fuehrerstand', label: 'Führerstand aktiv', kind: 'schalter', area: 'unbekannt', binds: 'setCabActive', evidence: [unbelegt] },
  { id: 'hilfskompressor', label: 'Hilfskompressor', kind: 'taster', area: 'Pneumatikpanel PT2', binds: 'startAuxCompressor', evidence: [unbelegt] },
  { id: 'stromabnehmer', label: 'Stromabnehmer', kind: 'taster', area: 'unbekannt', binds: 'raisePantograph/lowerPantograph', evidence: [unbelegt] },
  { id: 'hauptschalter', label: 'Hauptschalter', kind: 'taster', area: 'unbekannt', binds: 'closeMainSwitch/openMainSwitchCommand', evidence: [unbelegt] },
  { id: 'fahrtrichtung', label: 'Fahrtrichtung', kind: 'drehschalter', area: 'unbekannt', binds: 'setDirection', evidence: [unbelegt] },
  { id: 'fahrbremsschalter', label: 'Fahr-/Bremsschalter', kind: 'hebel', area: 'unbekannt', binds: 'setTractionSetpoint', evidence: [unbelegt] },
  { id: 'fbv', label: 'Führerbremsventil', kind: 'hebel', area: 'unbekannt', binds: 'setBrakeValve', evidence: [unbelegt] },
  { id: 'tacho', label: 'Geschwindigkeit', kind: 'instrument', area: 'unbekannt', binds: 'speedKmh', evidence: [unbelegt] },
  { id: 'manometer-hl-hb', label: 'HL / HB', kind: 'instrument', area: 'unbekannt', binds: 'hlBar/hbBar', evidence: [unbelegt] },
  { id: 'manometer-bz', label: 'Bremszylinder', kind: 'instrument', area: 'unbekannt', binds: 'bcBar', evidence: [unbelegt] },
  { id: 'fahrleitung', label: 'Fahrleitungsspannung', kind: 'instrument', area: 'unbekannt', binds: 'catenaryV', evidence: [unbelegt] },
  { id: 'zugkraft', label: 'Zug-/Bremskraft', kind: 'instrument', area: 'unbekannt', binds: 'tractionForceN', evidence: [unbelegt] },
];

/** Elemente, die nur durch Annahmen gestützt sind. */
export function unverifiedElements(elements: CabElement[] = CAB_ELEMENTS): CabElement[] {
  return elements.filter((e) => !e.evidence.some((ev) => ev.kind === 'bild'));
}
