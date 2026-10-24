import { Simulation } from './core/simulation';
import { TrainDynamics } from './physics/dynamics';
import { TestTrack } from './track/testTrack';
import { Re460Vehicle } from './vehicle/vehicle';

/** Abgestellte Lok mit angehängtem Zug, alles drucklos. Ausgangslage für das Aufrüsten. */
export function createParkedTrain(trailingMassKg = 400_000) {
  const sim = new Simulation({ tickRate: 50 });
  const track = new TestTrack();
  const dynamics = new TrainDynamics({ trailingMassKg }, track);
  const vehicle = new Re460Vehicle({
    lineVoltageV: () => track.lineVoltageV,
    speedMs: () => Math.abs(dynamics.velocityMs),
  });
  dynamics.attach(vehicle);
  sim.add(vehicle);
  sim.add(dynamics);
  return { sim, track, vehicle, dynamics };
}
