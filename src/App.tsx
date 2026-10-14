/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext.tsx';
import { DemoNoticeBanner } from './components/DemoNoticeBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { AppointmentLookupModal } from './components/AppointmentLookupModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';

function MainContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const { openBooking, openLookup } = useClinic();

  const handleNavigate = (tab: string) => {
    setIsAdminView(false);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitAdmin = () => {
    setIsAdminView(false);
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdminView) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <DemoNoticeBanner onOpenAdmin={() => {}} />
        <AdminDashboard onExitToPublic={handleExitAdmin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-mesh bg-grain flex flex-col font-sans selection:bg-teal-500 selection:text-white relative">
      {/* 1. Ethically explicit medical demo notice with quick admin link */}
      <DemoNoticeBanner onOpenAdmin={handleOpenAdmin} />

      {/* 2. Top Navigation Bar meeting strict Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenBooking={() => openBooking()}
        onOpenLookup={() => openLookup()}
      />

      {/* 3. Main Viewport Content */}
      <main className="flex-1">
        {currentTab === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentTab === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentTab === 'specialties' && <ServicesPage onNavigate={handleNavigate} />}
        {currentTab === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentTab === 'contact' && <ContactPage />}
      </main>

      {/* 4. Global Modals */}
      <BookingModal />
      <AppointmentLookupModal />

      {/* 5. Accessible Footer */}
      <Footer onNavigate={handleNavigate} onOpenAdmin={handleOpenAdmin} />
    </div>
  );
}

export default function App() {
  return (
    <ClinicProvider>
      <MainContent />
    </ClinicProvider>
  );
}
