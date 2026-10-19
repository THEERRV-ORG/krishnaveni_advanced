import React from 'react';
import { ClinicInfo } from '../types';
import { SECTION_ROUTES } from '../routes';
import { handleSectionLinkClick } from '../navigation';

interface FooterProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
  onOpenPatientPortal: () => void;
}

const LINKS = SECTION_ROUTES.filter(route => route.id !== 'home');

export const Footer: React.FC<FooterProps> = ({
  clinicInfo,
  onOpenBooking,
  onOpenPatientPortal,
}) => {
  return (
    <footer className="bg-primary-deep text-paper/80 pt-14 pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          <div className="md:col-span-5">
            <p className="font-serif text-2xl text-paper">Krishnaveni Physio</p>
            <p className="mt-3 max-w-sm leading-relaxed">
              Online physiotherapy and rehabilitation with Dr. P. Sai Tejaswini, MPT (Neuro), MIAP.
            </p>
            <button
              type="button"
              onClick={onOpenBooking}
              className="mt-6 bg-accent hover:bg-accent-deep text-ink font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
            >
              Book a consultation
            </button>
          </div>

          <nav className="md:col-span-3" aria-label="Footer">
            <p className="text-sm text-paper/50">On this page</p>
            <ul className="mt-3 space-y-2">
              {LINKS.map(link => (
                <li key={link.path}>
                  <a href={link.path} onClick={e => handleSectionLinkClick(e, link.path)} className="hover:text-paper">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="text-sm text-paper/50">Contact</p>
            <ul className="mt-3 space-y-2">
              <li><a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="hover:text-paper">{clinicInfo.phone}</a></li>
              <li><a href={`mailto:${clinicInfo.email}`} className="hover:text-paper">{clinicInfo.email}</a></li>
              <li>
                <button type="button" onClick={onOpenPatientPortal} className="hover:text-paper">
                  Track a booking
                </button>
              </li>
            </ul>
          </div>

        </div>

        <p className="mt-12 pt-6 border-t border-paper/15 text-sm text-paper/50">
          © {new Date().getFullYear()} {clinicInfo.name}
        </p>
      </div>
    </footer>
  );
};
