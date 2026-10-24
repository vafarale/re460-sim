import { assumption } from '../core/assumptions';
import type { TrackAtPosition } from '../physics/dynamics';

assumption({
  id: 'A-TRACK-01',
  statement: 'Die Prototyp-Teststrecke ist frei erfunden: eben bis km 2, dann 10 ‰ Steigung, durchgehend 15 kV 16,7 Hz.',
  rationale: 'Nur zum Testen der Fahrzeuglogik; echte Strecke folgt in Phase 4.',
});

export class TestTrack implements TrackAtPosition {
  lineVoltageV = 15_000;

  gradientPermille(positionM: number): number {
    return positionM < 2000 ? 0 : 10;
  }
}
