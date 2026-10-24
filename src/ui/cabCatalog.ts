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
const r4 = (observation: string): CabEvidence => ({ kind: 'bild', ref: 'R4', observation });
const r5 = (observation: string): CabEvidence => ({ kind: 'bild', ref: 'R5', observation });
const r6 = (observation: string): CabEvidence => ({ kind: 'bild', ref: 'R6', observation });

const OBSERVED: CabElement[] = [
  // Mittelpult
  { id: 'mitte-zaehler', label: 'Zwei Zählwerke', kind: 'instrument', area: 'Mittelpult links aussen', confidence: 'unklar', evidence: [r4('Zwei mechanische Zählwerke mit je 4 Stellen übereinander, zwischen linkem Display und Rundinstrumenten')] },
  { id: 'mitte-rundinstrument-oben', label: 'Rundinstrument oben', kind: 'instrument', area: 'Mittelpult links', position: { x: 0.34, y: 0.57 }, binds: 'hlBar/hbBar', confidence: 'wahrscheinlich', evidence: [r1('Kleines Rundinstrument, Zeiger senkrecht'), r4('Rundinstrument mit gelbem Zeiger'), { kind: 'annahme', assumptionId: 'A-UI-02' }] },
  { id: 'mitte-rundinstrument-unten', label: 'Rundinstrument unten', kind: 'instrument', area: 'Mittelpult links', position: { x: 0.34, y: 0.62 }, binds: 'bcBar', confidence: 'wahrscheinlich', evidence: [r1('Kleines Rundinstrument unter dem oberen'), r4('Rundinstrument mit grünem Skalenbogen und gelbem Zeiger'), { kind: 'annahme', assumptionId: 'A-UI-02' }] },
  { id: 'mitte-tasten-links', label: 'Vier Tasten unter den Rundinstrumenten', kind: 'taster', area: 'Mittelpult links', confidence: 'unklar', evidence: [r4('Taste mit Kreissymbol (weiss), rote Taste; darunter rote und grüne Taste')] },
  { id: 'mitte-display', label: 'ETCS-DMI', kind: 'display', area: 'Mittelpult', position: { x: 0.41, y: 0.6 }, binds: 'ETCS-DMI', confidence: 'belegt', evidence: [r1('Bildschirm mit Softkeys links, rechts und unten'), r5('Tachoscheibe 0–240 km/h mit Digitalwert in der Nabe (154), Zielgeschwindigkeitsmarke, Planungsbereich mit Distanzskala, Menütasten „Mode“, „Data“, „Umgehen“, „Spez“; Softkeys mit Pfeilen links und rechts; Tasten „FAIL“, „AUTO“, „MAN“ oberhalb')] },
  { id: 'mitte-schild', label: 'Oranges Schild', kind: 'leuchte', area: 'Mittelpult rechts oben', position: { x: 0.48, y: 0.555 }, confidence: 'unklar', evidence: [r1('Farbiges Schild mit kurzer Aufschrift'), r4('Oranges Schild mit Zahlen, nicht lesbar; vermutlich Information, kein Bedienelement')] },
  { id: 'mitte-profilinstrument-links', label: 'Zug-/Bremskraft ±100', kind: 'instrument', area: 'Mittelpult rechts', position: { x: 0.54, y: 0.56 }, binds: 'tractionForceN', confidence: 'wahrscheinlich', evidence: [r6('Senkrechte Skala von +100 über 0 bis −100, oben grüner Bereich, unten gelb/rot'), { kind: 'annahme', assumptionId: 'A-UI-03' }] },
  { id: 'mitte-fahrleitung-kv', label: 'Fahrleitungsspannung kV', kind: 'instrument', area: 'Mittelpult rechts', position: { x: 0.56, y: 0.56 }, binds: 'catenaryV', confidence: 'belegt', evidence: [r4('Senkrechte Skala 0 bis 20 mit Einheit „kV“, Zwischenwerte 5, 10, 15')] },
  { id: 'mitte-tastenspalte', label: 'Leuchttasten rechts', kind: 'taster', area: 'Mittelpult rechts aussen', position: { x: 0.585, y: 0.6 }, confidence: 'unklar', evidence: [r1('Spalte orange, gelbe und rote Leuchttasten'), r4('Vier Leuchttasten übereinander (orange, orange mit Symbol, rot, rot), Symbole nicht eindeutig')] },
  { id: 'mitte-taste-rot-links', label: 'Rote Leuchttaste neben Instrumenten', kind: 'taster', area: 'Mittelpult rechts', confidence: 'unklar', evidence: [r4('Rote Leuchttaste links unter den Profilinstrumenten')] },
  { id: 'mitte-kleinpanel', label: 'Bedienfeld mit zwei Anzeigen', kind: 'taster', area: 'Mittelpult unten', position: { x: 0.52, y: 0.645 }, confidence: 'unklar', evidence: [r1('Rote und grüne Taste, zwei Kontrolllampen, Anzeigefeld'), r4('Zwei kleine LCD-Anzeigen, zwei weisse Kontrolllampen, rote und grüne Taste')] },
  { id: 'mitte-drehregler', label: 'Zwei Drehregler', kind: 'drehschalter', area: 'Mittelpult rechts unten', position: { x: 0.56, y: 0.63 }, confidence: 'unklar', evidence: [r1('Zwei kleine Drehschalter'), r4('Zwei Drehknöpfe mit roter Markierung, je ein Symbol darüber; vermutlich Helligkeit')] },
  { id: 'mitte-tastenreihe-unten', label: 'Drei Leuchttasten unten', kind: 'taster', area: 'Mittelpult rechts unten', confidence: 'unklar', evidence: [r4('Orange, rot, orange; gleiches Symbol (Kreis mit seitlichen Strichen)')] },
  // Rechter Flügel
  { id: 'rechts-klima-regler', label: 'Temperaturregler', kind: 'drehschalter', area: 'Rechter Flügel links oben', position: { x: 0.65, y: 0.52 }, binds: 'Klima', confidence: 'belegt', evidence: [r1('Schwarzer Drehknopf'), r6('Drehknopf zwischen blauem und rotem Thermometer-Symbol')] },
  { id: 'rechts-klima-tasten', label: 'Klima ein/aus', kind: 'taster', area: 'Rechter Flügel links', position: { x: 0.65, y: 0.58 }, binds: 'Klima', confidence: 'wahrscheinlich', evidence: [r6('Grüne Taste mit Thermometer und „I“, rote Taste mit Thermometer')] },
  { id: 'rechts-tasten-scheibe', label: 'Grün/Rot unter Wischerschalter', kind: 'taster', area: 'Rechter Flügel links unten', confidence: 'unklar', evidence: [r6('Grüne Taste mit Symbol und „I“, rote Taste mit Symbol; Symbol nicht eindeutig')] },
  { id: 'rechts-wischer', label: 'Scheibenwischer-Wahlschalter', kind: 'drehschalter', area: 'Rechter Flügel links', position: { x: 0.65, y: 0.6 }, binds: 'Wischer', confidence: 'wahrscheinlich', evidence: [r23('Drehschalter mit mehreren Stellungen'), r6('Drehschalter mit Stellungssymbolen, darunter Scheibenwischer-Symbol')] },
  { id: 'rechts-tastenreihe', label: 'Vier farbige Tasten', kind: 'taster', area: 'Rechter Flügel oben', confidence: 'unklar', evidence: [r23('Reihe rot, orange, gelb, türkis')] },
  { id: 'rechts-display', label: 'Fahrzeugdisplay mit Tastatur', kind: 'display', area: 'Rechter Flügel Mitte', position: { x: 0.72, y: 0.6 }, binds: 'Fahrzeugdiagnose', confidence: 'wahrscheinlich', evidence: [r1('Grosser Bildschirm, darunter Zifferntastatur'), r6('Tastatur mit Ziffern und Tasten „HELP“, „CLEAR“, „ENTER“, „MODE“, „HOME“')] },
  { id: 'rechts-meldetasten', label: 'Leuchtmeldefeld', kind: 'taster', area: 'Rechter Flügel rechts oben', position: { x: 0.8, y: 0.62 }, confidence: 'unklar', evidence: [r1('Etwa 12 Leuchttasten'), r6('3×2 Leuchttasten orange/rot, darunter 2 orange und 1 rote mit Warndreieck')] },
  { id: 'rechts-parkbremse', label: 'Taste „P“', kind: 'taster', area: 'Rechter Flügel rechts', binds: 'Parkbremse', confidence: 'wahrscheinlich', evidence: [r6('Blaue Leuchttaste mit „P“'), { kind: 'annahme', assumptionId: 'A-UI-03' }] },
  { id: 'rechts-stromabnehmer-meldung', label: 'Meldung Stromabnehmer', kind: 'leuchte', area: 'Rechter Flügel rechts', binds: 'pantograph', confidence: 'wahrscheinlich', evidence: [r6('Orange Leuchttaste mit Zickzack-Symbol über dem grün/roten Paar'), { kind: 'annahme', assumptionId: 'A-UI-03' }] },
  { id: 'rechts-stromabnehmer', label: 'Stromabnehmer heben/senken', kind: 'taster', area: 'Rechter Flügel rechts unten', binds: 'raisePantograph/lowerPantograph', confidence: 'wahrscheinlich', evidence: [r6('Grüne Taste mit Zickzack-Symbol und „I“, rote Taste mit gleichem Symbol'), { kind: 'annahme', assumptionId: 'A-UI-03' }] },
  { id: 'rechts-hauptschalter', label: 'Hauptschalter ein/aus', kind: 'taster', area: 'Rechter Flügel rechts unten', binds: 'closeMainSwitch/openMainSwitchCommand', confidence: 'wahrscheinlich', evidence: [r6('Grüne Taste mit Kreis-Symbol und „I“, rote Taste daneben; gleiches Kreis-Symbol auf Schild oben rechts'), { kind: 'annahme', assumptionId: 'A-UI-03' }] },
  { id: 'rechts-schluessel', label: 'Schlüsselschalter', kind: 'drehschalter', area: 'Rechter Flügel rechts', position: { x: 0.83, y: 0.6 }, binds: 'setCabActive', confidence: 'wahrscheinlich', evidence: [r1('Schlüssel- oder Drehschalter'), r6('Schlüsselzylinder mit steckendem Schlüssel'), { kind: 'annahme', assumptionId: 'A-UI-03' }] },
  { id: 'rechts-hebel', label: 'Drehgriff unter dem Schlüssel', kind: 'hebel', area: 'Rechter Flügel rechts', confidence: 'unklar', evidence: [r23('Schwarzer abgewinkelter Hebel rechts am Flügel'), r6('Länglicher Drehgriff unter dem Schlüsselschalter')] },
  // Mittelkonsole
  { id: 'konsole-drehschalter', label: 'Drehschalter Mittelkonsole', kind: 'drehschalter', area: 'Mittelkonsole oben', position: { x: 0.57, y: 0.74 }, confidence: 'unklar', evidence: [r1('Drehschalter zwischen zwei quadratischen Tasten, darunter blaue Taste'), r23('Gleiche Anordnung'), r4('Schwarzer Drehgriff mit Zeigerfinne, kein Schlüssel erkennbar')] },
  { id: 'konsole-taste-symbol', label: 'Taste mit Symbol', kind: 'taster', area: 'Mittelkonsole oben', confidence: 'unklar', evidence: [r4('Graue Taste mit rundem Symbol links oben')] },
  { id: 'konsole-taste-blau', label: 'Blaue Leuchttaste', kind: 'taster', area: 'Mittelkonsole oben', confidence: 'unklar', evidence: [r4('Blaue Leuchttaste unter der Symboltaste')] },
  { id: 'konsole-taste-m', label: 'Taste „M“', kind: 'taster', area: 'Mittelkonsole oben', confidence: 'unklar', evidence: [r4('Graue Taste, Aufschrift „M“ lesbar')] },
  { id: 'konsole-hebel', label: 'Hebel mit Kugelknopf', kind: 'hebel', area: 'Mittelkonsole', position: { x: 0.59, y: 0.84 }, binds: 'setTractionSetpoint', confidence: 'wahrscheinlich', evidence: [r1('Längs verschiebbarer Hebel'), r23('Griff in einer Längskulisse'), r6('Schmaler Hebel mit Kugelknopf, zwei gelbe Markierungen auf der Kulisse'), { kind: 'annahme', assumptionId: 'A-UI-02' }] },
  { id: 'konsole-griff', label: 'Grosser Griff rechts', kind: 'hebel', area: 'Mittelkonsole rechts', confidence: 'unklar', evidence: [r6('Grosser schwarzer Griff rechts neben dem Kugelhebel; Funktion unbekannt')] },
  { id: 'konsole-knopf', label: 'Kleiner Drehknopf', kind: 'drehschalter', area: 'Mittelkonsole', position: { x: 0.6, y: 0.77 }, confidence: 'unklar', evidence: [r1('Schwarzer Drehknopf neben der Kulisse'), r23('Messingfarbener Knopf links der Kulisse')] },
  // Linker Flügel
  { id: 'links-tablet', label: 'Tablet', kind: 'display', area: 'Linker Flügel oben', position: { x: 0.2, y: 0.55 }, confidence: 'unklar', evidence: [r1('Tablet in Halterung mit Fahrplan-ähnlicher Liste; vermutlich nachgerüstet, nicht Teil der Lok')] },
  { id: 'links-display', label: 'Display mit Softkeys', kind: 'display', area: 'Linker Flügel', position: { x: 0.25, y: 0.71 }, confidence: 'unklar', evidence: [r1('Zweiter Bildschirm mit Softkey-Rahmen, ausgeschaltet'), r4('Gleiche Bauform wie das mittlere Display, Softkeys mit Symbolen oben')] },
  { id: 'links-tastenspalte', label: 'Tastenspalte', kind: 'taster', area: 'Linker Flügel unten', position: { x: 0.2, y: 0.8 }, confidence: 'unklar', evidence: [r1('Senkrechte Reihe grüne, rote, orange Tasten'), r4('Weisse Taste mit Haken-Symbol, daneben rote, orange und rote Tasten')] },
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
