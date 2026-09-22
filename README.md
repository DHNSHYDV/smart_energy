# Smart Energy Conservation Tracker – Environmental
### IoT-Driven Energy Sensing, Analytics & Conservation Simulation Platform
**Department of Computer Science and Engineering | Academic Year 2026-27**  
**Course Code:** 22CSE74 – Project Phase-II  

---

## 1. Project Overview & Academic Concept

This project is a complete, production-grade **software simulation of an IoT-driven Smart Energy Conservation Tracker**.

In physical deployments, measuring high-voltage 230V residential circuits requires current transformer (CT) clamps, smart plugs, relay modules, and microcontrollers. In this software simulation, **all physical sensors, smart plugs, relays, and the ESP32 edge gateway are modeled mathematically and executed asynchronously in software**.

The cloud backend, MQTT topics, time-series database, and responsive mobile/web dashboard behave **identically to a real physical IoT deployment**. Physical hardware can directly replace the simulation modules without altering the application layer.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              VIRTUAL PHYSICAL LAYER                             │
│  [Virtual Appliances (8)] ──> [Virtual CT / Voltage Sensors] ──> [Virtual Relays]│
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ 1-second sampling (configurable 1x-50x)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          EDGE CONTROLLER LAYER (ESP32)                          │
│                   Virtual IoT Controller (ESP32-SIM-001)                        │
│   - ADC emulation, root-mean-square calculation, instantaneous power math       │
│   - Active/Reactive power calculation, energy accumulator (kWh)                 │
│   - Local relay control & schedule execution cache                              │
│   - Embedded MQTT Publisher & HTTP Client                                       │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ MQTT / HTTP Telemetry
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND SERVICE LAYER                               │
│  Node.js + Express Server (Port 5000, 0.0.0.0)                                  │
│   ├── Embedded MQTT Broker (Aedes) on port 1883                                 │
│   ├── Socket.IO WebSocket Engine (Sub-second bidirectional sync)                │
│   ├── REST API (Appliances, Analytics, Schedules, Alerts, Config)               │
│   ├── Rule-based Anomaly Detection Engine (threshold & spike detectors)         │
│   ├── Energy-Saving Recommendation Engine (dynamic heuristics)                  │
│   ├── Tariff & Carbon Footprint Calculation Engine                              │
│   └── SQLite Embedded Database (WAL Mode for high-frequency inserts)            │
└───────────────────────┬─────────────────────────────────┬───────────────────────┘
                        │ Local Wi-Fi (192.168.1.42:5000) │
                        ▼                                 ▼
