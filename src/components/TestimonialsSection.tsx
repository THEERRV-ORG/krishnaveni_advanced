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
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-paper-deep/60 border-y border-line scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="band mb-5" />
        <h2 className="text-3xl sm:text-4xl text-ink">From patients</h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
          {testimonials.map(t => (
            <figure key={t.id}>
              <blockquote className="font-serif text-xl leading-relaxed text-ink">
                “{t.comment}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="text-ink font-semibold">{t.patientName}</span>
                <span className="text-ink-mute"> · {t.treatment} · {formatDate(t.date)}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-14 text-ink-soft">
          Treated by Dr. Tejaswini?{' '}
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
