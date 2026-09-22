import React, { useState, useEffect } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Flame, 
  Leaf, 
  IndianRupee,
  AlertCircle
} from 'lucide-react';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e'];

export function AnalyticsView() {
  const { backendUrl, telemetry } = useEnergy();
  const [range, setRange] = useState('7d'); // 'today' | 'yesterday' | '7d' | '30d'
  const [attribution, setAttribution] = useState(null);
  const [historical, setHistorical] = useState(null);
  const [peakHours, setPeakHours] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [attrRes, histRes, peakRes] = await Promise.all([
          fetch(`${backendUrl}/api/analytics/attribution`),
          fetch(`${backendUrl}/api/analytics/historical?range=${range}`),
          fetch(`${backendUrl}/api/analytics/peak-hours`)
        ]);

        const attrData = await attrRes.json();
        const histData = await histRes.json();
        const peakData = await peakRes.json();

        if (attrData.success) setAttribution(attrData.data);
        if (histData.success) setHistorical(histData.data);
        if (peakData.success) setPeakHours(peakData.data);
      } catch (e) {
        console.error('Analytics load error:', e.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [backendUrl, range]);

  const pieData = attribution?.breakdown?.filter(b => b.energyKwh > 0).map(b => ({
    name: b.name,
    value: b.energyKwh,
    percentage: b.percentage,
    cost: b.cost
  })) || [];

  return (
    <div className="space-y-6">
      
      {/* Analytics Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Historical Energy & Cost Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Device-level attribution, 24-hr diurnal load profiles, and carbon footprint trends
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Device-Level Attribution Donut & Top Consumers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donut Chart: Device Attribution */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                Device-Level Energy Attribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quantified breakdown of energy consumed by individual virtual appliances
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Total: {attribution?.totalEnergyKwh || telemetry.totalEnergyTodayKwh.toFixed(2)} kWh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            {/* Donut graphic */}
            <div className="h-64 flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="text-xs text-slate-500 font-mono">No consumption data recorded yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }}
                      formatter={(val, name, item) => [`${val} kWh (${item.payload.percentage}%)`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legend & Breakdown stats */}
            <div className="space-y-2 text-xs overflow-y-auto max-h-60 pr-1">
              {attribution?.breakdown?.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 truncate">
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                    />
                    <span className="text-slate-200 font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">{item.energyKwh} kWh</span>
                    <span className="font-bold text-emerald-400 w-12 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Demand Analysis Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Peak-Demand Window</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Evening Peak Window</span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
                {peakHours?.peakWindow || '18:00 - 22:00'}
              </span>
              <span className="text-[11px] text-amber-400/90 mt-1 block">
                +25% Surcharge applied to consumption
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {peakHours?.offPeakSavingsTip}
            </p>

            <div className="space-y-2">
              {peakHours?.breakdown?.map((b, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 truncate">{b.period}</span>
                  <span className="font-bold text-amber-400 ml-2">{b.share}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Standard: {peakHours?.standardTariff}</span>
            <span className="text-amber-400 font-semibold">Peak: {peakHours?.peakTariff}</span>
          </div>
        </div>

      </div>

      {/* Row 2: Historical Consumption Bar Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Consumption Trend ({range === '7d' ? 'Past 7 Days' : range === '30d' ? 'Past 30 Days' : 'Hourly Load Curve'})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated energy consumption and electricity cost across the selected interval
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Total: <strong className="text-emerald-400">{historical?.totalKwh || 0} kWh</strong></span>
            <span className="text-slate-400">Cost: <strong className="text-cyan-400">₹{historical?.totalCost || 0}</strong></span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">Loading trend records...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historical?.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey={range === 'today' || range === 'yesterday' ? 'time' : 'day'} 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                  formatter={(val, name) => [`${val} ${name === 'energyKwh' ? 'kWh' : '₹'}`, name === 'energyKwh' ? 'Energy' : 'Cost']}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(val) => <span className="text-xs text-slate-300">{val === 'energyKwh' ? 'Energy (kWh)' : 'Estimated Cost (₹)'}</span>} 
                />
                <Bar dataKey="energyKwh" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
