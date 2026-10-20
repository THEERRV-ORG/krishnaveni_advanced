import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DepartmentInfo } from '../types';
import { CLINICAL_DEPARTMENTS } from '../data/departmentsData';
import { useScrollLock } from '../hooks/useScrollLock';
import neuroImg from '../assets/images/conditions/neuro.jpg';
import orthoImg from '../assets/images/conditions/ortho.jpg';
import postOpImg from '../assets/images/conditions/post-op.jpg';
import sportsImg from '../assets/images/conditions/sports.jpg';
import womensHealthImg from '../assets/images/conditions/womens-health.jpg';
import cardioPulmonaryImg from '../assets/images/conditions/cardio-pulmonary.jpg';

// Kept here rather than in departmentsData, which the server also imports and cannot load images.
const DEPT_IMAGE: Record<string, { src: string; alt: string }> = {
  'dept-neuro': { src: neuroImg, alt: 'A physiotherapist supporting a stroke patient walking between parallel bars' },
  'dept-ortho': { src: orthoImg, alt: "A physiotherapist assessing a patient's lower back on a treatment table" },
  'dept-postop': { src: postOpImg, alt: 'A physiotherapist guiding a knee exercise after knee replacement surgery' },
  'dept-sports': { src: sportsImg, alt: "A physiotherapist applying kinesiology tape to an athlete's knee" },
  'dept-gynae-womens': { src: womensHealthImg, alt: 'A physiotherapist guiding a pregnant woman through a gentle exercise' },
  'dept-cardio-pulmonary': { src: cardioPulmonaryImg, alt: 'A physiotherapist coaching a patient on a rehab exercise bike' },
};

export const ServicesGrid: React.FC = () => {
  const [selected, setSelected] = useState<string>('All');
  const [activeDept, setActiveDept] = useState<DepartmentInfo | null>(null);
  useScrollLock(activeDept !== null);

  const tabs = ['All', ...CLINICAL_DEPARTMENTS.map(d => d.shortCode)];
  const visible = selected === 'All'
    ? CLINICAL_DEPARTMENTS
    : CLINICAL_DEPARTMENTS.filter(d => d.shortCode === selected);

  return (
    <section id="conditions" className="py-16 sm:py-24 bg-paper-deep/60 border-y border-line scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="max-w-2xl">
          <span className="band mb-5" />
          <h2 className="text-3xl sm:text-4xl text-ink">Conditions treated</h2>
          <p className="mt-4 text-ink-soft text-[17px] leading-relaxed">
            Six areas of practice. Open any of them for the conditions covered, what the video
            assessment involves, and Dr. Tejaswini's guidance.
          </p>
        </div>

        <div role="tablist" aria-label="Filter by area" className="mt-10 flex gap-6 overflow-x-auto [scrollbar-width:none] border-b border-line -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected === tab}
              onClick={() => setSelected(tab)}
              className={`shrink-0 py-3 -mb-px border-b-2 text-sm transition-colors ${
                selected === tab
                  ? 'border-primary text-ink font-semibold'
                  : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <ul className="divide-y divide-line">
          {visible.map(dept => (
            <li key={dept.id} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 px-3 -mx-3 rounded-lg transition-colors duration-200 hover:bg-primary-wash/80 group">
              {DEPT_IMAGE[dept.id] && (
                <button
                  type="button"
                  onClick={() => setActiveDept(dept)}
                  aria-label={`Read details: ${dept.name}`}
                  className="md:col-span-3 overflow-hidden rounded-md bg-paper-deep aspect-[3/2] self-start"
                >
                  <img
                    src={DEPT_IMAGE[dept.id].src}
                    alt={DEPT_IMAGE[dept.id].alt}
                    loading="lazy"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              )}
              <div className="md:col-span-3">
                <h3 className="text-xl text-ink">{dept.name}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{dept.tagline}</p>
              </div>
              <p className="md:col-span-4 text-[15px] text-ink leading-relaxed">
                {dept.whatWeTreat.map(item => item.condition).join(' · ')}
              </p>
              <div className="md:col-span-2 flex md:justify-end text-sm">
                <button
                  type="button"
                  onClick={() => setActiveDept(dept)}
                  className="text-primary font-semibold hover:underline underline-offset-4"
                >
                  Read details →
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeDept && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center sm:p-6"
          onClick={() => setActiveDept(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dept-title"
            onClick={e => e.stopPropagation()}
            className="bg-paper w-full max-w-3xl max-h-[92vh] flex flex-col rounded-t-lg sm:rounded-lg shadow-xl"
          >
            <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-line flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink-mute">{activeDept.shortCode}</p>
                <h3 id="dept-title" className="mt-1 text-2xl sm:text-3xl text-ink">{activeDept.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDept(null)}
                aria-label="Close"
                className="p-2 -mr-2 text-ink-soft hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6 overflow-y-auto overscroll-contain space-y-10">
              {DEPT_IMAGE[activeDept.id] && (
                <img
                  src={DEPT_IMAGE[activeDept.id].src}
                  alt={DEPT_IMAGE[activeDept.id].alt}
                  className="w-full aspect-[5/2] object-cover rounded-md bg-paper-deep"
                />
              )}
              <p className="text-[17px] leading-relaxed text-ink-soft">{activeDept.overview}</p>

              <div>
                <h4 className="text-lg text-ink">Conditions</h4>
                <dl className="mt-4 divide-y divide-line border-y border-line">
                  {activeDept.whatWeTreat.map(item => (
                    <div key={item.condition} className="py-4">
                      <dt className="font-semibold text-ink">{item.condition}</dt>
                      <dd className="mt-1 text-sm text-ink-soft leading-relaxed">{item.description}</dd>
                      <dd className="mt-2 text-sm text-ink-mute">
                        Common signs: {item.keySymptoms.join(', ')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h4 className="text-lg text-ink">What the video assessment involves</h4>
                <ol className="mt-4 space-y-4">
                  {activeDept.consultationProtocol.map((proto, idx) => (
                    <li key={proto.step} className="grid grid-cols-[2rem_1fr] gap-2">
                      <span className="font-serif text-primary font-bold">{idx + 1}.</span>
                      <div>
                        <p className="font-semibold text-ink">{proto.step}</p>
                        <p className="mt-1 text-sm text-ink-soft leading-relaxed">{proto.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-lg text-ink mb-3">Dr. Tejaswini's guidance</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {activeDept.expertGuidance.map((guide) => (
                    <li key={guide} className="bg-white border border-line rounded-xl p-5 shadow-sm">
                      <p className="text-sm text-ink leading-relaxed">{guide}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDept(null)}
                className="px-5 py-2 text-sm font-semibold text-ink border border-line rounded-md bg-white hover:border-primary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
