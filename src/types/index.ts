export interface DoctorProfile {
  name: string;
  title: string;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  languages: string[];
  registrationNumber: string; // Clearly labeled as demo registration
  bio: string;
  philosophy: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  avatarUrl: string;
}

export interface WorkingDaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  open: string; // e.g. "09:00"
  close: string; // e.g. "17:00"
  isClosed: boolean;
  slotDurationMinutes: number;
}

export interface ClinicSettings {
  name: string;
  tagline: string;
  address: {
    street: string;
    suite?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  whatsapp: string;
  workingHours: WorkingDaySchedule[];
  holidays: string[]; // YYYY-MM-DD
  heroSubtitle: string;
  emergencyNotice: string;
  isAcceptingNewPatients: boolean;
  appointmentSlotMinutes: number;
  consultationTypesEnabled: boolean;
}

export interface MedicalService {
  _id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  fee: number;
  currency: string;
  preparationInstructions?: string;
  isActive: boolean;
}

export interface MedicalSpecialty {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  isAvailableInDemo: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ConsultationType = 'in_person' | 'telehealth';

export interface Appointment {
  _id: string;
  referenceNumber: string; // e.g. "MCP-2610-8491"
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string; // "YYYY-MM-DD"
  timeSlot: string; // "09:30 AM"
  consultationType: ConsultationType;
  notes?: string;
  status: AppointmentStatus;
  adminNotes?: string;
  rejectionReason?: string;
  notificationLog?: Array<{
    channel: 'email' | 'whatsapp' | 'sms';
    status: 'simulated_success' | 'delivered' | 'failed' | 'pending';
    timestamp: string;
    details: string;
  }>;
  isDemoRecord: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiry {
  _id: string;
  name: string;
  emailOrPhone: string;
  category: 'general' | 'appointment' | 'facilities' | 'billing';
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  notes?: string;
  createdAt: string;
}

export interface AdminUserSession {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'clinic_staff';
}

export interface TimeSlotOption {
  time: string; // "09:00 AM"
  available: boolean;
  reason?: string;
}
