import React, { useState, useEffect } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Wifi,
  Cpu,
  Server,
  Radio,
  Terminal,
  ShieldCheck,
  Activity,
  ArrowRight,
  Database,
  Layers,
  Smartphone
} from 'lucide-react';

export function IoTNetworkView() {
  const { telemetry, backendUrl, networkInfo } = useEnergy();
  const [mqttPackets, setMqttPackets] = useState([]);

  // Generate packet logs based on live telemetry updates
  useEffect(() => {
    const packet = {
      timestamp: new Date().toISOString(),
      topic: 'smartenergy/telemetry/ESP32-SIM-001',
      qos: 0,
      payload: {
        dev: 'ESP32-SIM-001',
        v: Number(telemetry.gridVoltage.toFixed(1)),
        p: telemetry.totalActivePower,
        i: Number(telemetry.totalCurrent.toFixed(2)),
        pf: Number(telemetry.systemPowerFactor.toFixed(2)),
        kwh: Number(telemetry.totalEnergyTodayKwh.toFixed(3)),
        heap: 184320
      }
    };

    setMqttPackets(prev => [packet, ...prev.slice(0, 19)]);
  }, [telemetry]);

  return (
    <div className="space-y-6">

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-neutral-800" />
            IoT Gateway
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ESP32 Gateway: ONLINE
          </span>
        </div>
      </div>

      {/* GATEWAY HARDWARE & BROKER STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ESP32 Edge Gateway */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">ESP32 Microcontroller Node</h3>
                <span className="text-xs text-neutral-400 font-mono">ID: ESP32-SIM-001</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
              CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">SOC HARDWARE</span>
              <span className="font-bold text-neutral-800">ESP32-WROOM-32D</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">CLOCK FREQUENCY</span>
              <span className="font-bold text-neutral-800">240 MHz Dual Core</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">WI-FI RSSI</span>
              <span className="font-bold text-emerald-600">-56 dBm (5 GHz)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">FREE SRAM HEAP</span>
              <span className="font-bold text-neutral-800">184,320 Bytes</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">STATIC IP</span>
              <span className="font-bold text-neutral-800">192.168.1.145</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">ADC CONVERTER</span>
              <span className="font-bold text-neutral-800">ADS1115 (16-Bit I2C)</span>
            </div>
          </div>
        </div>

        {/* Embedded Aedes MQTT Broker */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Aedes MQTT Telemetry Broker</h3>
                <span className="text-xs text-neutral-400 font-mono">Broker: {networkInfo?.localIp || '192.168.1.42'}:1883</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
              ACTIVE :1883
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">TCP PORT</span>
              <span className="font-bold text-neutral-800">1883 (Standard MQTT)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">WEBSOCKET PORT</span>
              <span className="font-bold text-neutral-800">9001 (WSS Bridge)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">ACTIVE CLIENTS</span>
              <span className="font-bold text-neutral-800">2 Connected</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">TELEMETRY TOPIC</span>
              <span className="font-bold text-neutral-800 truncate block">smartenergy/telemetry/#</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">COMMAND TOPIC</span>
              <span className="font-bold text-neutral-800 truncate block">smartenergy/commands/#</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">DATABASE STORE</span>
              <span className="font-bold text-neutral-800">SQLite WAL Mode</span>
            </div>
          </div>
        </div>

      </div>

      {/* ARCHITECTURAL TOPOLOGY PIPELINE */}
      <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-neutral-900">End-to-End System Topology (Physical to Virtual Mapping)</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
            <span className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              1
            </span>
            <span className="font-bold text-xs text-neutral-900 block">Main Power Input</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">230V AC 50Hz</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              2
            </span>
            <span className="font-bold text-xs text-neutral-900 block">SCT-013 Clamps</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Non-invasive CT</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              3
            </span>
            <span className="font-bold text-xs text-neutral-900 block">ADS1115 + ESP32</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">RMS Integration</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              4
            </span>
            <span className="font-bold text-xs text-neutral-900 block">Aedes MQTT</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Port 1883 Broker</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              5
            </span>
            <span className="font-bold text-xs text-neutral-900 block">Backend Engine</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Node.js + SQLite</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              6
            </span>
            <span className="font-bold text-xs text-neutral-900 block">EMS Dashboard</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">React + Android APK</span>
          </div>

        </div>
      </div>

      {/* LIVE MQTT RAW PACKET STREAM TERMINAL */}
      <div className="p-5 rounded-2xl bg-neutral-950 text-neutral-200 border border-neutral-800 shadow-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-neutral-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-neutral-200">Live MQTT Packet Stream Monitor</span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 text-[10px] border border-neutral-800">
              QoS 0 · Unencrypted Local Sub
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> STREAMING
          </span>
        </div>

        <div className="h-56 overflow-y-auto space-y-1.5 text-[11px] pr-2">
          {mqttPackets.map((pkt, idx) => (
            <div key={idx} className="p-2 rounded bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700">
              <div className="flex items-center justify-between text-neutral-500 text-[10px] mb-1">
                <span className="text-amber-400 font-semibold">{pkt.topic}</span>
                <span>{pkt.timestamp}</span>
              </div>
              <div className="text-neutral-300">
                {JSON.stringify(pkt.payload)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
