import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  INITIAL_DOCTOR_PROFILE,
  INITIAL_CLINIC_SETTINGS,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_INQUIRIES
} from './seedData.ts';
import {
  DoctorProfile,
  ClinicSettings,
  MedicalService,
  Appointment,
  ContactInquiry
} from '../../types/index.ts';
import { isUsingSupabase, supabaseRepository } from './supabaseRepository.ts';

// In-Memory Fallback State (initialized with seed data)
class MemoryDataStore {
  doctorProfile: DoctorProfile = { ...INITIAL_DOCTOR_PROFILE };
  clinicSettings: ClinicSettings = { ...INITIAL_CLINIC_SETTINGS };
  services: MedicalService[] = [...INITIAL_SERVICES];
  appointments: Appointment[] = [...INITIAL_APPOINTMENTS];
  inquiries: ContactInquiry[] = [...INITIAL_INQUIRIES];
  adminUsers: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: 'super_admin' | 'clinic_staff';
  }> = [];

  constructor() {
    // Provision default admin in memory
    const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'ClinicAdmin2026!';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPass, salt);
    this.adminUsers.push({
      id: 'admin_01',
      email: (process.env.ADMIN_DEFAULT_EMAIL || 'admin@medicarepro.demo').toLowerCase(),
      passwordHash: hash,
      name: 'Dr. Elena Vance (Admin)',
      role: 'super_admin'
    });
  }
}

export const memoryStore = new MemoryDataStore();

let isMongoConnected = false;

export async function initDatabaseConnection(): Promise<{ connectedToAtlas: boolean; status: string }> {
  // 1. Check if Supabase PostgreSQL is configured
  if (isUsingSupabase()) {
    console.log('[DB] Connected to Supabase PostgreSQL database.');
    return { connectedToAtlas: false, status: 'Connected to Supabase PostgreSQL' };
  }

  // 2. Check if MongoDB Atlas is configured
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<db_user>') || uri.includes('<username>')) {
    console.log('[DB] Running in resilient Demo Mode with seed records.');
    return { connectedToAtlas: false, status: 'Demo In-Memory Mode (Connect Supabase or MongoDB Atlas)' };
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log('[DB] Connected to MongoDB Atlas successfully.');
    return { connectedToAtlas: true, status: 'Connected to MongoDB Atlas' };
  } catch (error) {
    console.warn('[DB] Database connection unsuccessful. Operating in seamless Demo Mode fallback.', error);
    isMongoConnected = false;
    return { connectedToAtlas: false, status: 'Fallback Demo Mode Active' };
  }
}

