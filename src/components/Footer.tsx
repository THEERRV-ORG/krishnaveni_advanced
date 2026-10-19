import React from 'react';
import { ArrowRight, ArrowUp, Mail, MessageCircle, Phone, Search } from 'lucide-react';
import { ClinicInfo } from '../types';
import { SECTION_ROUTES } from '../routes';
import { handleSectionLinkClick, navigateToSection } from '../navigation';
import { whatsappLink } from '../utils/whatsapp';

interface FooterProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
  onOpenPatientPortal: () => void;
}

const LINKS = SECTION_ROUTES.filter(route => route.id !== 'home');

const headingClass = 'text-xs font-semibold uppercase tracking-[0.14em] text-accent';
const linkClass = 'text-paper/85 hover:text-white transition-colors';

export const Footer: React.FC<FooterProps> = ({ clinicInfo, onOpenBooking, onOpenPatientPortal }) => {
  const telHref = `tel:${clinicInfo.phone.replace(/\s/g, '')}`;

  return (
    <footer className="bg-primary-deep text-paper/80 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

        <div className="md:col-span-5">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 shrink-0 rounded-full bg-white flex items-center justify-center">
              <img src="/logo-mark.png" alt="" width={44} height={44} className="w-11 h-11 object-contain" />
            </span>
            <div>
              <p className="font-serif text-2xl leading-tight text-white">Krishnaveni Advanced</p>
              <p className="text-sm text-paper/70">Physiotherapy &amp; Rehabilitation Services</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm leading-relaxed">
            Online physiotherapy and rehabilitation with Dr. P. Sai Tejaswini, MPT (Neuro), MIAP.
          </p>
          <button
            type="button"
            onClick={onOpenBooking}
            className="group mt-7 inline-flex items-center gap-2 bg-accent hover:bg-accent-deep text-ink font-semibold px-5 py-3 rounded-md transition-colors"
          >
            Book a consultation
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        </div>

        <nav className="md:col-span-3" aria-label="Footer">
          <p className={headingClass}>On this page</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-1">
            {LINKS.map(link => (
              <li key={link.path}>
                <a href={link.path} onClick={e => handleSectionLinkClick(e, link.path)} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className={headingClass}>Contact</p>
          <ul className="mt-5 space-y-5">
            <li className="flex gap-3.5">
              <Phone className="w-5 h-5 mt-0.5 shrink-0 text-accent" aria-hidden />
              <div>
                <a href={telHref} className={`${linkClass} text-[17px]`}>{clinicInfo.phone}</a>
                <p className="mt-0.5 text-sm text-paper/60">Mon–Sat, 9:30 am – 8:00 pm</p>
              </div>
            </li>
            <li className="flex gap-3.5">
              <MessageCircle className="w-5 h-5 mt-0.5 shrink-0 text-accent" aria-hidden />
              <a href={whatsappLink(clinicInfo.whatsapp)} target="_blank" rel="noreferrer" className={linkClass}>
                Chat on WhatsApp
              </a>
            </li>
            <li className="flex gap-3.5">
              <Mail className="w-5 h-5 mt-0.5 shrink-0 text-accent" aria-hidden />
              <a href={`mailto:${clinicInfo.email}`} className={`${linkClass} break-all`}>{clinicInfo.email}</a>
            </li>
            <li className="flex gap-3.5">
              <Search className="w-5 h-5 mt-0.5 shrink-0 text-accent" aria-hidden />
              <button type="button" onClick={onOpenPatientPortal} className={`${linkClass} text-left`}>
                Track a booking
              </button>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-paper/55">
          <p>© {new Date().getFullYear()} {clinicInfo.name}. All rights reserved.</p>
          <a
            href="/"
            onClick={e => { e.preventDefault(); navigateToSection('/'); }}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors self-start sm:self-auto"
          >
            Back to top
            <ArrowUp className="w-4 h-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
};
