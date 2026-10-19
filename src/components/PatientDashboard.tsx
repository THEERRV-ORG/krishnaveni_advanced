import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ExternalLink, Loader2, Video, X } from 'lucide-react';
import { Appointment } from '../types';
import { whatsappLink } from '../utils/whatsapp';
import { getBookingById } from '../lib/data';
import { useScrollLock } from '../hooks/useScrollLock';

interface PatientDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onBookNew: () => void;
  whatsapp: string;
}

const STATUS_STYLE: Record<string, { dot: string; text: string }> = {
  Confirmed: { dot: 'bg-primary', text: 'text-primary' },
  Pending: { dot: 'bg-amber-500', text: 'text-amber-700' },
  Completed: { dot: 'bg-ink-mute', text: 'text-ink-soft' },
  Cancelled: { dot: 'bg-red-500', text: 'text-red-700' },
};

const BOOKING_ID_RE = /^APT-\d{4}-[A-Z0-9]{6}$/;

const inputClass =
  'w-full bg-white border border-line rounded-md px-3 py-2.5 text-ink font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ isOpen, onClose, onBookNew, whatsapp }) => {
  useScrollLock(isOpen);
  const [bookingId, setBookingId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Appointment | null>(null);

  useEffect(() => {
    if (isOpen) setLookupError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = bookingId.trim().toUpperCase();
    if (!BOOKING_ID_RE.test(id)) {
      setLookupError('Booking IDs look like APT-2026-K7Q2MX. Check the ID on your confirmation screen.');
      return;
    }
    setLoading(true);
    setLookupError('');
    try {
      const found = await getBookingById(id);
      if (!found) {
        setLookupError('No booking has that ID. Check it, or message the clinic on WhatsApp.');
        return;
      }
      setBooking(found);
    } catch {
      setLookupError('The booking could not be loaded. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const bookNew = () => {
    onClose();
    onBookNew();
  };

  const status = booking ? STATUS_STYLE[booking.status] ?? STATUS_STYLE.Pending : null;
  const isActive = booking?.status === 'Confirmed' || booking?.status === 'Pending';

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-title"
        className="bg-paper w-full max-w-xl rounded-t-lg sm:rounded-lg shadow-xl flex flex-col max-h-[94vh]"
      >
        <div className="px-6 pt-5 pb-4 border-b border-line flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2 id="portal-title" className="text-2xl text-ink">Track a booking</h2>
            <p className="text-sm text-ink-mute mt-0.5">Krishnaveni Advanced Physiotherapy &amp; Rehabilitation Services</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 -mr-2 text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-8 overflow-y-auto overscroll-contain">
          {!booking ? (
            <>
              <form onSubmit={handleSubmit}>
                <p className="text-ink-soft leading-relaxed">
                  Enter the booking ID from your confirmation screen to see your time and consultation link.
                </p>

                <label htmlFor="portal-booking-id" className="block text-sm text-ink-soft mt-7 mb-1">Booking ID</label>
                <input
                  id="portal-booking-id"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                  placeholder="APT-2026-K7Q2MX"
                  aria-invalid={Boolean(lookupError)}
                  aria-describedby={lookupError ? 'portal-error' : undefined}
                  className={inputClass}
                />

                {lookupError && (
                  <p id="portal-error" role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {lookupError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !bookingId.trim()}
                  className="mt-5 inline-flex items-center gap-2 bg-accent hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold px-5 py-2.5 rounded-md transition-colors"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Looking up…' : 'Find my booking'}
                </button>
              </form>

              <div className="mt-10 pt-6 border-t border-line space-y-2 text-sm text-ink-soft">
                <p>
                  Lost your booking ID?{' '}
                  <a
                    href={whatsappLink(whatsapp, 'Hello, I booked a consultation but lost my booking ID.')}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-semibold underline underline-offset-4"
                  >
                    Ask the clinic on WhatsApp
                  </a>
                </p>
                <p>
                  No booking yet?{' '}
                  <button type="button" onClick={bookNew} className="text-primary font-semibold underline underline-offset-4">
                    Book a consultation
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => {
                  setBooking(null);
                  setBookingId('');
                }}
                className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
              >
                <ArrowLeft className="w-4 h-4" />
                Look up another booking
              </button>

              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-xl text-ink">{booking.serviceName || 'Online consultation'}</h3>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${status!.text}`}>
                  <span className={`w-2 h-2 rounded-full ${status!.dot}`} aria-hidden />
                  {booking.status}
                </span>
              </div>

              <dl className="mt-5 border-y border-line divide-y divide-line">
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-sm text-ink-mute">Patient</dt>
                  <dd className="text-ink text-right">{booking.patientName}</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-sm text-ink-mute">Date</dt>
                  <dd className="text-ink text-right">{formatLongDate(booking.date)}</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-sm text-ink-mute">Time</dt>
                  <dd className="text-ink">{booking.timeSlot}</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-sm text-ink-mute">Booking ID</dt>
                  <dd className="font-mono text-ink">{booking.id}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                {booking.status === 'Confirmed' && booking.meetingLink && (
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-deep text-paper font-semibold px-4 py-2 rounded-md transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Open the consultation link
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                )}
                <a
                  href={whatsappLink(
                    whatsapp,
                    `Hello Dr. Tejaswini, I'm writing about booking ${booking.id} on ${booking.date} at ${booking.timeSlot}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-semibold underline underline-offset-4"
                >
                  Message the clinic
                </a>
              </div>

              {isActive && (
                <p className="mt-6 text-sm text-ink-soft">
                  Need to cancel or change the time?{' '}
                  <a
                    href={whatsappLink(whatsapp, `Hello, I would like to cancel or reschedule booking ${booking.id} on ${booking.date} at ${booking.timeSlot}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-semibold underline underline-offset-4"
                  >
                    Message the clinic on WhatsApp
                  </a>{' '}
                  and they will update it.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
