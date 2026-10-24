/**
 * Simulationskern mit festem Zeitschritt.
 *
 * Die Simulation ist deterministisch: gleiche Eingaben in gleicher Reihenfolge
 * ergeben den gleichen Zustand. Sie kennt weder Browser noch DOM, damit jeder
 * Betriebsablauf ohne Oberfläche getestet werden kann.
 */

/** Ein Teilsystem, das pro Takt fortgeschrieben wird (Fahrzeuglogik, Physik, Zugsicherung, ...). */
export interface SimModule {
  readonly id: string;
  /** Schreibt den Zustand um `dt` Sekunden fort. */
  step(dt: number, time: number): void;
}

export interface SimulationOptions {
  /** Taktfrequenz in Hz. */
  tickRate?: number;
}

export class Simulation {
  readonly dt: number;
  private readonly modules: SimModule[] = [];
  private accumulator = 0;
  private ticks = 0;

  constructor(options: SimulationOptions = {}) {
    const tickRate = options.tickRate ?? 50;
    if (!(tickRate > 0)) throw new Error(`Ungültige Taktfrequenz: ${tickRate}`);
    this.dt = 1 / tickRate;
  }

  /** Simulationszeit in Sekunden seit Start. */
  get time(): number {
    return this.ticks * this.dt;
  }

  get tickCount(): number {
    return this.ticks;
  }

  /** Registriert ein Modul. Module werden in Registrierungsreihenfolge fortgeschrieben. */
  add<M extends SimModule>(module: M): M {
    if (this.modules.some((m) => m.id === module.id)) {
      throw new Error(`Modul bereits registriert: ${module.id}`);
    }
    this.modules.push(module);
    return module;
  }

  /** Führt genau einen Takt aus. */
  tick(): void {
    const time = this.time;
    for (const module of this.modules) module.step(this.dt, time);
    this.ticks++;
  }

  /** Führt so viele ganze Takte aus, wie in `seconds` passen; der Rest wird für den nächsten Aufruf aufgehoben. */
  advance(seconds: number): number {
    this.accumulator += seconds;
    let n = 0;
    while (this.accumulator >= this.dt - 1e-12) {
      this.tick();
      this.accumulator -= this.dt;
      n++;
    }
    return n;
  }
}
