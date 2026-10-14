import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import { X, Search, Calendar, Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const AppointmentLookupModal: React.FC = () => {
  const { isLookupOpen, closeLookup } = useClinic();
  const [refInput, setRefInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    referenceNumber: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    appointmentDate: string;
    timeSlot: string;
    serviceName: string;
    consultationType: string;
    createdAt: string;
    isDemoRecord: boolean;
  } | null>(null);

  if (!isLookupOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/appointments/lookup/${encodeURIComponent(refInput.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'No appointment found with that reference number.');
      }
    } catch {
      setError('Connection failure while searching for appointment reference.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed by Clinic Staff</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Front Desk Review</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Consultation Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Appointment Cancelled</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Track Appointment Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify clinic review progress with your unique booking reference
            </p>
          </div>
          <button
            onClick={closeLookup}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleLookup} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Booking Reference Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MCP-2610-8421"
                  value={refInput}
                  onChange={e => setRefInput(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-wider uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors whitespace-nowrap"
              >
                {isLoading ? 'Checking...' : 'Check Status'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Demo sample reference codes: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">MCP-2610-8421</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">MCP-2610-8422</code>
            </p>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {result.referenceNumber}
                </span>
                {getStatusBadge(result.status)}
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-900">{result.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Format:</span>
                  <span className="capitalize">{result.consultationType === 'telehealth' ? 'Telehealth Video Consultation' : 'In-Person Consultation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-medium text-teal-700 tabular-nums">{result.appointmentDate} at {result.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Request Logged:</span>
                  <span className="text-slate-600 tabular-nums">{new Date(result.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                {result.status === 'pending' && (
                  <p>Our front desk staff evaluates appointments within working hours. You will receive an update once confirmed.</p>
                )}
                {result.status === 'confirmed' && (
                  <p className="text-emerald-700 font-medium">Your slot is locked in the schedule. Please arrive 10 minutes prior to your appointment.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
