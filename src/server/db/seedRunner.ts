import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  DoctorProfileModel,
  ClinicSettingsModel,
  ServiceModel,
  AppointmentModel,
  ContactInquiryModel,
  AdminUserModel
} from './models.ts';
import {
  INITIAL_DOCTOR_PROFILE,
  INITIAL_CLINIC_SETTINGS,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_INQUIRIES
} from './seedData.ts';

dotenv.config();

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<db_user>')) {
    console.log('[Seed] Notice: MONGODB_URI not configured for Atlas. MediCare Pro runs out-of-the-box with memory fallback seed data.');
    process.exit(0);
  }

  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected.');

    // 1. Doctor Profile
    await DoctorProfileModel.deleteMany({});
    await DoctorProfileModel.create(INITIAL_DOCTOR_PROFILE);
    console.log('[Seed] Doctor profile seeded.');

    // 2. Clinic Settings
    await ClinicSettingsModel.deleteMany({});
    await ClinicSettingsModel.create(INITIAL_CLINIC_SETTINGS);
    console.log('[Seed] Clinic settings seeded.');

    // 3. Services
    await ServiceModel.deleteMany({});
    await ServiceModel.insertMany(INITIAL_SERVICES.map(({ _id, ...rest }) => rest));
    console.log('[Seed] Medical services seeded.');

    // 4. Appointments
    await AppointmentModel.deleteMany({});
    await AppointmentModel.insertMany(INITIAL_APPOINTMENTS.map(({ _id, ...rest }) => rest));
    console.log('[Seed] Initial sample appointments seeded.');

    // 5. Inquiries
    await ContactInquiryModel.deleteMany({});
    await ContactInquiryModel.insertMany(INITIAL_INQUIRIES.map(({ _id, ...rest }) => rest));
    console.log('[Seed] Sample inquiries seeded.');

    // 6. Admin User Provisioning
    await AdminUserModel.deleteMany({});
    const email = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@medicarepro.demo').toLowerCase();
    const rawPass = process.env.ADMIN_DEFAULT_PASSWORD || 'ClinicAdmin2026!';
    const passwordHash = await bcrypt.hash(rawPass, 10);

    await AdminUserModel.create({
      email,
      passwordHash,
      name: 'Dr. Elena Vance (Lead Admin)',
      role: 'super_admin'
    });
    console.log(`[Seed] Administrator provisioned: ${email}`);

    console.log('[Seed] Complete! Database is populated with pristine demonstration records.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
}

seedDatabase();
