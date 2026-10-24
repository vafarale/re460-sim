# Re 460 Simulator

Browserbasierter Führerstand-Simulator der SBB Re 460 (Lok 2000) im Zustand nach dem Refit, mit ETCS Level 2.
Technische und betriebliche Detailtreue haben Vorrang vor Grafik.

## Starten

```bash
npm install
npm run dev        # Entwicklungsserver
npm test           # alle Tests
npm run typecheck  # Typprüfung
```

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/core` | Simulationskern: fester Takt, Ereignisbus, Annahmen-Register |
| `src/vehicle` | Fahrzeuglogik: Bedienelemente, Teilsysteme, Bremsen, Sicherheitssteuerung |
| `src/physics` | Fahrphysik: Kräfte, Widerstände, Bewegung |
| `src/protection` | Zugsicherung: ETCS Level 2, vereinfachte Streckenzentrale |
| `src/track` | Streckendaten |
| `src/ui` | Darstellung im Browser (einziger Ordner mit DOM-Zugriff) |
| `tests` | Ablauf- und Referenztests |

Alles ausser `src/ui` und `src/main.ts` läuft ohne Browser und wird mit Vitest getestet.

## Quellen und Annahmen

- Jeder Fahrzeugwert trägt seine Quelle (siehe `src/vehicle/re460.ts`).
- Was nicht belegt ist, wird mit `assumption()` aus `src/core/assumptions.ts` registriert und in [docs/ANNAHMEN.md](docs/ANNAHMEN.md) geführt.
- Verwendete Quellen: [docs/QUELLEN.md](docs/QUELLEN.md).
