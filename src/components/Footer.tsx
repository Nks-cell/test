import React from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const { clinic, doctor } = useClinic();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Emergency Disclaimer Banner */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-rose-400">Medical Notice:</span>
            <span>{clinic.emergencyNotice}</span>
          </div>
          <span className="hidden sm:inline text-slate-500 tabular-nums">Emergency: Call 911</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Clinic Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold">
                +
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                MediCare<span className="text-teal-400">Pro</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {clinic.tagline}
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-medium text-slate-300">Lead Physician:</p>
              <p>{doctor.name} · {doctor.specialty}</p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Practice Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-teal-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-teal-400 transition-colors">
                  Doctor Profile & Credentials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('specialties')} className="hover:text-teal-400 transition-colors">
                  Medical Specialties
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-teal-400 transition-colors">
                  Consultation Services & Fees
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-teal-400 transition-colors">
                  Location & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Location */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Clinic Location
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  {clinic.address.street}, {clinic.address.suite ? clinic.address.suite + ', ' : ''}
                  {clinic.address.city}, {clinic.address.state} {clinic.address.postalCode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`tel:${clinic.phone}`} className="hover:text-white transition-colors tabular-nums">
                  {clinic.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`mailto:${clinic.email}`} className="hover:text-white transition-colors">
                  {clinic.email}
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Consultation Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Working Hours
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              {clinic.workingHours.slice(0, 6).map(w => (
                <div key={w.day} className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="font-medium text-slate-300">{w.day}:</span>
                  <span className="tabular-nums">
                    {w.isClosed ? 'Closed' : `${w.open} - ${w.close}`}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center py-0.5 text-slate-400">
                <span className="font-medium text-slate-400">Sunday:</span>
                <span>Closed</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Demo Attribution */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p>© {new Date().getFullYear()} MediCare Pro Demonstration Architecture. For healthcare practice presentations.</p>
            <p className="mt-1 text-slate-400">
              Medical content does not replace professional medical advice. No patient health records are collected.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">HIPAA & Privacy Architecture Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
