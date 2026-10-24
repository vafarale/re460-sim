import { Simulation } from './core/simulation';
import { listAssumptions } from './core/assumptions';

const sim = new Simulation({ tickRate: 50 });
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <h1>Re 460 Simulator</h1>
  <p>Projektgerüst. Simulationszeit: <span id="time">0.0</span> s</p>
  <p>Erfasste Annahmen: <span id="assumptions">0</span></p>
`;
const timeEl = document.querySelector<HTMLSpanElement>('#time')!;
const assumptionsEl = document.querySelector<HTMLSpanElement>('#assumptions')!;

let last = performance.now();
function frame(now: number): void {
  // Grosse Lücken (Tab im Hintergrund) nicht nachholen.
  sim.advance(Math.min((now - last) / 1000, 0.25));
  last = now;
  timeEl.textContent = sim.time.toFixed(1);
  assumptionsEl.textContent = String(listAssumptions().length);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
