import React, { useEffect } from 'react';
import { whatsappLink } from '../utils/whatsapp';

interface TestimonialsSectionProps {
  whatsapp: string;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ whatsapp }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://business.repu.ai/widget/reviews.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-paper-deep/60 border-y border-line scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="band mb-5" />
        <h2 className="text-3xl sm:text-4xl text-ink">From patients</h2>
      </div>

      <div className="mt-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div data-repu-inline="1e36d8c570ba9108" />
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
