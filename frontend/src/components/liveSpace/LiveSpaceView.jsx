import React, { useState } from 'react';
import { useVirtualLab } from '../../context/VirtualLabContext';
import { ThreeDimensionalTwinView } from '../virtualLab/ThreeDimensionalTwinView';
import { VirtualRoomsView } from '../virtualLab/VirtualRoomsView';
import { ElectricalTopologyView } from '../virtualLab/ElectricalTopologyView';
import { VirtualEnergyLabView } from '../virtualLab/VirtualEnergyLabView';
import { 
  Box, 
  Home, 
  GitBranch, 
  Sparkles, 
  Zap, 
  Activity, 
  Radio, 
  SlidersHorizontal,
  Layers
} from 'lucide-react';

export function LiveSpaceView() {
  const { activeStudioTab, setActiveStudioTab, totalActivePower, isConnected } = useVirtualLab();

  const subTabs = [
    { id: '3d', label: '3D Room Twin', icon: Box, desc: 'Interactive 3D building model with live heatmaps & component focus' },
    { id: 'room', label: 'Virtual Rooms', icon: Home, desc: 'Room-by-room appliance management & real-time load simulation' },
    { id: 'topology', label: 'Electrical Topology', icon: GitBranch, desc: 'Single-line circuit diagram, distribution board & line losses' },
    { id: 'studio', label: 'Interactive Studio', icon: Layers, desc: 'Full component library inspector & parameters tuning' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ── Top Hero Header ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE DIGITAL TWIN & ROOM SIMULATION</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Live Space</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                ESP32-SIM-001 TELEMETRY SYNCED
              </span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time 3D room visualization and interactive load management. Control appliances, view live heatmaps, inspect component electrical parameters, and observe dynamic energy consumption.
            </p>
          </div>

          {/* Realtime Telemetry Badge */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-semibold text-slate-400">Total Live Load</div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                <span>{totalActivePower.toFixed(0)}</span>
                <span className="text-xs font-normal text-emerald-400">W</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                <span>{isConnected ? 'Backend Telemetry Active' : 'Offline Mode'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Sub Navigation Tabs ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStudioTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStudioTab(tab.id)}
              className={`p-4 rounded-2xl text-left transition-all relative border cursor-pointer ${
                isActive
                  ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-100">{tab.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{tab.desc}</p>
              
              {isActive && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Content ──────────────────────────────────────── */}
      <div className="pt-2">
        {activeStudioTab === '3d' && <ThreeDimensionalTwinView />}
        {activeStudioTab === 'room' && <VirtualRoomsView />}
        {activeStudioTab === 'topology' && <ElectricalTopologyView />}
        {activeStudioTab === 'studio' && <VirtualEnergyLabView />}
      </div>

    </div>
  );
}
