import React from 'react';
import { Testimonial } from '../types';
import { whatsappLink } from '../utils/whatsapp';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  whatsapp: string;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials, whatsapp }) => {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-paper-deep/60 border-y border-line scroll-mt-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="band mb-5" />
        <h2 className="text-3xl sm:text-4xl text-ink">From patients</h2>
      </div>

      <div className="mt-12 relative">
        <div className="flex gap-6 w-max animate-marquee">
          {doubled.map((t, idx) => (
            <figure
              key={`${t.id}-${idx}`}
              className="w-[320px] shrink-0 bg-white rounded-xl border border-line p-6 shadow-sm flex flex-col"
            >
              <span className="text-3xl text-primary font-serif leading-none mb-1">{'"'}</span>
              <blockquote className="text-[15px] leading-relaxed text-ink flex-1">
                {t.comment}
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-line text-sm">
                <span className="font-semibold text-ink">{t.patientName}</span>
                <span className="block text-ink-mute mt-0.5">{t.treatment} {'·'} {formatDate(t.date)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="mt-10 text-ink-soft">
          Treated by Dr. Tejaswini ?{' '}
          <a
            href={whatsappLink(whatsapp, 'Hello Dr. Tejaswini, I would like to share feedback about my treatment.')}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-semibold underline underline-offset-4"
          >
            Send your feedback on WhatsApp
          </a>
          .
        </p>
      </div>
    </section>
  );
};
