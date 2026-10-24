/**
 * Zeichenlage der Pultelemente im 2D-Führerstand (viewBox 1600 × 640).
 *
 * Die Anordnung folgt den Referenzbildern R1–R4 (Lage relativ zueinander),
 * Masse sind geschätzt. Farben der Tasten wie auf den Bildern erkennbar.
 */

export type Shape =
  | { type: 'rect'; x: number; y: number; w: number; h: number }
  | { type: 'circle'; x: number; y: number; r: number };

export interface DeskItem {
  /** ID im Führerstand-Katalog. */
  catalogId: string;
  shapes: Shape[];
  /** Farben je Form (Tasten), sonst neutral. */
  colors?: string[];
  /** Bedienhandlung je Form, siehe ACTIONS in desk.ts. */
  actions?: (string | undefined)[];
  /** Leuchtbedingung je Form, siehe LAMPS in desk.ts. */
  lamps?: (string | undefined)[];
}

const r = (x: number, y: number, w: number, h: number): Shape => ({ type: 'rect', x, y, w, h });
const c = (x: number, y: number, rad: number): Shape => ({ type: 'circle', x, y, r: rad });

const GREEN = '#2e9d57';
const RED = '#d23b3b';
const ORANGE = '#e8862a';
const YELLOW = '#e6b62a';
const BLUE = '#3a62c9';
const CYAN = '#2aa6a6';
const WHITE = '#d9dbde';
const GREY = '#8a9099';

/** Pultflächen (Hintergrund), von links nach rechts. */
export const PANELS: { id: string; label: string; points: string }[] = [
  { id: 'links', label: 'Linker Flügel', points: '0,90 380,40 380,560 0,600' },
  { id: 'mitte', label: 'Mittelpult', points: '400,30 1180,30 1180,340 400,340' },
  { id: 'rechts', label: 'Rechter Flügel', points: '1200,40 1600,90 1600,440 1200,380' },
  { id: 'konsole', label: 'Mittelkonsole', points: '640,360 900,360 900,640 640,640' },
];

