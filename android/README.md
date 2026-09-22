# Smart Energy Tracker – Native Android Application (Java + Gradle)

This is the native Android mobile application for the **Smart Energy Conservation Tracker – Environmental** academic project (22CSE74 Project Phase-II, Department of Computer Science and Engineering).

---

## 1. Project Structure

```
android/
├── build.gradle                 # Top-level Gradle configuration
├── settings.gradle              # Module includes & repository definitions
├── gradle.properties            # JVM & AndroidX settings
├── gradle/wrapper/              # Gradle 8.4 wrapper specification
└── app/
    ├── build.gradle             # App dependencies: Retrofit, Socket.IO, MPAndroidChart
    └── src/main/
        ├── AndroidManifest.xml  # Cleartext HTTP & network permissions
        ├── res/                 # Layouts (CardViews, MaterialSwitches), Colors, Themes
        └── java/com/smartenergy/tracker/
            ├── model/           # Appliance, SensorReading, Telemetry, AlertItem
            ├── network/         # ApiClient, ApiService, SocketManager, PreferencesManager
            ├── adapter/         # ApplianceAdapter, AlertAdapter
            └── ui/              # MainActivity, DashboardFragment, AppliancesFragment, AlertsFragment
```

---

## 2. Opening in Android Studio

1. Launch **Android Studio**.
2. Click **File -> Open...** and select the directory:
   ```
   /home/dhnshydv/Smart_Energy/android
   ```
3. Let Gradle sync and download dependencies.
4. Connect your Android phone via USB (with USB Debugging enabled) or start an Android Emulator.
5. Click the green **Run (▶)** button to install and launch the app.

---

## 3. Connecting to the Laptop Simulation Server

1. Ensure the Node.js simulation server is running on the laptop:
   ```bash
   cd /home/dhnshydv/Smart_Energy
   ./start.sh
   ```
2. When the Android app opens on your phone:
   - Tap the **"IP Setup"** button in the top right corner of the toolbar.
   - Enter your laptop's Wi-Fi IP address (e.g. `192.168.1.42:5000` or `192.168.43.1:5000` if using mobile hotspot).
   - Tap **Connect**.
3. The gateway status will change to:
   ```
   ● ESP32-SIM-001 (ONLINE)
   ```
4. **Live Synchronization**:
   - The dashboard will stream real-time power (Watts), voltage, current, cost, and carbon emissions.
   - Tapping any switch in the **Devices** tab will trip the virtual relay on the laptop in $<50\text{ ms}$ over WebSockets!
