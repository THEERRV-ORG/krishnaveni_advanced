import React from 'react';
import { Doctor } from '../types';

interface AboutDoctorProps {
  doctor: Doctor;
  onOpenBooking: () => void;
}

const QUALIFICATIONS = [
  { title: 'Master of Physiotherapy (Neurology)', detail: 'MPT', type: 'degree' },
  { title: 'Bachelor of Physiotherapy', detail: 'BPT', type: 'degree' },
  { title: 'Member, Indian Association of Physiotherapists', detail: 'MIAP', type: 'degree' },
  { title: 'Bobath technique', detail: 'Certified', type: 'cert' },
  { title: 'Proprioceptive neuromuscular facilitation', detail: 'PNF', type: 'cert' },
  { title: 'Kinesio taping', detail: 'Certified', type: 'cert' },
  { title: 'Spinal decompression and manual therapy', detail: 'Trained', type: 'cert' },
];

export const AboutDoctor: React.FC<AboutDoctorProps> = ({ doctor, onOpenBooking }) => {
  return (
    <section
      id="about"
      className="py-16 sm:py-24 scroll-mt-24 relative bg-paper"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div className="lg:col-span-6 min-w-0 flex flex-col lg:pr-8">
          <span className="band mb-5" />
          <h2 className="text-3xl sm:text-4xl font-bold" style={{color:'#000000'}}>About {doctor.name}</h2>
          <p className="mt-2 font-semibold" style={{color:'#0048a8'}}>{doctor.title}</p>

          <div className="mt-8 space-y-5 text-[17px] leading-relaxed font-medium" style={{color:'#1a2e47'}}>
            {doctor.bio.split(/\n\s*\n/).map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:pt-9">
          <h3 className="text-xl font-bold" style={{color:'#000000'}}>Qualifications and training</h3>
          <ul className="mt-6 space-y-2">
            {QUALIFICATIONS.map(item => (
              <li
                key={item.title}
                className={`qual-row flex items-center justify-between gap-4 pl-4 py-3 pr-4 rounded-r-lg border-l-4 backdrop-blur-sm ${
                  item.type === 'degree'
                    ? 'border-primary-deep qual-row--degree bg-white/80'
                    : 'border-accent qual-row--cert bg-white/80'
                }`}
              >
                <span className="text-[15px] font-medium leading-snug" style={{color:'#14233a'}}>{item.title}</span>
                <span className={`text-lg font-bold font-serif shrink-0 ${
                  item.type === 'degree' ? 'text-primary-deep' : 'text-accent-deep'
                }`}>
                  {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
};
