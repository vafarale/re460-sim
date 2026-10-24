import { describe, expect, it } from 'vitest';
import { Simulation, type SimModule } from '../src/core/simulation';
import { EventBus } from '../src/core/events';

class Counter implements SimModule {
  readonly id = 'counter';
  calls = 0;
  step(): void {
    this.calls++;
  }
}

describe('Simulation', () => {
  it('läuft mit festem Takt', () => {
    const sim = new Simulation({ tickRate: 50 });
    const counter = sim.add(new Counter());
    sim.advance(1);
    expect(counter.calls).toBe(50);
    expect(sim.time).toBeCloseTo(1, 9);
  });

  it('hebt Restzeit für den nächsten Aufruf auf', () => {
    const sim = new Simulation({ tickRate: 50 });
    expect(sim.advance(0.015)).toBe(0);
    expect(sim.advance(0.015)).toBe(1);
  });

  it('ist deterministisch', () => {
    const run = () => {
      const sim = new Simulation();
      for (const dt of [0.016, 0.033, 0.017, 0.5]) sim.advance(dt);
      return sim.tickCount;
    };
    expect(run()).toBe(run());
  });

  it('weist doppelte Modul-IDs ab', () => {
    const sim = new Simulation();
    sim.add(new Counter());
    expect(() => sim.add(new Counter())).toThrow();
  });
});

describe('EventBus', () => {
  it('stellt Ereignisse zu und lässt sich abmelden', () => {
    const bus = new EventBus<{ ping: number }>();
    const got: number[] = [];
    const off = bus.on('ping', (n) => got.push(n));
    bus.emit('ping', 1);
    off();
    bus.emit('ping', 2);
    expect(got).toEqual([1]);
  });
});
