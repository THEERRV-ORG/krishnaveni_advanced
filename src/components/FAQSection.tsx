import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQSectionProps {
  faqs: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openId, setOpenId] = useState<string>('');

  return (
    <section id="faq" className="py-16 sm:py-24 scroll-mt-24 bg-ink text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Questions patients ask</h2>
        </div>

        <div className="divide-y divide-white/10">
          {faqs.map(faq => {
            const isOpen = openId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            return (
              <div key={faq.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? '' : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full text-left py-5 flex items-center justify-between gap-6 text-white"
                >
                  <span className="text-[16px] font-medium">{faq.question}</span>
                  <ChevronDown
                    className="w-5 h-5 shrink-0 transition-transform duration-300"
                    style={{ color: '#10a9cc', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {isOpen && (
                  <p id={panelId} className="pb-6 pr-8 text-white/60 leading-relaxed text-sm">
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
