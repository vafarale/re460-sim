/** Rundinstrument als SVG. Zeiger von -135° bis +135°. */
export interface GaugeOptions {
  label: string;
  unit: string;
  min: number;
  max: number;
  majorStep: number;
  /** Zweiter Zeiger (z. B. HB neben HL). */
  secondNeedle?: boolean;
}

const NS = 'http://www.w3.org/2000/svg';

export class Gauge {
  readonly element: SVGSVGElement;
  private readonly needle: SVGLineElement;
  private readonly needle2: SVGLineElement | undefined;
  private readonly readout: SVGTextElement;

  constructor(private readonly o: GaugeOptions) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-110 -110 220 220');
    svg.classList.add('gauge');
    const face = el('circle', { r: 100, class: 'gauge-face' });
    svg.append(face);
    for (let v = o.min; v <= o.max + 1e-9; v += o.majorStep) {
      const a = this.angle(v);
      const [x1, y1] = polar(a, 82);
      const [x2, y2] = polar(a, 94);
      svg.append(el('line', { x1, y1, x2, y2, class: 'gauge-tick' }));
      const [tx, ty] = polar(a, 68);
      const t = el('text', { x: tx, y: ty + 4, class: 'gauge-num' });
      t.textContent = String(Math.round(v * 10) / 10);
      svg.append(t);
    }
    const label = el('text', { x: 0, y: 40, class: 'gauge-label' });
    label.textContent = `${o.label} [${o.unit}]`;
    svg.append(label);
    this.readout = el('text', { x: 0, y: 70, class: 'gauge-readout' }) as SVGTextElement;
    svg.append(this.readout);
    if (o.secondNeedle) {
      this.needle2 = el('line', { x1: 0, y1: 0, x2: 0, y2: -80, class: 'gauge-needle2' }) as SVGLineElement;
      svg.append(this.needle2);
    }
    this.needle = el('line', { x1: 0, y1: 0, x2: 0, y2: -85, class: 'gauge-needle' }) as SVGLineElement;
    svg.append(this.needle, el('circle', { r: 6, class: 'gauge-hub' }));
    this.element = svg;
  }

  set(value: number, second?: number): void {
    this.needle.setAttribute('transform', `rotate(${this.angle(value)})`);
    if (this.needle2 && second !== undefined) this.needle2.setAttribute('transform', `rotate(${this.angle(second)})`);
    this.readout.textContent = second !== undefined ? `${value.toFixed(1)} / ${second.toFixed(1)}` : value.toFixed(this.o.max > 50 ? 0 : 1);
  }

  private angle(v: number): number {
    const f = Math.min(1, Math.max(0, (v - this.o.min) / (this.o.max - this.o.min)));
    return -135 + 270 * f;
  }
}

function polar(deg: number, r: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [Math.sin(rad) * r, -Math.cos(rad) * r];
}

function el(name: string, attrs: Record<string, string | number>): SVGElement {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}
