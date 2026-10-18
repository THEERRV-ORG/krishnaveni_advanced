import React from 'react';
import { ClinicInfo, Doctor } from '../types';
import { DoctorPortrait } from './DoctorPortrait';
import { whatsappLink } from '../utils/whatsapp';

interface HeroBannerProps {
  onOpenBooking: () => void;
  doctor: Doctor;
  clinicInfo: ClinicInfo;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenBooking, doctor, clinicInfo }) => {
  return (
    <section className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

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

          <div className="mt-8 flex flex-wrap items-center gap-3">
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

          <dl className="mt-10 pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
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

        <figure className="lg:col-span-5 w-full max-w-[15rem] sm:max-w-xs lg:max-w-none">
          <DoctorPortrait doctor={doctor} className="w-full aspect-[4/5] rounded-sm" />
          <figcaption className="mt-3 text-sm text-ink-soft font-serif italic">
            {doctor.name}, MPT (Neurology), MIAP — {doctor.title.toLowerCase()}.
          </figcaption>
        </figure>

      </div>
    </section>
  );
};
