import { describe, expect, it } from 'vitest';
import { createParkedTrain } from '../src/scenario';

/** Lässt die Simulation `seconds` Sekunden laufen. */
function run(sim: { advance(s: number): number }, seconds: number) {
  sim.advance(seconds);
}

function aufruesten() {
  const t = createParkedTrain();
  const { sim, vehicle: lok } = t;
  expect(lok.setBattery(true).ok).toBe(true);
  expect(lok.setCabActive(true).ok).toBe(true);
  expect(lok.startAuxCompressor().ok).toBe(true);
  run(sim, 30);
  expect(lok.raisePantograph().ok).toBe(true);
  run(sim, 7);
  expect(lok.closeMainSwitch().ok).toBe(true);
  lok.setBrakeValve('fahrt');
  run(sim, 180);
  return t;
}

describe('Aufrüsten aus abgestelltem Zustand', () => {
  it('führt zur Betriebsbereitschaft', () => {
    const { vehicle: lok } = aufruesten();
    const s = lok.state;
    expect(s.pantograph).toBe('oben');
    expect(s.mainSwitchClosed).toBe(true);
    expect(s.catenaryV).toBe(15_000);
    expect(s.hbBar).toBeGreaterThan(8);
    expect(s.hlBar).toBeCloseTo(5, 1);
    expect(s.bcBar).toBeLessThan(0.1);
  });

  it('weist den Führerstand ohne Batterie ab', () => {
    const { vehicle: lok } = createParkedTrain();
    const r = lok.setCabActive(true);
    expect(r.ok).toBe(false);
    expect(lok.state.cabActive).toBe(false);
  });

  it('weist den Stromabnehmer ohne Luftdruck ab', () => {
    const { vehicle: lok } = createParkedTrain();
    lok.setBattery(true);
    lok.setCabActive(true);
    expect(lok.raisePantograph().ok).toBe(false);
    expect(lok.state.pantograph).toBe('unten');
  });

  it('weist den Hauptschalter bei gesenktem Stromabnehmer ab', () => {
    const { sim, vehicle: lok } = createParkedTrain();
    lok.setBattery(true);
    lok.setCabActive(true);
    lok.startAuxCompressor();
    run(sim, 30);
    expect(lok.closeMainSwitch().ok).toBe(false);
  });

  it('weist den Hauptschalter ab, solange der Stromabnehmer noch hebt', () => {
    const { sim, vehicle: lok } = createParkedTrain();
    lok.setBattery(true);
    lok.setCabActive(true);
    lok.startAuxCompressor();
    run(sim, 30);
    lok.raisePantograph();
    run(sim, 2);
    expect(lok.closeMainSwitch().ok).toBe(false);
  });

  it('weist den Hauptschalter ohne Fahrleitungsspannung ab', () => {
    const { sim, track, vehicle: lok } = createParkedTrain();
    track.lineVoltageV = 0;
    lok.setBattery(true);
    lok.setCabActive(true);
    lok.startAuxCompressor();
    run(sim, 30);
    lok.raisePantograph();
    run(sim, 7);
    expect(lok.closeMainSwitch().ok).toBe(false);
  });

  it('weist den Hauptschalter ab, wenn der Fahr-/Bremsschalter nicht auf 0 steht', () => {
    const { sim, vehicle: lok } = createParkedTrain();
    lok.setBattery(true);
    lok.setCabActive(true);
    lok.startAuxCompressor();
    run(sim, 30);
    lok.raisePantograph();
    run(sim, 7);
    lok.setTractionSetpoint(0.5);
    expect(lok.closeMainSwitch().ok).toBe(false);
  });

  it('schaltet den Hauptschalter bei Spannungsausfall aus', () => {
    const { sim, track, vehicle: lok } = aufruesten();
    track.lineVoltageV = 0;
    run(sim, 0.1);
    expect(lok.state.mainSwitchClosed).toBe(false);
  });
});

describe('Abrüsten', () => {
  it('Batterie aus wird bei eingeschaltetem Hauptschalter abgewiesen', () => {
    const { vehicle: lok } = aufruesten();
    expect(lok.setBattery(false).ok).toBe(false);
  });

  it('Hauptschalter aus, Stromabnehmer senken, Führerstand und Batterie aus', () => {
    const { sim, vehicle: lok } = aufruesten();
    expect(lok.openMainSwitchCommand().ok).toBe(true);
    expect(lok.lowerPantograph().ok).toBe(true);
    run(sim, 4);
    expect(lok.state.pantograph).toBe('unten');
    expect(lok.setCabActive(false).ok).toBe(true);
    expect(lok.setBattery(false).ok).toBe(true);
  });
});

describe('Fahren und Bremsen', () => {
  it('ohne Fahrtrichtung gibt es keine Zugkraft', () => {
    const { sim, vehicle: lok, dynamics } = aufruesten();
    lok.setTractionSetpoint(1);
    run(sim, 10);
    expect(lok.state.tractionForceN).toBe(0);
    expect(dynamics.velocityMs).toBe(0);
  });

  it('bei angezogener Bremse gibt es keine Zugkraft', () => {
    const { sim, vehicle: lok } = aufruesten();
    lok.setBrakeValve('bremsen');
    run(sim, 10);
    lok.setDirection('vorwaerts');
    lok.setTractionSetpoint(1);
    run(sim, 5);
    expect(lok.state.tractionForceN).toBe(0);
  });

  it('fährt an, bremst elektrisch und hält mit der Druckluftbremse an', () => {
    const { sim, vehicle: lok, dynamics } = aufruesten();
    expect(lok.setDirection('vorwaerts').ok).toBe(true);
    lok.setTractionSetpoint(1);
    run(sim, 60);
    expect(dynamics.speedKmh).toBeGreaterThan(40);
    expect(lok.setDirection('rueckwaerts').ok).toBe(false);

    lok.setTractionSetpoint(-1);
    run(sim, 20);
    expect(lok.state.tractionForceN).toBeLessThan(0);

    lok.setTractionSetpoint(0);
    lok.setBrakeValve('bremsen');
    run(sim, 120);
    expect(dynamics.velocityMs).toBe(0);
  });

  it('Schnellbremsung entleert die Hauptleitung und nimmt die Zugkraft weg', () => {
    const { sim, vehicle: lok } = aufruesten();
    lok.setDirection('vorwaerts');
    lok.setTractionSetpoint(1);
    run(sim, 20);
    lok.setBrakeValve('schnellbremsung');
    run(sim, 3);
    expect(lok.state.hlBar).toBeLessThan(0.5);
    expect(lok.state.tractionForceN).toBe(0);
  });
});

describe('Physik-Plausibilität', () => {
  it('erreicht mit 400 t Anhängelast in der Ebene nach 60 s eine plausible Geschwindigkeit', () => {
    const { sim, vehicle: lok, dynamics } = aufruesten();
    lok.setDirection('vorwaerts');
    lok.setTractionSetpoint(1);
    run(sim, 60);
    // Obergrenze aus maximaler Zugkraft ohne Widerstand: a = 275 kN / (484 t * 1.1), nach Rampe.
    const aMax = 275_000 / (484_000 * 1.1);
    expect(dynamics.velocityMs).toBeLessThan(aMax * 60);
    expect(dynamics.speedKmh).toBeGreaterThan(60);
  });
});
