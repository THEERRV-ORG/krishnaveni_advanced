import React, { useState } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { ClinicInfo } from '../types';
import { whatsappLink } from '../utils/whatsapp';

interface ContactSectionProps {
  clinicInfo: ClinicInfo;
}

const inputClass =
  'w-full bg-white border border-line rounded-md px-3 py-2.5 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

function validateName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 3) return 'Name must be at least 3 characters.';
  if (!/^[a-zA-ZÀ-ɏ\s'.'-]+$/.test(trimmed)) return 'Name should contain letters only.';
  if (/^(.)\1+$/i.test(trimmed.replace(/\s/g, ''))) return 'Please enter your real name.';
  return '';
}

export const ContactSection: React.FC<ContactSectionProps> = ({ clinicInfo }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [message, setMessage] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (nameError) setNameError(validateName(e.target.value));
  };

  const handleNameBlur = () => {
    setNameError(validateName(name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateName(name);
    if (error) { setNameError(error); return; }
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
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-1 shrink-0 text-primary" aria-hidden />
              <div>
                <dt className="sr-only">Phone and WhatsApp</dt>
                <dd>
                  <a href={`tel:${clinicInfo.phone.replace(/\s/g, '')}`} className="text-ink text-lg hover:text-primary">
                    {clinicInfo.phone}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-1 shrink-0 text-primary" aria-hidden />
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a href={`mailto:${clinicInfo.email}`} className="text-ink text-lg hover:text-primary">
                    {clinicInfo.email}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-1 shrink-0 text-primary" aria-hidden />
              <div>
                <dt className="sr-only">Consultation hours</dt>
                {hours.map(line => (
                  <dd key={line} className="text-ink">{line}</dd>
                ))}
              </div>
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
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              aria-describedby={nameError ? 'name-error' : undefined}
              className={`${inputClass} ${nameError ? 'border-red-400 focus:ring-red-300 focus:border-red-400' : ''}`}
            />
            {nameError && <p id="name-error" className="mt-1 text-sm text-red-500">{nameError}</p>}
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
