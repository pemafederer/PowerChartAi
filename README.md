# 🚴‍♂️ PowerChartAI

**PowerChartAI** is an intelligent cycling performance analysis app that allows athletes to upload `.tcx` ride files, extract power data, and compute estimated power output based on physical models using real-world elevation and route data via Google APIs.

Built with **Vite**, **React**, and **TypeScript**, the app aims to help cyclists evaluate their performance accurately by combining recorded power data with terrain-aware estimations — especially useful for rides without a power meter.

---

## 🔧 Core Functionality

- 🗂️ **TCX File Upload**\
  Upload training files exported from Garmin, Wahoo, or other GPS devices.

- 📈 **Interval Detection (5 min & 20 min)**\
  Automatically finds your best 5-minute and 20-minute average power segments.

- ⛰️ **Elevation Gain Calculation**\
  Uses the **Google Elevation API** or **Snap-to-Roads + Elevation** for precision, useful when GPS altitude is noisy (e.g., tunnels or gallerias).

- 🔏 **Distance Estimation**\
  Accurate segment distance via **Google Routes API** (cycling mode).

- 🧠 **Power Estimation Model**\
  Uses physics-based formulas (mass, gradient, drag, etc.) to estimate power output.

- ⚙️ **Proxy Server for Secure API Calls**\
  A lightweight Express backend to handle Google API requests securely with environment variables.

---

## 🧪 Erweiterte Features

- 🗃️ **Historie der Leistungstests (Datenbank)**\
  Speichere deine berechneten FTP-, VO₂max- und 5-Minuten-Werte nach jedem Upload in einer persönlichen Datenbank (Supabase).\
  Die App merkt sich:

  - berechnete FTP (W & W/kg)
  - geschätzte VO₂max
  - gemessene & geschätzte 5min- und 20min-Werte

- ↺ **Vergangene Tests auswählen & analysieren**\
  Über ein Dropdown-Menü kannst du ältere Tests auswählen und ihre Resultate (inkl. Zonen, Powerprofil & VO₂max) erneut ansehen und analysieren.\
  Zusätzlich gibt es eine Option, um zur aktuellen (nicht gespeicherten) Analyse zurückzukehren.

- 💡 **Tooltips für bessere UX**\
  Überall dort, wo es für den User nicht selbsterklärend ist, wurden kontextsensitive Info-Icons mit Tooltips eingefügt – z. B.:

  - Beim Dropdown-Menü zur Auswahl alter Tests
  - In der "Nachberechnete Leistung"-Sektion
  - In der Power Profil Analyse

---

## 📊 Fortschrittsanalyse

- Die Fortschritt-Komponente zeigt deine Leistungsentwicklung über die Zeit (W/kg) für FTP und 5min Power.
- Die Achsen passen sich dynamisch an deine Werte an (mit etwas Puffer oben & unten), um visuelles Clipping zu vermeiden.
- Punktuelle Darstellung + zwei Linien (FTP & 5min) für direkte Vergleichbarkeit.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://gitlab.ost.ch/pema.federer/PowerChartAI.git
cd PowerChartAI
```

### 2. Install Dependencies

```bash
npm install
```

(Bei Konflikten ggf. `--legacy-peer-deps` anhängen)

### 3. Start the Dev Server

```bash
npm run dev
```

---

Bei Fragen, Bugs oder Feature-Wünschen: gerne direkt issue im GitLab-Repo erstellen oder melden 🚀

