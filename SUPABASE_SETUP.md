# Supabase Setup & Deployment Guide for MediCare Pro

This guide explains how to connect and deploy **MediCare Pro** to **Supabase**.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose an Organization, Name (e.g. `medicare-pro`), strong Database Password, and Region closest to your users.
4. Click **Create new project** and wait ~1 minute for provisioning.

---

## 2. Run Database Migration in Supabase SQL Editor

We have included a complete migration file located at:
📁 `supabase/schema.sql`

1. In your Supabase Dashboard, open the **SQL Editor** tab (icon with `>_` on the left sidebar).
2. Click **New Query**.
3. Copy the entire contents of `supabase/schema.sql` and paste them into the editor.
4. Click **Run** (or `Cmd/Ctrl + Enter`).

### What this creates:
- ✅ `public.doctor_profiles` — Physician bio, credentials, qualifications, and education.
- ✅ `public.clinic_settings` — Outpatient working hours, address, phone, and emergency disclaimer.
- ✅ `public.services` — Consultation catalog with duration, fees, and instructions.
- ✅ `public.appointments` — Appointment records with unique booking reference codes.
- ✅ `idx_unique_active_slot` — **PostgreSQL Partial Unique Index** enforcing conflict-free slot scheduling at the database engine level!
- ✅ `public.contact_inquiries` — Patient inquiries from the contact form.
- ✅ `public.admin_users` — Administrator credentials.
- ✅ **Row Level Security (RLS)** — Secure public read policies, public booking inserts, and protected administrative controls.
- ✅ **Pristine Seed Data** — Doctor Elena Vance profile, clinic settings, 6 medical services, and sample appointments.

---

## 3. Retrieve Supabase API Credentials

1. In your Supabase Dashboard, click the **Settings** (gear) icon → **API** (or **Project Settings** → **Data API**).
2. Note the following values:
   - **Project URL**: e.g., `https://xyzcompany.supabase.co`
   - **anon / public key**: `eyJhbGci...`
   - **service_role key**: `eyJhbGci...` (keep secret, used on the backend)

---

## 4. Configure Your Environment Variables

Create or update your `.env` file with these values:

```env
# Supabase Project URL
SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"

# Supabase Keys
SUPABASE_ANON_KEY="your-anon-public-key"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

# Admin default credentials
ADMIN_DEFAULT_EMAIL="admin@medicarepro.demo"
ADMIN_DEFAULT_PASSWORD="ClinicAdmin2026!"
```

---

## 5. Verify Supabase Connection

Start the development server:
```bash
npm run dev
```

The server will automatically detect your Supabase credentials:
```
[DB] Connected to Supabase PostgreSQL database.
[MediCare Pro] Server running on http://0.0.0.0:3000
```

When you:
- Book an appointment on the website, it is inserted directly into your Supabase `appointments` table.
- Edit doctor information or clinic hours in the Admin Dashboard, it updates your Supabase `doctor_profiles` or `clinic_settings` table.
- Double bookings on the same slot are blocked by PostgreSQL constraints!

---

## 6. Production Deployment Options

### Option A: Vercel / Netlify (Full-Stack or Frontend + Serverless)
1. Push your repository to GitHub.
2. Import the project in Vercel or Netlify.
3. Add the environment variables from Section 4 under **Project Settings → Environment Variables**.
4. Set Build Command: `npm run build`
5. Output Directory: `dist`

### Option B: Render / Railway / Docker
1. Create a Web Service connected to your repository.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`
4. Add the environment variables in the service dashboard.
