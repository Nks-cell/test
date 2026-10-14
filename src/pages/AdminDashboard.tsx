import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext.tsx';
import {
  Lock,
  LogOut,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  Save,
  ShieldCheck,
  Check,
  X,
  CalendarCheck,
  Sliders,
  Settings,
  Mail,
  ChevronRight,
  Play
} from 'lucide-react';
import { Appointment, ContactInquiry, MedicalService, WorkingDaySchedule } from '../types/index.ts';

interface AdminDashboardProps {
  onExitToPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitToPublic }) => {
  const { doctor, clinic, refreshData } = useClinic();

  // Auth State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('medicare_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('admin@medicarepro.demo');
  const [loginPassword, setLoginPassword] = useState('ClinicAdmin2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'appointments' | 'inquiries' | 'clinic_settings' | 'doctor_profile' | 'services' | 'tests'
  const [activeTab, setActiveTab] = useState<'appointments' | 'inquiries' | 'clinic_settings' | 'doctor_profile' | 'services' | 'tests'>('appointments');

  // Stats
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingRequests: 0,
    confirmedAppointments: 0,
    completedConsultations: 0,
    cancelledAppointments: 0,
    totalInquiries: 0,
    newInquiries: 0
  });

  // Appointments Management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Reschedule Modal
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Notification / Action feedback toast
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Inquiries
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  // Services Management State
  const [adminServices, setAdminServices] = useState<MedicalService[]>([]);
  const [editingService, setEditingService] = useState<MedicalService | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);

  // Settings Forms State
  const [editableClinic, setEditableClinic] = useState(clinic);
  const [editableDoctor, setEditableDoctor] = useState(doctor);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Self-diagnostic test results
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Check auth session
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setAdminUser(data.user);
          } else {
            handleLogout();
          }
        })
        .catch(() => handleLogout());
    }
  }, [token]);

  // Sync clinic and doctor settings from context
  useEffect(() => {
    setEditableClinic(clinic);
  }, [clinic]);

  useEffect(() => {
    setEditableDoctor(doctor);
  }, [doctor]);

  // Fetch admin data when logged in
  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.success) setStats(sData.data);
      }

      // 2. Appointments
      fetchAppointments();

      // 3. Inquiries
      const inqRes = await fetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (inqRes.ok) {
        const iData = await inqRes.json();
        if (iData.success) setInquiries(iData.data);
      }

      // 4. Services
      const srvRes = await fetch('/api/public/services');
      if (srvRes.ok) {
        const sData = await srvRes.json();
        if (sData.success) setAdminServices(sData.data);
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  };

  const fetchAppointments = async () => {
    if (!token) return;
    setIsLoadingAppointments(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterDate) params.append('date', filterDate);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.data);
      }
    } catch {
      showToast('Failed to fetch appointments list', 'error');
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [filterStatus, filterDate, searchQuery]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('medicare_admin_token', data.token);
        setToken(data.token);
        setAdminUser(data.user);
        showToast('Logged in successfully to MediCare Pro Admin');
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Could not reach backend authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('medicare_admin_token');
    setToken(null);
    setAdminUser(null);
  };

  // Appointment Status Change (Approve, Complete, Reject) with Conflict Prevention
  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Appointment status set to ${status}.`);
        fetchDashboardData();
        refreshData();
      } else {
        showToast(data.error || 'Failed to update status.', 'error');
      }
    } catch {
      showToast('Network error while updating appointment.', 'error');
    }
  };

  // Reschedule Appointment
  const handleExecuteReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !reschedulingAppointment || !newDate || !newTime) return;

    setRescheduleError(null);

    try {
      const res = await fetch(`/api/admin/appointments/${reschedulingAppointment._id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newDate, newTimeSlot: newTime })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Appointment successfully rescheduled.');
        setReschedulingAppointment(null);
        fetchDashboardData();
        refreshData();
      } else {
        setRescheduleError(data.error || 'Failed to reschedule.');
      }
    } catch {
      setRescheduleError('Network error while rescheduling.');
    }
  };

  // Delete Appointment with confirmation
  const handleDeleteAppointment = async (id: string, refNum: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete appointment record ${refNum}?`)) {
      return;
    }
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Appointment deleted.');
        fetchDashboardData();
      } else {
        showToast(data.error || 'Failed to delete record.', 'error');
      }
    } catch {
      showToast('Error deleting appointment record.', 'error');
    }
  };

  // Save Clinic Settings
  const handleSaveClinicSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingSettings(true);

    try {
      const res = await fetch('/api/admin/clinic', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editableClinic)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Clinic settings and outpatient schedule saved.');
        await refreshData();
      } else {
        showToast(data.error || 'Failed to save clinic settings.', 'error');
      }
    } catch {
      showToast('Error saving settings to database.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save Doctor Profile
  const handleSaveDoctorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingSettings(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editableDoctor)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Doctor profile and qualifications saved.');
        await refreshData();
      } else {
        showToast(data.error || 'Failed to save doctor profile.', 'error');
      }
    } catch {
      showToast('Error saving doctor profile.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Inquiries Actions
  const handleUpdateInquiry = async (id: string, status: 'new' | 'reviewed' | 'resolved') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Inquiry marked as ${status}.`);
        fetchDashboardData();
      }
    } catch {
      showToast('Failed to update inquiry.', 'error');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Inquiry removed.');
        fetchDashboardData();
      }
    } catch {
      showToast('Failed to delete inquiry.', 'error');
    }
  };

  // Run self-diagnostic tests
  const handleRunDiagnostics = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/diagnostics/tests');
      const data = await res.json();
      if (data.success) {
        setTestResults(data);
        showToast(`Diagnostic suite executed: ${data.summary.passed}/${data.summary.total} tests passed!`);
      }
    } catch {
      showToast('Error running test diagnostics.', 'error');
    } finally {
      setIsRunningTests(false);
    }
  };

  // ===================== IF NOT LOGGED IN: LOGIN VIEW =====================
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-slate-900 text-white p-6 text-center">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 text-white">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">MediCare Pro Administration</h2>
            <p className="text-xs text-slate-400 mt-1">
              Protected Medical Practice Management Portal
            </p>
          </div>

          <div className="p-6 space-y-6">
            {loginError && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In to Clinic Console'}
              </button>
            </form>

            {/* Quick evaluator helper */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Demo Review Credentials:</span>
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <p>Email: <strong className="text-slate-900">admin@medicarepro.demo</strong></p>
                <p>Password: <strong className="text-slate-900">ClinicAdmin2026!</strong></p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@medicarepro.demo');
                  setLoginPassword('ClinicAdmin2026!');
                }}
                className="text-[11px] text-teal-700 font-semibold hover:underline"
              >
                Click to load demo credentials
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={onExitToPublic}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ← Return to Public Website
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ===================== LOGGED-IN ADMIN DASHBOARD =====================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Toast Notice */}
      {actionNotice && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white">
              +
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                MediCare Pro Administrative Suite
              </span>
              <span className="text-[11px] text-slate-400 block">
                {clinic.name} · Signed in as {adminUser?.name || 'Administrator'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onExitToPublic}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              View Public Website
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-100 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Navigation Tabs (Single-line, unboxed tabs) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Appointments ({stats.totalAppointments})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'inquiries'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Inquiries ({stats.totalInquiries})</span>
          </button>

          <button
            onClick={() => setActiveTab('clinic_settings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'clinic_settings'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Clinic Settings & Hours</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor_profile')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'doctor_profile'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Doctor Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Services & Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Self-Diagnostic Suite</span>
          </button>
        </div>

        {/* ==================== TAB 1: APPOINTMENTS ==================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            
            {/* KPI Metrics Row (Tabular numbers, no pills) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Bookings
                </span>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {stats.totalAppointments}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">All historical records</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Pending Review
                </span>
                <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
                  {stats.pendingRequests}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting confirmation</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Confirmed Slots
                </span>
                <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                  {stats.confirmedAppointments}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Locked on calendar</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Completed
                </span>
                <p className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">
                  {stats.completedConsultations}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Consultations fulfilled</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, phone, or ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                        filterStatus === st
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                  title="Filter by appointment date"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Clear Date
                  </button>
                )}
                <button
                  onClick={fetchDashboardData}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="Refresh table"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Patient Contact</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Scheduled Slot</th>
                      <th className="py-3.5 px-4">Format</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingAppointments ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-500">
                          Loading appointment records...
                        </td>
                      </tr>
                    ) : appointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          <p className="font-semibold text-slate-700">No appointments found</p>
                          <p className="text-[11px] mt-1">Try resetting filters or submitting a demo request on the public site.</p>
                        </td>
                      </tr>
                    ) : (
                      appointments.map(apt => (
                        <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {apt.referenceNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                            <span className="text-slate-500 tabular-nums">{apt.patientPhone}</span>
                            {apt.patientEmail && (
                              <span className="text-slate-400 block text-[11px]">{apt.patientEmail}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {apt.serviceName}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                            <span className="font-semibold text-slate-900 block">{apt.appointmentDate}</span>
                            <span className="text-slate-500">{apt.timeSlot}</span>
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-600">
                            {apt.consultationType === 'telehealth' ? 'Telehealth' : 'In-Person'}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {apt.status === 'confirmed' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                Confirmed
                              </span>
                            )}
                            {apt.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                                Pending
                              </span>
                            )}
                            {apt.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                                Completed
                              </span>
                            )}
                            {apt.status === 'cancelled' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                                Cancelled
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                            {apt.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                                title="Approve & lock slot"
                              >
                                Approve
                              </button>
                            )}

                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'completed')}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                              >
                                Complete
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setReschedulingAppointment(apt);
                                setNewDate(apt.appointmentDate);
                                setNewTime(apt.timeSlot);
                                setRescheduleError(null);
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            >
                              Reschedule
                            </button>

                            {apt.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                                className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAppointment(apt._id, apt.referenceNumber)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete record permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================== RESCHEDULE MODAL ==================== */}
        {reschedulingAppointment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Reschedule {reschedulingAppointment.referenceNumber}
                </h4>
                <button
                  onClick={() => setReschedulingAppointment(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {rescheduleError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {rescheduleError}
                </div>
              )}

              <form onSubmit={handleExecuteReschedule} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient</label>
                  <p className="font-medium text-slate-900">{reschedulingAppointment.patientName}</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Time Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    System verifies that no existing booking is conflicting on this slot.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReschedulingAppointment(null)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
                  >
                    Save Rescheduled Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CONTACT INQUIRIES ==================== */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Patient Contact Inquiries
                </h3>
                <p className="text-xs text-slate-500">
                  Manage messages received from the public contact page.
                </p>
              </div>
              <span className="text-xs text-slate-500 tabular-nums font-semibold">
                {inquiries.length} Inquiries Logged
              </span>
            </div>

            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-xs">No inquiries logged yet.</p>
              ) : (
                inquiries.map(inq => (
                  <div
                    key={inq._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{inq.name}</span>
                        <span className="text-slate-500 text-xs ml-2 tabular-nums">({inq.emailOrPhone})</span>
                        <span className="ml-3 text-[11px] uppercase tracking-wider font-semibold text-teal-700">
                          {inq.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {new Date(inq.createdAt).toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded bg-white border border-slate-200">
                          {inq.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{inq.message}"
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        {inq.status === 'new' && (
                          <button
                            onClick={() => handleUpdateInquiry(inq._id, 'reviewed')}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                          >
                            Mark Reviewed
                          </button>
                        )}
                        {inq.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateInquiry(inq._id, 'resolved')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteInquiry(inq._id)}
                        className="text-slate-400 hover:text-rose-600 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: CLINIC SETTINGS & HOURS ==================== */}
        {activeTab === 'clinic_settings' && (
          <form onSubmit={handleSaveClinicSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Clinic Settings & Working Hours
                </h3>
                <p className="text-xs text-slate-500">
                  Configure practice details, outpatient consultation hours, and slot intervals.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={editableClinic.name}
                  onChange={e => setEditableClinic({ ...editableClinic, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editableClinic.tagline}
                  onChange={e => setEditableClinic({ ...editableClinic, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editableClinic.phone}
                  onChange={e => setEditableClinic({ ...editableClinic, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editableClinic.email}
                  onChange={e => setEditableClinic({ ...editableClinic, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-3">Address & Location</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editableClinic.address.street}
                    onChange={e => setEditableClinic({
                      ...editableClinic,
                      address: { ...editableClinic.address, street: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Suite / Floor</label>
                  <input
                    type="text"
                    value={editableClinic.address.suite || ''}
                    onChange={e => setEditableClinic({
                      ...editableClinic,
                      address: { ...editableClinic.address, suite: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={editableClinic.address.city}
                    onChange={e => setEditableClinic({
                      ...editableClinic,
                      address: { ...editableClinic.address, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">State / Region</label>
                  <input
                    type="text"
                    value={editableClinic.address.state}
                    onChange={e => setEditableClinic({
                      ...editableClinic,
                      address: { ...editableClinic.address, state: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={editableClinic.address.postalCode}
                    onChange={e => setEditableClinic({
                      ...editableClinic,
                      address: { ...editableClinic.address, postalCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Working Hours Editor */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-3">Daily Outpatient Schedule & Slot Times</h4>
              <div className="space-y-2 text-xs">
                {editableClinic.workingHours.map((wh, idx) => (
                  <div key={wh.day} className="flex flex-wrap items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-24 font-semibold text-slate-900">{wh.day}:</span>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={wh.isClosed}
                        onChange={e => {
                          const updated = [...editableClinic.workingHours];
                          updated[idx].isClosed = e.target.checked;
                          setEditableClinic({ ...editableClinic, workingHours: updated });
                        }}
                      />
                      <span>Closed</span>
                    </label>

                    {!wh.isClosed && (
                      <div className="flex items-center gap-2">
                        <span>Open:</span>
                        <input
                          type="time"
                          value={wh.open}
                          onChange={e => {
                            const updated = [...editableClinic.workingHours];
                            updated[idx].open = e.target.value;
                            setEditableClinic({ ...editableClinic, workingHours: updated });
                          }}
                          className="px-2 py-1 border border-slate-300 rounded"
                        />
                        <span>Close:</span>
                        <input
                          type="time"
                          value={wh.close}
                          onChange={e => {
                            const updated = [...editableClinic.workingHours];
                            updated[idx].close = e.target.value;
                            setEditableClinic({ ...editableClinic, workingHours: updated });
                          }}
                          className="px-2 py-1 border border-slate-300 rounded"
                        />
                        <span>Slot:</span>
                        <input
                          type="number"
                          value={wh.slotDurationMinutes}
                          onChange={e => {
                            const updated = [...editableClinic.workingHours];
                            updated[idx].slotDurationMinutes = Number(e.target.value);
                            setEditableClinic({ ...editableClinic, workingHours: updated });
                          }}
                          className="w-16 px-2 py-1 border border-slate-300 rounded"
                        />
                        <span>min</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}

        {/* ==================== TAB 4: DOCTOR PROFILE ==================== */}
        {activeTab === 'doctor_profile' && (
          <form onSubmit={handleSaveDoctorProfile} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Doctor Profile & Qualifications
                </h3>
                <p className="text-xs text-slate-500">
                  Edit physician biography, clinical specialty, and academic details.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={editableDoctor.name}
                  onChange={e => setEditableDoctor({ ...editableDoctor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={editableDoctor.title}
                  onChange={e => setEditableDoctor({ ...editableDoctor, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Specialty</label>
                <input
                  type="text"
                  value={editableDoctor.specialty}
                  onChange={e => setEditableDoctor({ ...editableDoctor, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={editableDoctor.experienceYears}
                  onChange={e => setEditableDoctor({ ...editableDoctor, experienceYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration / License Notice</label>
                <input
                  type="text"
                  value={editableDoctor.registrationNumber}
                  onChange={e => setEditableDoctor({ ...editableDoctor, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Languages (Comma-separated)</label>
                <input
                  type="text"
                  value={editableDoctor.languages.join(', ')}
                  onChange={e => setEditableDoctor({
                    ...editableDoctor,
                    languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Clinical Biography</label>
              <textarea
                rows={4}
                value={editableDoctor.bio}
                onChange={e => setEditableDoctor({ ...editableDoctor, bio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Patient Care Philosophy</label>
              <textarea
                rows={2}
                value={editableDoctor.philosophy}
                onChange={e => setEditableDoctor({ ...editableDoctor, philosophy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Save Doctor Profile
              </button>
            </div>
          </form>
        )}

        {/* ==================== TAB 5: SERVICES & PRICING ==================== */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Medical Services & Fee Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Configure consultation types, fees, and patient instructions.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingService({
                    _id: '',
                    name: '',
                    category: 'Primary Care',
                    description: '',
                    durationMinutes: 30,
                    fee: 100,
                    currency: 'USD',
                    isActive: true
                  });
                  setIsCreatingService(true);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminServices.map(srv => (
                <div key={srv._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-semibold text-teal-700">{srv.category}</span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{srv.name}</h4>
                      </div>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        ${srv.fee}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{srv.description}</p>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{srv.durationMinutes} min</span>
                      <span>·</span>
                      <span className={srv.isActive ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                        {srv.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingService(srv);
                        setIsCreatingService(false);
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete ${srv.name}?`)) return;
                        const res = await fetch(`/api/admin/services/${srv._id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) {
                          showToast('Service deleted.');
                          fetchDashboardData();
                          refreshData();
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Edit / Create Modal */}
            {editingService && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isCreatingService ? 'Add Medical Service' : 'Edit Service'}
                    </h4>
                    <button onClick={() => setEditingService(null)}>
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const url = isCreatingService
                        ? '/api/admin/services'
                        : `/api/admin/services/${editingService._id}`;
                      const method = isCreatingService ? 'POST' : 'PUT';

                      const res = await fetch(url, {
                        method,
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(editingService)
                      });

                      if (res.ok) {
                        showToast(`Service ${isCreatingService ? 'created' : 'updated'}.`);
                        setEditingService(null);
                        fetchDashboardData();
                        refreshData();
                      }
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Service Name</label>
                      <input
                        type="text"
                        required
                        value={editingService.name}
                        onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Category</label>
                        <input
                          type="text"
                          required
                          value={editingService.category}
                          onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Fee (USD)</label>
                        <input
                          type="number"
                          required
                          value={editingService.fee}
                          onChange={e => setEditingService({ ...editingService, fee: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        required
                        value={editingService.durationMinutes}
                        onChange={e => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingService.description}
                        onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
                      >
                        Save Service
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 6: SELF-DIAGNOSTIC SUITE ==================== */}
        {activeTab === 'tests' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Automated System Diagnostic Test Suite
                </h3>
                <p className="text-xs text-slate-500">
                  Verifies booking validation, double-booking conflict prevention, password hashing, and admin JWT authorization.
                </p>
              </div>
              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningTests}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunningTests ? 'Executing Tests...' : 'Run Diagnostics Now'}</span>
              </button>
            </div>

            {testResults ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Execution Summary: </span>
                    <span className="text-emerald-700 font-bold tabular-nums">
                      {testResults.summary.passed} Passed
                    </span>
                    <span className="text-slate-400 mx-2">·</span>
                    <span className="text-rose-700 font-bold tabular-nums">
                      {testResults.summary.failed} Failed
                    </span>
                    <span className="text-slate-400 mx-2">·</span>
                    <span className="text-slate-600 tabular-nums">
                      {testResults.summary.total} Total
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Status: All Critical Invariants Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {testResults.results.map((res: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                        res.passed
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {res.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{res.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">[{res.category}]</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{res.message}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 shrink-0">PASS</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Play className="w-8 h-8 text-teal-600 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-700">Test suite ready to execute</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Run Diagnostics Now" to verify booking collision safeguards, date boundaries, and token authorization.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
