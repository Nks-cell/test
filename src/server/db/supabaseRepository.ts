import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DoctorProfile, ClinicSettings, MedicalService, Appointment, ContactInquiry } from '../../types/index.ts';

let serverSupabaseClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (serverSupabaseClient) return serverSupabaseClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://iykjnanfjawsxclupxdh.supabase.co';
  // Prefer Service Role key on server for full administrative bypass of RLS, else Anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3StYhSVbTXibRpD59YBQfQ_PfbILdlD';

  if (url && key && !url.includes('example.supabase.co') && !url.includes('placeholder')) {
    serverSupabaseClient = createClient(url, key);
    return serverSupabaseClient;
  }

  return null;
}

export function isUsingSupabase(): boolean {
  return Boolean(getSupabaseServerClient());
}

export const supabaseRepository = {
  async getDoctorProfile(): Promise<DoctorProfile | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;
    const { data, error } = await client
      .from('doctor_profiles')
      .select('*')
      .eq('id', 'primary_doctor')
      .single();
    if (error || !data) return null;

    return {
      name: data.name,
      title: data.title,
      specialty: data.specialty,
      qualifications: data.qualifications || [],
      experienceYears: data.experience_years || 0,
      languages: data.languages || [],
      registrationNumber: data.registration_number || '',
      bio: data.bio,
      philosophy: data.philosophy,
      education: data.education || [],
      avatarUrl: data.avatar_url || ''
    };
  },

  async updateDoctorProfile(updates: Partial<DoctorProfile>): Promise<DoctorProfile | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.specialty !== undefined) payload.specialty = updates.specialty;
    if (updates.qualifications !== undefined) payload.qualifications = updates.qualifications;
    if (updates.experienceYears !== undefined) payload.experience_years = updates.experienceYears;
    if (updates.languages !== undefined) payload.languages = updates.languages;
    if (updates.registrationNumber !== undefined) payload.registration_number = updates.registrationNumber;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.philosophy !== undefined) payload.philosophy = updates.philosophy;
    if (updates.education !== undefined) payload.education = updates.education;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { data, error } = await client
      .from('doctor_profiles')
      .update(payload)
      .eq('id', 'primary_doctor')
      .select()
      .single();

    if (error || !data) return null;
    return this.getDoctorProfile();
  },

  async getClinicSettings(): Promise<ClinicSettings | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const { data, error } = await client
      .from('clinic_settings')
      .select('*')
      .eq('id', 'primary_clinic')
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      tagline: data.tagline,
      address: data.address || {},
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      workingHours: data.working_hours || [],
      holidays: data.holidays || [],
      heroSubtitle: data.hero_subtitle || '',
      emergencyNotice: data.emergency_notice || '',
      isAcceptingNewPatients: data.is_accepting_new_patients,
      appointmentSlotMinutes: data.appointment_slot_minutes || 30,
      consultationTypesEnabled: data.consultation_types_enabled
    };
  },

  async updateClinicSettings(updates: Partial<ClinicSettings>): Promise<ClinicSettings | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.tagline !== undefined) payload.tagline = updates.tagline;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
    if (updates.workingHours !== undefined) payload.working_hours = updates.workingHours;
    if (updates.holidays !== undefined) payload.holidays = updates.holidays;
    if (updates.heroSubtitle !== undefined) payload.hero_subtitle = updates.heroSubtitle;
    if (updates.emergencyNotice !== undefined) payload.emergency_notice = updates.emergencyNotice;
    if (updates.isAcceptingNewPatients !== undefined) payload.is_accepting_new_patients = updates.isAcceptingNewPatients;
    if (updates.appointmentSlotMinutes !== undefined) payload.appointment_slot_minutes = updates.appointmentSlotMinutes;
    if (updates.consultationTypesEnabled !== undefined) payload.consultation_types_enabled = updates.consultationTypesEnabled;

    const { error } = await client
      .from('clinic_settings')
      .update(payload)
      .eq('id', 'primary_clinic');

    if (error) return null;
    return this.getClinicSettings();
  },

  async getServices(): Promise<MedicalService[] | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const { data, error } = await client
      .from('services')
      .select('*')
      .order('fee', { ascending: true });

    if (error || !data) return null;

    return data.map((d: any) => ({
      _id: d.id,
      name: d.name,
      category: d.category,
      description: d.description,
      durationMinutes: d.duration_minutes,
      fee: Number(d.fee),
      currency: d.currency,
      preparationInstructions: d.preparation_instructions,
      isActive: d.is_active
    }));
  },

  async createService(item: Omit<MedicalService, '_id'>): Promise<MedicalService | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const id = `srv_${Date.now()}`;
    const { data, error } = await client
      .from('services')
      .insert({
        id,
        name: item.name,
        category: item.category,
        description: item.description,
        duration_minutes: item.durationMinutes,
        fee: item.fee,
        currency: item.currency || 'USD',
        preparation_instructions: item.preparationInstructions,
        is_active: item.isActive
      })
      .select()
      .single();

    if (error || !data) return null;
    return {
      _id: data.id,
      name: data.name,
      category: data.category,
      description: data.description,
      durationMinutes: data.duration_minutes,
      fee: Number(data.fee),
      currency: data.currency,
      preparationInstructions: data.preparation_instructions,
      isActive: data.is_active
    };
  },

  async getAppointments(filters?: { status?: string; date?: string; search?: string }): Promise<Appointment[] | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    let query = client.from('appointments').select('*');

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.date) {
      query = query.eq('appointment_date', filters.date);
    }
    if (filters?.search) {
      query = query.or(`patient_name.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((a: any) => ({
      _id: a.id,
      referenceNumber: a.reference_number,
      patientName: a.patient_name,
      patientPhone: a.patient_phone,
      patientEmail: a.patient_email,
      serviceId: a.service_id,
      serviceName: a.service_name,
      appointmentDate: a.appointment_date,
      timeSlot: a.time_slot,
      consultationType: a.consultation_type,
      notes: a.notes,
      status: a.status,
      adminNotes: a.admin_notes,
      rejectionReason: a.rejection_reason,
      notificationLog: a.notification_log || [],
      isDemoRecord: a.is_demo_record,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }));
  },

  async createAppointment(item: Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Appointment | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const { data, error } = await client
      .from('appointments')
      .insert({
        reference_number: item.referenceNumber,
        patient_name: item.patientName,
        patient_phone: item.patientPhone,
        patient_email: item.patientEmail,
        service_id: item.serviceId,
        service_name: item.serviceName,
        appointment_date: item.appointmentDate,
        time_slot: item.timeSlot,
        consultation_type: item.consultationType,
        notes: item.notes,
        status: item.status || 'pending',
        is_demo_record: item.isDemoRecord ?? true,
        notification_log: item.notificationLog || []
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[Supabase:Appointments:InsertError]', error);
      return null;
    }

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
  },

  async getInquiries(filters?: { status?: string }): Promise<ContactInquiry[] | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    let query = client.from('contact_inquiries').select('*');
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((i: any) => ({
      _id: i.id,
      name: i.name,
      emailOrPhone: i.email_or_phone,
      category: i.category,
      message: i.message,
      status: i.status,
      notes: i.notes,
      createdAt: i.created_at
    }));
  },

  async createInquiry(item: Omit<ContactInquiry, '_id' | 'createdAt'>): Promise<ContactInquiry | null> {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const { data, error } = await client
      .from('contact_inquiries')
      .insert({
        name: item.name,
        email_or_phone: item.emailOrPhone,
        category: item.category,
        message: item.message,
        status: item.status || 'new',
        notes: item.notes
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      _id: data.id,
      name: data.name,
      emailOrPhone: data.email_or_phone,
      category: data.category,
      message: data.message,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at
    };
  }
};
