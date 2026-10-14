import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { TimeSlotOption } from '../types/index.ts';

export const BookingModal: React.FC = () => {
  const { isBookingOpen, closeBooking, services, selectedServiceId } = useClinic();

  const [step, setStep] = useState<'service' | 'datetime' | 'patient' | 'confirmed'>('service');
  const [serviceId, setServiceId] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'in_person' | 'telehealth'>('in_person');
  
  // Tomorrow's date by default for convenient testing
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    // If tomorrow is Sunday, advance to Monday
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getDefaultDate());
  const [availableSlots, setAvailableSlots] = useState<TimeSlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Patient inputs
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    referenceNumber: string;
    status: string;
    appointmentDate: string;
    timeSlot: string;
    serviceName: string;
    consultationType: string;
    patientName: string;
  } | null>(null);

  const [copiedRef, setCopiedRef] = useState(false);

  // Initialize service on open
  useEffect(() => {
    if (isBookingOpen) {
      if (selectedServiceId) {
        setServiceId(selectedServiceId);
      } else if (services.length > 0 && !serviceId) {
        setServiceId(services[0]._id);
      }
      setStep('service');
      setSubmitError(null);
      setBookingConfirmation(null);
    }
  }, [isBookingOpen, selectedServiceId, services]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate || !isBookingOpen) return;

    let isMounted = true;
    setIsFetchingSlots(true);
    setSlotError(null);
    setSelectedSlot('');

    fetch(`/api/public/slots?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success && data.data) {
          if (!data.data.isOperatingDay) {
            setSlotError(data.data.reason || 'Clinic is closed on this date.');
            setAvailableSlots([]);
          } else {
            setAvailableSlots(data.data.slots || []);
          }
        } else {
          setSlotError(data.error || 'Failed to load clinic time slots.');
        }
      })
      .catch(() => {
        if (isMounted) setSlotError('Network connection error while checking schedule.');
      })
      .finally(() => {
        if (isMounted) setIsFetchingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, isBookingOpen]);

  if (!isBookingOpen) return null;

  const selectedService = services.find(s => s._id === serviceId) || services[0];

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!patientName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (!patientPhone.trim()) {
      setSubmitError('Please provide a valid contact phone number.');
      return;
    }
    if (!selectedSlot) {
      setSubmitError('Please pick an available time slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || undefined,
        serviceId: selectedService._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        consultationType,
        notes: patientNotes.trim() || undefined
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBookingConfirmation(data.data);
        setStep('confirmed');
      } else {
        setSubmitError(data.error || 'Could not schedule appointment. Please check availability.');
      }
    } catch {
      setSubmitError('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReference = () => {
    if (!bookingConfirmation?.referenceNumber) return;
    navigator.clipboard.writeText(bookingConfirmation.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Request Medical Consultation</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified scheduling with immediate reference code · Demo Outpatient Portal
            </p>
          </div>
          <button
            onClick={closeBooking}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Clean editorial style) */}
        {step !== 'confirmed' && (
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-600">
            <span className={step === 'service' ? 'font-bold text-teal-700' : ''}>
              1. Consultation Service
            </span>
            <span>→</span>
            <span className={step === 'datetime' ? 'font-bold text-teal-700' : ''}>
              2. Date & Time Slot
            </span>
            <span>→</span>
            <span className={step === 'patient' ? 'font-bold text-teal-700' : ''}>
              3. Patient Details
            </span>
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: Select Service */}
          {step === 'service' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Select Medical Service
                </label>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {services.map(s => (
                    <label
                      key={s._id}
                      onClick={() => setServiceId(s._id)}
                      className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                        serviceId === s._id
                          ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            ${s.fee}
                          </span>
                          <span className="text-xs text-slate-500 block tabular-nums">
                            {s.durationMinutes} min
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Consultation Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('in_person')}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                      consultationType === 'in_person'
                        ? 'border-teal-600 bg-teal-50/60 text-teal-900 ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">In-Person Visit</p>
                    <p className="text-xs text-slate-500 mt-0.5">At MediCare Pro Outpatient Suite</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationType('telehealth')}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                      consultationType === 'telehealth'
                        ? 'border-teal-600 bg-teal-50/60 text-teal-900 ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">Telehealth Video</p>
                    <p className="text-xs text-slate-500 mt-0.5">Encrypted remote clinical call</p>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  Continue to Schedule →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date & Time Slot */}
          {step === 'datetime' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Consultation Date
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Clinic working hours: Mon–Fri 08:30–17:00, Sat 09:00–13:30 (Closed Sundays)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Available Time Slots ({selectedDate})
                  </label>
                  {isFetchingSlots && (
                    <span className="text-xs text-teal-600 font-medium">Checking schedule...</span>
                  )}
                </div>

                {slotError ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{slotError} Please pick a different operating date.</span>
                  </div>
                ) : availableSlots.length === 0 && !isFetchingSlots ? (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    No consultation slots available on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center tabular-nums ${
                          !slot.available
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : selectedSlot === slot.time
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500 ring-offset-1'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50'
                        }`}
                        title={!slot.available ? 'Slot is already booked' : 'Click to select slot'}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                {selectedSlot && (
                  <p className="text-xs text-teal-700 font-medium mt-2">
                    Selected: {selectedSlot} on {selectedDate}
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('service')}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep('patient')}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  Continue to Details →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Information */}
          {step === 'patient' && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">Service:</span>
                  <span>{selectedService.name} ({consultationType === 'telehealth' ? 'Telehealth' : 'In-Person'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">Schedule:</span>
                  <span className="tabular-nums font-medium text-teal-700">{selectedDate} at {selectedSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">Consultation Fee:</span>
                  <span className="tabular-nums font-bold text-slate-900">${selectedService.fee}</span>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Non-Sensitive Reason for Visit / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="e.g. Annual wellness checkup, prescription renewal review, or general question."
                  value={patientNotes}
                  onChange={e => setPatientNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Do not submit sensitive diagnostic history. Routine scheduling information only.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  ← Change Time
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <span>Confirm Booking Request</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Confirmation screen */}
          {step === 'confirmed' && bookingConfirmation && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Appointment Request Confirmed!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your appointment slot has been successfully recorded in the clinic database.
                </p>
              </div>

              {/* Reference Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Booking Reference
                  </span>
                  <button
                    onClick={copyReference}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-center py-2">
                  <span className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                    {bookingConfirmation.referenceNumber}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-medium text-slate-800">{bookingConfirmation.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-medium text-slate-800">{bookingConfirmation.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled:</span>
                    <span className="font-medium text-slate-800 tabular-nums">
                      {bookingConfirmation.appointmentDate} at {bookingConfirmation.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Initial Status:</span>
                    <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Pending Staff Review
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Clinic staff will review and approve your slot. You can check the live status at any time using the reference code above in the "Verify Status" tool.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={closeBooking}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-colors"
                >
                  Done & Return to Website
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
