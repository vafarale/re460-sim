import type { TrainDynamics } from '../physics/dynamics';
import type { Re460Vehicle } from '../vehicle/vehicle';
import { CAB_ELEMENTS, type CabElement } from './cabCatalog';
import { BOUND, DESK, PANELS, type Shape } from './deskLayout';
import { Gauge } from './gauge';

const NS = 'http://www.w3.org/2000/svg';

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

const byId = new Map(CAB_ELEMENTS.map((e) => [e.id, e]));

function describe(e: CabElement): string {
  const conf = { belegt: 'Funktion belegt', wahrscheinlich: 'Funktion wahrscheinlich', unklar: 'Funktion unklar' }[e.confidence];
  const ev = e.evidence
    .map((x) => (x.kind === 'bild' ? `${x.ref}: ${x.observation}` : `Annahme ${x.assumptionId}`))
    .map((t) => `<li>${t}</li>`)
    .join('');
  return `<b>${e.label}</b> · ${conf}${e.binds ? ` · bedient <code>${e.binds}</code>` : ''}<ul>${ev}</ul>`;
}

/**
 * Pult nach Referenzbildern. Elemente mit unklarer Funktion sind sichtbar,
 * aber ausgegraut und ohne Wirkung; ein Klick zeigt ihren Beleg.
 */
