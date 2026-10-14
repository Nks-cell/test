import mongoose, { Schema } from 'mongoose';

// Doctor Profile Schema
export const DoctorProfileSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  specialty: { type: String, required: true },
  qualifications: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  languages: [{ type: String }],
  registrationNumber: { type: String, default: 'DEMO-REG' },
  bio: { type: String, required: true },
  philosophy: { type: String, required: true },
  education: [
    {
      degree: { type: String },
      institution: { type: String },
      year: { type: String }
    }
  ],
  avatarUrl: { type: String, default: '' }
}, { timestamps: true });

// Clinic Settings Schema
export const ClinicSettingsSchema = new Schema({
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    suite: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  whatsapp: { type: String, required: true },
  workingHours: [
    {
      day: { type: String, required: true },
      open: { type: String, required: true },
      close: { type: String, required: true },
      isClosed: { type: Boolean, default: false },
      slotDurationMinutes: { type: Number, default: 30 }
    }
  ],
  holidays: [{ type: String }],
  heroSubtitle: { type: String, default: '' },
  emergencyNotice: { type: String, default: '' },
  isAcceptingNewPatients: { type: Boolean, default: true },
  appointmentSlotMinutes: { type: Number, default: 30 },
  consultationTypesEnabled: { type: Boolean, default: true }
}, { timestamps: true });

// Service Schema
export const ServiceSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  durationMinutes: { type: Number, default: 30 },
  fee: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  preparationInstructions: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Appointment Schema
export const AppointmentSchema = new Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true },
  patientName: { type: String, required: true, trim: true },
  patientPhone: { type: String, required: true, trim: true },
  patientEmail: { type: String, trim: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  appointmentDate: { type: String, required: true, index: true }, // "YYYY-MM-DD"
  timeSlot: { type: String, required: true }, // "09:30 AM"
  consultationType: { type: String, enum: ['in_person', 'telehealth'], default: 'in_person' },
  notes: { type: String, maxlength: 500 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  adminNotes: { type: String },
  rejectionReason: { type: String },
  notificationLog: [
    {
      channel: { type: String },
      status: { type: String },
      timestamp: { type: String },
      details: { type: String }
    }
  ],
  isDemoRecord: { type: Boolean, default: true }
}, { timestamps: true });

// Enforce compound uniqueness for confirmed slots to prevent double-booking at DB level
AppointmentSchema.index({ appointmentDate: 1, timeSlot: 1, status: 1 });

// Contact Inquiry Schema
export const ContactInquirySchema = new Schema({
  name: { type: String, required: true, trim: true },
  emailOrPhone: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['general', 'appointment', 'facilities', 'billing'],
    default: 'general'
  },
  message: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ['new', 'reviewed', 'resolved'], default: 'new' },
  notes: { type: String }
}, { timestamps: true });

// Admin User Schema
export const AdminUserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'clinic_staff'], default: 'super_admin' },
  lastLoginAt: { type: Date }
}, { timestamps: true });

// Mongoose Models
export const DoctorProfileModel = mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', DoctorProfileSchema);
export const ClinicSettingsModel = mongoose.models.ClinicSettings || mongoose.model('ClinicSettings', ClinicSettingsSchema);
export const ServiceModel = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
export const AppointmentModel = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const ContactInquiryModel = mongoose.models.ContactInquiry || mongoose.model('ContactInquiry', ContactInquirySchema);
export const AdminUserModel = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
