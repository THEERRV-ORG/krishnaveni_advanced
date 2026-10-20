import React from 'react';
import { ClinicInfo, Doctor } from '../types';
import { whatsappLink } from '../utils/whatsapp';
import { DoctorPortrait } from './DoctorPortrait';
import heroBg from '../assets/images/hero_bg.webp';
import doctorPlaceholder from '../assets/images/doctor_placeholder.webp';

interface HeroBannerProps {
  onOpenBooking: () => void;
  doctor: Doctor;
  clinicInfo: ClinicInfo;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenBooking, doctor, clinicInfo }) => {
  return (
    <section
      className="relative border-b border-line bg-paper"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* A light wash over the photo so it stays in the background behind the copy. */}
      <div aria-hidden className="absolute inset-0 bg-paper/85" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[calc(100vh-4rem)]">

        <div className="lg:col-span-7">
          <span className="band mb-6" />
          <h1 className="text-[2.1rem] leading-[1.15] sm:text-5xl sm:leading-[1.12] text-ink">
            Physiotherapy for stroke, spine and joint pain —{' '}
            <em className="text-primary">by video, from home.</em>
          </h1>
          <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
            One-to-one, 45-minute consultations on Google Meet with {doctor.name}.
            Share your scans before the call; you finish with an assessment and a home exercise plan.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-accent hover:bg-accent-deep text-ink font-semibold px-6 py-3 rounded-md transition-colors"
            >
              Book a consultation
            </button>
            <a
              href={whatsappLink(clinicInfo.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-md border border-primary text-primary font-semibold hover:bg-primary-wash transition-colors"
            >
              Ask on WhatsApp
            </a>
          </div>

          <dl className="mt-6 pt-4 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            <div>
              <dt className="text-ink-mute">Treats</dt>
              <dd className="mt-1 text-ink">Neuro, ortho, post-op, sports and women's health</dd>
            </div>
            <div>
              <dt className="text-ink-mute">Hours</dt>
              <dd className="mt-1 text-ink">Mon–Sat, 9:30 am – 8:00 pm</dd>
            </div>
            <div>
              <dt className="text-ink-mute">Where</dt>
              <dd className="mt-1 text-ink">Online, anywhere in India</dd>
            </div>
          </dl>
        </div>

        <figure className="lg:col-span-5 w-full max-w-[16rem] sm:max-w-[18rem] lg:max-w-[22rem] mx-auto lg:ml-auto lg:mr-0">
          <DoctorPortrait doctor={doctor} placeholderSrc={doctorPlaceholder} className="w-full aspect-square rounded-sm" />
          <figcaption className="mt-3 text-sm text-ink-soft font-serif italic text-center">
            {doctor.name}, MPT (Neurology), MIAP — {doctor.title.toLowerCase()}.
          </figcaption>
          <dl className="mt-5 grid grid-cols-2 divide-x divide-line border-y border-line bg-paper/70 text-center">
            <div className="py-3 px-2">
              <dt className="sr-only">Clinical experience</dt>
              <dd className="font-serif text-3xl text-primary leading-none">{doctor.experienceYears}+</dd>
              <dd className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">Years clinical experience</dd>
            </div>
            <div className="py-3 px-2">
              <dt className="sr-only">Patients recovered</dt>
              <dd className="font-serif text-3xl text-primary leading-none">5000+</dd>
              <dd className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">Recovered patients</dd>
            </div>
          </dl>
        </figure>

      </div>
    </section>
  );
};