┌────────────────────────────────────────┐ ┌──────────────────────────────────────┐
│       DESKTOP DASHBOARD (LAPTOP)       │ │       MOBILE WEB APP (PHONE)         │
│  - Full analytics & peak analysis      │ │  - Mobile-first quick controls       │
│  - Multi-appliance comparison charts   │ │  - Real-time push alerts & toggles   │
│  - Simulation speed/anomaly controls   │ │  - QR code instant onboarding        │
│  - Hardware topology visualizer        │ │  - Device attribution donut charts   │
└────────────────────────────────────────┘ └──────────────────────────────────────┘
```

---

## 2. Hardware to Software Mapping (Academic Specification)

| Physical Component | Simulated Software Equivalent | Functionality & Equations |
|---|---|---|
| **CT Clamp (SCT-013) & PT** | `VirtualEnergySensor` | Computes $V_{\text{rms}}$, $I_{\text{rms}} = \frac{P}{V \cdot \text{PF}}$, $P = V \cdot I \cdot \text{PF}$, $S = V \cdot I$, $Q = \sqrt{S^2 - P^2}$ |
| **ESP32 Edge Gateway** | `VirtualESP32` (`ESP32-SIM-001`) | Emulates 240MHz dual-core ADC sampling, Wi-Fi RSSI signal sway, FreeRTOS relay actuation |
| **5V/12V Relay Module** | `VirtualRelaySubsystem` | Opens ($0\text{ W}$) and closes circuits, providing sub-50ms optimistic state sync |
| **Physical Appliances** | 8 `VirtualAppliance` Models | AC inverter ramp, fridge cooling cycles, PC burst loads, LED lighting, Geyser thermostat cutoff |
| **Cloud MQTT Broker** | Embedded Aedes MQTT Broker | Listens on port `1883`, publishes to `sensors/ESP32-SIM-001/telemetry`, accepts commands on `devices/ESP32-SIM-001/command/relay` |
| **Time-Series DB** | SQLite3 (WAL Mode) | High write throughput storing time-series sensor samples, alerts, and historical daily stats |
| **Mobile App** | Responsive Web App | PWA-ready responsive interface accessible over local Wi-Fi with QR pairing |

---

## 3. Mathematical Foundations

1. **Active Power ($P$)**:
   $$P = V_{\text{rms}} \times I_{\text{rms}} \times \cos(\phi) \quad [\text{Watts}]$$
2. **Current ($I$)**:
   $$I_{\text{rms}} = \frac{P}{V_{\text{rms}} \times \text{Power Factor}} \quad [\text{Amperes}]$$
3. **Cumulative Energy ($E$)**:
   $$\Delta E = \frac{P \times \Delta t}{3.6 \times 10^6} \quad [\text{kWh}], \quad E_{\text{today}} = \sum \Delta E$$
4. **Electricity Cost**:
   $$\text{Cost} = E_{\text{kWh}} \times \text{Tariff} \quad [₹], \quad \text{where standard tariff} = ₹8.00/\text{kWh}$$
   *(During peak hours 18:00 - 22:00, a $1.25\times$ surcharge applies).*
5. **Carbon Footprint**:
   $$\text{Emission} = E_{\text{kWh}} \times 0.82 \quad [\text{kg CO}_2]$$
   *(Indian CEA grid emission factor $\approx 0.82\text{ kg CO}_2/\text{kWh}$).*

---

## 4. Running the Platform

### Step 1: Start the Platform
Run the startup script from the root directory:
```bash
./start.sh
# OR
npm start
```

### Step 2: Access from Laptop
Open your laptop browser:
```
http://localhost:5000
```

### Step 3: Connect Mobile Phone over Local Wi-Fi
1. Ensure your laptop and phone are connected to the **SAME Wi-Fi network**.
2. Click **"Connect Mobile"** on the top header of the laptop dashboard.
3. Scan the on-screen **QR Code** using your phone camera (or open `http://<laptop-ip>:5000` directly, e.g. `http://192.168.1.42:5000`).
4. The touch-friendly mobile interface will load instantly!

---

## 5. Live Demonstration Script for Evaluators

1. **Verify Edge Gateway**: Observe the top badge showing `ESP32-SIM-001 (ONLINE)`, Wi-Fi RSSI (e.g. `-62 dBm`), and MQTT connected.
2. **Dual-Device Synchronization**:
   - Keep laptop dashboard and phone dashboard side-by-side.
   - On the phone, tap **TURN OFF** on the **Air Conditioner**.
   - Notice the AC power drops to $0\text{ W}$ immediately on **both the laptop and phone screens** in $<50\text{ ms}$.
   - Tap **TURN ON** to restore it.
3. **Simulation Acceleration**:
   - In the Simulation Control bar, click **10x** or **50x**.
   - Watch the Energy ($kWh$) and Cost ($₹$) accumulate at accelerated speed to demonstrate days of usage in seconds.
4. **Trigger Anomaly Detection**:
   - Click **"Inject AC Anomaly"** in the toolbar.
   - AC power will surge to $\sim 2450\text{ W}$ (compressor stall fault).
   - An animated **CRITICAL ALERT** banner will appear on both screens, and a warning log is recorded in the Alerts tab.
   - Click **"Clear AC Surge"** or resolve the alert.
5. **Dynamic Recommendations**:
   - Inspect the **Intelligent Conservation Recommendations** banner.
   - Notice how it calculates the exact percentage contribution of the dominant appliance and suggests rupee savings for temperature or schedule adjustments.
6. **Automation & Scheduling**:
   - Navigate to the **Schedules** tab.
   - Create an automated rule (e.g., Water Heater OFF at 07:30).
   - The virtual ESP32 checks rules continuously and triggers relay shutoffs automatically.
7. **Device Attribution & Analytics**:
   - Open the **Analytics** tab.
   - Review the Donut Chart showing each appliance's percentage share of total consumption.
   - Inspect the 24-Hour Diurnal Load Curve highlighting evening peak demand (18:00 - 22:00).
8. **Academic Hardware Mapping**:
   - Click **"Project Guide"** in the header to open the interactive Physical vs. Simulation comparison table.

---

## 6. Technology Stack

- **Backend**: Node.js v20, Express, Socket.IO v4
- **IoT Protocols**: Embedded Aedes MQTT Broker (Port 1883), WebSocket, HTTP
- **Database**: SQLite3 (`better-sqlite3`, WAL mode)
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Networking**: Local IP auto-discovery (`os.networkInterfaces()`), QR Code generation (`qrcode`)
