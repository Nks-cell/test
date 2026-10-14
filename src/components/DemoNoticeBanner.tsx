import React, { useState } from 'react';
import { ShieldAlert, X, Lock, CheckCircle2 } from 'lucide-react';

interface DemoNoticeBannerProps {
  onOpenAdmin: () => void;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = ({ onOpenAdmin }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <aside aria-label="Demo notice toggle" className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full shadow-md hover:bg-slate-50 transition-colors"
          title="Show demonstration notice"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>Demo Disclaimer</span>
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Demonstration site notice" className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-left">
          <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong className="text-white font-medium">Demonstration Project:</strong> Fictional doctor & clinic demo. Sample records & credentials only. Do not submit sensitive health data.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-teal-200 bg-teal-950/80 hover:bg-teal-900 border border-teal-700/50 rounded transition-colors whitespace-nowrap"
          >
            <Lock className="w-3 h-3 text-teal-400" />
            <span>Clinic Admin Portal</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white p-1"
            title="Minimize banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
