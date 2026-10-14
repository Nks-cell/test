import { DoctorProfile, ClinicSettings, MedicalService, MedicalSpecialty, Appointment, ContactInquiry } from '../../types/index.ts';

export const INITIAL_DOCTOR_PROFILE: DoctorProfile = {
  name: "Dr. Elena Vance, MD",
  title: "Consultant Physician & Preventive Medicine Specialist",
  specialty: "Internal Medicine & Primary Care",
  qualifications: [
    "MD - General Internal Medicine (Distinction)",
    "MBBS - Medical Sciences & Clinical Practice",
    "Fellow - American College of Physicians (FACP)",
    "Board Certified in Lifestyle & Preventive Medicine"
  ],
  experienceYears: 14,
  languages: ["English", "Spanish", "Conversational French"],
  registrationNumber: "DEMO-LIC-94821 (Fictional Demo Registration)",
  bio: "Dr. Elena Vance is an experienced internal medicine specialist dedicated to holistic, evidence-based adult healthcare. Her practice prioritizes long-term preventative health, diagnostic thoroughness, and transparent patient communication.",
  philosophy: "We treat patients as valued partners in their own health journey, combining rigorous clinical diagnostics with empathetic, unhurried consultations.",
  education: [
    { degree: "Residency in Internal Medicine", institution: "Metropolitan Academic Medical Center", year: "2012 - 2015" },
    { degree: "Doctor of Medicine (MD)", institution: "University School of Medicine", year: "2008 - 2012" },
    { degree: "B.Sc. in Human Biology & Biochemistry", institution: "State University", year: "2004 - 2008" }
  ],
  avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRHKk7GsCWKzmlT6iRVKPWBN4HjTbGum4QG5An3V-B8A&s=10"
};

export const INITIAL_CLINIC_SETTINGS: ClinicSettings = {
  name: "MediCare Pro Health Clinic",
  tagline: "Modern outpatient clinic providing comprehensive primary and preventative medical consultations.",
  address: {
    street: "450 Medical Heights Boulevard",
    suite: "Suite 320, Wellness Pavilion",
    city: "San Francisco",
    state: "CA",
    postalCode: "94107",
    country: "United States"
  },
  phone: "+1 (555) 382-7491",
  email: "care@medicarepro-demo.health",
  whatsapp: "+1 (555) 382-7491",
  workingHours: [
    { day: "Monday", open: "08:30", close: "17:00", isClosed: false, slotDurationMinutes: 30 },
    { day: "Tuesday", open: "08:30", close: "17:00", isClosed: false, slotDurationMinutes: 30 },
    { day: "Wednesday", open: "08:30", close: "17:00", isClosed: false, slotDurationMinutes: 30 },
    { day: "Thursday", open: "08:30", close: "17:00", isClosed: false, slotDurationMinutes: 30 },
    { day: "Friday", open: "08:30", close: "16:30", isClosed: false, slotDurationMinutes: 30 },
    { day: "Saturday", open: "09:00", close: "13:30", isClosed: false, slotDurationMinutes: 30 },
    { day: "Sunday", open: "09:00", close: "13:00", isClosed: true, slotDurationMinutes: 30 }
  ],
  holidays: [
    "2026-01-01",
    "2026-05-25",
    "2026-07-04",
    "2026-09-07",
    "2026-11-26",
    "2026-12-25"
  ],
  heroSubtitle: "Book in-person consultations or structured telehealth reviews with verified scheduling and direct doctor care.",
  emergencyNotice: "MediCare Pro is an outpatient primary care practice. If you are experiencing a life-threatening medical emergency, call 911 immediately or go to the nearest hospital emergency room.",
  isAcceptingNewPatients: true,
  appointmentSlotMinutes: 30,
  consultationTypesEnabled: true
};

