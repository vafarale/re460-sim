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
  { catalogId: 'mitte-profilinstrument-links', shapes: [r(1010, 50, 44, 160)] },
  { catalogId: 'mitte-taste-rot-links', shapes: [r(1000, 222, 36, 26)], colors: [RED] },
  { catalogId: 'mitte-drehregler', shapes: [c(1060, 236, 13), c(1100, 236, 13)] },
  { catalogId: 'mitte-tastenreihe-unten', shapes: [r(1004, 280, 38, 28), r(1050, 280, 38, 28), r(1096, 280, 38, 28)], colors: [ORANGE, RED, ORANGE] },
  { catalogId: 'mitte-tastenspalte', shapes: [r(1136, 50, 34, 28), r(1136, 96, 34, 28), r(1136, 142, 34, 28), r(1136, 188, 34, 28)], colors: [ORANGE, ORANGE, RED, RED] },
  { catalogId: 'mitte-kleinpanel', shapes: [r(870, 230, 120, 90)] },
  // Rechter Flügel
  { catalogId: 'rechts-drehknopf-oben', shapes: [c(1240, 80, 16)] },
  { catalogId: 'rechts-tastenreihe', shapes: [r(1276, 70, 22, 20), r(1302, 70, 22, 20), r(1328, 70, 22, 20), r(1354, 70, 22, 20)], colors: [RED, ORANGE, YELLOW, CYAN] },
  { catalogId: 'rechts-tasten-gruen-rot', shapes: [r(1222, 116, 34, 26), r(1262, 116, 34, 26), r(1222, 260, 34, 26), r(1262, 260, 34, 26)], colors: [GREEN, RED, GREEN, RED] },
  { catalogId: 'rechts-wahlschalter', shapes: [c(1258, 196, 30)] },
  { catalogId: 'rechts-display', shapes: [r(1320, 110, 170, 120), r(1320, 240, 170, 70)] },
  { catalogId: 'rechts-leuchttasten', shapes: [r(1506, 120, 26, 22), r(1538, 120, 26, 22), r(1570, 120, 22, 22), r(1506, 148, 26, 22), r(1538, 148, 26, 22), r(1570, 148, 22, 22), r(1506, 176, 26, 22), r(1538, 176, 26, 22), r(1506, 216, 26, 22), r(1506, 256, 26, 22), r(1506, 296, 26, 22), r(1540, 296, 26, 22)], colors: [ORANGE, ORANGE, YELLOW, ORANGE, RED, ORANGE, ORANGE, YELLOW, BLUE, YELLOW, GREEN, RED] },
  { catalogId: 'rechts-schluessel', shapes: [c(1560, 360, 15)] },
  { catalogId: 'rechts-hebel', shapes: [r(1576, 230, 18, 50)] },
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
  lever: { catalogId: 'konsole-hebel', x: 708, y: 490, w: 60, h: 140 },
} as const;
