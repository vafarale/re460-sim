import { listAssumptions } from '../core/assumptions';
import type { TrainDynamics } from '../physics/dynamics';
import type { BrakeValvePosition, CommandResult, Direction, Re460Vehicle } from '../vehicle/vehicle';
import { mountDesk } from './desk';

/**
 * Vereinfachter Führerstand für den Prototyp. Anordnung und Beschriftung sind
 * funktional (A-UI-01), nicht nach dem Pult der Re 460 nach Refit.
 */
export function mountCab(root: HTMLElement, lok: Re460Vehicle, dyn: TrainDynamics): () => void {
  root.innerHTML = `
    <header>
      <h1>Re 460 – Führerstand</h1>
      <span class="hint">Anordnung nach Referenzbildern; Beschriftungen noch nicht belegt</span>
    </header>
    <section class="cab-desk" id="cab-desk"></section>
    <h2 class="aux-title">Hilfspult: Funktionen, deren Bedienelement auf den Bildern noch nicht identifiziert ist (Annahme A-UI-01)</h2>
    <section class="desk">
      <div class="panel">
        <h2>Versorgung</h2>
        <button data-cmd="battery" class="toggle">Batterie</button>
        <button data-cmd="cab" class="toggle">Führerstand aktiv</button>
        <button data-cmd="aux">Hilfskompressor</button>
        <div class="lamps">
          <span class="lamp" data-lamp="battery">Batterie</span>
          <span class="lamp" data-lamp="aux">Hilfskompr.</span>
        </div>
      </div>
      <div class="panel">
        <h2>Hochspannung</h2>
        <div class="row"><button data-cmd="panto-up">Stromabnehmer heben</button><button data-cmd="panto-down">senken</button></div>
        <div class="row"><button data-cmd="hs-on">Hauptschalter ein</button><button data-cmd="hs-off">aus</button></div>
        <div class="lamps">
          <span class="lamp" data-lamp="panto">Stromabnehmer</span>
          <span class="lamp red" data-lamp="hs-off">HS aus</span>
        </div>
      </div>
      <div class="panel">
        <h2>Fahrtrichtung</h2>
        <div class="row" data-group="direction">
          <button data-dir="rueckwaerts">R</button><button data-dir="neutral">0</button><button data-dir="vorwaerts">V</button>
        </div>
        <h2>Fahr-/Bremsschalter</h2>
        <input type="range" id="setpoint" min="-100" max="100" step="5" value="0" />
        <div class="scale"><span>E-Bremse</span><span id="setpoint-val">0</span><span>Zugkraft</span></div>
        <div class="lamps"><span class="lamp" data-lamp="traction">Zugkraft</span><span class="lamp" data-lamp="ebrake">E-Bremse</span></div>
        <div class="block-reason" id="block-reason"></div>
      </div>
      <div class="panel">
        <h2>Führerbremsventil</h2>
        <div class="col" data-group="fbv">
          <button data-fbv="fuellen">Füllen</button>
          <button data-fbv="fahrt">Fahrt</button>
          <button data-fbv="abschluss">Abschluss</button>
          <button data-fbv="bremsen">Bremsen</button>
          <button data-fbv="schnellbremsung" class="danger">Schnellbremsung</button>
        </div>
      </div>
    </section>
    <section class="bottom">
      <div class="panel grow">
        <h2>Meldungen</h2>
        <ol id="messages"></ol>
      </div>
      <div class="panel grow">
        <h2>Annahmen (nicht belegt)</h2>
        <ul id="assumptions"></ul>
      </div>
    </section>
    <footer id="status"></footer>
  `;

  const renderDesk = mountDesk(root.querySelector<HTMLElement>('#cab-desk')!, lok, dyn);

  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const report = (r: CommandResult) => r;

  root.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest('button');
    if (!b) return;
    const s = lok.state;
    switch (b.dataset.cmd) {
      case 'battery': report(lok.setBattery(!s.batteryOn)); break;
      case 'cab': report(lok.setCabActive(!s.cabActive)); break;
      case 'aux': report(lok.startAuxCompressor()); break;
      case 'panto-up': report(lok.raisePantograph()); break;
      case 'panto-down': report(lok.lowerPantograph()); break;
      case 'hs-on': report(lok.closeMainSwitch()); break;
      case 'hs-off': report(lok.openMainSwitchCommand()); break;
    }
    if (b.dataset.dir) report(lok.setDirection(b.dataset.dir as Direction));
    if (b.dataset.fbv) report(lok.setBrakeValve(b.dataset.fbv as BrakeValvePosition));
  });

  const setpoint = q<HTMLInputElement>('#setpoint');
  setpoint.addEventListener('input', () => {
    const r = lok.setTractionSetpoint(Number(setpoint.value) / 100);
    if (!r.ok) setpoint.value = '0';
  });

  // Tastatur: W/S Fahr-/Bremsschalter, X auf 0, Leertaste Schnellbremsung.
  const onKey = (ev: KeyboardEvent) => {
    const cur = lok.state.tractionSetpoint;
    if (ev.key === 'w') lok.setTractionSetpoint(Math.round((cur + 0.1) * 10) / 10);
    else if (ev.key === 's') lok.setTractionSetpoint(Math.round((cur - 0.1) * 10) / 10);
    else if (ev.key === 'x') lok.setTractionSetpoint(0);
    else if (ev.key === ' ') { ev.preventDefault(); lok.setBrakeValve('schnellbremsung'); }
    else return;
    setpoint.value = String(Math.round(lok.state.tractionSetpoint * 100));
  };
  window.addEventListener('keydown', onKey);

  const assumptionsEl = q<HTMLUListElement>('#assumptions');
  const renderAssumptions = () => {
    assumptionsEl.innerHTML = listAssumptions()
      .map((a) => `<li><b>${a.id}</b> ${a.statement}<br><small>${a.rationale}</small></li>`)
      .join('');
  };
  renderAssumptions();

  const lamp = (name: string, on: boolean) => q(`[data-lamp="${name}"]`).classList.toggle('on', on);
  const messagesEl = q<HTMLOListElement>('#messages');
  let shownMessages = -1;

  return function render(): void {
    const s = lok.state;
    renderDesk();

    lamp('battery', s.batteryOn);
    lamp('aux', s.auxCompressorRunning);
    lamp('panto', s.pantograph === 'oben');
    q('[data-lamp="panto"]').classList.toggle('blink', s.pantograph === 'hebt' || s.pantograph === 'senkt');
    lamp('hs-off', s.batteryOn && !s.mainSwitchClosed);
    lamp('traction', s.tractionForceN > 0);
    lamp('ebrake', s.tractionForceN < 0);
    q('[data-cmd="battery"]').classList.toggle('active', s.batteryOn);
    q('[data-cmd="cab"]').classList.toggle('active', s.cabActive);
    root.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach((b) => b.classList.toggle('active', b.dataset.dir === s.direction));
    root.querySelectorAll<HTMLButtonElement>('[data-fbv]').forEach((b) => b.classList.toggle('active', b.dataset.fbv === s.brakeValve));
    const reason = lok.tractionBlockReason();
    q('#block-reason').textContent = reason ? `Zugkraft gesperrt: ${reason}` : 'Zugkraft freigegeben';
    q('#block-reason').classList.toggle('ok', reason === null);
    q('#setpoint-val').textContent = `${Math.round(s.tractionSetpoint * 100)} % · ${(s.tractionForceN / 1000).toFixed(0)} kN`;
    if (document.activeElement !== setpoint) setpoint.value = String(Math.round(s.tractionSetpoint * 100));

    if (lok.messages.length !== shownMessages) {
      shownMessages = lok.messages.length;
      messagesEl.innerHTML = lok.messages
        .slice(-12)
        .reverse()
        .map((m) => `<li class="${m.level}"><time>${m.time.toFixed(1)} s</time> ${m.text}</li>`)
        .join('');
    }
    q('#status').textContent =
      `Position ${(dyn.positionM / 1000).toFixed(3)} km · Neigung ${dyn.track.gradientPermille(dyn.positionM)} ‰ · ` +
      `Zugmasse ${(dyn.massKg / 1000).toFixed(0)} t · Tasten: W/S Fahr-/Bremsschalter, X auf 0, Leertaste Schnellbremsung`;
  };
}
