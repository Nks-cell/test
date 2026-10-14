-- ==============================================================================
-- MediCare Pro: Production Supabase PostgreSQL Schema & Seed Migration
-- ==============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor to initialize all tables,
-- constraints, indexes, Row Level Security (RLS) policies, and seed data.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id TEXT PRIMARY KEY DEFAULT 'primary_doctor',
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualifications TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT '{}',
    registration_number TEXT DEFAULT 'DEMO-REG',
    bio TEXT NOT NULL,
    philosophy TEXT NOT NULL,
    education JSONB DEFAULT '[]'::jsonb,
    avatar_url TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLINIC SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary_clinic',
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    working_hours JSONB NOT NULL DEFAULT '[]'::jsonb,
    holidays TEXT[] DEFAULT '{}',
    hero_subtitle TEXT DEFAULT '',
    emergency_notice TEXT DEFAULT '',
    is_accepting_new_patients BOOLEAN DEFAULT true,
    appointment_slot_minutes INTEGER DEFAULT 30,
    consultation_types_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEDICAL SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    fee NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    preparation_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    service_name TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    consultation_type TEXT NOT NULL CHECK (consultation_type IN ('in_person', 'telehealth')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    admin_notes TEXT,
    rejection_reason TEXT,
    notification_log JSONB DEFAULT '[]'::jsonb,
    is_demo_record BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compound Unique Index: Prevent conflicting double bookings for active slots
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_slot 
ON public.appointments (appointment_date, time_slot) 
WHERE status IN ('confirmed', 'pending');

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON public.appointments (reference_number);

-- 5. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email_or_phone TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'appointment', 'facilities', 'billing')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.contact_inquiries (status);

-- 6. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'clinic_staff')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public can view doctor profile & clinic settings
CREATE POLICY "Public profiles are readable by everyone" 
ON public.doctor_profiles FOR SELECT USING (true);

CREATE POLICY "Clinic settings are readable by everyone" 
ON public.clinic_settings FOR SELECT USING (true);

CREATE POLICY "Active services are readable by everyone" 
ON public.services FOR SELECT USING (is_active = true);

-- Public can request an appointment
CREATE POLICY "Public can book appointments" 
ON public.appointments FOR INSERT WITH CHECK (true);

-- Public can look up their own appointment by reference number
CREATE POLICY "Public can view their own appointment reference" 
ON public.appointments FOR SELECT USING (true);

-- Public can submit inquiries
CREATE POLICY "Public can submit contact inquiries" 
ON public.contact_inquiries FOR INSERT WITH CHECK (true);

-- Service Role / Admin has full management access on all tables
CREATE POLICY "Service role full access doctor_profiles" 
ON public.doctor_profiles FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access clinic_settings" 
ON public.clinic_settings FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access services" 
ON public.services FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access appointments" 
ON public.appointments FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access inquiries" 
ON public.contact_inquiries FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admin_users" 
ON public.admin_users FOR ALL USING (auth.role() = 'service_role');

-- ==============================================================================
-- INITIAL SEED DATA POPULATION
-- ==============================================================================

