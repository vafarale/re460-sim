import './ui/style.css';
import { createParkedTrain } from './scenario';
import { mountCab } from './ui/cab';

const { sim, vehicle, dynamics } = createParkedTrain();
const render = mountCab(document.querySelector<HTMLDivElement>('#app')!, vehicle, dynamics);

let last = performance.now();
function frame(now: number): void {
  // Grosse Lücken (Tab im Hintergrund) nicht nachholen.
  sim.advance(Math.min((now - last) / 1000, 0.25));
  last = now;
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
