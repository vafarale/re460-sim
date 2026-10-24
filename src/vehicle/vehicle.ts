import type { SimModule } from '../core/simulation';
import { assumption } from '../core/assumptions';
import { PARAMS } from './parameters';

/**
 * Fahrzeuglogik der Re 460 für den ersten Prototyp.
 *
 * Bedienhandlungen laufen über Methoden, die ein CommandResult liefern. Eine
 * abgewiesene Handlung ändert nichts am Zustand und erzeugt eine Meldung.
 * Bezeichnungen der Bedienelemente nach Refit sind noch nicht belegt (A-UI-01).
 */

assumption({
  id: 'A-UI-01',
  statement: 'Bezeichnung und Auswahl der Bedienelemente (Batterie, Führerstand, Hilfskompressor, Stromabnehmer, Hauptschalter, Fahrtrichtung, Fahr-/Bremsschalter, Führerbremsventil) sind funktional, nicht nach dem Pult nach Refit.',
  rationale: 'Pultlayout nach Refit ist öffentlich nicht dokumentiert; Auswertung von Fotos und Videos steht aus.',
});
assumption({
  id: 'A-PNEU-05',
  statement: 'Führerbremsventil mit den Stellungen Füllen, Fahrt, Abschluss, Bremsen, Schnellbremsung.',
  rationale: 'Klassische Stellungen eines Führerbremsventils; Bauart auf der Re 460 nach Refit nicht belegt.',
});

export type Direction = 'neutral' | 'vorwaerts' | 'rueckwaerts';
export type PantographState = 'unten' | 'hebt' | 'oben' | 'senkt';
export type BrakeValvePosition = 'fuellen' | 'fahrt' | 'abschluss' | 'bremsen' | 'schnellbremsung';

export interface CommandResult {
  ok: boolean;
  reason?: string;
}

export interface Message {
  time: number;
  level: 'info' | 'warnung' | 'abgewiesen';
  text: string;
}

export interface VehicleState {
  batteryOn: boolean;
  cabActive: boolean;
  auxCompressorRunning: boolean;
  pantograph: PantographState;
  mainSwitchClosed: boolean;
  direction: Direction;
  /** Sollwert Fahr-/Bremsschalter, -1 (volle E-Bremse) bis +1 (volle Zugkraft). */
  tractionSetpoint: number;
  brakeValve: BrakeValvePosition;
  /** Drücke in bar. */
  hbBar: number;
  hlBar: number;
  bcBar: number;
  pantoAirBar: number;
  /** Fahrleitungsspannung am Stromabnehmer in V (0 wenn unten). */
  catenaryV: number;
  /** Tatsächliche Zugkraft (positiv) oder E-Bremskraft (negativ) in N. */
  tractionForceN: number;
}

