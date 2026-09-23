import React, { useState } from 'react';
import { EnergyProvider, useEnergy } from './context/EnergyContext';
import { OverviewView } from './components/overview/OverviewView';
import { LiveEnergyView } from './components/live/LiveEnergyView';
import { DevicesView } from './components/devices/DevicesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AutomationsView } from './components/automations/AutomationsView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { IoTNetworkView } from './components/network/IoTNetworkView';
import { EnergyConfigView } from './components/config/EnergyConfigView';
import { SystemLabModal } from './components/lab/SystemLabModal';
import { MobileConnectModal } from './components/system/MobileConnectModal';
import { AcademicMappingModal } from './components/system/AcademicMappingModal';
import { DeviceDetailDrawer } from './components/ui/DeviceDetailDrawer';
import { BottomNav } from './components/common/BottomNav';
import {
  LayoutGrid,
  Activity,
  Cpu,
  BarChart3,
  Sparkles,
  ShieldAlert,
  FileText,
  Radio,
  Settings,
  FlaskConical,
  Smartphone,
  GraduationCap,
  Search,
  Bell,
  ChevronDown,
  X,
  AlertOctagon,
  Power
} from 'lucide-react';

function DashboardShell() {
  const { 
    activeTab, 
    setActiveTab, 
    telemetry, 
    appliances,
    schedules,
    alerts, 
    isPaused, 
    togglePause, 
    toastAlert, 
    setToastAlert,
    selectedDeviceForDetail,
    setSelectedDeviceForDetail,
    toggleAppliance
  } = useEnergy();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadAlerts = alerts.filter(a => !a.is_resolved);

  // Tab Title helper
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'overview':
        return { title: 'Overview' };
      case 'live':
        return { title: 'Live Telemetry' };
      case 'appliances':
      case 'devices':
        return { title: 'Sub-Circuits' };
      case 'analytics':
        return { title: 'Analytics' };
      case 'schedules':
      case 'automations':
        return { title: 'Automations' };
      case 'alerts':
        return { title: 'Incidents' };
      case 'reports':
        return { title: 'Audit Reports' };
      case 'network':
        return { title: 'IoT Gateway' };
      case 'config':
        return { title: 'Configuration' };
      default:
        return { title: 'Smart Energy Converter' };
    }
  };

  const currentTabInfo = getTabTitle();

  return (
    <div className="h-screen w-full bg-[#16171b] flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* Toast Push Notification */}
      {toastAlert && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-white border border-rose-200 shadow-2xl text-neutral-900 flex items-start gap-3 animate-slide-in">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5 text-rose-600">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              ⚠ Anomaly Detected: {toastAlert.applianceName || toastAlert.alertType}
            </span>
            <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
              {toastAlert.message}
            </p>
          </div>
          <button onClick={() => setToastAlert(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* LEFT DOCKED DARK SIDEBAR (Professional Enterprise Desktop Layout) */}
      <aside className="w-full md:w-64 md:h-screen md:sticky md:top-0 bg-[#111215] flex md:flex-col justify-between p-3 md:p-4 shrink-0 border-b md:border-b-0 md:border-r border-neutral-800/80 z-20 text-neutral-300 select-none">
        
        {/* Top: Logo + Nav Items */}
        <div className="flex md:flex-col gap-4 w-full">
          
          {/* Logo Header */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 px-2 py-1.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 ring-1 ring-white/10 group-hover:scale-105 transition-transform shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z" fill="white" />
              </svg>
            </div>
            <div className="hidden md:block leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight">Smart Energy</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v2.0</span>
              </div>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-neutral-400 block mt-0.5">
                Enterprise Converter
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex md:flex-col gap-1 w-full overflow-x-auto md:overflow-visible">
            
            <div className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 pt-2 pb-1">
              Operations
            </div>

            {/* 1. Overview */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'dashboard' || activeTab === 'overview'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Overview</span>
            </button>

            {/* 2. Live Telemetry */}
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'live'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Live Telemetry</span>
            </button>

            {/* 3. Devices */}
            <button
              onClick={() => setActiveTab('devices')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'devices' || activeTab === 'appliances'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Sub-Circuits</span>
              </div>
              <span className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                {appliances.length}
              </span>
            </button>

            {/* 4. Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'analytics'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Analytics</span>
            </button>

            {/* 5. Automations */}
            <button
              onClick={() => setActiveTab('automations')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'automations' || activeTab === 'schedules'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Automations</span>
            </button>

            {/* 6. Alerts */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'alerts'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Incidents</span>
              </div>
              {unreadAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* 7. Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'reports'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Audit Reports</span>
            </button>

            <div className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 pt-3 pb-1">
              System
            </div>

            {/* 8. IoT Network */}
            <button
              onClick={() => setActiveTab('network')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'network'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">IoT Gateway</span>
            </button>

            {/* 9. Config */}
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'config'
                  ? 'text-white bg-white/10 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Configuration</span>
            </button>

            {/* 10. Viva Sandbox */}
            <button
              onClick={() => setIsLabOpen(true)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-all cursor-pointer w-full text-left mt-1 border border-amber-400/20"
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Viva Sandbox</span>
              </div>
              <span className="hidden md:inline text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                LAB
              </span>
            </button>

          </nav>
        </div>

        {/* Bottom Section: Gateway Status & Mobile APK */}
        <div className="hidden md:flex flex-col gap-2 pt-3 border-t border-neutral-800/80">
          <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-neutral-300">ESP32-SIM-001</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">50.0 Hz</span>
          </div>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer border border-neutral-700/50"
          >
            <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
            <span>Connect Mobile App</span>
          </button>
        </div>

      </aside>

      {/* FULL-SCREEN INNER CANVAS */}
      <main className="flex-1 bg-white md:m-3 md:rounded-[32px] p-5 sm:p-7 lg:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] pb-20 md:pb-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-100 gap-3">
          
          {/* Bold Title Only (No AI Slop Subtitle) */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              {currentTabInfo.title}
            </h1>
          </div>

          {/* Right Controls Bar */}
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            
            {/* Quick Viva Sandbox Trigger Button */}
            <button
              onClick={() => setIsLabOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
              <span>Viva Sandbox</span>
            </button>

            {/* Search Button */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200/80 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                  {searchQuery && (
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {appliances
                        .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(a => (
                          <div
                            key={a.id}
                            onClick={() => {
                              setSelectedDeviceForDetail(a);
                              setIsSearchOpen(false);
                            }}
                            className="p-2 rounded-lg hover:bg-neutral-50 text-xs flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-neutral-800">{a.name}</span>
                            <span className="font-mono text-[10px] text-neutral-400">{a.id}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsDropdownOpen(!isAlertsDropdownOpen)}
                className="relative w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200/80 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
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
                        <div key={a.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-900">{a.applianceName || a.alertType}</span>
                            <span className="text-[9px] font-bold text-rose-600 uppercase">{a.severity}</span>
                          </div>
                          <span className="text-neutral-500 text-[11px] leading-tight block mt-0.5">{a.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setActiveTab('alerts'); setIsAlertsDropdownOpen(false); }}
                    className="w-full mt-2 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-center text-xs font-medium cursor-pointer"
                  >
                    View All Alerts
                  </button>
                </div>
              )}
            </div>

            {/* Academic User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="bg-neutral-100 hover:bg-neutral-200/80 px-2.5 py-1.5 rounded-full flex items-center gap-2 cursor-pointer transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                  22
                </div>
                <span className="text-xs font-semibold text-neutral-800">
                  Dhanush Y.
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
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 flex items-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    Academic Project Details
                  </button>
                  <button
                    onClick={() => {
                      setIsConnectModalOpen(true);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    Mobile App (APK) Setup
                  </button>
                  <button
                    onClick={() => {
                      setIsLabOpen(true);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    Viva Sandbox & Stress Tests
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Canvas Body View */}
        <div className="flex-1 w-full">
          {(activeTab === 'dashboard' || activeTab === 'overview') && <OverviewView />}
          {activeTab === 'live' && <LiveEnergyView />}
          {(activeTab === 'devices' || activeTab === 'appliances') && <DevicesView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {(activeTab === 'automations' || activeTab === 'schedules') && <AutomationsView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'network' && <IoTNetworkView />}
          {activeTab === 'config' && <EnergyConfigView />}
        </div>

        {/* Academic Project Presentation Footer */}
        <div className="pt-6 mt-6 border-t border-neutral-100 text-[11px] text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Department of CSE | Academic Year 2026-27 | <strong>22CSE74 Project Phase-II</strong>
          </span>
          <span className="font-mono text-neutral-500">
            Node: ESP32-SIM-001 · 230V Base · ₹{telemetry.tariffRate.toFixed(2)}/kWh Tariff · Aedes MQTT 1883
          </span>
        </div>

      </main>

      {/* System Modals & Drawers */}
      <DeviceDetailDrawer
        device={selectedDeviceForDetail}
        onClose={() => setSelectedDeviceForDetail(null)}
        onToggle={toggleAppliance}
        tariffRate={telemetry.tariffRate}
        schedules={schedules}
      />
      <SystemLabModal
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
      />
      <MobileConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />
      <AcademicMappingModal 
        isOpen={isAcademicModalOpen} 
        onClose={() => setIsAcademicModalOpen(false)} 
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        onOpenLab={() => setIsLabOpen(true)}
        onOpenAcademic={() => setIsAcademicModalOpen(true)}
        onOpenConnect={() => setIsConnectModalOpen(true)}
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
