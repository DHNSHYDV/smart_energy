import React from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Cpu, HardDrive, Smartphone } from 'lucide-react';

export function AcademicMappingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const mapping = [
    {
      physical: 'CT Clamp Sensor (SCT-013) & Voltage Transformer',
      simulated: 'Virtual Energy Sensor Module',
      details: 'Calculates RMS Voltage (230V ± noise), RMS Current (I = P/(V*PF)), Power Factor (cos φ), Active Power (P), Apparent Power (S), Reactive Power (Q), and Cumulative Energy (kWh).'
    },
    {
      physical: 'ESP32 Microcontroller / Edge Gateway',
      simulated: 'Virtual IoT Controller (ESP32-SIM-001)',
      details: 'Emulates FreeRTOS dual-core firmware, ADC sampling at 1-sec intervals, GPIO relay actuation, Wi-Fi RSSI signal sway, and MQTT telemetry publishing.'
    },
    {
      physical: '5V/12V Relay Module / Smart Plug',
      simulated: 'Virtual Relay Actuation Subsystem',
      details: 'Software switches virtual appliance circuits between OPEN (0W) and CLOSED (active load), updating local cache and synchronizing across clients.'
    },
    {
      physical: 'Physical Home Appliances (AC, Geyser, etc.)',
      simulated: '8 Mathematical Virtual Appliance Models',
      details: 'State machines simulating inverter compressor ramps, refrigerator cooling duty cycles, dynamic PC workloads, LED drivers, and thermostat shutoffs.'
    },
    {
      physical: 'Cloud MQTT Broker (HiveMQ / AWS IoT Core)',
      simulated: 'Embedded Aedes MQTT Broker (Port 1883)',
      details: 'Standard MQTT 3.1.1 compliant message broker routing telemetry on sensors/ESP32-SIM-001/telemetry and commands on devices/ESP32-SIM-001/command/relay.'
    },
    {
      physical: 'Cloud Time-Series Database (InfluxDB / Timescale)',
      simulated: 'SQLite Embedded Time-Series Engine (WAL Mode)',
      details: 'High-speed write throughput storing instantaneous telemetry records, daily analytics, anomaly alerts, and scheduled automations.'
    },
    {
      physical: 'Android/iOS Native Mobile Application',
      simulated: 'Responsive Mobile Web Application',
      details: 'Mobile-first PWA-style web application accessible over local Wi-Fi at http://<laptop-ip>:5000 with sub-50ms WebSocket synchronization.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            Academic Project Specification (22CSE74)
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Physical IoT vs. Software Simulation Mapping
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department of Computer Science & Engineering | Major Project Phase-II
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
            <strong className="text-emerald-400">Academic Project Concept:</strong> This system is a complete, software-based simulation of an IoT-driven Smart Energy Conservation Tracker. Instead of connecting hazardous 230V physical electrical circuits, the edge controllers, current sensors, and load behaviors are simulated mathematically with strict physics fidelity. The cloud API, MQTT topics, and mobile dashboard are designed so that <em>real ESP32 hardware and CT sensors can replace the virtual components seamlessly</em> without modifying the application layer.
          </div>

          {/* Mapping Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700 text-[11px]">
                  <th className="p-3 w-1/3">Physical Component</th>
                  <th className="p-3 w-1/3">Simulated Software Equivalent</th>
                  <th className="p-3 w-1/3 hidden sm:table-cell">Implementation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {mapping.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                        <span>{row.physical}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-emerald-400">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{row.simulated}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 hidden sm:table-cell text-[11px] leading-relaxed">
                      {row.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Social Relevance & SDGs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                United Nations SDG 7: Clean Energy
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Empowers consumers with appliance-level attribution to eliminate phantom vampire loads and optimize residential energy consumption.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                United Nations SDG 13: Climate Action
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Directly tracks carbon footprint using standard grid emission factors (0.82 kg CO₂/kWh), demonstrating tangible carbon reduction via automated scheduling.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
