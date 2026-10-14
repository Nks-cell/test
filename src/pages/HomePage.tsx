import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import {
  CalendarCheck,
  Stethoscope,
  Clock,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { doctor, clinic, services, openBooking } = useClinic();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredServices = services.slice(0, 3);

  const faqs = [
    {
      q: "How does the consultation booking request work?",
      a: "Choose your preferred clinical service, select an available date and time slot from our real-time schedule, and enter your contact details. You immediately receive a unique reference number (e.g. MCP-2610-8421). Our clinic staff verifies your request within working hours to confirm your consultation."
    },
    {
      q: "What should I bring to my first appointment?",
      a: "Please bring a government-issued photo ID, your insurance card (or payment method), and a complete list of your current medications, supplements, and recent diagnostic lab records."
    },
    {
      q: "Are telehealth consultations available for new patients?",
      a: "Yes. Non-emergency consultations, general medical guidance, and lab reviews can be scheduled as encrypted telehealth video visits. However, physical examinations and certain diagnostic procedures require an in-person clinic visit."
    },
    {
      q: "What is your appointment cancellation and rescheduling policy?",
      a: "To ensure other patients have access to open clinical slots, we kindly request at least 24 hours advance notice if you need to reschedule or cancel your consultation."
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION (Domain-native, 2-column split with high-fidelity photo and ambient grid texture) */}
      <section className="relative pt-6 sm:pt-12 overflow-hidden">
        {/* Subtle Background Geometric Grid & Radial Vignette */}
        <div className="absolute inset-0 bg-grid-subtle opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, Value Proposition, CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                <span>Evidence-Based Outpatient Healthcare</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display [text-wrap:balance]">
                Personalized Medical Care with <span className="text-teal-600">{doctor.name}</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {clinic.tagline} {clinic.heroSubtitle}
              </p>

              {/* Doctor Quick Credentials Strip (Clean unboxed typography) */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">{doctor.specialty}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="tabular-nums">{doctor.experienceYears} Years Practice</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>FACP Fellow</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>San Francisco Clinic</span>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => openBooking()}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
                >
                  Meet Dr. Vance →
                </button>
              </div>

              {/* Acceptance Notice */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Currently accepting new adult patients for primary & preventive consultations.</span>
              </div>
            </div>

            {/* Right Column: High-Impact Doctor Portrait */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRHKk7GsCWKzmlT6iRVKPWBN4HjTbGum4QG5An3V-B8A&s=10"
                  alt={`${doctor.name} - ${doctor.title}`}
                  className="w-full h-auto aspect-[3/4] object-cover object-top"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{doctor.name}</h3>
                    <p className="text-xs text-slate-500">{doctor.title}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    Lic: {doctor.registrationNumber.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FACTUAL TRUST STRIP (Full-width row below hero split, no pills, tabular figures) */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">14+</div>
              <div className="text-xs text-slate-600 mt-0.5">Years Clinical Practice</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">30–45m</div>
              <div className="text-xs text-slate-600 mt-0.5">Unhurried Consultations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">100%</div>
              <div className="text-xs text-slate-600 mt-0.5">Doctor-Led Patient Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">2 Formats</div>
              <div className="text-xs text-slate-600 mt-0.5">In-Person & Telehealth</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Clinical Offerings
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Featured Consultation Services
            </h3>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredServices.map(service => (
            <div
              key={service._id}
              className="clinic-card clinic-card-hover rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-teal-700">{service.category}</span>
                  <span className="tabular-nums">{service.durationMinutes} minutes</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2 font-display">{service.name}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-xs text-slate-500 block">Consultation Fee</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    ${service.fee}
                  </span>
                </div>
                <button
                  onClick={() => openBooking(service._id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CLINIC FACILITIES & ENVIRONMENT (With subtle dark dot texture overlay) */}
      <section className="relative bg-slate-900 text-white py-18 overflow-hidden">
        {/* Subtle dot texture on dark section */}
        <div className="absolute inset-0 bg-dots-subtle opacity-15 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Clinic Infrastructure
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight font-display">
                Designed for Serenity, Hygiene, and Diagnostic Thoroughness
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                MediCare Pro provides a calming, sterile, and patient-centered outpatient environment. Our consultation suites are equipped with modern point-of-care diagnostics, comfortable examination seating, and privacy-shielded spaces.
              </p>
              
              <div className="space-y-3 pt-2 text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>HEPA-filtered clinical ventilation and rigorous sterilization protocols.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>On-site specimen collection and rapid diagnostic telemetry partners.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Full wheelchair accessibility with dedicated ground-floor patient parking.</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
                >
                  View Location & Directions
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md">
                <img
                  src="/src/assets/images/clinic_interior_1791978465988.jpg"
                  alt="Reception and Consultation Area"
                  className="w-full h-48 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3 bg-slate-950/80 text-xs text-slate-300">
                  Patient Reception & Waiting Lounge
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md">
                <img
                  src="/src/assets/images/clinic_consultation_1791978466106.jpg"
                  alt="Clinical Examination Room"
                  className="w-full h-48 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3 bg-slate-950/80 text-xs text-slate-300">
                  Private Diagnostic & Exam Suite
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. HOW APPOINTMENT SCHEDULING WORKS (Human editorial numbering) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Transparent Workflow
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            How to Book Your Consultation
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            Real-time slot availability backed by server validation and conflict prevention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="clinic-card clinic-card-hover p-6 rounded-2xl">
            <span className="text-xs font-mono font-bold text-teal-600">01</span>
            <h4 className="text-base font-bold text-slate-900 mt-2 mb-1.5 font-display">Select Clinical Service</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose from annual wellness exams, preventive consultations, or telehealth reviews.
            </p>
          </div>

          <div className="clinic-card clinic-card-hover p-6 rounded-2xl">
            <span className="text-xs font-mono font-bold text-teal-600">02</span>
            <h4 className="text-base font-bold text-slate-900 mt-2 mb-1.5 font-display">Pick Real-Time Slot</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select a date and verified open slot computed directly from clinic working hours.
            </p>
          </div>

          <div className="clinic-card clinic-card-hover p-6 rounded-2xl">
            <span className="text-xs font-mono font-bold text-teal-600">03</span>
            <h4 className="text-base font-bold text-slate-900 mt-2 mb-1.5 font-display">Instant Reference Code</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive your unique booking reference (e.g. MCP-2610-8421) recorded in the database.
            </p>
          </div>

          <div className="clinic-card clinic-card-hover p-6 rounded-2xl">
            <span className="text-xs font-mono font-bold text-teal-600">04</span>
            <h4 className="text-base font-bold text-slate-900 mt-2 mb-1.5 font-display">Staff Review & Status</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track your booking status online or await telephone pre-screening confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* 6. SAMPLE PATIENT TESTIMONIALS (Strictly labeled as illustrative sample demo content) */}
      <section className="relative bg-slate-50/70 py-16 border-y border-slate-200/80 overflow-hidden">
        <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Patient Feedback Demonstration
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-display">
                Illustrative Patient Experiences
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              <strong className="text-slate-700">Notice:</strong> The testimonials below are sample demo placeholders to demonstrate layout until authentic patient consent is obtained.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="clinic-card clinic-card-hover p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                "Dr. Vance took 40 minutes to thoroughly evaluate my cardiovascular risk factors and explained every diagnostic lab number in plain terms. The most reassuring medical appointment I have had."
              </p>
              <div className="pt-4 border-t border-slate-100 text-xs">
                <p className="font-bold text-slate-900 font-display">Marcus S. (Sample Demo Patient)</p>
                <p className="text-slate-500">Preventive Health Consultation · 2026</p>
              </div>
            </div>

            <div className="clinic-card clinic-card-hover p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                "Booking online was seamless. I picked a Tuesday morning slot, received an instant reference number, and front desk confirmed within an hour. Pristine clinic and very attentive staff."
              </p>
              <div className="pt-4 border-t border-slate-100 text-xs">
                <p className="font-bold text-slate-900 font-display">Hannah C. (Sample Demo Patient)</p>
                <p className="text-slate-500">General Consultation · 2026</p>
              </div>
            </div>

            <div className="clinic-card clinic-card-hover p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                "The telehealth video review for my chronic hypertension refill saved me a 2-hour commute. Dr. Vance was punctual and reviewed my home blood pressure logs carefully."
              </p>
              <div className="pt-4 border-t border-slate-100 text-xs">
                <p className="font-bold text-slate-900 font-display">Arthur P. (Sample Demo Patient)</p>
                <p className="text-slate-500">Telehealth Chronic Review · 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Answers & Clarity
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-teal-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM BOOKING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold">
              Ready to Schedule Your Medical Consultation?
            </h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              Choose an in-person appointment or telehealth video review with Dr. Elena Vance. Fast confirmation and real-time open slots.
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <button
              onClick={() => openBooking()}
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              Book an Appointment
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-3.5 border border-teal-300/40 hover:bg-teal-800/40 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Contact Clinic
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
