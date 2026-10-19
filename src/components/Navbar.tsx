import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { ClinicInfo } from '../types';
import clinicLogo from '../assets/images/krishnaveni_physio_logo_1785932195343.jpg';
import { SECTION_ROUTES } from '../routes';
import { handleSectionLinkClick } from '../navigation';

interface NavbarProps {
  clinicInfo: ClinicInfo;
  activeSection: string;
  onOpenBooking: () => void;
  onOpenPatientPortal: () => void;
}

const navItems = SECTION_ROUTES.filter(route => route.id !== 'home');

export const Navbar: React.FC<NavbarProps> = ({
  clinicInfo,
  activeSection,
  onOpenBooking,
  onOpenPatientPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const revealedByHover = useRef(false);
  const pastHeroRef = useRef(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const heroEnd = () => {
      const hero = document.getElementById('home');
      return hero ? hero.offsetTop + hero.offsetHeight : 0;
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      pastHeroRef.current = y > heroEnd();

      if (!pastHeroRef.current) {
        setHidden(false);
      } else if (delta > 4) {
        revealedByHover.current = false;
        setHidden(true);
      } else if (delta < -4) {
        revealedByHover.current = false;
        setHidden(false);
      }
    };

    // Reveal when the pointer reaches the top edge of the window.
    const onMouseMove = (e: MouseEvent) => {
      if (pastHeroRef.current && e.clientY <= 16) {
        revealedByHover.current = true;
        setHidden(false);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const handleMouseLeave = () => {
    if (revealedByHover.current && pastHeroRef.current && !mobileMenuOpen) {
      revealedByHover.current = false;
      setHidden(true);
    }
  };

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    setMobileMenuOpen(false);
    handleSectionLinkClick(event, path);
  };

  return (
    <header
      onMouseLeave={handleMouseLeave}
      onFocus={() => setHidden(false)}
      className={`sticky top-0 z-50 bg-paper border-b border-line transition-transform duration-300 ease-out ${
        hidden && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 min-h-16 flex items-center justify-between gap-6">
        <a
          href="/"
          onClick={e => handleNavClick(e, '/')}
          aria-label="Krishnaveni Advanced Physiotherapy & Rehabilitation Services — home"
          className="flex items-center gap-3 text-left min-w-0"
        >
          <img src={clinicLogo} alt="" className="w-11 h-11 shrink-0 rounded-xl object-contain bg-white border border-line" />
          <span className="leading-tight min-w-0">
            <span className="block text-base sm:text-lg font-bold tracking-tight text-primary-deep">
              KRISHNAVENI <span className="text-accent">ADVANCED</span>
            </span>
            <span className="block max-w-[22rem] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary">
              Physiotherapy &amp; Rehabilitation Services • Dr. P. Sai Tejaswini, MPT (Neuro), MIAP
            </span>
          </span>
        </a>

        <nav aria-label="Main" className="hidden xl:flex shrink-0 items-center gap-5 whitespace-nowrap text-sm text-ink-soft">
          {navItems.map(item => (
            <a
              key={item.id}
              href={item.path}
              onClick={e => handleNavClick(e, item.path)}
              aria-current={activeSection === item.id ? 'location' : undefined}
              className={`py-1 border-b-2 transition-colors ${
                activeSection === item.id
                  ? 'border-primary text-ink'
                  : 'border-transparent hover:text-ink'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden xl:flex shrink-0 items-center gap-5 whitespace-nowrap">
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
          className="xl:hidden p-2 -mr-2 text-ink"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-line bg-paper px-4 pb-5">
          <nav className="flex flex-col py-2">
            {navItems.map(item => (
              <a
                key={item.id}
                href={item.path}
                onClick={e => handleNavClick(e, item.path)}
                className="text-left py-3 text-base text-ink border-b border-line/70"
              >
                {item.label}
              </a>
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