export const DESK: DeskItem[] = [
  // Linker Flügel
  { catalogId: 'links-display', shapes: [r(50, 90, 290, 230)] },
  { catalogId: 'links-tastenspalte', shapes: [r(40, 360, 36, 28), r(84, 360, 36, 28), r(40, 396, 36, 28), r(84, 396, 36, 28), r(40, 432, 36, 28)], colors: [WHITE, RED, RED, ORANGE, RED] },
  { catalogId: 'links-hebel', shapes: [r(250, 470, 70, 110)] },
  // Mittelpult
  { catalogId: 'mitte-zaehler', shapes: [r(412, 60, 46, 18), r(412, 84, 46, 18)] },
  { catalogId: 'mitte-tasten-links', shapes: [r(420, 268, 34, 26), r(460, 268, 34, 26), r(420, 300, 34, 26), r(460, 300, 34, 26)], colors: [WHITE, RED, RED, GREEN] },
  { catalogId: 'mitte-schild', shapes: [r(880, 50, 110, 40)], colors: [ORANGE] },
  { catalogId: 'mitte-taste-rot-links', shapes: [r(1000, 222, 36, 26)], colors: [RED] },
  { catalogId: 'mitte-drehregler', shapes: [c(1060, 236, 13), c(1100, 236, 13)] },
  { catalogId: 'mitte-tastenreihe-unten', shapes: [r(1004, 280, 38, 28), r(1050, 280, 38, 28), r(1096, 280, 38, 28)], colors: [ORANGE, RED, ORANGE] },
  { catalogId: 'mitte-tastenspalte', shapes: [r(1136, 50, 34, 28), r(1136, 96, 34, 28), r(1136, 142, 34, 28), r(1136, 188, 34, 28)], colors: [ORANGE, ORANGE, RED, RED] },
  { catalogId: 'mitte-kleinpanel', shapes: [r(870, 230, 120, 90)] },
  // Rechter Flügel (nach R6)
  { catalogId: 'rechts-klima-regler', shapes: [c(1256, 84, 18)] },
  { catalogId: 'rechts-klima-tasten', shapes: [r(1220, 120, 34, 26), r(1262, 120, 34, 26)], colors: [GREEN, RED] },
  { catalogId: 'rechts-wischer', shapes: [c(1256, 200, 26)] },
  { catalogId: 'rechts-tasten-scheibe', shapes: [r(1220, 262, 34, 26), r(1262, 262, 34, 26)], colors: [GREEN, RED] },
  { catalogId: 'rechts-tastenreihe', shapes: [r(1320, 70, 22, 18), r(1346, 70, 22, 18), r(1372, 70, 22, 18), r(1398, 70, 22, 18)], colors: [RED, ORANGE, YELLOW, CYAN] },
  { catalogId: 'rechts-display', shapes: [r(1310, 100, 168, 130), r(1310, 240, 168, 70)] },
  { catalogId: 'rechts-meldetasten', shapes: [r(1488, 104, 30, 22), r(1522, 104, 30, 22), r(1556, 104, 30, 22), r(1488, 132, 30, 22), r(1522, 132, 30, 22), r(1556, 132, 30, 22), r(1488, 170, 30, 22), r(1522, 170, 30, 22), r(1488, 206, 30, 22)], colors: [ORANGE, ORANGE, ORANGE, ORANGE, RED, ORANGE, ORANGE, ORANGE, RED] },
  { catalogId: 'rechts-schluessel', shapes: [c(1566, 214, 14)], actions: ['cab-toggle'], lamps: ['cab'] },
  { catalogId: 'rechts-hebel', shapes: [r(1548, 250, 40, 16)] },
  { catalogId: 'rechts-parkbremse', shapes: [r(1488, 246, 30, 22)], colors: [BLUE] },
  { catalogId: 'rechts-stromabnehmer-meldung', shapes: [r(1488, 284, 30, 22)], colors: [ORANGE], lamps: ['panto-moving'] },
  { catalogId: 'rechts-stromabnehmer', shapes: [r(1474, 326, 28, 24), r(1506, 326, 28, 24)], colors: [GREEN, RED], actions: ['panto-up', 'panto-down'], lamps: ['panto-up', undefined] },
  { catalogId: 'rechts-hauptschalter', shapes: [r(1540, 330, 22, 22), r(1566, 330, 22, 22)], colors: [GREEN, RED], actions: ['hs-on', 'hs-off'], lamps: ['hs-on', 'hs-off'] },
  // Mittelkonsole
  { catalogId: 'konsole-taste-symbol', shapes: [r(660, 380, 34, 26)], colors: [GREY] },
  { catalogId: 'konsole-taste-blau', shapes: [r(660, 414, 34, 26)], colors: [BLUE] },
  { catalogId: 'konsole-drehschalter', shapes: [c(738, 404, 24)] },
  { catalogId: 'konsole-taste-m', shapes: [r(786, 420, 34, 26)], colors: [GREY] },
  { catalogId: 'konsole-knopf', shapes: [c(738, 462, 13)] },
];

/** Feste Plätze der Instrumente, die an die Simulation gebunden sind. */
export const BOUND = {
  hlhb: { catalogId: 'mitte-rundinstrument-oben', x: 470, y: 112, size: 100 },
  bc: { catalogId: 'mitte-rundinstrument-unten', x: 470, y: 214, size: 100 },
  dmi: { catalogId: 'mitte-display', x: 530, y: 40, w: 330, h: 290 },
  kv: { catalogId: 'mitte-fahrleitung-kv', x: 1062, y: 50, w: 44, h: 160 },
  force: { catalogId: 'mitte-profilinstrument-links', x: 1010, y: 50, w: 44, h: 160 },
  lever: { catalogId: 'konsole-hebel', x: 708, y: 490, w: 60, h: 140 },
} as const;
