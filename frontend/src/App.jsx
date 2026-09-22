import React, { useState } from 'react';
import { EnergyProvider, useEnergy } from './context/EnergyContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { SimControlBar } from './components/simulation/SimControlBar';
import { MetricCards } from './components/dashboard/MetricCards';
import { LivePowerChart } from './components/dashboard/LivePowerChart';
import { QuickApplianceGrid } from './components/dashboard/QuickApplianceGrid';
import { AppliancesView } from './components/appliances/AppliancesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AlertsView } from './components/alerts/AlertsView';
import { SchedulesView } from './components/schedules/SchedulesView';
import { RecommendationsBanner } from './components/recommendations/RecommendationsBanner';
import { MobileConnectModal } from './components/system/MobileConnectModal';
import { AcademicMappingModal } from './components/system/AcademicMappingModal';
import { AlertOctagon, X } from 'lucide-react';

function DashboardContent() {
  const { activeTab, toastAlert, setToastAlert } = useEnergy();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-20 md:pb-8">
      
      {/* Real-Time Push Toast Alert Banner */}
      {toastAlert && (
        <div className="fixed top-18 right-4 z-50 max-w-md w-full p-4 rounded-2xl bg-rose-950 border border-rose-500 shadow-2xl shadow-rose-950/50 animate-bounce flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
              ⚠ {toastAlert.severity} ALERT: {toastAlert.alertType}
            </span>
            <p className="text-xs text-rose-100 mt-1 leading-snug">
              {toastAlert.message}
            </p>
          </div>
          <button 
            onClick={() => setToastAlert(null)}
            className="p-1 text-rose-400 hover:text-white rounded-lg hover:bg-rose-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header 
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* Simulation Control Toolbar */}
        <SimControlBar />

        {/* Tab-driven View Switching */}
        {activeTab === 'dashboard' && (
          <div>
            <MetricCards />
            <RecommendationsBanner />
            <LivePowerChart />
            <QuickApplianceGrid />
          </div>
        )}

        {activeTab === 'appliances' && <AppliancesView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'schedules' && <SchedulesView />}

      </main>

      {/* Academic Project Presentation Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-900 text-center text-xs text-slate-500 hidden md:block">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Department of Computer Science and Engineering | Academic Year 2026-27 | <strong>22CSE74 Project Phase-II</strong>
          </p>
          <p className="text-slate-400">
            Smart Energy Conservation Tracker &ndash; Environmental (Software Simulation)
          </p>
        </div>
      </footer>

      {/* Native Mobile Bottom Navigation Bar */}
      <BottomNav />

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
      <DashboardContent />
    </EnergyProvider>
  );
}