export function isUsingMongo(): boolean {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

// Unified Data Access Repository (Abstracts Supabase / MongoDB / Memory store seamlessly)
export const dbRepository = {
  // Doctor Profile
  async getDoctorProfile(): Promise<DoctorProfile> {
    if (isUsingSupabase()) {
      const data = await supabaseRepository.getDoctorProfile();
      if (data) return data;
    }
    return memoryStore.doctorProfile;
  },

  async updateDoctorProfile(updates: Partial<DoctorProfile>): Promise<DoctorProfile> {
    if (isUsingSupabase()) {
      const data = await supabaseRepository.updateDoctorProfile(updates);
      if (data) {
        memoryStore.doctorProfile = data;
        return data;
      }
    }
    memoryStore.doctorProfile = {
      ...memoryStore.doctorProfile,
      ...updates
    };
    return memoryStore.doctorProfile;
  },

  // Clinic Settings
  async getClinicSettings(): Promise<ClinicSettings> {
    if (isUsingSupabase()) {
      const data = await supabaseRepository.getClinicSettings();
      if (data) return data;
    }
    return memoryStore.clinicSettings;
  },

  async updateClinicSettings(updates: Partial<ClinicSettings>): Promise<ClinicSettings> {
    if (isUsingSupabase()) {
      const data = await supabaseRepository.updateClinicSettings(updates);
      if (data) {
        memoryStore.clinicSettings = data;
        return data;
      }
    }
    memoryStore.clinicSettings = {
      ...memoryStore.clinicSettings,
      ...updates
    };
    return memoryStore.clinicSettings;
  },

  // Services
  async getServices(): Promise<MedicalService[]> {
    if (isUsingSupabase()) {
      const data = await supabaseRepository.getServices();
      if (data && data.length > 0) return data;
    }
    return memoryStore.services;
  },

  async createService(data: Omit<MedicalService, '_id'>): Promise<MedicalService> {
    if (isUsingSupabase()) {
      const created = await supabaseRepository.createService(data);
      if (created) {
        memoryStore.services.push(created);
        return created;
      }
    }
    const newService: MedicalService = {
      ...data,
      _id: `srv_${Date.now()}`
    };
    memoryStore.services.push(newService);
    return newService;
  },

  async updateService(id: string, updates: Partial<MedicalService>): Promise<MedicalService | null> {
    const index = memoryStore.services.findIndex(s => s._id === id);
    if (index === -1) return null;
    memoryStore.services[index] = { ...memoryStore.services[index], ...updates };
    return memoryStore.services[index];
  },

  async deleteService(id: string): Promise<boolean> {
    const index = memoryStore.services.findIndex(s => s._id === id);
    if (index === -1) return false;
    memoryStore.services.splice(index, 1);
    return true;
  },

  // Appointments
  async getAppointments(filters?: { status?: string; date?: string; search?: string }): Promise<Appointment[]> {
    if (isUsingSupabase()) {
      const data = await supabaseRepository.getAppointments(filters);
      if (data) return data;
    }

    let result = [...memoryStore.appointments];

    if (filters?.status && filters.status !== 'all') {
      result = result.filter(a => a.status === filters.status);
    }

    if (filters?.date) {
      result = result.filter(a => a.appointmentDate === filters.date);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a =>
        a.patientName.toLowerCase().includes(q) ||
        a.referenceNumber.toLowerCase().includes(q) ||
        a.patientPhone.includes(q) ||
        (a.patientEmail && a.patientEmail.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAppointmentByReference(referenceNumber: string): Promise<Appointment | null> {
    if (isUsingSupabase()) {
      const client = (await import('./supabaseRepository.ts')).getSupabaseServerClient();
      if (client) {
        const { data } = await client
          .from('appointments')
          .select('*')
          .ilike('reference_number', referenceNumber)
          .single();
        if (data) {
          return {
            _id: data.id,
            referenceNumber: data.reference_number,
            patientName: data.patient_name,
            patientPhone: data.patient_phone,
            patientEmail: data.patient_email,
            serviceId: data.service_id,
            serviceName: data.service_name,
            appointmentDate: data.appointment_date,
            timeSlot: data.time_slot,
            consultationType: data.consultation_type,
            notes: data.notes,
            status: data.status,
            isDemoRecord: data.is_demo_record,
            notificationLog: data.notification_log || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
        }
      }
    }
    const apt = memoryStore.appointments.find(a => a.referenceNumber.toUpperCase() === referenceNumber.toUpperCase());
    return apt || null;
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const apt = memoryStore.appointments.find(a => a._id === id);
    return apt || null;
  },

  async isSlotBooked(date: string, timeSlot: string, excludeId?: string): Promise<boolean> {
    if (isUsingSupabase()) {
      const client = (await import('./supabaseRepository.ts')).getSupabaseServerClient();
      if (client) {
        let query = client
          .from('appointments')
          .select('id')
          .eq('appointment_date', date)
          .eq('time_slot', timeSlot)
          .in('status', ['confirmed', 'pending']);
        if (excludeId) query = query.neq('id', excludeId);
        const { data } = await query;
        if (data && data.length > 0) return true;
      }
    }

    // Only 'confirmed' or 'pending' appointments block the slot
    return memoryStore.appointments.some(a =>
      a.appointmentDate === date &&
      a.timeSlot === timeSlot &&
      (a.status === 'confirmed' || a.status === 'pending') &&
      (!excludeId || a._id !== excludeId)
    );
  },

  async createAppointment(appointmentData: Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    if (isUsingSupabase()) {
      const created = await supabaseRepository.createAppointment(appointmentData);
      if (created) {
        memoryStore.appointments.push(created);
        return created;
      }
    }

    const newAppointment: Appointment = {
      ...appointmentData,
      _id: `apt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryStore.appointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    if (isUsingSupabase()) {
      const client = (await import('./supabaseRepository.ts')).getSupabaseServerClient();
      if (client) {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
        if (updates.rejectionReason !== undefined) payload.rejection_reason = updates.rejectionReason;
        if (updates.appointmentDate !== undefined) payload.appointment_date = updates.appointmentDate;
        if (updates.timeSlot !== undefined) payload.time_slot = updates.timeSlot;
        if (updates.notificationLog !== undefined) payload.notification_log = updates.notificationLog;

        await client.from('appointments').update(payload).eq('id', id);
      }
    }

    const index = memoryStore.appointments.findIndex(a => a._id === id);
    if (index === -1) return null;
    memoryStore.appointments[index] = {
      ...memoryStore.appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return memoryStore.appointments[index];
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (isUsingSupabase()) {
      const client = (await import('./supabaseRepository.ts')).getSupabaseServerClient();
      if (client) {
        await client.from('appointments').delete().eq('id', id);
      }
    }

    const index = memoryStore.appointments.findIndex(a => a._id === id);
    if (index === -1) return false;
    memoryStore.appointments.splice(index, 1);
    return true;
  },

  // Contact Inquiries
  async getInquiries(filters?: { status?: string }): Promise<ContactInquiry[]> {
    if (isUsingSupabase()) {
      const data = await supabaseRepository.getInquiries(filters);
      if (data) return data;
    }

    let result = [...memoryStore.inquiries];
    if (filters?.status && filters.status !== 'all') {
      result = result.filter(i => i.status === filters.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createInquiry(data: Omit<ContactInquiry, '_id' | 'createdAt'>): Promise<ContactInquiry> {
    if (isUsingSupabase()) {
      const created = await supabaseRepository.createInquiry(data);
      if (created) {
        memoryStore.inquiries.push(created);
        return created;
      }
    }

    const newInquiry: ContactInquiry = {
      ...data,
      _id: `inq_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    memoryStore.inquiries.push(newInquiry);
    return newInquiry;
  },

  async updateInquiry(id: string, updates: Partial<ContactInquiry>): Promise<ContactInquiry | null> {
    if (isUsingSupabase()) {
      const client = (await import('./supabaseRepository.ts')).getSupabaseServerClient();
      if (client) {
        await client.from('contact_inquiries').update(updates).eq('id', id);
      }
    }

    const index = memoryStore.inquiries.findIndex(i => i._id === id);
    if (index === -1) return null;
    memoryStore.inquiries[index] = { ...memoryStore.inquiries[index], ...updates };
    return memoryStore.inquiries[index];
  },

  async deleteInquiry(id: string): Promise<boolean> {
    if (isUsingSupabase()) {
      const client = (await import('./supabaseRepository.ts')).getSupabaseServerClient();
      if (client) {
        await client.from('contact_inquiries').delete().eq('id', id);
      }
    }

    const index = memoryStore.inquiries.findIndex(i => i._id === id);
    if (index === -1) return false;
    memoryStore.inquiries.splice(index, 1);
    return true;
  },

  // Admin User
  async findAdminByEmail(email: string) {
    if (isUsingSupabase()) {
      const client = (await import('./supabaseRepository.ts')).getSupabaseServerClient();
      if (client) {
        const { data } = await client
          .from('admin_users')
          .select('*')
          .ilike('email', email.toLowerCase())
          .single();
        if (data) {
          return {
            id: data.id,
            email: data.email,
            passwordHash: data.password_hash,
            name: data.name,
            role: data.role
          };
        }
      }
    }
    return memoryStore.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async updateAdminPassword(email: string, newHash: string) {
    const user = memoryStore.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.passwordHash = newHash;
      return true;
    }
    return false;
  }
};
