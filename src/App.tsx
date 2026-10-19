import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AboutDoctor } from './components/AboutDoctor';
import { ServicesGrid } from './components/ServicesGrid';
import { HowItWorks } from './components/HowItWorks';
import { BookingModal } from './components/BookingModal';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

import { 
  ClinicInfo, 
  Doctor, 
  Service, 
  Testimonial, 
  FAQItem, 
  ConsultationType,
  Appointment
} from './types';

import { 
  INITIAL_CLINIC_INFO, 
  INITIAL_DOCTOR, 
  INITIAL_SERVICES, 
  INITIAL_TESTIMONIALS, 
  INITIAL_FAQS 
} from './data/initialData';

import { MessageCircle } from 'lucide-react';
import { whatsappLink } from './utils/whatsapp';
import { routeForPath } from './routes';
import { currentSectionPath, getPendingPath, scrollToPath } from './navigation';

export default function App() {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(INITIAL_CLINIC_INFO);
  const [doctor, setDoctor] = useState<Doctor>(INITIAL_DOCTOR);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  const [activeSection, setActiveSection] = useState(() => routeForPath(window.location.pathname)?.id ?? 'home');

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingPreselectedService, setBookingPreselectedService] = useState<Service | null>(null);
  const [bookingInitialType, setBookingInitialType] = useState<ConsultationType>('Online Consultation');
  const [bookingPreloadedReports, setBookingPreloadedReports] = useState<{ name: string; url: string; uploadedAt: string }[]>([]);
  const [bookingPreloadedIssues, setBookingPreloadedIssues] = useState<string>('');

  const [patientDashboardOpen, setPatientDashboardOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  // Fetch live store data from backend Express server
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [clinicRes, srvRes, contentRes] = await Promise.all([
          fetch('/api/clinic-info'),
          fetch('/api/services'),
          fetch('/api/content')
        ]);

        if (clinicRes.ok) {
          const cData = await clinicRes.json();
          if (cData.clinic) setClinicInfo(cData.clinic);
          if (cData.doctor) setDoctor(cData.doctor);
        }

        if (srvRes.ok) {
          const sData = await srvRes.json();
          if (Array.isArray(sData) && sData.length > 0) setServices(sData);
        }

        if (contentRes.ok) {
          const cntData = await contentRes.json();
          if (cntData.testimonials) setTestimonials(cntData.testimonials);
          if (cntData.faqs) setFaqs(cntData.faqs);
        }
      } catch (err) {
        console.log('Using initial client data store', err);
      }
    };
    loadBackendData();
  }, []);

  // Deep links (/about, /faq, ...) open at their section; back/forward scroll between sections.
  useEffect(() => {
    if (routeForPath(window.location.pathname)?.id !== 'home') {
      window.history.scrollRestoration = 'manual';
      requestAnimationFrame(() => scrollToPath(window.location.pathname, 'instant'));
    }
    const onPopState = () => scrollToPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Keep the URL and the highlighted nav link in step with the section being read.
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const path = getPendingPath() ?? currentSectionPath();
      const route = routeForPath(path);
      if (!route) return;
      setActiveSection(route.id);
      if (!getPendingPath() && window.location.pathname !== route.path) {
        window.history.replaceState(null, '', route.path + window.location.search + window.location.hash);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', sync);
    };
  }, []);

  // The admin dashboard has no public link; staff open it at /#admin.
  useEffect(() => {
    const syncAdminFromHash = () => setAdminDashboardOpen(window.location.hash === '#admin');
    syncAdminFromHash();
    window.addEventListener('hashchange', syncAdminFromHash);
    return () => window.removeEventListener('hashchange', syncAdminFromHash);
  }, []);

  const closeAdminDashboard = () => {
    setAdminDashboardOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleOpenBooking = (
    type: ConsultationType = 'Online Consultation', 
    service: Service | null = null,
    reports: { name: string; url: string; uploadedAt: string }[] = [],
    patientIssues: string = ''
  ) => {
    setBookingInitialType(type);
    setBookingPreselectedService(service);
    setBookingPreloadedReports(reports);
    setBookingPreloadedIssues(patientIssues);
    setBookingModalOpen(true);
  };

  const handleBookingComplete = (newApt: Appointment) => {
    // Refresh patient or admin data
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <Navbar
        clinicInfo={clinicInfo}
        activeSection={activeSection}
        onOpenBooking={() => handleOpenBooking('Online Consultation')}
        onOpenPatientPortal={() => setPatientDashboardOpen(true)}
      />

      <main>
        <div id="home">
          <HeroBanner
            onOpenBooking={() => handleOpenBooking('Online Consultation')}
            doctor={doctor}
            clinicInfo={clinicInfo}
          />
        </div>
        <AboutDoctor doctor={doctor} onOpenBooking={() => handleOpenBooking('Online Consultation')} />
        <ServicesGrid onOpenBooking={(issues) => handleOpenBooking('Online Consultation', null, [], issues || '')} />
        <HowItWorks />
        <TestimonialsSection testimonials={testimonials} whatsapp={clinicInfo.whatsapp} />
        <FAQSection faqs={faqs} />
        <ContactSection clinicInfo={clinicInfo} />
      </main>

      <Footer
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking('Online Consultation')}
        onOpenPatientPortal={() => setPatientDashboardOpen(true)}
      />

      {/* Mobile action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-line px-4 py-2.5 grid grid-cols-2 gap-3">
        <a
          href={whatsappLink(clinicInfo.whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 border border-primary text-primary font-semibold text-sm py-2.5 rounded-md"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp
        </a>
        <button
          type="button"
          onClick={() => handleOpenBooking('Online Consultation')}
          className="bg-accent text-ink font-semibold text-sm py-2.5 rounded-md"
        >
          Book
        </button>
      </div>

      <BookingModal
        services={services}
        preselectedService={bookingPreselectedService}
        initialType={bookingInitialType}
        initialReports={bookingPreloadedReports}
        initialProblemDescription={bookingPreloadedIssues}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onBookingComplete={handleBookingComplete}
      />

      <PatientDashboard
        isOpen={patientDashboardOpen}
        onClose={() => setPatientDashboardOpen(false)}
        onBookNew={() => handleOpenBooking('Online Consultation')}
      />

      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={closeAdminDashboard}
        services={services}
        onRefreshServices={() => {}}
        doctor={doctor}
        onDoctorUpdated={(updatedDoc) => setDoctor(updatedDoc)}
      />
    </div>
  );
}