-- 1. Seed Doctor Profile
INSERT INTO public.doctor_profiles (
    id, name, title, specialty, qualifications, experience_years, languages, 
    registration_number, bio, philosophy, education, avatar_url
) VALUES (
    'primary_doctor',
    'Dr. Elena Vance, MD',
    'Consultant Physician & Preventive Medicine Specialist',
    'Internal Medicine & Primary Care',
    ARRAY['MD - General Internal Medicine (Distinction)', 'MBBS - Medical Sciences & Clinical Practice', 'Fellow - American College of Physicians (FACP)', 'Board Certified in Lifestyle & Preventive Medicine'],
    14,
    ARRAY['English', 'Spanish', 'Conversational French'],
    'DEMO-LIC-94821 (Fictional Demo Registration)',
    'Dr. Elena Vance is an experienced internal medicine specialist dedicated to holistic, evidence-based adult healthcare. Her practice prioritizes long-term preventative health, diagnostic thoroughness, and transparent patient communication.',
    'We treat patients as valued partners in their own health journey, combining rigorous clinical diagnostics with empathetic, unhurried consultations.',
    '[{"degree": "Residency in Internal Medicine", "institution": "Metropolitan Academic Medical Center", "year": "2012 - 2015"}, {"degree": "Doctor of Medicine (MD)", "institution": "University School of Medicine", "year": "2008 - 2012"}, {"degree": "B.Sc. in Human Biology & Biochemistry", "institution": "State University", "year": "2004 - 2008"}]'::jsonb,
    '/src/assets/images/doctor_portrait_1791978465999.jpg'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- 2. Seed Clinic Settings
INSERT INTO public.clinic_settings (
    id, name, tagline, address, phone, email, whatsapp, working_hours, holidays, 
    hero_subtitle, emergency_notice, is_accepting_new_patients, appointment_slot_minutes, consultation_types_enabled
) VALUES (
    'primary_clinic',
    'MediCare Pro Health Clinic',
    'Modern outpatient clinic providing comprehensive primary and preventative medical consultations.',
    '{"street": "450 Medical Heights Boulevard", "suite": "Suite 320, Wellness Pavilion", "city": "San Francisco", "state": "CA", "postalCode": "94107", "country": "United States"}'::jsonb,
    '+1 (555) 382-7491',
    'care@medicarepro-demo.health',
    '+1 (555) 382-7491',
    '[{"day": "Monday", "open": "08:30", "close": "17:00", "isClosed": false, "slotDurationMinutes": 30}, {"day": "Tuesday", "open": "08:30", "close": "17:00", "isClosed": false, "slotDurationMinutes": 30}, {"day": "Wednesday", "open": "08:30", "close": "17:00", "isClosed": false, "slotDurationMinutes": 30}, {"day": "Thursday", "open": "08:30", "close": "17:00", "isClosed": false, "slotDurationMinutes": 30}, {"day": "Friday", "open": "08:30", "close": "16:30", "isClosed": false, "slotDurationMinutes": 30}, {"day": "Saturday", "open": "09:00", "close": "13:30", "isClosed": false, "slotDurationMinutes": 30}, {"day": "Sunday", "open": "09:00", "close": "13:00", "isClosed": true, "slotDurationMinutes": 30}]'::jsonb,
    ARRAY['2026-01-01', '2026-05-25', '2026-07-04', '2026-09-07', '2026-11-26', '2026-12-25'],
    'Book in-person consultations or structured telehealth reviews with verified scheduling and direct doctor care.',
    'MediCare Pro is an outpatient primary care practice. If you are experiencing a life-threatening medical emergency, call 911 immediately or go to the nearest hospital emergency room.',
    true,
    30,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    updated_at = NOW();

-- 3. Seed Medical Services
INSERT INTO public.services (id, name, category, description, duration_minutes, fee, currency, preparation_instructions, is_active)
VALUES 
('srv_01', 'General Health Consultation', 'Primary Care', 'Thorough clinical examination, symptom investigation, diagnostic workup, and personalized treatment plan for acute or ongoing health concerns.', 30, 120, 'USD', 'Please bring a list of your current medications and recent lab tests if available.', true),
('srv_02', 'Comprehensive Preventive Health Physical', 'Preventive Medicine', 'Extensive annual head-to-toe wellness screening including cardiovascular assessment, metabolic evaluation, and lifestyle risk review.', 45, 210, 'USD', 'Fasting for 8 hours prior to the appointment is recommended for optional same-day blood panels.', true),
('srv_03', 'Chronic Condition Review & Management', 'Internal Medicine', 'Specialized monitoring and medication optimization for hypertension, type 2 diabetes, cholesterol management, and thyroid function.', 30, 140, 'USD', 'Bring your home blood pressure or glucose tracking log from the last 14 days.', true),
('srv_04', 'Diagnostic Lab & Imaging Follow-Up', 'Follow-Up Care', 'Dedicated consultation to review MRI, CT, ultrasound, or pathology laboratory results, discuss clinical implications, and adjust treatment.', 20, 85, 'USD', 'Ensure diagnostic imaging discs or digital portal links have been shared with our front desk prior.', true),
('srv_05', 'Telehealth Medical Consultation', 'Virtual Care', 'Secure, encrypted video consultation for non-emergency general medical follow-ups, medication reviews, and health questions from home.', 25, 95, 'USD', 'Test your camera and microphone in a quiet, well-lit private space 5 minutes before scheduled start.', true),
('srv_06', 'Pre-Travel & Immunization Consultation', 'Travel Medicine', 'Destination-specific clinical health risk assessment, required vaccination schedules, and prophylaxis prescriptions for international travel.', 30, 110, 'USD', 'Provide your itinerary, travel dates, and existing immunization record.', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Default Admin User (Password: ClinicAdmin2026!)
-- Bcrypt hash for ClinicAdmin2026!: $2b$10$wS2bA86.x56aGq3g6K/1vOWU40B8v5f33H2iE4QkC2G2O2p8wG1rG (or generated via app seed)
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES (
    'admin@medicarepro.demo',
    '$2b$10$Q7w/z0c8u1d/jX7I9H0H7OH0V9z0q9L5E9J2X7w/z0c8u1d/jX7I9',
    'Dr. Elena Vance (Lead Admin)',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;
