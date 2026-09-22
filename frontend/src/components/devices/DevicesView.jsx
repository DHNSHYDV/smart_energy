import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Zap,
  Power,
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Snowflake,
  Tv,
  Monitor,
  Lightbulb,
  Fan,
  WashingMachine,
  Activity,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const iconMap = {
  'AC001': Snowflake,
  'FR001': Zap,
  'TV001': Tv,
  'PC001': Monitor,
  'LT001': Lightbulb,
  'FN001': Fan,
  'WM001': Zap,
  'GH001': Flame,
};

export function DevicesView() {
  const {
    appliances,
    toggleAppliance,
    setSelectedDeviceForDetail,
    injectAnomaly,
    telemetry
  } = useEnergy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filter categories
  const categories = ['ALL', 'Living Room', 'Kitchen', 'Bedroom', 'Office', 'Utility', 'Bathroom'];

  // Filtered devices
  const filteredAppliances = appliances.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || device.location.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const activeCount = appliances.filter(a => a.isOn).length;
  const totalPowerW = appliances
    .filter(a => a.isOn)
    .reduce((acc, a) => acc + (a.reading?.activePower || 0), 0);

  return (
    <div className="space-y-6">

      {/* TOP SUMMARY & CONTROLS STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-neutral-700" />
            Device Catalog & Relay Control
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Individual sub-metering points mapped to physical CT channels and smart relay contacts
          </p>
        </div>

        {/* Live Aggregates */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200/70 font-mono">
            <span className="text-neutral-400 block text-[10px]">CONNECTED</span>
            <span className="font-bold text-neutral-900">{activeCount} / {appliances.length} Active</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 font-mono">
            <span className="text-amber-600 block text-[10px]">TOTAL DRAW</span>
            <span className="font-bold text-amber-900">{totalPowerW} W</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search devices or channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>
      </div>

      {/* APPLIANCE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAppliances.map((app, idx) => {
          const Icon = iconMap[app.id] || Zap;
          const reading = app.reading || {
            activePower: 0,
            current: 0,
            powerFactor: app.powerFactor || 0.95,
            cumulativeEnergyKwh: 0
          };
          const power = app.isOn ? reading.activePower : 0;
          const energyKwh = reading.cumulativeEnergyKwh || 0;
          const estCostToday = (energyKwh * telemetry.tariffRate).toFixed(1);

          return (
            <div
              key={app.id}
              onClick={() => setSelectedDeviceForDetail(app)}
              className={`group p-4 rounded-2xl bg-white border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between ${
                app.isOn 
                  ? 'border-neutral-200/90 shadow-xs' 
                  : 'border-neutral-200/50 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      app.isOn 
                        ? 'bg-neutral-900 text-white shadow-xs' 
                        : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 group-hover:text-blue-600 transition-colors">
                        {app.name}
                      </h4>
                      <span className="text-[11px] text-neutral-400 font-sans block">
                        {app.location}
                      </span>
                    </div>
                  </div>

                  {/* Smart Relay Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAppliance(app.id);
                    }}
                    title={`Relay: ${app.isOn ? 'Click to open' : 'Click to close'}`}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      app.isOn
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-2 ring-emerald-500/20'
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {/* Technical Node Badging */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mb-3 pb-2 border-b border-neutral-100">
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">CH0{idx + 1}</span>
                  <span>SCT-013</span>
                  <span className="ml-auto font-sans font-semibold">
                    {app.isOn ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-neutral-400">STANDBY</span>
                    )}
                  </span>
                </div>

                {/* Primary Metric: Power */}
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    Active Power
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-mono font-bold text-neutral-900">
                      {power}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">W</span>
                  </div>
                </div>

                {/* Metric Strip (Current, PF, Energy) */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-neutral-50 text-[11px] font-mono mb-3">
                  <div>
                    <span className="text-[9px] text-neutral-400 block">CURRENT</span>
                    <span className="font-bold text-neutral-700">{(app.isOn ? reading.current : 0).toFixed(1)}A</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 block">PF</span>
                    <span className={`font-bold ${(reading.powerFactor < 0.85 && app.isOn) ? 'text-rose-600' : 'text-neutral-700'}`}>
                      {reading.powerFactor.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 block">TODAY</span>
                    <span className="font-bold text-neutral-700">{energyKwh.toFixed(2)}k</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-mono text-[11px]">₹{estCostToday} today</span>
                <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform text-[11px]">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
