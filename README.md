# 🚴‍♂️ PowerChartAI

**PowerChartAI** is an intelligent cycling performance analysis app that allows athletes to upload `.tcx` ride files, extract power data, and compute estimated power output based on physical models using real-world elevation and route data via Google APIs.

Built with **Vite**, **React**, and **TypeScript**, the app aims to help cyclists evaluate their performance accurately by combining recorded power data with terrain-aware estimations — especially useful for rides without a power meter.

---

## 🔧 Core Functionality

- 🗂️ **TCX File Upload**  
  Upload training files exported from Garmin, Wahoo, or other GPS devices.

- 📈 **Interval Detection (5 min & 20 min)**  
  Automatically finds your best 5-minute and 20-minute average power segments.

- ⛰️ **Elevation Gain Calculation**  
  Uses the **Google Elevation API** or **Snap-to-Roads + Elevation** for precision, useful when GPS altitude is noisy (e.g., tunnels or gallerias).

- 📏 **Distance Estimation**  
  Accurate segment distance via **Google Routes API** (cycling mode).

- 🧠 **Power Estimation Model**  
  Uses physics-based formulas (mass, gradient, drag, etc.) to estimate power output.

- ⚙️ **Proxy Server for Secure API Calls**  
  A lightweight Express backend to handle Google API requests securely with environment variables.

---

## 🧪 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend (Proxy):** Node.js + Express
- **UI:** MUI (Material UI)
- **APIs:**
  - Google Maps Elevation API
  - Google Routes API
  - (Optional) Google Snap-to-Roads API

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://gitlab.ost.ch/pema.federer/PowerChartAI.git
cd PowerChartAI
