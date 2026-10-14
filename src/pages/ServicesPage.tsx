import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import { INITIAL_SPECIALTIES } from '../server/db/seedData.ts';
import {
  CalendarCheck,
  Clock,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (tab: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { services, openBooking } = useClinic();
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('all');

  const specialties = INITIAL_SPECIALTIES;

  // Filter services if needed
  const filteredServices = services;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Comprehensive Clinical Care
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Services & Specialties
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          MediCare Pro supports configurable medical specialties tailored to individual practice requirements. Explore our active internal medicine consultation offerings below.
        </p>
      </div>

      {/* 2. Medical Disclaimer Box */}
      <div className="clinic-card rounded-2xl p-5 text-xs text-slate-600 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900">Clinical Advice Notice:</strong> The descriptions and consultation fees provided below are for informational demonstration purposes. Content does not constitute clinical medical advice or establish a patient-physician relationship prior to a formal consultation.
        </div>
      </div>

      {/* 3. Configurable Specialty Modules Showcase */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Practice Specialties Overview
            </h2>
            <p className="text-xs text-slate-500">
              Doctors and clinics can easily configure which specialty modules appear on their website.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Demo Specialty: <span className="text-teal-700 font-bold">Internal & Preventive Medicine</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {specialties.map(spec => (
            <div
              key={spec.id}
              className={`p-5 rounded-2xl border transition-all ${
                spec.isAvailableInDemo
                  ? 'border-teal-200 bg-teal-50/40 ring-1 ring-teal-500/20 shadow-sm'
                  : 'clinic-card opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-teal-800">
                  {spec.isAvailableInDemo ? 'Active Practice Module' : 'Configurable Add-On'}
                </span>
                {spec.isAvailableInDemo ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Practiced Here
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Module Option
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-display">{spec.name}</h3>
              <p className="text-xs font-medium text-teal-700 mb-2">{spec.tagline}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{spec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active Medical Services Catalog */}
      <div className="border-t border-slate-200 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Outpatient Consultations
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
              Available Clinical Consultation Services
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            {services.length} active consultation protocols configured
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map(service => (
            <div
              key={service._id}
              className="clinic-card clinic-card-hover rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-teal-700">{service.category}</span>
                  <span className="tabular-nums font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.durationMinutes} min consultation</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">{service.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {service.preparationInstructions && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 mb-4 flex items-start gap-2">
                    <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Preparation Guidance: </strong>
                      {service.preparationInstructions}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-xs text-slate-500 block">Out-of-Pocket / Insurance Fee</span>
                  <span className="text-xl font-bold text-slate-900 tabular-nums">
                    ${service.fee} <span className="text-xs font-normal text-slate-500">USD</span>
                  </span>
                </div>
                <button
                  onClick={() => openBooking(service._id)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Request Booking</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Custom Practice Note */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Customizing for Your Own Clinic?</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            All services, durations, fees, and specialty modules can be adjusted in real time from the secure admin dashboard. No code modifications needed.
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shrink-0"
        >
          Discuss Practice Website
        </button>
      </div>

    </div>
  );
};
