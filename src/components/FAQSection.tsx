import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQSectionProps {
  faqs: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openId, setOpenId] = useState<string>(faqs[0]?.id || '');

  return (
    <section id="faqs" className="py-16 sm:py-24 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <span className="band mb-5" />
          <h2 className="text-3xl sm:text-4xl text-ink">Questions patients ask</h2>
        </div>

        <div className="lg:col-span-8 border-t border-line">
          {faqs.map(faq => {
            const isOpen = openId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            return (
              <div key={faq.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? '' : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full text-left py-5 flex items-start justify-between gap-6 text-ink"
                >
                  <span className="text-[17px] font-semibold">{faq.question}</span>
                  {isOpen
                    ? <Minus className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    : <Plus className="w-5 h-5 text-ink-mute shrink-0 mt-0.5" />}
                </button>
                {isOpen && (
                  <p id={panelId} className="pb-6 pr-10 text-ink-soft leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
