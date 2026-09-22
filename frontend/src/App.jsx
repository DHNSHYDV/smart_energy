import React, { useState } from 'react';
import { EnergyProvider, useEnergy } from './context/EnergyContext';
import { OverviewView } from './components/dashboard/OverviewView';
import { AppliancesView } from './components/appliances/AppliancesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AlertsView } from './components/alerts/AlertsView';
import { SchedulesView } from './components/schedules/SchedulesView';
import { MobileConnectModal } from './components/system/MobileConnectModal';
import { AcademicMappingModal } from './components/system/AcademicMappingModal';
import {
  LayoutGrid,
  SlidersHorizontal,
  BarChart3,
  Box,
  Smartphone,
  Power,
  Play,
  Pause,
  AlertTriangle,
  Search,
  Bell,
  ChevronDown,
  X,
  AlertOctagon,
  GraduationCap
} from 'lucide-react';

function DashboardShell() {
  const { 
    activeTab, 
    setActiveTab, 
    telemetry, 
    alerts, 
    isPaused, 
    togglePause, 
    toastAlert, 
    setToastAlert 
  } = useEnergy();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.is_resolved);

  return (
    <div className="min-h-screen bg-blueprint-grid flex items-center justify-center p-2 sm:p-4 lg:p-8 select-none">
      
      {/* Toast Push Notification */}
      {toastAlert && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl text-white flex items-start gap-3 animate-slide-in">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
              ⚠ Anomaly Detected: {toastAlert.applianceName || toastAlert.alertType}
            </span>
            <p className="text-xs text-neutral-300 mt-0.5 leading-snug">
              {toastAlert.message}
            </p>
          </div>
          <button onClick={() => setToastAlert(null)} className="text-neutral-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Outer Dark Tablet / App Frame */}
      <div className="w-full max-w-[1380px] bg-[#16171b] rounded-[36px] shadow-2xl border border-neutral-800/80 p-3 sm:p-5 flex flex-col md:flex-row gap-4 lg:gap-6 min-h-[780px] relative">

        {/* LEFT DARK SIDEBAR (Embedded in Tablet Frame) */}
        <aside className="shrink-0 flex md:flex-col items-center justify-between py-2 px-1 md:w-16">
          
          {/* Top Logo Badge (Pastel Cream with stylized glyph) */}
          <div className="flex md:flex-col items-center gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              title="Smart Energy Tracker"
              className="w-11 h-11 rounded-2xl bg-[#fdf3db] text-neutral-900 flex items-center justify-center font-black shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z" fill="#16171b" />
              </svg>
            </button>

            {/* Vertical Navigation Bar */}
            <nav className="flex md:flex-col items-center gap-4 md:space-y-4 md:mt-6">
              
              {/* Overview / Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                title="Overview"
                className={`p-2.5 rounded-xl transition-all ${
                  activeTab === 'dashboard'
                    ? 'text-white bg-neutral-800/90 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              {/* Appliances & Relays */}
              <button
                onClick={() => setActiveTab('appliances')}
                title="Appliances & Sensors"
                className={`p-2.5 rounded-xl transition-all ${
                  activeTab === 'appliances'
                    ? 'text-white bg-neutral-800/90 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {/* Analytics & ML Forecasting */}
              <button
                onClick={() => setActiveTab('analytics')}
                title="Historical Analytics & Forecast"
                className={`p-2.5 rounded-xl transition-all ${
                  activeTab === 'analytics'
                    ? 'text-white bg-neutral-800/90 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>

              {/* Schedules */}
              <button
                onClick={() => setActiveTab('schedules')}
                title="Schedules & Automation"
                className={`p-2.5 rounded-xl transition-all ${
                  activeTab === 'schedules'
                    ? 'text-white bg-neutral-800/90 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
                }`}
              >
                <Box className="w-5 h-5" />
              </button>

              {/* Mobile Connect QR */}
              <button
                onClick={() => setIsConnectModalOpen(true)}
                title="Mobile App Connect"
                className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40 transition-all"
              >
                <Smartphone className="w-5 h-5" />
              </button>

            </nav>
          </div>

          {/* Bottom Sidebar Action: Sim Pause / Reset */}
          <div className="flex md:flex-col items-center gap-3">
            <button
              onClick={togglePause}
              title={isPaused ? "Resume Simulation" : "Pause Simulation"}
              className={`p-2.5 rounded-xl transition-all ${
                isPaused 
                  ? 'text-amber-400 bg-amber-950/40' 
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
              }`}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>

        </aside>

        {/* MAIN INNER PURE-WHITE CANVAS */}
        <main className="flex-1 bg-white rounded-[28px] p-5 sm:p-7 lg:p-8 flex flex-col justify-between shadow-sm relative overflow-x-hidden min-h-[680px]">
          
          {/* Top Canvas Header Bar */}
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-neutral-100">
            
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-neutral-900">
                {activeTab === 'dashboard' && 'Overview'}
                {activeTab === 'appliances' && 'Appliances & CT Sensors'}
                {activeTab === 'analytics' && 'Analytics & Forecasting'}
                {activeTab === 'schedules' && 'Automation Schedules'}
                {activeTab === 'alerts' && 'System Alerts'}
              </h1>
            </div>

            {/* Right Controls Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Search Button */}
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200/80 flex items-center justify-center text-neutral-600 transition-colors"
                  title="Search appliances"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Quick Search Popover */}
                {isSearchOpen && (
                  <div className="absolute right-0 top-12 z-30 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3">
                    <input
                      type="text"
                      placeholder="Search appliances, meters..."
                      className="w-full text-xs px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Notification Bell Button */}
              <div className="relative">
                <button
                  onClick={() => setIsAlertsDropdownOpen(!isAlertsDropdownOpen)}
                  className="relative w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200/80 flex items-center justify-center text-neutral-600 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlerts.length > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 border-2 border-white ring-1 ring-rose-300"></span>
                  )}
                </button>

                {/* Alerts Popover */}
                {isAlertsDropdownOpen && (
                  <div className="absolute right-0 top-12 z-30 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100 mb-2">
                      <h4 className="text-xs font-bold text-neutral-900">Telemetry Alerts</h4>
                      <span className="text-[10px] text-neutral-400 font-medium">{unreadAlerts.length} Active</span>
                    </div>
                    {alerts.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-3 text-center">No active anomalies detected.</p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-2 text-xs">
                        {alerts.slice(0, 5).map(a => (
                          <div key={a.id} className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                            <span className="font-semibold text-neutral-900 block">{a.applianceName || a.alertType}</span>
                            <span className="text-neutral-500 text-[11px] leading-tight block mt-0.5">{a.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Pill ("Zoia M." as in screenshot) */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="bg-neutral-100 hover:bg-neutral-200/80 px-2.5 py-1.5 rounded-full flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {/* Avatar Circle */}
                  <div className="w-6 h-6 rounded-full bg-amber-400/90 text-neutral-900 flex items-center justify-center font-bold text-[11px] shadow-xs">
                    👩‍💻
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    Zoia M.
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Profile / Project Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-12 z-30 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 text-xs">
                    <div className="p-2 border-b border-neutral-100 mb-1">
                      <p className="font-bold text-neutral-900">Dhanush Yadav</p>
                      <p className="text-[11px] text-neutral-400">22CSE74 Major Project</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAcademicModalOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      Academic Project Info
                    </button>
                    <button
                      onClick={() => {
                        setIsConnectModalOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 flex items-center gap-2"
                    >
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      Mobile App (APK) Setup
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Canvas View Content */}
          <div className="flex-1 w-full">
            {activeTab === 'dashboard' && (
              <OverviewView 
                onOpenConnectModal={() => setIsConnectModalOpen(true)}
                onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
              />
            )}
            {activeTab === 'appliances' && <AppliancesView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'schedules' && <SchedulesView />}
            {activeTab === 'alerts' && <AlertsView />}
          </div>

          {/* Academic Footer Info */}
          <div className="pt-6 mt-6 border-t border-neutral-100 text-[11px] text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              NHCE CSE | Major Project Phase-II 22CSE74
            </span>
            <span className="font-mono">
              Gateway ESP32-SIM-001 · 230V Base · ₹8.00/kWh Tariff
            </span>
          </div>

        </main>

      </div>

      {/* System Modals */}
      <MobileConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />
      <AcademicMappingModal 
        isOpen={isAcademicModalOpen} 
        onClose={() => setIsAcademicModalOpen(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <EnergyProvider>
      <DashboardShell />
    </EnergyProvider>
  );
}
