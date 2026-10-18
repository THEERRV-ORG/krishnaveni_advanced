import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Award, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Doctor } from '../types';

interface HeroBannerProps {
  onOpenBooking: () => void;
  doctor?: Doctor;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenBooking, doctor }) => {
  const slides = [
    {
      title: 'Expert Online Physiotherapy & Rehabilitation',
      subtitle: 'Personalized 1-on-1 Google Meet Video Consultations for Neurological, Orthopaedic, Joint, Spine & Sports Conditions',
      badge: '100% Online Physiotherapy Consultations',
      image: '/src/assets/images/physio_hero_banner_1785345962335.jpg',
      tag: 'Krishnaveni Advanced Physiotherapy & Rehabilitation Services'
    },
    {
      title: 'Multispecialty Online Rehabilitation Care',
      subtitle: 'Evidence-Based Video Therapy for Stroke, Back Pain, Frozen Shoulder, Knee Pain & Post-Op Recovery',
      badge: 'Dr. P. Sai Tejaswini, MPT (Neuro), MIAP',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1920',
      tag: 'EXPERT EVIDENCE-BASED PHYSIOTHERAPY'
    },
    {
      title: 'Seamless Google Meet & Zoom Video Sessions',
      subtitle: 'Expert Physical Movement Analysis, Scan Reviews & Personalized Digital Exercise Prescriptions',
      badge: 'Google Meet / Zoom HD Video Sessions',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1920',
      tag: 'TRANSPARENT & ACCESSIBLE ONLINE CARE'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Background Slideshow */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-40 scale-105 transition-transform duration-10000' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-950/70" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text Block */}
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-cyan-300 text-xs sm:text-sm font-medium">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{slides[currentSlide].tag}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none">
              {slides[currentSlide].title}
            </h1>

            <p className="text-lg sm:text-xl text-blue-100/90 font-medium max-w-2xl leading-relaxed">
              {slides[currentSlide].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">Dr. P. Sai Tejaswini, MPT (Neuro), MIAP</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>4+ Yrs Clinical Experience</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenBooking()}
                className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Video className="w-5 h-5" />
                <span>Book Online Consultation</span>
              </button>
            </div>
          </div>

          {/* Right Doctor Feature Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all" />

              <div className="relative flex items-center gap-4 mb-4">
                <img
                  src={doctor?.avatarUrl || '/api/doctor-photo'}
                  alt={doctor?.name || "Dr. P. Sai Tejaswini"}
                  className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-cyan-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{doctor?.name || "Dr. P. Sai Tejaswini"}</h3>
                  <p className="text-xs font-semibold text-cyan-400">{doctor?.qualification || "MPT (Neurology), MIAP"}</p>
                  <p className="text-xs text-slate-400 mt-1">{doctor?.title || "Chief Physiotherapist"}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Specialization:</span>
                  <span className="font-semibold text-white">Online Physiotherapy & Rehab</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Consultation Mode:</span>
                  <span className="text-cyan-400 font-semibold">1-on-1 Google Meet Video</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Clinical Focus:</span>
                  <span className="text-emerald-400 font-semibold">Neuro, Ortho & Women's Health</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" /> Certified Specialist
                </span>
                <span className="text-cyan-300 font-medium">Online Across India & Global</span>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Controls */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">4+ Years</p>
                <p className="text-xs text-slate-400">Clinical Excellence</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">5,000+</p>
                <p className="text-xs text-slate-400">Recovered Patients</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">100% Secure</p>
                <p className="text-xs text-slate-400">Razorpay Payments</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