export const INITIAL_SERVICES: MedicalService[] = [
  {
    _id: "srv_01",
    name: "General Health Consultation",
    category: "Primary Care",
    description: "Thorough clinical examination, symptom investigation, diagnostic workup, and personalized treatment plan for acute or ongoing health concerns.",
    durationMinutes: 30,
    fee: 120,
    currency: "USD",
    preparationInstructions: "Please bring a list of your current medications and recent lab tests if available.",
    isActive: true
  },
  {
    _id: "srv_02",
    name: "Comprehensive Preventive Health Physical",
    category: "Preventive Medicine",
    description: "Extensive annual head-to-toe wellness screening including cardiovascular assessment, metabolic evaluation, and lifestyle risk review.",
    durationMinutes: 45,
    fee: 210,
    currency: "USD",
    preparationInstructions: "Fasting for 8 hours prior to the appointment is recommended for optional same-day blood panels.",
    isActive: true
  },
  {
    _id: "srv_03",
    name: "Chronic Condition Review & Management",
    category: "Internal Medicine",
    description: "Specialized monitoring and medication optimization for hypertension, type 2 diabetes, cholesterol management, and thyroid function.",
    durationMinutes: 30,
    fee: 140,
    currency: "USD",
    preparationInstructions: "Bring your home blood pressure or glucose tracking log from the last 14 days.",
    isActive: true
  },
  {
    _id: "srv_04",
    name: "Diagnostic Lab & Imaging Follow-Up",
    category: "Follow-Up Care",
    description: "Dedicated consultation to review MRI, CT, ultrasound, or pathology laboratory results, discuss clinical implications, and adjust treatment.",
    durationMinutes: 20,
    fee: 85,
    currency: "USD",
    preparationInstructions: "Ensure diagnostic imaging discs or digital portal links have been shared with our front desk prior.",
    isActive: true
  },
  {
    _id: "srv_05",
    name: "Telehealth Medical Consultation",
    category: "Virtual Care",
    description: "Secure, encrypted video consultation for non-emergency general medical follow-ups, medication reviews, and health questions from home.",
    durationMinutes: 25,
    fee: 95,
    currency: "USD",
    preparationInstructions: "Test your camera and microphone in a quiet, well-lit private space 5 minutes before scheduled start.",
    isActive: true
  },
  {
    _id: "srv_06",
    name: "Pre-Travel & Immunization Consultation",
    category: "Travel Medicine",
    description: "Destination-specific clinical health risk assessment, required vaccination schedules, and prophylaxis prescriptions for international travel.",
    durationMinutes: 30,
    fee: 110,
    currency: "USD",
    preparationInstructions: "Provide your itinerary, travel dates, and existing immunization record.",
    isActive: true
  }
];

