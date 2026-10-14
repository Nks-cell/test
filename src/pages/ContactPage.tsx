import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { clinic } = useClinic();

  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [category, setCategory] = useState<'general' | 'appointment' | 'facilities' | 'billing'>('general');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !emailOrPhone.trim() || !message.trim()) {
      setFeedback({ success: false, message: 'Please complete all required fields.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          emailOrPhone: emailOrPhone.trim(),
          category,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          success: true,
          message: 'Your inquiry has been logged in the clinic database. Staff will review it during outpatient hours.'
        });
        setName('');
        setEmailOrPhone('');
        setMessage('');
      } else {
        setFeedback({ success: false, message: data.error || 'Failed to submit inquiry.' });
      }
    } catch {
      setFeedback({ success: false, message: 'Network connection error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Clinic Location & Front Desk
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Contact MediCare Pro
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Reach our administrative team for non-emergency inquiries, scheduling assistance, or directions to our San Francisco outpatient clinic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Direct Clinic Coordinates & Working Hours */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Coordinates Card */}
          <div className="clinic-card rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
              Practice Information
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Clinic Address</span>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                    {clinic.address.street}<br />
                    {clinic.address.suite && <>{clinic.address.suite}<br /></>}
                    {clinic.address.city}, {clinic.address.state} {clinic.address.postalCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Telephone & Front Desk</span>
                  <a
                    href={`tel:${clinic.phone}`}
                    className="text-xs text-teal-700 font-medium hover:underline tabular-nums"
                  >
                    {clinic.phone}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click to call during outpatient hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Electronic Inquiries</span>
                  <a
                    href={`mailto:${clinic.email}`}
                    className="text-xs text-teal-700 font-medium hover:underline"
                  >
                    {clinic.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">WhatsApp Front Desk</span>
                  <a
                    href={`https://wa.me/${clinic.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-700 font-medium hover:underline tabular-nums"
                  >
                    {clinic.whatsapp} (Demo Channel)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours Schedule */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Outpatient Consultation Hours</span>
            </div>
            <div className="space-y-2 text-xs">
              {clinic.workingHours.map(w => (
                <div key={w.day} className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="font-medium text-slate-700">{w.day}</span>
                  <span className="tabular-nums font-semibold text-slate-900">
                    {w.isClosed ? 'Closed' : `${w.open} - ${w.close}`}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              Walk-in triage is subject to doctor availability. Pre-scheduled appointments strongly recommended.
            </p>
          </div>

          {/* Map Location Card Placeholder */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Clinic Map & Parking</span>
              <span className="text-[11px] text-slate-400">Ground Floor Suite</span>
            </div>
            <div className="w-full h-40 bg-slate-100 rounded-xl flex flex-col items-center justify-center p-4 text-center border border-dashed border-slate-300">
              <MapPin className="w-6 h-6 text-teal-600 mb-1" />
              <p className="text-xs font-semibold text-slate-700">450 Medical Heights Blvd</p>
              <p className="text-[11px] text-slate-500">Validated 2-hour patient parking available on P1 level.</p>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="clinic-card rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Send an Outpatient Message
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Have a question regarding clinical services, facilities, or insurance billing? Leave a message for our front desk.
              </p>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                  feedback.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {feedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Bennett"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number or Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 (555) 000-0000 or samuel@example.com"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="general">General Clinic Inquiry</option>
                  <option value="appointment">Appointment Scheduling Inquiry</option>
                  <option value="billing">Insurance & Out-of-Pocket Billing</option>
                  <option value="facilities">Facility Accessibility & Parking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder="How can our front desk assist you today?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Do not send sensitive personal health diagnostics.</span>
                  <span>{message.length}/1000</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <span>Submit Message</span>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Inquiries are securely dispatched directly to the clinic administrative database.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
