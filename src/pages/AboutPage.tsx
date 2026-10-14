import React from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import {
  GraduationCap,
  Award,
  Globe2,
  CalendarCheck,
  Building,
  CheckCircle2,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { doctor, clinic, openBooking } = useClinic();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. Header & Lead Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Doctor Photo & Registration Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <img
              src={doctor.avatarUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRHKk7GsCWKzmlT6iRVKPWBN4HjTbGum4QG5An3V-B8A&s=10"}
              alt={doctor.name}
              className="w-full h-auto aspect-[3/4] object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="p-5 border-t border-slate-100 space-y-2">
              <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
              <p className="text-xs font-medium text-teal-700">{doctor.title}</p>
              
              <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>Registration Status:</span>
                <span className="font-mono text-slate-700">{doctor.registrationNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Professional Attribution Disclaimer:</strong> The qualifications and registration number listed here represent fictional demonstration data to illustrate the profile layout for prospective medical practitioners.
            </span>
          </div>
        </div>

        {/* Doctor Biography, Philosophy, Languages */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Physician Biography
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 font-display">
              About {doctor.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {doctor.specialty} · {doctor.experienceYears} Years Clinical Experience
            </p>
          </div>

          <div className="prose text-slate-600 text-sm leading-relaxed space-y-4">
            <p>{doctor.bio}</p>
            <p>
              Dr. Vance completed her internal medicine training with honors, focusing on early cardiovascular interventions and metabolic health maintenance. Her patient care philosophy centers on comprehensive diagnostic listening rather than rushed 7-minute visits.
            </p>
          </div>

          {/* Clinical Philosophy Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Clinical Care Philosophy
            </h4>
            <blockquote className="text-sm text-slate-800 italic leading-relaxed">
              "{doctor.philosophy}"
            </blockquote>
          </div>

          {/* Languages Spoken & Practice Focus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
                <Globe2 className="w-4 h-4 text-teal-600" />
                <span>Languages Spoken</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                {doctor.languages.map(lang => (
                  <span key={lang} className="bg-slate-100 px-2.5 py-1 rounded-md">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Consultation Availability</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monday to Saturday by appointment. Accepting in-person and telehealth patients.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => openBooking()}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Schedule Consultation with Dr. Vance</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. Education & Academic Background */}
      <div className="border-t border-slate-200 pt-12">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Academic Credentials
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-6">
            Education & Clinical Training
          </h2>

          <div className="space-y-4">
            {doctor.education.map((edu, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">{edu.year}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{edu.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Board Certifications & Professional Memberships */}
      <div className="border-t border-slate-200 pt-12">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Accreditations
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-6">
            Board Certifications & Fellowships
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctor.qualifications.map((qual, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
              >
                <Award className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">{qual}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Clinic Facility Standards */}
      <div className="border-t border-slate-200 pt-12">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Practice Facility
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              About {clinic.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Located at {clinic.address.street}, {clinic.address.city}, our outpatient clinic was designed from the ground up to eliminate clinical intimidation while maintaining hospital-grade sterilization standards.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block">Outpatient Privacy</span>
                <span className="text-xs text-slate-500 mt-1 block">Acoustically insulated consultation rooms ensuring complete confidentiality.</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block">Digital Health Records</span>
                <span className="text-xs text-slate-500 mt-1 block">Paperless, encrypted lab review workflows and secure patient communications.</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block">On-Site Diagnostic Partners</span>
                <span className="text-xs text-slate-500 mt-1 block">Immediate point-of-care specimen draws, ECG, and spirometry available.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