export function mountDesk(root: HTMLElement, lok: Re460Vehicle, dyn: TrainDynamics): () => void {
  root.innerHTML = `
    <div class="desk-legend">
      <span class="lg belegt">belegt</span><span class="lg wahrscheinlich">wahrscheinlich</span><span class="lg unklar">unklar (ohne Funktion)</span>
      <span class="desk-hint">Element anklicken für Herkunft</span>
    </div>`;
  const svg = el('svg', { viewBox: '0 0 1600 640', class: 'desk-svg', role: 'img', 'aria-label': 'Führerstand Re 460 nach Referenzbildern' });
  root.append(svg);
  const info = document.createElement('div');
  info.className = 'desk-info';
  info.innerHTML = 'Klicke ein Pultelement an, um zu sehen, worauf es beruht.';
  root.append(info);

  for (const p of PANELS) {
    svg.append(el('polygon', { points: p.points, class: 'desk-panel' }));
  }

  const showInfo = (id: string) => {
    const e = byId.get(id);
    if (e) info.innerHTML = describe(e);
  };

  for (const item of DESK) {
    const entry = byId.get(item.catalogId);
    const g = el('g', { class: `desk-item ${entry?.confidence ?? 'unklar'}`, 'data-id': item.catalogId });
    item.shapes.forEach((s: Shape, i) => {
      const fill = item.colors?.[i] ?? '#1b1e22';
      const shape =
        s.type === 'rect'
          ? el('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 3, fill })
          : el('circle', { cx: s.x, cy: s.y, r: s.r, fill });
      g.append(shape);
    });
    g.addEventListener('click', () => showInfo(item.catalogId));
    svg.append(g);
  }

  // Gebundene Instrumente
  const place = (gauge: Gauge, x: number, y: number, size: number, id: string) => {
    const s = gauge.element;
    s.setAttribute('x', String(x - size / 2));
    s.setAttribute('y', String(y - size / 2));
    s.setAttribute('width', String(size));
    s.setAttribute('height', String(size));
    const g = el('g', { class: `desk-item ${byId.get(id)?.confidence ?? 'unklar'}`, 'data-id': id });
    g.append(s);
    g.addEventListener('click', () => showInfo(id));
    svg.append(g);
  };
  const hl = new Gauge({ label: 'HL/HB', unit: 'bar', min: 0, max: 12, majorStep: 2, secondNeedle: true });
  const bc = new Gauge({ label: 'BZ', unit: 'bar', min: 0, max: 6, majorStep: 1 });
  place(hl, BOUND.hlhb.x, BOUND.hlhb.y, BOUND.hlhb.size, BOUND.hlhb.catalogId);
  place(bc, BOUND.bc.x, BOUND.bc.y, BOUND.bc.size, BOUND.bc.catalogId);

  // Display Mitte: vereinfachte Geschwindigkeitsanzeige, bis das ETCS-DMI in Phase 4 kommt.
  const d = BOUND.dmi;
  const dmiG = el('g', { class: 'desk-item wahrscheinlich', 'data-id': d.catalogId });
  dmiG.append(el('rect', { x: d.x, y: d.y, width: d.w, height: d.h, rx: 6, fill: '#0b0c0e', stroke: '#555' }));
  for (let i = 0; i < 8; i++) dmiG.append(el('rect', { x: d.x + 6, y: d.y + 20 + i * 32, width: 16, height: 22, rx: 2, class: 'softkey' }));
  for (let i = 0; i < 8; i++) dmiG.append(el('rect', { x: d.x + d.w - 22, y: d.y + 20 + i * 32, width: 16, height: 22, rx: 2, class: 'softkey' }));
  for (let i = 0; i < 10; i++) dmiG.append(el('rect', { x: d.x + 34 + i * 27, y: d.y + d.h - 26, width: 20, height: 18, rx: 2, class: 'softkey' }));
  const tacho = new Gauge({ label: 'v', unit: 'km/h', min: 0, max: 240, majorStep: 40 });
  const ts = tacho.element;
  ts.setAttribute('x', String(d.x + 34));
  ts.setAttribute('y', String(d.y + 14));
  ts.setAttribute('width', '230');
  ts.setAttribute('height', '230');
  dmiG.append(ts);
  const dmiNote = el('text', { x: d.x + d.w / 2, y: d.y + d.h - 34, class: 'dmi-note' });
  dmiNote.textContent = 'ETCS-DMI folgt (Phase 4)';
  dmiG.append(dmiNote);
  dmiG.addEventListener('click', () => showInfo(d.catalogId));
  svg.append(dmiG);

  // Fahrleitungsspannung kV (belegt durch R4): Profilinstrument 0–20 kV.
  const k = BOUND.kv;
  const kvG = el('g', { class: 'desk-item belegt', 'data-id': k.catalogId });
  kvG.append(el('rect', { x: k.x, y: k.y, width: k.w, height: k.h, rx: 3, fill: '#0b0c0e', stroke: '#555' }));
  for (let v = 0; v <= 20; v += 5) {
    const y = k.y + k.h - 10 - (v / 20) * (k.h - 20);
    kvG.append(el('line', { x1: k.x + k.w - 14, y1: y, x2: k.x + k.w - 4, y2: y, stroke: '#ddd' }));
    const t = el('text', { x: k.x + 6, y: y + 4, class: 'kv-num' });
    t.textContent = String(v);
    kvG.append(t);
  }
  const kvUnit = el('text', { x: k.x + k.w / 2, y: k.y + k.h + 14, class: 'kv-num kv-unit' });
  kvUnit.textContent = 'kV';
  kvG.append(kvUnit);
  const kvNeedle = el('line', { x1: k.x + k.w - 22, x2: k.x + k.w - 2, y1: 0, y2: 0, class: 'kv-needle' });
  kvG.append(kvNeedle);
  kvG.addEventListener('click', () => showInfo(k.catalogId));
  svg.append(kvG);

  // Kulissenhebel Mittelkonsole: Fahr-/Bremsschalter (wahrscheinlich), oben = Zugkraft.
  const L = BOUND.lever;
  const lvG = el('g', { class: 'desk-item wahrscheinlich lever', 'data-id': L.catalogId });
  lvG.append(el('rect', { x: L.x, y: L.y, width: L.w, height: L.h, rx: 6, fill: '#1b1e22', stroke: '#555' }));
  lvG.append(el('rect', { x: L.x + L.w / 2 - 4, y: L.y + 8, width: 8, height: L.h - 16, rx: 4, fill: '#000' }));
  const mid = L.y + L.h / 2;
  lvG.append(el('line', { x1: L.x + 4, x2: L.x + 14, y1: mid, y2: mid, stroke: '#ddd' }));
  const handle = el('rect', { x: L.x - 8, y: mid - 9, width: L.w + 16, height: 18, rx: 6, class: 'lever-handle' });
  lvG.append(handle);
  svg.append(lvG);
  const toSvgY = (clientY: number) => {
    const pt = svg.createSVGPoint();
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse()).y;
  };
  let dragging = false;
  const setFromY = (y: number) => {
    const travel = L.h / 2 - 12;
    const v = Math.max(-1, Math.min(1, (mid - y) / travel));
    lok.setTractionSetpoint(Math.abs(v) < 0.05 ? 0 : Math.round(v * 20) / 20);
  };
  lvG.addEventListener('pointerdown', (ev) => {
    dragging = true;
    lvG.setPointerCapture(ev.pointerId);
    setFromY(toSvgY(ev.clientY));
    showInfo(L.catalogId);
  });
  lvG.addEventListener('pointermove', (ev) => dragging && setFromY(toSvgY(ev.clientY)));
  lvG.addEventListener('pointerup', () => (dragging = false));

  return function render(): void {
    const s = lok.state;
    hl.set(s.hlBar, s.hbBar);
    bc.set(s.bcBar);
    tacho.set(dyn.speedKmh);
    const kvY = k.y + k.h - 10 - (Math.min(20, s.catenaryV / 1000) / 20) * (k.h - 20);
    kvNeedle.setAttribute('y1', String(kvY));
    kvNeedle.setAttribute('y2', String(kvY));
    handle.setAttribute('y', String(mid - 9 - s.tractionSetpoint * (L.h / 2 - 12)));
  };
}
