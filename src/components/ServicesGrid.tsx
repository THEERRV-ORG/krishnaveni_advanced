import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DepartmentInfo } from '../types';
import { CLINICAL_DEPARTMENTS } from '../data/departmentsData';

interface ServicesGridProps {
  onOpenBooking: (preloadedIssue?: string) => void;
}

const BOOK_LABEL: Record<string, string> = {
  'dept-neuro': 'Book a neuro consultation',
  'dept-ortho': 'Book an ortho consultation',
  'dept-postop': 'Book a post-op consultation',
  'dept-sports': 'Book a sports injury consultation',
  'dept-gynae-womens': "Book a women's health consultation",
  'dept-cardio-pulmonary': 'Book a cardio-pulmonary consultation',
};

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onOpenBooking }) => {
  const [selected, setSelected] = useState<string>('All');
  const [activeDept, setActiveDept] = useState<DepartmentInfo | null>(null);

  const tabs = ['All', ...CLINICAL_DEPARTMENTS.map(d => d.shortCode)];
  const visible = selected === 'All'
    ? CLINICAL_DEPARTMENTS
    : CLINICAL_DEPARTMENTS.filter(d => d.shortCode === selected);

  const book = (dept: DepartmentInfo) => {
    setActiveDept(null);
    onOpenBooking(`${dept.name}: `);
  };

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
              <div className="md:col-span-4">
                <h3 className="text-xl text-ink">{dept.name}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{dept.tagline}</p>
              </div>
              <p className="md:col-span-5 text-[15px] text-ink leading-relaxed">
                {dept.whatWeTreat.map(item => item.condition).join(' · ')}
              </p>
              <div className="md:col-span-3 flex md:flex-col md:items-end gap-4 md:gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => book(dept)}
                  className="text-primary font-semibold hover:underline underline-offset-4 text-left md:text-right"
                >
                  {BOOK_LABEL[dept.id] ?? 'Book a consultation'} →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDept(dept)}
                  className="text-ink-soft hover:text-ink underline underline-offset-4 decoration-line"
                >
                  Read details
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

            <div className="px-6 sm:px-8 py-6 overflow-y-auto space-y-10">
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

            <div className="px-6 sm:px-8 py-4 border-t border-line flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveDept(null)}
                className="px-4 py-2 text-sm text-ink-soft hover:text-ink"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => book(activeDept)}
                className="bg-accent hover:bg-accent-deep text-ink font-semibold text-sm px-5 py-2 rounded-md transition-colors"
              >
                {BOOK_LABEL[activeDept.id] ?? 'Book a consultation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
