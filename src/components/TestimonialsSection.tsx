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
  // The strip is two identical halves and slides left by exactly one half, so the loop is seamless.
  // Each half repeats the reviews until it is wider than large screens (8 cards ≈ 2750px).
  const repeats = Math.max(1, Math.ceil(8 / Math.max(testimonials.length, 1)));
  const half = Array.from({ length: repeats }, () => testimonials).flat();
  const strip = [...half, ...half];
  // Keep the speed constant (about one card every 10 seconds) however many reviews there are.
  const duration = `${half.length * 10}s`;

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-paper-deep/60 border-y border-line scroll-mt-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="band mb-5" />
        <h2 className="text-3xl sm:text-4xl text-ink">From patients</h2>
      </div>

      <div className="mt-12 relative">
        {/* pr-6 adds the gap after the last card too, so each half is exactly as wide as its cards plus gaps. */}
        <div className="flex gap-6 pr-6 w-max animate-marquee" style={{ animationDuration: duration }}>
          {strip.map((t, idx) => (
            <figure
              key={`${t.id}-${idx}`}
              aria-hidden={idx >= testimonials.length || undefined}
              className="w-[320px] shrink-0 bg-white rounded-xl border border-line p-6 shadow-sm flex flex-col"
            >
              {t.rating > 0 ? (
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < t.rating ? 'text-amber-400' : 'text-line'} aria-hidden>★</span>
                    ))}
                  </span>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-label="Google review">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              ) : (
                <span className="text-3xl text-primary font-serif leading-none mb-1">{'"'}</span>
              )}
              <blockquote className="text-[15px] leading-relaxed text-ink flex-1">
                {t.comment}
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-line text-sm">
                <span className="font-semibold text-ink">{t.patientName}</span>
                {t.rating === 0 && (
                  <span className="block text-ink-mute mt-0.5">{t.treatment} {'·'} {formatDate(t.date)}</span>
                )}
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
