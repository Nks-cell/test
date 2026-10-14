import React, { createContext, useContext, useState, useEffect } from 'react';
import { DoctorProfile, ClinicSettings, MedicalService } from '../types/index.ts';
import { INITIAL_DOCTOR_PROFILE, INITIAL_CLINIC_SETTINGS, INITIAL_SERVICES } from '../server/db/seedData.ts';

interface ClinicContextType {
  doctor: DoctorProfile;
  clinic: ClinicSettings;
  services: MedicalService[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  isBookingOpen: boolean;
  openBooking: (serviceId?: string) => void;
  closeBooking: () => void;
  selectedServiceId?: string;
  isLookupOpen: boolean;
  openLookup: () => void;
  closeLookup: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<DoctorProfile>(INITIAL_DOCTOR_PROFILE);
  const [clinic, setClinic] = useState<ClinicSettings>(INITIAL_CLINIC_SETTINGS);
  const [services, setServices] = useState<MedicalService[]>(INITIAL_SERVICES);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const refreshData = async () => {
    try {
      const [docRes, clinicRes, srvRes] = await Promise.all([
        fetch('/api/public/profile'),
        fetch('/api/public/clinic'),
        fetch('/api/public/services')
      ]);

      if (docRes.ok) {
        const dData = await docRes.json();
        if (dData.success && dData.data) setDoctor(dData.data);
      }
      if (clinicRes.ok) {
        const cData = await clinicRes.json();
        if (cData.success && cData.data) setClinic(cData.data);
      }
      if (srvRes.ok) {
        const sData = await srvRes.json();
        if (sData.success && sData.data) setServices(sData.data);
      }
    } catch (err) {
      console.warn('Could not reach public API, using initial seed data.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setSelectedServiceId(undefined);
  };

  const openLookup = () => setIsLookupOpen(true);
  const closeLookup = () => setIsLookupOpen(false);

  return (
    <ClinicContext.Provider
      value={{
        doctor,
        clinic,
        services,
        isLoading,
        refreshData,
        isBookingOpen,
        openBooking,
        closeBooking,
        selectedServiceId,
        isLookupOpen,
        openLookup,
        closeLookup
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
