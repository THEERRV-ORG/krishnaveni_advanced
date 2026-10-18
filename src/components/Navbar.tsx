import React, { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { ClinicInfo } from '../types';
import clinicLogo from '../assets/images/krishnaveni_physio_logo_1785932195343.jpg';

interface NavbarProps {
  clinicInfo: ClinicInfo;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenBooking: () => void;
  onOpenPatientPortal: () => void;
}

const navItems = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Conditions' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'faqs', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  clinicInfo,
  activeSection,
  setActiveSection,
  onOpenBooking,
  onOpenPatientPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left shrink-0"
        >
          <img src={clinicLogo} alt="" className="w-9 h-9 rounded-md object-contain bg-white border border-line" />
          <span className="leading-tight">
            <span className="block font-serif text-[17px] text-ink">Krishnaveni Physio</span>
            <span className="block text-xs text-ink-mute">Dr. P. Sai Tejaswini, MPT (Neuro)</span>
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-6 text-sm text-ink-soft">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`py-1 border-b-2 transition-colors ${
                activeSection === item.id
                  ? 'border-primary text-ink'
                  : 'border-transparent hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <button
            type="button"
            onClick={onOpenPatientPortal}
            className="text-sm text-ink-soft hover:text-ink"
          >
            Track booking
          </button>
          <button
            type="button"
            onClick={onOpenBooking}
            className="bg-accent hover:bg-accent-deep text-ink font-semibold text-sm px-4 py-2 rounded-md transition-colors"
          >
            Book a consultation
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(open => !open)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          className="lg:hidden p-2 -mr-2 text-ink"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-line bg-paper px-4 pb-5">
          <nav className="flex flex-col py-2">
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="text-left py-3 text-base text-ink border-b border-line/70"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPatientPortal();
              }}
              className="text-left py-3 text-base text-ink border-b border-line/70"
            >
              Track booking
            </button>
          </nav>
          <div className="pt-3 space-y-1 text-sm text-ink-soft">
            <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-ink">
              <Phone className="w-4 h-4 text-primary" />
              {clinicInfo.phone}
            </a>
            <p>Mon–Sat, 9:30 am – 8:00 pm</p>
          </div>
        </div>
      )}
    </header>
  );
};
