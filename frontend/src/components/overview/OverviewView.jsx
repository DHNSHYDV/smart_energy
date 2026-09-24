import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  Zap,
  Activity,
  IndianRupee,
  Leaf,
  Gauge,
  Power,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  Sparkles,
  Wifi,
  ShieldCheck,
  Server,
  Snowflake,
  Monitor,
  Tv,
  Flame,
  Wind,
  Disc,
  Lightbulb,
  Refrigerator
} from 'lucide-react';

function getApplianceIcon(app) {
  const id = (app.id || '').toLowerCase();
  const name = (app.name || '').toLowerCase();
  if (id.includes('ac') || name.includes('ac') || name.includes('air')) {
    return <Snowflake className="w-4 h-4 text-sky-600" />;
  }
  if (id.includes('pc') || name.includes('computer') || name.includes('pc')) {
    return <Monitor className="w-4 h-4 text-indigo-600" />;
  }
  if (id.includes('tv') || name.includes('tv') || name.includes('television')) {
    return <Tv className="w-4 h-4 text-purple-600" />;
  }
  if (id.includes('heater') || id.includes('geyser') || name.includes('heater')) {
    return <Flame className="w-4 h-4 text-amber-600" />;
  }
  if (id.includes('fridge') || name.includes('fridge') || name.includes('refrigerator')) {
    return <Refrigerator className="w-4 h-4 text-cyan-600" />;
  }
  if (id.includes('wash') || name.includes('washing')) {
    return <Disc className="w-4 h-4 text-blue-600" />;
  }
  if (id.includes('fan') || name.includes('fan')) {
    return <Wind className="w-4 h-4 text-teal-600" />;
  }
  if (id.includes('light') || name.includes('light')) {
    return <Lightbulb className="w-4 h-4 text-amber-500" />;
  }
  return <Zap className="w-4 h-4 text-neutral-600" />;
}

