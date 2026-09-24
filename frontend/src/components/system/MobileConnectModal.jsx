import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { X, Wifi, Smartphone, Laptop, Check, Copy, ArrowRightLeft, AlertTriangle } from 'lucide-react';

export function MobileConnectModal({ isOpen, onClose }) {
  const { networkInfo, gatewayStatus } = useEnergy();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isLoopback = networkInfo?.isLoopback || networkInfo?.localIp === '127.0.0.1' || networkInfo?.localIp === 'localhost';
  const effectiveIp = (!isLoopback && networkInfo?.localIp) ? networkInfo.localIp : '192.168.1.42';
  const mobileUrl = (!isLoopback && networkInfo?.mobileUrl) ? networkInfo.mobileUrl : `http://${effectiveIp}:5000`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-neutral-200/90 rounded-[32px] shadow-2xl p-6 text-neutral-900 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Connect Mobile Device</h2>
            <p className="text-xs text-neutral-500">Control appliances & view live charts from your smartphone</p>
          </div>
        </div>

        {/* Localhost vs Wi-Fi Explanation Banner if Loopback */}
        {isLoopback ? (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Why "localhost" won't work on mobile:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                Connecting to <code>localhost</code> from a phone points to the phone itself, not this laptop. Both devices must be on the <strong>same Wi-Fi router or phone mobile hotspot</strong> so your phone can reach the laptop's LAN IP: <strong className="font-mono text-amber-900">{effectiveIp}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              Ready for mobile pairing on Wi-Fi: <strong className="font-mono text-emerald-800">{effectiveIp}</strong>
            </span>
          </div>
        )}

        {/* Architecture flow badge */}
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 mb-5">
          <div className="flex items-center gap-1 font-medium text-neutral-900">
            <Laptop className="w-4 h-4 text-blue-600" />
            <span>Laptop Server</span>
          </div>
          <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-400" />
          <div className="flex items-center gap-1 text-neutral-600">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Same Wi-Fi</span>
          </div>
          <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-400" />
          <div className="flex items-center gap-1 font-medium text-neutral-900">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Mobile Client</span>
          </div>
        </div>

        {/* QR Code and Direct URL Container */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 mb-5">
          
          {/* QR Code */}
          <div className="bg-white p-2.5 rounded-2xl shadow-xs border border-neutral-100 shrink-0">
            {networkInfo?.qrCode ? (
              <img 
                src={networkInfo.qrCode} 
                alt="Mobile Connection QR Code" 
                className="w-32 h-32 rounded-xl object-contain"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-neutral-100 text-neutral-500 text-xs text-center font-mono rounded-xl">
                Generating QR...
              </div>
            )}
          </div>

          {/* Instructions & Direct Link */}
          <div className="flex-1 space-y-3 text-left w-full">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Direct Network URL</span>
              <div className="flex items-center gap-1.5 mt-1 bg-white border border-neutral-200 rounded-xl p-2 font-mono text-xs text-neutral-900 select-all">
                <span className="truncate font-semibold text-blue-600">{mobileUrl}</span>
                <button
                  onClick={copyToClipboard}
                  title="Copy URL"
                  className="ml-auto p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <ol className="text-xs text-neutral-600 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Connect your phone to <strong>Same Wi-Fi</strong>.</li>
              <li>Scan the QR code or enter <strong className="font-mono text-neutral-800">{mobileUrl}</strong>.</li>
              <li>Tapping switches on phone instantly triggers the virtual relay on the laptop!</li>
            </ol>
          </div>
        </div>

        {/* Gateway Diagnostics Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div>
            <span className="text-neutral-400">Gateway:</span>
            <span className="font-mono text-neutral-800 ml-1.5 font-semibold">{gatewayStatus?.deviceId || 'ESP32-SIM-001'}</span>
          </div>
          <div>
            <span className="text-neutral-400">Local Wi-Fi IP:</span>
            <span className="font-mono text-emerald-600 ml-1.5 font-semibold">{effectiveIp}</span>
          </div>
          <div>
            <span className="text-neutral-400">Protocol:</span>
            <span className="text-neutral-800 ml-1.5">MQTT (1883) + WS</span>
          </div>
          <div>
            <span className="text-neutral-400">Port:</span>
            <span className="font-mono text-neutral-800 ml-1.5">5000</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
