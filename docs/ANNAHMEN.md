# Annahmen

Hier steht jede Fahrzeugfunktion und jeder Parameter, der nicht durch eine Quelle belegt ist.
Die massgebliche Liste sind die `assumption()`-Aufrufe im Code; die Oberfläche zeigt sie vollständig an.

| ID | Bereich | Datei |
| --- | --- | --- |
| A-UI-01 | Auswahl und Bezeichnung der Bedienelemente (nicht nach Pult nach Refit) | `src/vehicle/vehicle.ts` |
| A-PNEU-01 … 05 | Drücke, Raten und Stellungen der Druckluftanlage | `src/vehicle/parameters.ts`, `src/vehicle/vehicle.ts` |
| A-EL-01 … 04 | Stromabnehmer-Zeiten, Verriegelungen Hauptschalter, Zugkraft, Fahrtrichtung | `src/vehicle/parameters.ts` |
| A-TRAK-01 … 03 | Anfahrzugkraft, E-Bremskraft, Rampen | `src/vehicle/parameters.ts` |
| A-PHYS-01 … 03 | Laufwiderstand, pneumatische Bremswirkung, Massepunktmodell | `src/physics/dynamics.ts` |
| A-TRACK-01 | Erfundene Teststrecke | `src/track/testTrack.ts` |
