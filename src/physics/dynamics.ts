import type { SimModule } from '../core/simulation';
import { assumption } from '../core/assumptions';
import { RE460 } from '../vehicle/re460';
import type { Re460Vehicle } from '../vehicle/vehicle';
import { PARAMS } from '../vehicle/parameters';

assumption({
  id: 'A-PHYS-01',
  statement: 'Laufwiderstand des ganzen Zuges: w = 2,5 + (v / 40 km/h)² N/kN, bezogen auf das Zuggewicht.',
  rationale: 'Grobe Näherung im Stil der Strahl-Formel; wird in Phase 3 durch getrennte Lok- und Wagenformeln ersetzt.',
});
assumption({
  id: 'A-PHYS-02',
  statement: 'Pneumatische Bremse erreicht bei vollem Bremszylinderdruck 0,9 m/s² Verzögerung, linear mit dem Druck.',
  rationale: 'Platzhalter; in Phase 3 aus Bremsgewicht bzw. Bremshundertsteln des Zuges berechnet.',
});
assumption({
  id: 'A-PHYS-03',
  statement: 'Zug als ein Massepunkt mit 10 % Zuschlag für rotierende Massen.',
  rationale: 'Übliche Vereinfachung; Zuglänge wird erst in Phase 3 berücksichtigt.',
});

const G = 9.81;

export interface TrainConsist {
  /** Masse der angehängten Wagen in kg. */
  trailingMassKg: number;
}

export interface TrackAtPosition {
  /** Neigung in Promille, positiv = Steigung in Fahrtrichtung vorwärts. */
  gradientPermille(positionM: number): number;
}

export class TrainDynamics implements SimModule {
  readonly id = 'dynamics';
  /** Geschwindigkeit in m/s, positiv = vorwärts. */
  velocityMs = 0;
  positionM = 0;
  accelerationMs2 = 0;
  private vehicle: Re460Vehicle | undefined;

  constructor(
    private readonly consist: TrainConsist,
    readonly track: TrackAtPosition,
  ) {}

  attach(vehicle: Re460Vehicle): void {
    this.vehicle = vehicle;
  }

  get massKg(): number {
    return RE460.massKg.value + this.consist.trailingMassKg;
  }

  get speedKmh(): number {
    return Math.abs(this.velocityMs) * 3.6;
  }

  step(dt: number): void {
    if (!this.vehicle) return;
    const s = this.vehicle.state;
    const m = this.massKg;
    const mEff = m * 1.1;
    const v = this.velocityMs;
    const dirSign = s.direction === 'rueckwaerts' ? -1 : s.direction === 'vorwaerts' ? 1 : Math.sign(v) || 1;

    // Antreibende Kräfte (vorzeichenbehaftet in Gleisrichtung).
    const traction = s.tractionForceN > 0 ? s.tractionForceN * dirSign : 0;
    const gradient = -m * G * (this.track.gradientPermille(this.positionM) / 1000);

    // Widerstehende Kräfte wirken immer gegen die Bewegung.
    const vKmh = Math.abs(v) * 3.6;
    const resistance = (m * G * (2.5 + (vKmh / 40) ** 2)) / 1000;
    const pneumatic = (s.bcBar / PARAMS.bc.maxBar) * 0.9 * m;
    const electric = s.tractionForceN < 0 ? -s.tractionForceN : 0;
    const opposing = resistance + pneumatic + electric;

    const driving = traction + gradient;
    if (Math.abs(v) < 1e-3 && Math.abs(driving) <= opposing) {
      // Haftreibung: Zug bleibt stehen.
      this.velocityMs = 0;
      this.accelerationMs2 = 0;
      return;
    }
    const moveSign = Math.abs(v) > 1e-3 ? Math.sign(v) : Math.sign(driving);
    const a = (driving - moveSign * opposing) / mEff;
    let vNext = v + a * dt;
    // Bremsen und Widerstand kehren die Bewegung nicht um.
    if (Math.sign(vNext) !== moveSign && Math.abs(driving) <= opposing) vNext = 0;
    this.accelerationMs2 = (vNext - v) / dt;
    this.positionM += ((v + vNext) / 2) * dt;
    this.velocityMs = vNext;
  }
}
