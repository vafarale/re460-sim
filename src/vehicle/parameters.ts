import { assumption } from '../core/assumptions';
import { RE460 } from './re460';

/**
 * Parameter der Fahrzeuglogik und Pneumatik für den Prototyp.
 * Alles hier ist entweder aus re460.ts belegt oder als Annahme registriert.
 */

assumption({
  id: 'A-PNEU-01',
  statement: 'Hauptleitung (HL) Regeldruck 5,0 bar, volle Betriebsbremsung bei 3,5 bar, Schnellbremsung entleert auf 0 bar.',
  rationale: 'Übliche UIC-Werte für die automatische Druckluftbremse; fahrzeugspezifisch noch nicht belegt.',
});
assumption({
  id: 'A-PNEU-02',
  statement: 'Hauptluftbehälter (HB) wird vom Hauptkompressor zwischen 8,5 und 10 bar gehalten; Füllrate 0,08 bar/s.',
  rationale: 'Typischer Bereich für Elektrolokomotiven; Re-460-Werte und Kompressorleistung nach Refit unbekannt.',
});
assumption({
  id: 'A-PNEU-03',
  statement: 'Hilfskompressor füllt den Stromabnehmer-/Hauptschalter-Luftvorrat mit 0,25 bar/s bis 6 bar; Stromabnehmer hebt ab 4,5 bar.',
  rationale: 'Dass der Hilfskompressor Hauptschalter und Stromabnehmer versorgt, ist belegt (Lernkarten); Drücke und Raten sind geschätzt.',
});
assumption({
  id: 'A-PNEU-04',
  statement: 'Bremszylinderdruck folgt linear der HL-Absenkung: 0 bar bei 5,0 bar HL, 3,8 bar bei 3,5 bar HL und darunter.',
  rationale: 'Vereinfachtes Verhalten eines UIC-Steuerventils; keine Füll- und Lösezeiten modelliert.',
});
assumption({
  id: 'A-EL-01',
  statement: 'Stromabnehmer braucht 6 s zum Heben und 3 s zum Senken.',
  rationale: 'Geschätzt; reale Zeiten unbekannt.',
});
assumption({
  id: 'A-EL-02',
  statement: 'Hauptschalter lässt sich nur einschalten, wenn Stromabnehmer oben, Fahrleitungsspannung vorhanden und Fahr-/Bremsschalter auf 0.',
  rationale: 'Übliche Verriegelung bei Elektrolokomotiven; Re-460-spezifische Bedingungen noch nicht belegt.',
});
assumption({
  id: 'A-EL-03',
  statement: 'Zugkraft wird nur freigegeben, wenn Hauptschalter ein, Fahrtrichtung gewählt und HL mindestens 4,7 bar; sonst wird sie sofort weggenommen.',
  rationale: 'Sinnvolle Traktionssperre bei angezogener Bremse; genaue Bedingungen der Re 460 unbekannt.',
});
assumption({
  id: 'A-EL-04',
  statement: 'Fahrtrichtung lässt sich nur im Stillstand (unter 0,5 km/h) wechseln.',
  rationale: 'Übliche Verriegelung; nicht für die Re 460 belegt.',
});
assumption({
  id: 'A-TRAK-01',
  statement: 'Maximale Anfahrzugkraft 275 kN, darüber begrenzt durch 6100 kW Leistung am Rad.',
  rationale: '6100 kW ist belegt (Wikipedia); 275 kN ist ein oft genannter, aber hier nicht belegter Wert.',
});
assumption({
  id: 'A-TRAK-02',
  statement: 'Maximale elektrische Bremskraft 150 kN, begrenzt durch 6100 kW; nur mit eingeschaltetem Hauptschalter.',
  rationale: 'Geschätzt; Rückspeisung über die Fahrleitung ist belegt (Lernkarten), Kennlinie nicht.',
});
assumption({
  id: 'A-TRAK-03',
  statement: 'Zug- und Bremskraft folgen dem Sollwert mit 40 kN/s.',
  rationale: 'Geschätzter Ruckbegrenzer; reale Rampen unbekannt.',
});

export const PARAMS = {
  hl: { normalBar: 5.0, fullServiceBar: 3.5, rateBarPerS: 0.6, emergencyRateBarPerS: 3.0 },
  hb: { minBar: 8.5, maxBar: 10.0, fillRateBarPerS: 0.08 },
  pantoAir: { maxBar: 6.0, raiseMinBar: 4.5, fillRateBarPerS: 0.25 },
  bc: { maxBar: 3.8 },
  pantograph: { raiseS: 6, lowerS: 3 },
  traction: {
    maxForceN: 275_000,
    maxPowerW: RE460.maxPowerW.value,
    maxEBrakeForceN: 150_000,
    rampNPerS: 40_000,
    minHlBar: 4.7,
  },
  directionChangeMaxKmh: 0.5,
} as const;