export function OverviewView() {
  const { 
    telemetry, 
    appliances, 
    liveHistory, 
    toggleAppliance, 
    alerts, 
    recommendations,
    costInfo,
    carbonInfo,
    setActiveTab,
    setSelectedDeviceForDetail,
    currentUser,
    setAuthModalMode,
    setIsAuthModalOpen
  } = useEnergy();

  // Active devices sorted by power draw
  const activeAppliances = appliances
    .filter(a => a.isOn)
    .sort((a, b) => ((b.reading?.activePower || 0) - (a.reading?.activePower || 0)));

  // Calculate live average and peak from live history
  const historyPowers = liveHistory.map(h => h.totalPower);
  const peakPowerW = historyPowers.length > 0 ? Math.max(...historyPowers) : telemetry.totalActivePower;
  const avgPowerW = historyPowers.length > 0 
    ? Math.round(historyPowers.reduce((a, b) => a + b, 0) / historyPowers.length) 
    : telemetry.totalActivePower;

  // Chart data
  const chartData = liveHistory.length > 3 
    ? liveHistory 
    : [
        { time: '1', totalPower: 1400 },
        { time: '2', totalPower: 1650 },
        { time: '3', totalPower: 1520 },
        { time: '4', totalPower: 2150 },
        { time: '5', totalPower: 1845 }
      ];

  const unreadAlerts = alerts.filter(a => !a.is_resolved);

  return (
    <div className="space-y-6">

      {/* RESIDENT CONTEXT BANNER */}
      {currentUser && (
        <div className="p-3.5 px-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.name ? currentUser.name[0] : 'R'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">{currentUser.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  {currentUser.door_no}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                  • {currentUser.consumer_id}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-md">
                {currentUser.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-neutral-500 hidden sm:inline">
              <strong className="text-neutral-800">{activeAppliances.length}</strong> of {appliances.length} appliances on
            </span>
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
            >
              Switch Resident
            </button>
          </div>
        </div>
      )}

      {/* COMPACT KPI ROW (5 CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* KPI 1: Current Load */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Current Load</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              {(telemetry.totalActivePower / 1000).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">kW</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block font-mono">
            {telemetry.totalCurrent} A @ {telemetry.gridVoltage} V
          </span>
        </div>

        {/* KPI 2: Today's Energy */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Today's Energy</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              {telemetry.totalEnergyTodayKwh.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">kWh</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Accumulated 24-hr
          </span>
        </div>

        {/* KPI 3: Today's Cost */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Today's Cost</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              ₹{telemetry.estimatedCost.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Rate: ₹{telemetry.tariffRate}/kWh
          </span>
        </div>

        {/* KPI 4: Carbon Emissions */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Carbon Footprint</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              {telemetry.carbonKg.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">kg CO₂</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            CEA Factor: 0.82
          </span>
        </div>

        {/* KPI 5: Peak Demand */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Peak Demand</span>
            <Gauge className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              {(peakPowerW / 1000).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">kW</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Sanctioned: 5.0 kW
          </span>
        </div>

      </div>

      {/* MAIN TWO-COLUMN OPERATIONAL SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Live Load Chart + Active Loads Strip (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* LIVE LOAD CARD */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Live Building Load Profile
                </h3>
              </div>

              {/* Sub-metrics indicator pills */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-neutral-400 block">Current</span>
                  <span className="font-bold text-neutral-900">{(telemetry.totalActivePower / 1000).toFixed(2)} kW</span>
                </div>
                <div className="text-right border-l border-neutral-100 pl-3">
                  <span className="text-[10px] uppercase text-neutral-400 block">Peak</span>
                  <span className="font-bold text-rose-600">{(peakPowerW / 1000).toFixed(2)} kW</span>
                </div>
                <div className="text-right border-l border-neutral-100 pl-3">
                  <span className="text-[10px] uppercase text-neutral-400 block">Avg</span>
                  <span className="font-bold text-neutral-700">{(avgPowerW / 1000).toFixed(2)} kW</span>
                </div>
              </div>
            </div>

            {/* Sparkline chart */}
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 14, right: 6, left: 6, bottom: 4 }}>
                  <defs>
                    <linearGradient id="livePowerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', borderColor: '#e2e8f0', fontSize: '12px' }}
                    formatter={(val) => [`${val} W`, 'Active Load']}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPower"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#livePowerGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACTIVE DEVICES STRIP */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <Power className="w-4 h-4 text-emerald-600" />
                Active Loads
              </h3>
              <button 
                onClick={() => setActiveTab('devices')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                All Devices ({appliances.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeAppliances.slice(0, 4).map((app) => {
                const powerW = app.reading ? Math.round(app.reading.activePower) : 0;
                const currentA = app.reading ? app.reading.current : 0;

                return (
                  <div 
                    key={app.id} 
                    className="p-3 rounded-xl bg-neutral-50/80 hover:bg-neutral-100/70 border border-neutral-200/60 flex items-center justify-between transition-colors"
                  >
                    <div 
                      onClick={() => setSelectedDeviceForDetail(app)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200/90 flex items-center justify-center shrink-0">
                        {getApplianceIcon(app)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">{app.name}</h4>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {app.location} · {app.ratedPower}W rated
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-neutral-900 block">{powerW} W</span>
                        <span className="text-[10px] text-neutral-400 block">{currentA} A</span>
                      </div>

                      <button
                        onClick={() => toggleAppliance(app.id, false)}
                        title="Turn OFF"
                        className="p-1.5 rounded-lg bg-neutral-200 hover:bg-rose-100 text-neutral-600 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Action Center + Monthly Savings + Health (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* ACTION CENTER */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Action Center
              </h3>
              <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                {unreadAlerts.length} Active Items
              </span>
            </div>

            <div className="space-y-2.5">
              {unreadAlerts.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-50 text-center text-xs text-neutral-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  No high-priority alerts. Operating within green thresholds.
                </div>
              ) : (
                unreadAlerts.slice(0, 2).map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                      <span>{a.applianceName || a.alertType}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-800">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-neutral-700 leading-snug">{a.message}</p>
                  </div>
                ))
              )}

              {/* Recommended Action */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Energy Conservation Recommendation</span>
                </div>
                <p className="text-neutral-700 leading-snug">
                  Peak window (18:00 - 22:00) adds 25% tariff surcharge. Shift Water Heater heating cycles to off-peak slots to save ₹132/month.
                </p>
                <button
                  onClick={() => setActiveTab('automations')}
                  className="mt-2 text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Configure automated load shift <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* MONTHLY ENERGY BUDGET & SAVINGS */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Monthly Conservation Budget
              </h3>
              <span className="text-xs font-mono font-bold text-neutral-900">
                ₹{telemetry.estimatedCost.toFixed(0)} / ₹2,500
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden mb-3">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (telemetry.estimatedCost / 2500) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-100">
              <div>
                <span className="text-neutral-400 block text-[11px]">Potential Savings</span>
                <span className="font-bold text-emerald-600 font-mono">₹684 / month</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block text-[11px]">CO₂ Avoidable</span>
                <span className="font-bold text-neutral-800 font-mono">18.7 kg / month</span>
              </div>
            </div>
          </div>

          {/* SYSTEM HEALTH CARD */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-neutral-600" />
              <div>
                <span className="font-bold text-neutral-900 block">Simulation Node Health</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('network')}
              className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              IoT Diagnostics
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
