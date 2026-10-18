import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AboutDoctor } from './components/AboutDoctor';
import { ServicesGrid } from './components/ServicesGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { BookingModal } from './components/BookingModal';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { DocsModal } from './components/DocsModal';
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

import { MessageSquare, Phone, Calendar } from 'lucide-react';

export default function App() {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(INITIAL_CLINIC_INFO);
  const [doctor, setDoctor] = useState<Doctor>(INITIAL_DOCTOR);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  const [activeSection, setActiveSection] = useState('home');

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingPreselectedService, setBookingPreselectedService] = useState<Service | null>(null);
  const [bookingInitialType, setBookingInitialType] = useState<ConsultationType>('Online Consultation');
  const [bookingPreloadedReports, setBookingPreloadedReports] = useState<{ name: string; url: string; uploadedAt: string }[]>([]);
  const [bookingPreloadedIssues, setBookingPreloadedIssues] = useState<string>('');

  const [patientDashboardOpen, setPatientDashboardOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Mesh Gradients for Frosted Glass Depth */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[600px] left-[-150px] w-[450px] h-[450px] bg-cyan-200/40 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[1500px] right-[-100px] w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[2600px] left-[-100px] w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-[110px] pointer-events-none z-0" />

      {/* Navbar */}
      <Navbar
        clinicInfo={clinicInfo}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenBooking={() => handleOpenBooking('Online Consultation')}
        onOpenPatientPortal={() => setPatientDashboardOpen(true)}
        onOpenAdminPortal={() => setAdminDashboardOpen(true)}
        onOpenDocsModal={() => setDocsModalOpen(true)}
      />

      {/* Hero Banner Section */}
      <div id="home">
        <HeroBanner
          onOpenBooking={() => handleOpenBooking('Online Consultation')}
          doctor={doctor}
        />
      </div>

      {/* About Doctor & Clinic */}
      <AboutDoctor
        doctor={doctor}
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking('Online Consultation')}
        onDoctorUpdated={(updatedDoc) => setDoctor(updatedDoc)}
      />

      {/* Services Grid (Departments & What We Treat) */}
      <ServicesGrid
        onOpenBooking={(issues) => handleOpenBooking('Online Consultation', null, [], issues || '')}
      />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Patient Reviews & Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* FAQs */}
      <FAQSection faqs={faqs} />

      {/* Contact & Map */}
      <ContactSection clinicInfo={clinicInfo} />

      {/* Footer */}
      <Footer
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking('Online Consultation')}
        onOpenPatientPortal={() => setPatientDashboardOpen(true)}
        onOpenAdminPortal={() => setAdminDashboardOpen(true)}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Floating WhatsApp Quick Chat */}
        <a
          href={`https://wa.me/919490605809?text=Hello%20Dr.%20Sai%20Tejaswini,%20I%20would%20like%20to%20book%20an%20online%20physiotherapy%20consultation.`}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-white"
          title="Chat with Dr. P. Sai Tejaswini on WhatsApp"
        >
          <MessageSquare className="w-6 h-6" />
        </a>

      </div>

      {/* Booking Wizard Modal */}
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

      {/* Patient Dashboard Modal */}
      <PatientDashboard
        isOpen={patientDashboardOpen}
        onClose={() => setPatientDashboardOpen(false)}
        onBookNew={() => handleOpenBooking('Online Consultation')}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        services={services}
        onRefreshServices={() => {}}
        doctor={doctor}
        onDoctorUpdated={(updatedDoc) => setDoctor(updatedDoc)}
      />

      {/* Tech Architecture Docs Modal */}
      <DocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />

    </div>
  );
}
