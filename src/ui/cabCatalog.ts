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
      /** Referenz-ID aus docs/referenz/README.md, z. B. 'R1'. */
      ref: string;
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
  /** Welche Fahrzeugfunktion das Element bedient oder anzeigt; fehlt, solange unbekannt. */
  binds?: string;
  /** Wie sicher die Zuordnung zur Funktion ist. */
  confidence: 'belegt' | 'wahrscheinlich' | 'unklar';
  evidence: CabEvidence[];
}

const unbelegt: CabEvidence = { kind: 'annahme', assumptionId: 'A-UI-01' };

/** Stand Prototyp: alle Elemente funktional, noch ohne Bildbeleg. */
const FUNCTIONAL: Omit<CabElement, 'confidence'>[] = [
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

/**
 * Auf den Referenzbildern R1–R3 erkannte Elemente (Pult nach Refit).
 * Positionen gemessen auf R1 (Weitwinkel, daher verzerrt). Beschriftungen sind
 * auf den Bildern nicht lesbar; Funktionen sind deshalb höchstens 'wahrscheinlich'.
 */
const r1 = (observation: string): CabEvidence => ({ kind: 'bild', ref: 'R1', observation });
const r23 = (observation: string): CabEvidence => ({ kind: 'bild', ref: 'R2', observation });

const OBSERVED: CabElement[] = [
  // Mittelpult
  { id: 'mitte-rundinstrument-oben', label: 'Rundinstrument oben', kind: 'instrument', area: 'Mittelpult links', position: { x: 0.34, y: 0.57 }, binds: 'hlBar/hbBar', confidence: 'wahrscheinlich', evidence: [r1('Kleines Rundinstrument, Zeiger senkrecht'), { kind: 'annahme', assumptionId: 'A-UI-02' }] },
  { id: 'mitte-rundinstrument-unten', label: 'Rundinstrument unten', kind: 'instrument', area: 'Mittelpult links', position: { x: 0.34, y: 0.62 }, binds: 'bcBar', confidence: 'wahrscheinlich', evidence: [r1('Kleines Rundinstrument unter dem oberen'), { kind: 'annahme', assumptionId: 'A-UI-02' }] },
  { id: 'mitte-display', label: 'Display mit Tachoscheibe', kind: 'display', area: 'Mittelpult', position: { x: 0.41, y: 0.6 }, binds: 'ETCS-DMI', confidence: 'wahrscheinlich', evidence: [r1('Bildschirm mit Softkeys links, rechts und unten; runde Geschwindigkeitsskala links, blauer Balken und Liste rechts')] },
  { id: 'mitte-schild-gelb', label: 'Gelbes Schild', kind: 'leuchte', area: 'Mittelpult rechts oben', position: { x: 0.48, y: 0.56 }, confidence: 'unklar', evidence: [r1('Gelbes Schild mit kurzer Aufschrift, nicht lesbar')] },
  { id: 'mitte-balkeninstrumente', label: 'Zwei Profilinstrumente', kind: 'instrument', area: 'Mittelpult rechts', position: { x: 0.55, y: 0.56 }, confidence: 'unklar', evidence: [r1('Zwei senkrechte Profilinstrumente nebeneinander'), r23('Gleiche zwei Profilinstrumente, Skalen nicht lesbar')] },
  { id: 'mitte-tastenspalte', label: 'Leuchttasten rechts', kind: 'taster', area: 'Mittelpult rechts aussen', position: { x: 0.58, y: 0.6 }, confidence: 'unklar', evidence: [r1('Spalte orange, gelbe und rote Leuchttasten'), r23('Etwa 8 Leuchttasten in zwei Spalten, gelb/orange/rot')] },
  { id: 'mitte-kleinpanel', label: 'Kleines Bedienfeld unten', kind: 'taster', area: 'Mittelpult unten', position: { x: 0.52, y: 0.64 }, confidence: 'unklar', evidence: [r1('Rote und grüne Taste, zwei Kontrolllampen, Anzeigefeld')] },
  { id: 'mitte-kippschalter', label: 'Zwei Schalter', kind: 'schalter', area: 'Mittelpult rechts unten', position: { x: 0.56, y: 0.63 }, confidence: 'unklar', evidence: [r1('Zwei kleine Kipp- oder Drehschalter')] },
  // Rechter Flügel
  { id: 'rechts-drehknopf-oben', label: 'Drehknopf oben', kind: 'drehschalter', area: 'Rechter Flügel oben', position: { x: 0.65, y: 0.52 }, confidence: 'unklar', evidence: [r1('Schwarzer Drehknopf'), r23('Schwarzer Drehknopf, daneben rote Taste')] },
  { id: 'rechts-tasten-gruen-rot', label: 'Grün/Rot-Tastenpaare', kind: 'taster', area: 'Rechter Flügel links', position: { x: 0.65, y: 0.58 }, confidence: 'unklar', evidence: [r1('Zwei Paare grüne/rote Tasten übereinander, typisch für Ein/Aus'), r23('Grüne und rote Taste unter dem Wahlschalter')] },
  { id: 'rechts-wahlschalter', label: 'Wahlschalter mit Skala', kind: 'drehschalter', area: 'Rechter Flügel links', position: { x: 0.65, y: 0.6 }, confidence: 'unklar', evidence: [r1('Drehschalter mit Symbolen'), r23('Drehschalter mit mehreren nummerierten Stellungen')] },
  { id: 'rechts-tastenreihe', label: 'Vier farbige Tasten', kind: 'taster', area: 'Rechter Flügel oben', confidence: 'unklar', evidence: [r23('Reihe rot, orange, gelb, türkis')] },
  { id: 'rechts-display', label: 'Display mit Tastatur', kind: 'display', area: 'Rechter Flügel Mitte', position: { x: 0.72, y: 0.6 }, binds: 'Fahrzeugdiagnose', confidence: 'wahrscheinlich', evidence: [r1('Grosser Bildschirm, darunter Zifferntastatur und Funktionstasten')] },
  { id: 'rechts-leuchttasten', label: 'Leuchttastenfeld', kind: 'taster', area: 'Rechter Flügel rechts', position: { x: 0.8, y: 0.67 }, confidence: 'unklar', evidence: [r1('Etwa 12 Leuchttasten orange/gelb/rot, eine blaue, grüne und rote Tasten')] },
  { id: 'rechts-schluessel', label: 'Schlüssel-/Drehschalter', kind: 'drehschalter', area: 'Rechter Flügel unten rechts', position: { x: 0.83, y: 0.75 }, confidence: 'unklar', evidence: [r1('Schlüssel- oder Drehschalter mit Bügel')] },
  { id: 'rechts-hebel', label: 'Hebel am rechten Flügel', kind: 'hebel', area: 'Rechter Flügel rechts', confidence: 'unklar', evidence: [r23('Schwarzer abgewinkelter Hebel rechts am Flügel')] },
  // Mittelkonsole
  { id: 'konsole-schluessel', label: 'Schlüsselschalter', kind: 'drehschalter', area: 'Mittelkonsole oben', position: { x: 0.57, y: 0.74 }, binds: 'setCabActive', confidence: 'wahrscheinlich', evidence: [r1('Schlüsselzylinder zwischen zwei quadratischen Tasten, darunter blaue Taste'), r23('Gleiche Anordnung'), { kind: 'annahme', assumptionId: 'A-UI-02' }] },
  { id: 'konsole-hebel', label: 'Hebel in Kulisse', kind: 'hebel', area: 'Mittelkonsole', position: { x: 0.59, y: 0.84 }, binds: 'setTractionSetpoint', confidence: 'wahrscheinlich', evidence: [r1('Längs verschiebbarer Hebel, rechte Hand des Lokführers darauf'), r23('T-förmiger Griff in einer Längskulisse'), { kind: 'annahme', assumptionId: 'A-UI-02' }] },
  { id: 'konsole-knopf', label: 'Kleiner Drehknopf', kind: 'drehschalter', area: 'Mittelkonsole', position: { x: 0.6, y: 0.77 }, confidence: 'unklar', evidence: [r1('Schwarzer Drehknopf neben der Kulisse'), r23('Messingfarbener Knopf links der Kulisse')] },
  // Linker Flügel
  { id: 'links-tablet', label: 'Tablet', kind: 'display', area: 'Linker Flügel oben', position: { x: 0.2, y: 0.55 }, confidence: 'unklar', evidence: [r1('Tablet in Halterung mit Fahrplan-ähnlicher Liste; vermutlich nachgerüstet, nicht Teil der Lok')] },
  { id: 'links-display', label: 'Display mit Softkeys', kind: 'display', area: 'Linker Flügel', position: { x: 0.25, y: 0.71 }, confidence: 'unklar', evidence: [r1('Zweiter Bildschirm mit Softkey-Rahmen, ausgeschaltet')] },
  { id: 'links-tastenspalte', label: 'Tastenspalte', kind: 'taster', area: 'Linker Flügel unten', position: { x: 0.2, y: 0.8 }, confidence: 'unklar', evidence: [r1('Senkrechte Reihe grüne, rote, orange Tasten')] },
  { id: 'links-hebel', label: 'Hebel links unten', kind: 'hebel', area: 'Linker Flügel unten', position: { x: 0.31, y: 0.93 }, confidence: 'unklar', evidence: [r1('Griff unter der linken Hand des Lokführers, nur teilweise sichtbar')] },
];

export const CAB_ELEMENTS: CabElement[] = [
  ...FUNCTIONAL.map((e) => ({ ...e, confidence: 'unklar' as const })),
  ...OBSERVED,
];

/** Elemente, die nur durch Annahmen gestützt sind. */
export function unverifiedElements(elements: CabElement[] = CAB_ELEMENTS): CabElement[] {
  return elements.filter((e) => !e.evidence.some((ev) => ev.kind === 'bild'));
}
