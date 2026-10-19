import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Download, ExternalLink, FileText, Loader2, Video, X } from 'lucide-react';
import { Appointment } from '../types';
import { whatsappLink } from '../utils/whatsapp';

interface PatientDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onBookNew: () => void;
  whatsapp: string;
}

type Tab = 'appointments' | 'reports';
const FILTERS = ['All', 'Confirmed', 'Completed', 'Cancelled'] as const;

const STATUS_STYLE: Record<string, { dot: string; text: string }> = {
  Confirmed: { dot: 'bg-primary', text: 'text-primary' },
  Pending: { dot: 'bg-amber-500', text: 'text-amber-700' },
  Completed: { dot: 'bg-ink-mute', text: 'text-ink-soft' },
  Cancelled: { dot: 'bg-red-500', text: 'text-red-700' },
};

const inputClass =
  'w-full bg-white border border-line rounded-md px-3 py-2.5 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

function parseDate(iso: string): Date | null {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatLongDate(iso: string): string {
  const date = parseDate(iso);
  return date
    ? date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : iso;
}

async function findAppointments(identifier: string): Promise<Appointment[]> {
  // A booking ID must match exactly; partial matches would expose other patients' bookings.
  if (/^APT-/i.test(identifier)) {
    const res = await fetch(`/api/appointments/${encodeURIComponent(identifier.toUpperCase())}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error('lookup failed');
    return [await res.json()];
  }

  const digits = identifier.replace(/\D/g, '');
  const query = /^\+?[\d\s-]{8,}$/.test(identifier)
    ? `role=patient&phone=${encodeURIComponent(digits.slice(-10))}`
    : `role=patient&email=${encodeURIComponent(identifier.toLowerCase())}`;
  const res = await fetch(`/api/appointments?${query}`);
  if (!res.ok) throw new Error('lookup failed');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ isOpen, onClose, onBookNew, whatsapp }) => {
  const [identifier, setIdentifier] = useState('');
  const [lookedUpWith, setLookedUpWith] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [loading, setLoading] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (isOpen) setLookupError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const runLookup = async (value: string) => {
    setLoading(true);
    setLookupError('');
    try {
      const found = await findAppointments(value);
      if (found.length === 0) {
        setLookupError('No bookings match that. Use the mobile number, email or booking ID you gave when booking.');
        return;
      }
      setAppointments(found);
      setLookedUpWith(value);
    } catch {
      setLookupError('The booking records could not be reached. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = identifier.trim();
    if (value) runLookup(value);
  };

  const resetLookup = () => {
    setAppointments(null);
    setIdentifier('');
    setLookedUpWith('');
    setFilter('All');
    setActiveTab('appointments');
    setConfirmCancelId(null);
  };

  const bookNew = () => {
    onClose();
    onBookNew();
  };

  const cancelAppointment = async (id: string) => {
    setCancellingId(id);
    setCancelError('');
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled', cancellationReason: 'Cancelled by patient from portal' }),
      });
      if (!res.ok) throw new Error('cancel failed');
      setConfirmCancelId(null);
      const refreshed = await findAppointments(lookedUpWith);
      setAppointments(refreshed);
    } catch {
      setCancelError('The booking could not be cancelled. Try again, or message the clinic on WhatsApp.');
    } finally {
      setCancellingId(null);
    }
  };

  const reports = (appointments ?? []).flatMap(apt =>
    (apt.medicalReports ?? []).map(rep => ({ ...rep, appointmentId: apt.id })),
  );
  const visible = (appointments ?? []).filter(apt => filter === 'All' || apt.status === filter);
  const patientName = appointments?.[0]?.patientName;

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-title"
        className={`bg-paper w-full ${appointments ? 'max-w-3xl' : 'max-w-xl'} rounded-t-lg sm:rounded-lg shadow-xl flex flex-col max-h-[94vh]`}
      >
        <div className="px-6 pt-5 pb-4 border-b border-line flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2 id="portal-title" className="text-2xl text-ink">
              {appointments ? `Bookings for ${patientName}` : 'Track a booking'}
            </h2>
            <p className="text-sm text-ink-mute mt-0.5">
              {appointments
                ? `Found with ${lookedUpWith}`
                : 'Krishnaveni Advanced Physiotherapy & Rehabilitation Services'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 -mr-2 text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!appointments ? (
          <div className="px-6 py-8 sm:py-10 overflow-y-auto">
            <form onSubmit={handleSubmit} className="max-w-md">
              <p className="text-ink-soft leading-relaxed">
                See your consultation times, Google Meet links and the reports you shared. Use the details you gave
                when you booked.
              </p>

              <label htmlFor="portal-identifier" className="block text-sm text-ink-soft mt-7 mb-1">
                Mobile number, email or booking ID
              </label>
              <input
                id="portal-identifier"
                type="text"
                autoComplete="off"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="9876543210, you@example.com or APT-2026-1234"
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
                disabled={loading || !identifier.trim()}
                className="mt-5 inline-flex items-center gap-2 bg-accent hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold px-5 py-2.5 rounded-md transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Looking up…' : 'Find my bookings'}
              </button>
            </form>

            <p className="mt-10 pt-6 border-t border-line text-sm text-ink-soft">
              No booking yet?{' '}
              <button type="button" onClick={bookNew} className="text-primary font-semibold underline underline-offset-4">
                Book a consultation
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 flex items-end justify-between gap-4 border-b border-line shrink-0">
              <div role="tablist" className="flex gap-6">
                {([
                  ['appointments', `Appointments (${appointments.length})`],
                  ['reports', `Reports (${reports.length})`],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === id}
                    onClick={() => setActiveTab(id)}
                    className={`py-3 -mb-px border-b-2 text-sm transition-colors ${
                      activeTab === id ? 'border-primary text-ink font-semibold' : 'border-transparent text-ink-soft hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={resetLookup}
                className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
              >
                <ArrowLeft className="w-4 h-4" />
                Look up another
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-6">
              {activeTab === 'appointments' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1 text-sm" aria-label="Filter by status">
                      {FILTERS.map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFilter(f)}
                          aria-pressed={filter === f}
                          className={`px-3 py-1.5 rounded-md transition-colors ${
                            filter === f ? 'bg-primary-wash text-primary-deep font-semibold' : 'text-ink-soft hover:text-ink'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={bookNew} className="text-sm text-primary font-semibold hover:underline underline-offset-4">
                      Book another consultation →
                    </button>
                  </div>

                  {cancelError && (
                    <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {cancelError}
                    </p>
                  )}

                  {visible.length === 0 ? (
                    <p className="mt-10 text-ink-soft">No {filter.toLowerCase()} bookings.</p>
                  ) : (
                    <ul className="mt-5 divide-y divide-line border-y border-line">
                      {visible.map(apt => {
                        const date = parseDate(apt.date);
                        const status = STATUS_STYLE[apt.status] ?? STATUS_STYLE.Pending;
                        const canJoin = apt.status === 'Confirmed' && Boolean(apt.meetingLink);
                        const isConfirming = confirmCancelId === apt.id;
                        return (
                          <li key={apt.id} className="py-5 grid grid-cols-[3.5rem_1fr] sm:grid-cols-[4rem_1fr] gap-4">
                            <div className="text-center leading-none pt-1">
                              <span className="block font-serif text-3xl text-ink">{date ? date.getDate() : '—'}</span>
                              <span className="block mt-1 text-xs text-ink-mute">
                                {date ? date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <h3 className="text-lg text-ink">{apt.serviceName || 'Online consultation'}</h3>
                                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${status.text}`}>
                                  <span className={`w-2 h-2 rounded-full ${status.dot}`} aria-hidden />
                                  {apt.status}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-ink-soft">
                                {formatLongDate(apt.date)} · {apt.timeSlot}
                              </p>
                              <p className="mt-1 text-sm text-ink-mute">
                                Booking ID <span className="font-mono text-ink-soft">{apt.id}</span>
                                {apt.amountPaid > 0 && <> · ₹{apt.amountPaid} paid</>}
                              </p>

                              {isConfirming ? (
                                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                                  <span className="text-ink">Cancel this booking?</span>
                                  <button
                                    type="button"
                                    disabled={cancellingId === apt.id}
                                    onClick={() => cancelAppointment(apt.id)}
                                    className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-semibold px-3.5 py-1.5 rounded-md"
                                  >
                                    {cancellingId === apt.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Yes, cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmCancelId(null)}
                                    className="text-ink-soft hover:text-ink"
                                  >
                                    Keep it
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                  {canJoin && (
                                    <a
                                      href={apt.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-deep text-paper font-semibold px-4 py-2 rounded-md transition-colors"
                                    >
                                      <Video className="w-4 h-4" />
                                      Join on Google Meet
                                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                                    </a>
                                  )}
                                  <a
                                    href={whatsappLink(
                                      whatsapp,
                                      `Hello Dr. Tejaswini, I'm writing about booking ${apt.id} on ${apt.date} at ${apt.timeSlot}.`,
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary font-semibold underline underline-offset-4"
                                  >
                                    Message the clinic
                                  </a>
                                  {apt.status === 'Confirmed' && (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmCancelId(apt.id)}
                                      className="text-red-700 hover:text-red-800 underline underline-offset-4"
                                    >
                                      Cancel booking
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}

              {activeTab === 'reports' && (
                reports.length === 0 ? (
                  <p className="text-ink-soft">
                    You haven't shared any reports. You can attach scans or X-rays when you book a consultation.
                  </p>
                ) : (
                  <ul className="divide-y divide-line border-y border-line">
                    {reports.map((rep, idx) => (
                      <li key={`${rep.appointmentId}-${idx}`} className="py-4 flex items-center gap-4">
                        <FileText className="w-5 h-5 text-primary shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-ink truncate">{rep.name}</p>
                          <p className="text-sm text-ink-mute">
                            Shared {rep.uploadedAt} · booking <span className="font-mono">{rep.appointmentId}</span>
                          </p>
                        </div>
                        <a
                          href={rep.url}
                          download={rep.name}
                          className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline underline-offset-4"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
