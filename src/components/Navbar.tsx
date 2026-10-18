import React, { useState } from 'react';
import { 
  Activity, 
  Phone, 
  Clock, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  FileText,
  Search
} from 'lucide-react';
import { ClinicInfo } from '../types';
import clinicLogo from '../assets/images/krishnaveni_physio_logo_1785932195343.jpg';

interface NavbarProps {
  clinicInfo: ClinicInfo;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenBooking: () => void;
  onOpenPatientPortal: () => void;
  onOpenAdminPortal: () => void;
  onOpenDocsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  clinicInfo,
  activeSection,
  setActiveSection,
  onOpenBooking,
  onOpenPatientPortal,
  onOpenAdminPortal,
  onOpenDocsModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: string; label: string; icon?: React.ElementType }> = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Doctor' },
    { id: 'services', label: 'Departments & What We Treat' },
    { id: 'testimonials', label: 'Reviews' },
    { id: 'faqs', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/40 shadow-sm shadow-slate-900/5">
      {/* Top Notification / Contact Bar */}
      <div className="bg-slate-950/90 backdrop-blur-md text-slate-200 text-xs py-2 px-4 sm:px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <a href="mailto:krishnavenirehab@gmail.com" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
              <span className="text-cyan-400 font-medium">krishnavenirehab@gmail.com</span>
            </a>
            <a href={`tel:${clinicInfo.phone}`} className="hidden sm:flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">{clinicInfo.phone}</span>
            </a>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mon - Sat: 9:30 AM - 8:00 PM</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-cyan-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Online Consultation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDocsModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 text-cyan-300 font-medium transition-colors border border-white/10"
              title="View Architecture & Setup Documentation"
            >
              <FileText className="w-3 h-3" />
              <span>Tech Specs</span>
            </button>
            <button
              onClick={onOpenPatientPortal}
              className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors font-medium"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Track Appointment</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenAdminPortal}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-medium text-amber-400"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white shadow-md shadow-blue-500/10 border border-slate-200/80 p-0.5 group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
            <img 
              src={clinicLogo} 
              alt="KRISHNAVENI Physiotherapy Logo" 
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block leading-tight group-hover:text-blue-600 transition-colors">
              KRISHNAVENI <span className="text-cyan-600 font-extrabold uppercase">Advanced</span>
            </span>
            <span className="text-[10px] font-semibold text-blue-600 tracking-widest uppercase block">
              Physiotherapy & Rehabilitation Services • Dr. P. Sai Tejaswini, MPT (Neuro), MIAP
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-sm font-medium text-slate-700 bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-white/60 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200'
                    : 'hover:bg-white/70 hover:text-blue-600'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-amber-300 animate-pulse" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-blue-200 hover:shadow-xl transition-all transform active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Online Consultation</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-xl text-slate-700 bg-white/50 backdrop-blur-md border border-white/60 hover:bg-white/80 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/90 backdrop-blur-xl border-t border-white/40 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
            >
              <span>{item.label}</span>
              {item.icon && <item.icon className="w-4 h-4 text-cyan-600" />}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Online Appointment</span>
            </button>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPatientPortal();
                }}
                className="w-full text-center py-2 text-xs font-semibold bg-slate-100 text-slate-800 rounded-lg"
              >
                Track Booking
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminPortal();
                }}
                className="w-full text-center py-2 text-xs font-semibold bg-amber-50 text-amber-800 rounded-lg border border-amber-200"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
