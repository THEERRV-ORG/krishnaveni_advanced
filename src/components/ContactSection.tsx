import React, { useState } from 'react';
import { ClinicInfo } from '../types';
import { whatsappLink } from '../utils/whatsapp';

interface ContactSectionProps {
  clinicInfo: ClinicInfo;
}

const inputClass =
  'w-full bg-white border border-line rounded-md px-3 py-2.5 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

export const ContactSection: React.FC<ContactSectionProps> = ({ clinicInfo }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello Dr. Tejaswini, this is ${name.trim()}.\n\n${message.trim()}`;
    window.open(whatsappLink(clinicInfo.whatsapp, text), '_blank', 'noopener,noreferrer');
  };

  const hours = clinicInfo.workingHours.split('|').map(line => line.trim()).filter(Boolean);

  return (
    <section id="contact" className="py-16 sm:py-24 bg-paper-deep/60 border-t border-line scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div className="lg:col-span-5">
          <span className="band mb-5" />
          <h2 className="text-3xl sm:text-4xl text-ink">Contact</h2>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Not sure whether physiotherapy can help? Ask before you book.
          </p>

          <dl className="mt-8 space-y-5">
            <div>
              <dt className="text-sm text-ink-mute">Phone and WhatsApp</dt>
              <dd className="mt-1">
                <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="text-ink text-lg hover:text-primary">
                  {clinicInfo.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-mute">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${clinicInfo.email}`} className="text-ink text-lg hover:text-primary">
                  {clinicInfo.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-mute">Consultation hours</dt>
              {hours.map(line => (
                <dd key={line} className="mt-1 text-ink">{line}</dd>
              ))}
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-6 lg:col-start-7 space-y-4 self-start">
          <h3 className="text-xl text-ink">Send a question</h3>
          <div>
            <label htmlFor="contact-name" className="block text-sm text-ink-soft mb-1">Your name</label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm text-ink-soft mb-1">Your question</label>
            <textarea
              id="contact-message"
              rows={5}
              required
              placeholder="For example: I've had lower back pain for three months and an MRI shows a disc bulge."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-deep text-paper font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              Send on WhatsApp
            </button>
            <p className="text-sm text-ink-mute">Opens WhatsApp with your message ready to send.</p>
          </div>
        </form>

      </div>
    </section>
  );
};