export const INITIAL_SPECIALTIES: MedicalSpecialty[] = [
  {
    id: "internal_medicine",
    name: "Internal Medicine",
    tagline: "Adult disease prevention, diagnosis, and long-term wellness.",
    description: "Comprehensive adult medical care covering multisystem conditions, preventive screening, and chronic disease stabilization.",
    iconName: "Stethoscope",
    isAvailableInDemo: true
  },
  {
    id: "preventive_care",
    name: "Preventive Cardiology & Metabolic Health",
    tagline: "Early risk detection and cardiovascular optimization.",
    description: "Proactive screening for arterial health, lipid disorders, metabolic syndrome, and lifestyle-driven vascular protection.",
    iconName: "HeartPulse",
    isAvailableInDemo: true
  },
  {
    id: "pediatrics",
    name: "Pediatrics & Family Care",
    tagline: "Configurable specialty module for family and pediatric clinics.",
    description: "Developmental milestones, pediatric wellness exams, and childhood vaccination programs (available when configured for pediatricians).",
    iconName: "Baby",
    isAvailableInDemo: false
  },
  {
    id: "dermatology",
    name: "Clinical Dermatology",
    tagline: "Configurable specialty module for dermatology practices.",
    description: "Skin pathology screening, dermoscopy, allergic skin reactions, and clinical lesion evaluations (configurable for dermatologists).",
    iconName: "Sparkles",
    isAvailableInDemo: false
  },
  {
    id: "orthopedics",
    name: "Orthopedics & Joint Health",
    tagline: "Configurable specialty module for orthopedic specialists.",
    description: "Musculoskeletal injuries, joint pain management, osteoarthritis care, and post-surgical rehabilitation guidance.",
    iconName: "Activity",
    isAvailableInDemo: false
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    _id: "apt_101",
    referenceNumber: "MCP-2610-8421",
    patientName: "Marcus Sterling (Sample Demo)",
    patientPhone: "+1 (555) 234-5678",
    patientEmail: "marcus.demo@example.com",
    serviceId: "srv_02",
    serviceName: "Comprehensive Preventive Health Physical",
    appointmentDate: "2026-10-16",
    timeSlot: "09:30 AM",
    consultationType: "in_person",
    notes: "Annual preventive physical examination. Requesting cholesterol panel.",
    status: "confirmed",
    adminNotes: "Confirmed after telephone pre-screening. Fasting guidelines sent.",
    isDemoRecord: true,
    createdAt: "2026-10-12T10:15:00.000Z",
    updatedAt: "2026-10-12T11:30:00.000Z"
  },
  {
    _id: "apt_102",
    referenceNumber: "MCP-2610-8422",
    patientName: "Hannah Chen (Sample Demo)",
    patientPhone: "+1 (555) 345-6789",
    patientEmail: "hannah.chen.demo@example.com",
    serviceId: "srv_01",
    serviceName: "General Health Consultation",
    appointmentDate: "2026-10-16",
    timeSlot: "11:00 AM",
    consultationType: "in_person",
    notes: "Persistent mild headache and fatigue over the past fortnight.",
    status: "pending",
    adminNotes: "",
    isDemoRecord: true,
    createdAt: "2026-10-13T14:20:00.000Z",
    updatedAt: "2026-10-13T14:20:00.000Z"
  },
  {
    _id: "apt_103",
    referenceNumber: "MCP-2610-8423",
    patientName: "Arthur Pendelton (Sample Demo)",
    patientPhone: "+1 (555) 456-7890",
    patientEmail: "arthur.p.demo@example.com",
    serviceId: "srv_03",
    serviceName: "Chronic Condition Review & Management",
    appointmentDate: "2026-10-19",
    timeSlot: "14:00 PM",
    consultationType: "in_person",
    notes: "Hypertension 6-month refill assessment and blood pressure log check.",
    status: "confirmed",
    adminNotes: "Patient reminded to bring blood pressure journal.",
    isDemoRecord: true,
    createdAt: "2026-10-13T16:45:00.000Z",
    updatedAt: "2026-10-14T08:10:00.000Z"
  },
  {
    _id: "apt_104",
    referenceNumber: "MCP-2610-8424",
    patientName: "Sophia Rodriguez (Sample Demo)",
    patientPhone: "+1 (555) 567-8901",
    patientEmail: "sophia.rodriguez.demo@example.com",
    serviceId: "srv_05",
    serviceName: "Telehealth Medical Consultation",
    appointmentDate: "2026-10-20",
    timeSlot: "10:00 AM",
    consultationType: "telehealth",
    notes: "Lab results follow-up via video call.",
    status: "pending",
    adminNotes: "",
    isDemoRecord: true,
    createdAt: "2026-10-14T03:10:00.000Z",
    updatedAt: "2026-10-14T03:10:00.000Z"
  }
];

export const INITIAL_INQUIRIES: ContactInquiry[] = [
  {
    _id: "inq_01",
    name: "David Miller (Sample Demo)",
    emailOrPhone: "david.miller.demo@example.com",
    category: "appointment",
    message: "Hello Dr. Vance, do you have any weekend slots available for new patient preventive checkups next month?",
    status: "new",
    createdAt: "2026-10-13T16:00:00.000Z"
  },
  {
    _id: "inq_02",
    name: "Rachel Green (Sample Demo)",
    emailOrPhone: "+1 (555) 901-2345",
    category: "billing",
    message: "Does your practice accept Anthem Blue Cross PPO for outpatient specialist consultations?",
    status: "reviewed",
    notes: "Provided fee schedule and out-of-network superbill info.",
    createdAt: "2026-10-12T09:30:00.000Z"
  }
];