/** Was die Fahrzeuglogik von aussen braucht. */
export interface VehicleEnvironment {
  /** Spannung in der Fahrleitung über der Lok, in V. */
  lineVoltageV(): number;
  /** Aktuelle Geschwindigkeit in m/s. */
  speedMs(): number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export class Re460Vehicle implements SimModule {
  readonly id = 're460';
  readonly messages: Message[] = [];
  private time = 0;
  private pantoProgress = 0; // 0 = unten, 1 = oben
  private compressorOn = false;
  private lastBlockReason: string | null = null;

  readonly state: VehicleState = {
    batteryOn: false,
    cabActive: false,
    auxCompressorRunning: false,
    pantograph: 'unten',
    mainSwitchClosed: false,
    direction: 'neutral',
    tractionSetpoint: 0,
    brakeValve: 'abschluss',
    hbBar: 0,
    hlBar: 0,
    bcBar: PARAMS.bc.maxBar,
    pantoAirBar: 0,
    catenaryV: 0,
    tractionForceN: 0,
  };

  constructor(private readonly env: VehicleEnvironment) {}

  // ---- Bedienhandlungen ----

  setBattery(on: boolean): CommandResult {
    if (!on && this.state.mainSwitchClosed) return this.reject('Batterie aus nur bei ausgeschaltetem Hauptschalter');
    this.state.batteryOn = on;
    if (!on) {
      this.state.cabActive = false;
      this.state.auxCompressorRunning = false;
    }
    return this.accept(on ? 'Batterie eingeschaltet' : 'Batterie ausgeschaltet');
  }

  setCabActive(on: boolean): CommandResult {
    if (on && !this.state.batteryOn) return this.reject('Führerstand aktivieren: Batterie ist aus');
    if (!on && this.state.mainSwitchClosed) return this.reject('Führerstand deaktivieren nur bei ausgeschaltetem Hauptschalter');
    this.state.cabActive = on;
    if (!on) {
      this.state.direction = 'neutral';
      this.state.tractionSetpoint = 0;
    }
    return this.accept(on ? 'Führerstand aktiviert' : 'Führerstand deaktiviert');
  }

  startAuxCompressor(): CommandResult {
    if (!this.state.batteryOn) return this.reject('Hilfskompressor: Batterie ist aus');
    if (this.state.pantoAirBar >= PARAMS.pantoAir.maxBar) return this.reject('Hilfskompressor: Luftvorrat bereits voll');
    this.state.auxCompressorRunning = true;
    return this.accept('Hilfskompressor läuft');
  }

  raisePantograph(): CommandResult {
    if (!this.state.cabActive) return this.reject('Stromabnehmer: Führerstand nicht aktiviert');
    if (this.state.pantograph === 'oben' || this.state.pantograph === 'hebt') return this.reject('Stromabnehmer ist bereits oben');
    if (this.state.pantoAirBar < PARAMS.pantoAir.raiseMinBar) return this.reject('Stromabnehmer: zu wenig Luftdruck, Hilfskompressor einschalten');
    this.state.pantograph = 'hebt';
    return this.accept('Stromabnehmer hebt');
  }

  lowerPantograph(): CommandResult {
    if (!this.state.cabActive) return this.reject('Stromabnehmer: Führerstand nicht aktiviert');
    if (this.state.pantograph === 'unten' || this.state.pantograph === 'senkt') return this.reject('Stromabnehmer ist bereits unten');
    this.state.pantograph = 'senkt';
    if (this.state.mainSwitchClosed) this.openMainSwitch('Hauptschalter aus: Stromabnehmer senkt');
    return this.accept('Stromabnehmer senkt');
  }

  closeMainSwitch(): CommandResult {
    if (!this.state.cabActive) return this.reject('Hauptschalter: Führerstand nicht aktiviert');
    if (this.state.mainSwitchClosed) return this.reject('Hauptschalter ist bereits ein');
    if (this.state.pantograph !== 'oben') return this.reject('Hauptschalter: Stromabnehmer nicht oben');
    if (this.state.catenaryV <= 0) return this.reject('Hauptschalter: keine Fahrleitungsspannung');
    if (this.state.tractionSetpoint !== 0) return this.reject('Hauptschalter: Fahr-/Bremsschalter nicht auf 0');
    this.state.mainSwitchClosed = true;
    return this.accept('Hauptschalter eingeschaltet');
  }

  openMainSwitchCommand(): CommandResult {
    if (!this.state.mainSwitchClosed) return this.reject('Hauptschalter ist bereits aus');
    this.openMainSwitch('Hauptschalter ausgeschaltet');
    return { ok: true };
  }

  setDirection(direction: Direction): CommandResult {
    if (!this.state.cabActive) return this.reject('Fahrtrichtung: Führerstand nicht aktiviert');
    if (direction === this.state.direction) return { ok: true };
    if (this.env.speedMs() * 3.6 > PARAMS.directionChangeMaxKmh) return this.reject('Fahrtrichtung nur im Stillstand wechseln');
    if (this.state.tractionSetpoint !== 0) return this.reject('Fahrtrichtung: Fahr-/Bremsschalter nicht auf 0');
    this.state.direction = direction;
    return this.accept(`Fahrtrichtung ${direction}`);
  }

  setTractionSetpoint(value: number): CommandResult {
    if (!this.state.cabActive) return this.reject('Fahr-/Bremsschalter: Führerstand nicht aktiviert');
    this.state.tractionSetpoint = clamp(value, -1, 1);
    return { ok: true };
  }

  setBrakeValve(position: BrakeValvePosition): CommandResult {
    if (!this.state.cabActive && position !== 'schnellbremsung') return this.reject('Führerbremsventil: Führerstand nicht aktiviert');
    if (position === 'schnellbremsung' && this.state.brakeValve !== 'schnellbremsung') this.warn('Schnellbremsung');
    this.state.brakeValve = position;
    return { ok: true };
  }

  /** Grund, warum Zugkraft gerade gesperrt ist, oder null wenn freigegeben. */
  tractionBlockReason(): string | null {
    const s = this.state;
    if (!s.cabActive) return 'Führerstand nicht aktiviert';
    if (!s.mainSwitchClosed) return 'Hauptschalter aus';
    if (s.direction === 'neutral') return 'keine Fahrtrichtung gewählt';
    if (s.hlBar < PARAMS.traction.minHlBar) {
      return `Bremse nicht gelöst: HL ${s.hlBar.toFixed(1)} bar, nötig ${PARAMS.traction.minHlBar} bar`;
    }
    return null;
  }

  // ---- Takt ----

  step(dt: number, time: number): void {
    this.time = time;
    const s = this.state;
    const p = PARAMS;

    // Hilfskompressor (batteriegespeist) füllt den Luftvorrat für Stromabnehmer und Hauptschalter.
    if (s.auxCompressorRunning) {
      if (!s.batteryOn) s.auxCompressorRunning = false;
      s.pantoAirBar = Math.min(p.pantoAir.maxBar, s.pantoAirBar + p.pantoAir.fillRateBarPerS * dt);
      if (s.pantoAirBar >= p.pantoAir.maxBar) {
        s.auxCompressorRunning = false;
        this.info('Hilfskompressor aus: Luftvorrat voll');
      }
    }

    // Hauptkompressor mit Druckschalter, nur bei eingeschaltetem Hauptschalter.
    if (s.mainSwitchClosed) {
      if (s.hbBar <= p.hb.minBar) this.compressorOn = true;
      if (s.hbBar >= p.hb.maxBar) this.compressorOn = false;
    } else {
      this.compressorOn = false;
    }
    if (this.compressorOn) s.hbBar = Math.min(p.hb.maxBar, s.hbBar + p.hb.fillRateBarPerS * dt);
    // Hauptluftbehälter speist den Stromabnehmer-Luftvorrat.
    if (s.hbBar > s.pantoAirBar) s.pantoAirBar = Math.min(p.pantoAir.maxBar, s.hbBar);

    this.stepPantograph(dt);
    s.catenaryV = s.pantograph === 'oben' ? this.env.lineVoltageV() : 0;
    if (s.mainSwitchClosed && s.catenaryV <= 0) this.openMainSwitch('Hauptschalter aus: Fahrleitungsspannung fehlt');

    this.stepBrakePipe(dt);
    this.stepTraction(dt);
  }

  private stepPantograph(dt: number): void {
    const s = this.state;
    if (s.pantograph === 'hebt') {
      if (s.pantoAirBar < PARAMS.pantoAir.raiseMinBar) {
        s.pantograph = 'senkt';
        this.warn('Stromabnehmer senkt: Luftdruck zu tief');
      } else {
        this.pantoProgress = Math.min(1, this.pantoProgress + dt / PARAMS.pantograph.raiseS);
        if (this.pantoProgress >= 1) {
          s.pantograph = 'oben';
          this.info('Stromabnehmer oben');
        }
      }
    } else if (s.pantograph === 'oben' && s.pantoAirBar < PARAMS.pantoAir.raiseMinBar) {
      s.pantograph = 'senkt';
      if (s.mainSwitchClosed) this.openMainSwitch('Hauptschalter aus: Stromabnehmer senkt');
      this.warn('Stromabnehmer senkt: Luftdruck zu tief');
    }
    if (s.pantograph === 'senkt') {
      this.pantoProgress = Math.max(0, this.pantoProgress - dt / PARAMS.pantograph.lowerS);
      if (this.pantoProgress <= 0) {
        s.pantograph = 'unten';
        this.info('Stromabnehmer unten');
      }
    }
  }

  private stepBrakePipe(dt: number): void {
    const s = this.state;
    const hl = PARAMS.hl;
    let target: number;
    let rate: number = hl.rateBarPerS;
    switch (s.brakeValve) {
      case 'fuellen':
      case 'fahrt':
        target = Math.min(hl.normalBar, s.hbBar);
        break;
      case 'abschluss':
        target = s.hlBar;
        break;
      case 'bremsen':
        target = hl.fullServiceBar;
        break;
      case 'schnellbremsung':
        target = 0;
        rate = hl.emergencyRateBarPerS;
        break;
    }
    // HL kann nur bis zum HB-Druck gefüllt werden.
    if (target > s.hlBar) target = Math.min(target, s.hbBar);
    if (s.brakeValve === 'fuellen') rate *= 2;
    const delta = clamp(target - s.hlBar, -rate * dt, rate * dt);
    s.hlBar = Math.max(0, s.hlBar + delta);
    if (delta > 0) s.hbBar = Math.max(0, s.hbBar - delta * 0.2);

    const drop = hl.normalBar - s.hlBar;
    s.bcBar = clamp((drop / (hl.normalBar - hl.fullServiceBar)) * PARAMS.bc.maxBar, 0, PARAMS.bc.maxBar);
  }

  private stepTraction(dt: number): void {
    const s = this.state;
    const t = PARAMS.traction;
    const v = Math.max(this.env.speedMs(), 0.1);
    let target = 0;
    const blockReason = this.tractionBlockReason();
    const tractionReleased = blockReason === null;
    // Einmal melden, wenn Zugkraft verlangt, aber gesperrt ist (Text ohne Zahlen, damit nicht jeder Takt meldet).
    const reasonKey = s.tractionSetpoint > 0 && blockReason ? blockReason.split(':')[0]! : null;
    if (reasonKey !== this.lastBlockReason) {
      if (reasonKey) this.warn(`Zugkraft gesperrt: ${blockReason}`);
      this.lastBlockReason = reasonKey;
    }
    if (s.tractionSetpoint > 0 && tractionReleased) {
      target = Math.min(s.tractionSetpoint * t.maxForceN, t.maxPowerW / v);
    } else if (s.tractionSetpoint < 0 && s.mainSwitchClosed && s.cabActive && this.env.speedMs() > 0.5) {
      target = -Math.min(-s.tractionSetpoint * t.maxEBrakeForceN, t.maxPowerW / v);
    }
    // Fehlt die Freigabe, wird die Zugkraft sofort weggenommen (A-EL-03), nicht über die Rampe.
    if (!tractionReleased && s.tractionForceN > 0) s.tractionForceN = 0;
    // tractionForceN ist auf die Fahrtrichtung bezogen (positiv = antreibend).
    const step = t.rampNPerS * dt;
    s.tractionForceN += clamp(target - s.tractionForceN, -step, step);
    if (target === 0 && Math.abs(s.tractionForceN) < step) s.tractionForceN = 0;
  }

  // ---- Hilfsfunktionen ----

  private openMainSwitch(text: string): void {
    this.state.mainSwitchClosed = false;
    this.state.tractionForceN = 0;
    this.info(text);
  }

  private accept(text: string): CommandResult {
    this.info(text);
    return { ok: true };
  }

  private reject(reason: string): CommandResult {
    this.push('abgewiesen', reason);
    return { ok: false, reason };
  }

  private info(text: string): void {
    this.push('info', text);
  }

  private warn(text: string): void {
    this.push('warnung', text);
  }

  private push(level: Message['level'], text: string): void {
    this.messages.push({ time: this.time, level, text });
    if (this.messages.length > 200) this.messages.shift();
  }
}
