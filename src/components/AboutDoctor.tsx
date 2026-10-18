import React from 'react';
import { Doctor } from '../types';

interface AboutDoctorProps {
  doctor: Doctor;
  onOpenBooking: () => void;
}

const QUALIFICATIONS = [
  { title: 'Master of Physiotherapy (Neurology)', detail: 'MPT' },
  { title: 'Bachelor of Physiotherapy', detail: 'BPT' },
  { title: 'Member, Indian Association of Physiotherapists', detail: 'MIAP' },
  { title: 'Bobath technique', detail: 'Certified' },
  { title: 'Proprioceptive neuromuscular facilitation', detail: 'PNF' },
  { title: 'Kinesio taping', detail: 'Certified' },
  { title: 'Spinal decompression and manual therapy', detail: 'Trained' },
];

export const AboutDoctor: React.FC<AboutDoctorProps> = ({ doctor, onOpenBooking }) => {
  return (
    <section id="about" className="py-16 sm:py-24 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div className="lg:col-span-6">
          <span className="band mb-5" />
          <h2 className="text-3xl sm:text-4xl text-ink">About {doctor.name}</h2>
          <p className="mt-2 text-ink-mute">{doctor.title}</p>

          <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink-soft">
            {doctor.bio.split(/\n\s*\n/).map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenBooking}
            className="mt-8 text-primary font-semibold border-b-2 border-primary/30 hover:border-primary pb-0.5 transition-colors"
          >
            Book a consultation with Dr. Tejaswini →
          </button>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <h3 className="text-xl text-ink">Qualifications and training</h3>
          <ul className="mt-5 border-t border-line">
            {QUALIFICATIONS.map(item => (
              <li key={item.title} className="flex items-baseline justify-between gap-4 py-3.5 border-b border-line">
                <span className="text-ink">{item.title}</span>
                <span className="text-sm text-ink-mute shrink-0">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
};
