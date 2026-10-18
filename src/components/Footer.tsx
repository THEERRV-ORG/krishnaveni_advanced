import React from 'react';
import { Activity, Phone, Mail, MapPin, Heart, ShieldCheck, Video } from 'lucide-react';
import { ClinicInfo } from '../types';
import clinicLogo from '../assets/images/krishnaveni_physio_logo_1785932195343.jpg';

interface FooterProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
  onOpenPatientPortal: () => void;
  onOpenAdminPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  clinicInfo,
  onOpenBooking,
  onOpenPatientPortal,
  onOpenAdminPortal
}) => {
  return (
    <footer className="bg-slate-950/90 text-slate-300 border-t border-white/10 backdrop-blur-md pt-16 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Doctor */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white shadow-md border border-white/20 p-0.5 shrink-0 flex items-center justify-center">
                <img 
                  src={clinicLogo} 
                  alt="KRISHNAVENI Physiotherapy Logo" 
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Krishnaveni Advanced Physiotherapy & Rehabilitation Services
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Krishnaveni Advanced Physiotherapy & Rehabilitation Services. Directed by Dr. P. Sai Tejaswini, MPT (Neuro), MIAP. Purely online specialized physiotherapy & tele-rehabilitation services across India and worldwide.
            </p>

            <div className="flex items-center gap-2 text-xs text-cyan-300 font-semibold bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md w-fit">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>100% Online Physiotherapy & Tele-Rehab</span>
            </div>

            <div className="pt-2 space-y-1.5 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <a href="mailto:krishnavenirehab@gmail.com" className="hover:text-cyan-300 transition-colors">
                  krishnavenirehab@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <a href="tel:+919490605809" className="hover:text-emerald-300 transition-colors">
                  +91 94906 05809 (WhatsApp Available)
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About Dr. P. Sai Tejaswini</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">Departments & What We Treat</a></li>
              <li><a href="#testimonials" className="hover:text-cyan-400 transition-colors">Patient Reviews</a></li>
              <li><a href="#faqs" className="hover:text-cyan-400 transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Departments</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">Neurological Rehabilitation</li>
              <li className="text-slate-400">Orthopedic Care & Rehabilitation</li>
              <li className="text-slate-400">Post-Surgical & Trauma Rehab</li>
              <li className="text-slate-400">Sports Injury & Performance</li>
              <li className="text-slate-400">Gynaecological & Women’s Health</li>
              <li className="text-slate-400">Cardiology & Pulmonology Rehab</li>
              <li className="text-cyan-400 font-semibold flex items-center gap-1">
                <Video className="w-3.5 h-3.5" /> Online Video Tele-Consultation
              </li>
            </ul>
          </div>

          {/* Portals & Actions */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Access Portals</h4>
            <div className="space-y-2.5">
              <button
                onClick={onOpenBooking}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs py-3 rounded-full shadow-lg shadow-cyan-500/20 transition-all text-center"
              >
                Book Appointment Online
              </button>

              <button
                onClick={onOpenPatientPortal}
                className="w-full bg-white/10 hover:bg-white/20 text-cyan-300 border border-white/10 backdrop-blur-md font-semibold text-xs py-2.5 rounded-full text-center transition-all"
              >
                Track Booking & Invoices
              </button>

              <button
                onClick={onOpenAdminPortal}
                className="w-full bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10 backdrop-blur-md font-semibold text-xs py-2.5 rounded-full text-center transition-all"
              >
                Admin Control Dashboard
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Krishnaveni Advanced Physiotherapy & Rehabilitation Services. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Designed for Dr. P. Sai Tejaswini, MPT (Neuro), MIAP</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
