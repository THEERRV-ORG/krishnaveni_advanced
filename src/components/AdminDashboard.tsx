import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Download,
  ExternalLink,
  Loader2,
  LogOut,
  Phone,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Appointment, Doctor } from '../types';
import { whatsappLink } from '../utils/whatsapp';
import { DoctorPortrait } from './DoctorPortrait';
import {
  adminErrorMessage,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutAdmin,
  watchAdminUser,
} from '../lib/adminAuth';
import {
  cancelAppointment,
  getDefaultMeetingLink,
  isAdminAccount,
  isSiteSetUp,
  listAppointments,
  reopenAppointment,
  saveDoctorPhoto,
  seedSiteContent,
  setDefaultMeetingLink,
  updateAppointmentFields,
} from '../lib/data';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor;
  maxPerSlot: number;
  onDoctorUpdated?: (doctor: Doctor) => void;
}

type Tab = 'overview' | 'appointments' | 'settings';
type StatusFilter = 'All' | 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
type WhenFilter = 'Upcoming' | 'Past' | 'All dates';

const STATUS_STYLE: Record<string, { dot: string; text: string }> = {
  Confirmed: { dot: 'bg-primary', text: 'text-primary' },
  Pending: { dot: 'bg-amber-500', text: 'text-amber-700' },
  Completed: { dot: 'bg-ink-mute', text: 'text-ink-soft' },
  Cancelled: { dot: 'bg-red-500', text: 'text-red-700' },
};

const inputClass =
  'w-full bg-white border border-line rounded-md px-3 py-2.5 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';
const labelClass = 'block text-sm text-ink-soft mb-1';

function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function slotMinutes(slot: string): number {
  const m = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(m[2], 10);
}

function byDateThenTime(a: Appointment, b: Appointment): number {
  return a.date === b.date ? slotMinutes(a.timeSlot) - slotMinutes(b.timeSlot) : a.date.localeCompare(b.date);
}

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', opts);
}

const isActive = (a: Appointment) => a.status === 'Confirmed' || a.status === 'Pending';

const StatusLabel: React.FC<{ status: string }> = ({ status }) => {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${style.text}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`} aria-hidden />
      {status}
    </span>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, doctor, maxPerSlot, onDoctorUpdated }) => {
  // 'checking' until Firebase reports whether a Google session exists and the server accepts it.
  const [authState, setAuthState] = useState<'checking' | 'signedOut' | 'signedIn'>('checking');
  const [adminEmail, setAdminEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const signedIn = authState === 'signedIn';

  const [tab, setTab] = useState<Tab>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [whenFilter, setWhenFilter] = useState<WhenFilter>('Upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    return watchAdminUser(async user => {
      if (!user) {
        setAuthState('signedOut');
        return;
      }
      try {
        const email = user.email?.toLowerCase() ?? '';
        if (!user.emailVerified || !email || !(await isAdminAccount(email))) {
          await signOutAdmin();
          setLoginError(`${user.email ?? 'This account'} is not an admin. Ask the clinic to add it in Firebase.`);
          setAuthState('signedOut');
          return;
        }
        setAdminEmail(email);
        setLoginError('');
        setAuthState('signedIn');
      } catch (err) {
        await signOutAdmin();
        setLoginError(adminErrorMessage(err, 'Sign-in could not be checked. Try again.'));
        setAuthState('signedOut');
      }
    });
  }, [isOpen]);

  const loadAppointments = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setAppointments(await listAppointments());
    } catch (err) {
      setLoadError(adminErrorMessage(err, 'Bookings could not be loaded. Refresh to try again.'));
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    const cell = (value: unknown) => {
      let text = value === undefined || value === null ? '' : String(value);
      // Stop spreadsheet apps treating patient-entered text as a formula.
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const header = ['Booking ID', 'Patient', 'Age', 'Gender', 'Phone', 'Email', 'City', 'Date', 'Time', 'Status', 'Complaint', 'Booked at'];
    const rows = appointments.map(a => [
      a.id, a.patientName, a.patientAge, a.patientGender, a.patientPhone, a.patientEmail, a.patientAddress,
      a.date, a.timeSlot, a.status, a.problemDescription, a.createdAt,
    ]);
    const csv = '\uFEFF' + [header, ...rows].map(r => r.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments-${localToday()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isOpen && signedIn) loadAppointments();
  }, [isOpen, signedIn]);

  const today = localToday();

  const counts = useMemo(() => ({
    today: appointments.filter(a => a.date === today && isActive(a)).length,
    upcoming: appointments.filter(a => a.date >= today && isActive(a)).length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length,
  }), [appointments, today]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = appointments.filter(a => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (whenFilter === 'Upcoming' && a.date < today) return false;
      if (whenFilter === 'Past' && a.date >= today) return false;
      if (!term) return true;
      return [a.id, a.patientName, a.patientPhone, a.patientEmail, a.problemDescription]
        .some(v => (v || '').toLowerCase().includes(term));
    });
    list.sort(byDateThenTime);
    if (whenFilter !== 'Upcoming') list.reverse();
    return list;
  }, [appointments, search, statusFilter, whenFilter, today]);

  const selected = appointments.find(a => a.id === selectedId) ?? null;

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setLoginError('');
    try {
      await signInWithGoogle();
      // watchAdminUser checks the account with the server and finishes signing in.
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setLoginError('Google sign-in did not complete. Allow pop-ups for this site and try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    await signOutAdmin();
    setAppointments([]);
    setSelectedId(null);
    setTab('overview');
  };

  const openAppointment = (id: string) => {
    setSelectedId(id);
    setTab('appointments');
  };

  const replaceAppointment = (updated: Appointment) => {
    setAppointments(list => list.map(a => (a.id === updated.id ? updated : a)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-paper flex flex-col">
      <header className="shrink-0 border-b border-line bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/apple-touch-icon.png" alt="" width={36} height={36} className="w-9 h-9 shrink-0" />
            <div className="min-w-0">
              <p className="font-serif text-lg leading-tight text-ink truncate">Clinic admin</p>
              <p className="text-xs text-ink-mute truncate">Krishnaveni Advanced Physiotherapy &amp; Rehabilitation Services</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {signedIn && (
              <button type="button" onClick={signOut} className="hidden sm:inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Close admin" className="p-2 -mr-2 text-ink-soft hover:text-ink">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {signedIn && (
          <nav aria-label="Admin sections" className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-6 text-sm">
            {([
              ['overview', 'Overview'],
              ['appointments', `Appointments (${appointments.length})`],
              ['settings', 'Settings'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={`py-3 -mb-px border-b-2 transition-colors ${
                  tab === id ? 'border-primary text-ink font-semibold' : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
            <button type="button" onClick={signOut} className="sm:hidden ml-auto py-3 text-ink-soft">
              Sign out
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {!signedIn ? (
          <div className="max-w-sm mx-auto px-4 py-16">
            <span className="band mb-5" />
            <h1 className="text-3xl text-ink">Sign in</h1>
            <p className="mt-2 text-ink-soft">For clinic staff only. Use the clinic's Google account.</p>

            {!isFirebaseConfigured ? (
              <p role="alert" className="mt-8 flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                Firebase is not configured. Add the VITE_FIREBASE_* settings to .env and restart the server.
              </p>
            ) : authState === 'checking' ? (
              <p className="mt-8 flex items-center gap-2 text-ink-soft">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking your sign-in…
              </p>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="mt-8 w-full inline-flex items-center justify-center gap-3 bg-white border border-line hover:border-primary text-ink font-semibold py-2.5 rounded-md transition-colors disabled:opacity-60"
              >
                {signingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg aria-hidden width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
                  </svg>
                )}
                {signingIn ? 'Waiting for Google…' : 'Sign in with Google'}
              </button>
            )}

            {loginError && (
              <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {loginError}
              </p>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {loadError && (
              <p role="alert" className="mb-6 flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {loadError}
              </p>
            )}

            {tab === 'overview' && (
              <Overview
                appointments={appointments}
                counts={counts}
                today={today}
                loading={loading}
                onOpen={openAppointment}
                onRefresh={loadAppointments}
              />
            )}

            {tab === 'appointments' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`lg:col-span-7 ${selected ? 'hidden lg:block' : ''}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[14rem]">
                      <Search className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
                      <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Name, phone, email, booking ID or complaint"
                        aria-label="Search bookings"
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                    <button type="button" onClick={loadAppointments} aria-label="Refresh" className="p-2.5 border border-line rounded-md text-ink-soft hover:text-ink bg-white">
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button type="button" onClick={downloadCsv} className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-line rounded-md text-sm text-ink-soft hover:text-ink bg-white">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div className="flex gap-1" aria-label="When">
                      {(['Upcoming', 'Past', 'All dates'] as const).map(w => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setWhenFilter(w)}
                          aria-pressed={whenFilter === w}
                          className={`px-3 py-1.5 rounded-md ${whenFilter === w ? 'bg-primary-wash text-primary-deep font-semibold' : 'text-ink-soft hover:text-ink'}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1" aria-label="Status">
                      {(['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatusFilter(s)}
                          aria-pressed={statusFilter === s}
                          className={`px-3 py-1.5 rounded-md ${statusFilter === s ? 'bg-primary-wash text-primary-deep font-semibold' : 'text-ink-soft hover:text-ink'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-ink-mute">{filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'}</p>

                  {filtered.length === 0 ? (
                    <p className="mt-6 text-ink-soft">No bookings match these filters.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-line border-y border-line">
                      {filtered.map(a => (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(a.id)}
                            aria-current={selectedId === a.id ? 'true' : undefined}
                            className={`w-full text-left py-3.5 px-3 -mx-3 grid grid-cols-[5.5rem_1fr_auto] gap-4 items-baseline rounded-md transition-colors ${
                              selectedId === a.id ? 'bg-primary-wash' : 'hover:bg-paper-deep'
                            }`}
                          >
                            <span className="text-sm text-ink">
                              {formatDate(a.date, { day: 'numeric', month: 'short' })}
                              <span className="block text-ink-mute">{a.timeSlot.split(' - ')[0]}</span>
                            </span>
                            <span className="min-w-0">
                              <span className="block text-ink font-semibold truncate">{a.patientName}</span>
                              <span className="block text-sm text-ink-mute truncate">
                                {a.patientPhone} · {a.problemDescription || 'No complaint given'}
                              </span>
                            </span>
                            <StatusLabel status={a.status} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className={`lg:col-span-5 ${selected ? '' : 'hidden lg:block'}`}>
                  {selected ? (
                    <AppointmentDetail
                      key={selected.id}
                      appointment={selected}
                      onBack={() => setSelectedId(null)}
                      onUpdated={replaceAppointment}
                      maxPerSlot={maxPerSlot}
                    />
                  ) : (
                    <p className="lg:sticky lg:top-0 text-ink-mute border border-dashed border-line rounded-md p-6">
                      Select a booking to see the patient's details.
                    </p>
                  )}
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <Settings
                doctor={doctor}
                onDoctorUpdated={onDoctorUpdated}
                adminEmail={adminEmail}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ---------------------------------------------------------------------------

interface OverviewProps {
  appointments: Appointment[];
  counts: { today: number; upcoming: number; completed: number; cancelled: number };
  today: string;
  loading: boolean;
  onOpen: (id: string) => void;
  onRefresh: () => void;
}

const Overview: React.FC<OverviewProps> = ({ appointments, counts, today, loading, onOpen, onRefresh }) => {
  const todays = appointments.filter(a => a.date === today && isActive(a)).sort(byDateThenTime);
  const weekEnd = addDays(today, 7);
  const thisWeek = appointments
    .filter(a => a.date > today && a.date <= weekEnd && isActive(a))
    .sort(byDateThenTime);

  const row = (a: Appointment, showDate: boolean) => (
    <li key={a.id}>
      <button
        type="button"
        onClick={() => onOpen(a.id)}
        className="w-full text-left py-3.5 grid grid-cols-[7rem_1fr_auto] gap-4 items-baseline hover:bg-paper-deep px-3 -mx-3 rounded-md"
      >
        <span className="text-sm text-ink">
          {showDate && <span className="block">{formatDate(a.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>}
          <span className={showDate ? 'text-ink-mute' : ''}>{a.timeSlot.split(' - ')[0]}</span>
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-ink truncate">{a.patientName}</span>
          <span className="block text-sm text-ink-mute truncate">{a.problemDescription || 'No complaint given'}</span>
        </span>
        <span className="text-sm text-primary">Open →</span>
      </button>
    </li>
  );

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl text-ink">{formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
        <button type="button" onClick={onRefresh} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 border-y border-line divide-x divide-line">
        {([
          ['Today', counts.today],
          ['Upcoming', counts.upcoming],
          ['Completed', counts.completed],
          ['Cancelled', counts.cancelled],
        ] as const).map(([label, value], idx) => (
          <div key={label} className={`py-5 px-4 ${idx === 2 ? 'border-t md:border-t-0 border-line' : ''} ${idx === 3 ? 'border-t md:border-t-0 border-line' : ''}`}>
            <dt className="text-sm text-ink-mute">{label}</dt>
            <dd className="mt-1 font-serif text-3xl text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="text-xl text-ink">Today's consultations</h2>
        {todays.length === 0 ? (
          <p className="mt-3 text-ink-soft">No consultations booked for today.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">{todays.map(a => row(a, false))}</ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl text-ink">Next 7 days</h2>
        {thisWeek.length === 0 ? (
          <p className="mt-3 text-ink-soft">Nothing booked in the next week.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">{thisWeek.map(a => row(a, true))}</ul>
        )}
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------

interface AppointmentDetailProps {
  appointment: Appointment;
  onBack: () => void;
  onUpdated: (appointment: Appointment) => void;
  maxPerSlot: number;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({ appointment: a, onBack, onUpdated, maxPerSlot }) => {
  const [meetLink, setMeetLink] = useState(a.meetingLink || '');
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const run = async (key: string, action: () => Promise<Appointment>, message: string) => {
    setSaving(key);
    setError('');
    setNotice('');
    try {
      onUpdated(await action());
      setNotice(message);
      setConfirmingCancel(false);
    } catch (err) {
      setError(adminErrorMessage(err, 'The change could not be saved. Try again.'));
    } finally {
      setSaving(null);
    }
  };

  const facts: [string, React.ReactNode][] = [
    ['When', `${formatDate(a.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${a.timeSlot}`],
    ['Age and gender', [a.patientAge, a.patientGender].filter(Boolean).join(' · ') || '—'],
    ['Phone', (
      <span className="flex flex-wrap gap-x-4">
        <a href={`tel:${a.patientPhone}`} className="text-ink hover:text-primary inline-flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />{a.patientPhone}
        </a>
        <a href={whatsappLink(a.patientPhone.length === 10 ? `91${a.patientPhone}` : a.patientPhone, `Hello ${a.patientName}, this is Krishnaveni Advanced Physiotherapy about your booking ${a.id}.`)} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
          WhatsApp
        </a>
      </span>
    )],
    ['Email', <a href={`mailto:${a.patientEmail}`} className="text-ink hover:text-primary break-all">{a.patientEmail}</a>],
    ['City', a.patientAddress && a.patientAddress !== 'N/A' ? a.patientAddress : '—'],
    ['Booked', a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'],
  ];
  if (a.amountPaid > 0) facts.push(['Paid', `₹${a.amountPaid} · ${a.paymentMethod || 'online'}`]);
  if (a.status === 'Cancelled' && a.cancellationReason) facts.push(['Cancellation reason', a.cancellationReason]);

  return (
    <article className="lg:sticky lg:top-0 bg-white border border-line rounded-md">
      <div className="p-5 border-b border-line">
        <button type="button" onClick={onBack} className="lg:hidden mb-3 inline-flex items-center gap-1.5 text-sm text-ink-soft">
          <ArrowLeft className="w-4 h-4" /> All bookings
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl text-ink">{a.patientName}</h2>
            <p className="mt-1 text-sm text-ink-mute">Booking ID <span className="font-mono text-ink-soft">{a.id}</span></p>
          </div>
          <StatusLabel status={a.status} />
        </div>
      </div>

      <dl className="px-5 divide-y divide-line">
        {facts.map(([label, value]) => (
          <div key={label} className="py-3 grid grid-cols-[8.5rem_1fr] gap-3 text-sm">
            <dt className="text-ink-mute">{label}</dt>
            <dd className="text-ink min-w-0">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="px-5 py-4 border-t border-line">
        <h3 className="text-sm text-ink-mute">Complaint</h3>
        <p className="mt-1 text-ink leading-relaxed whitespace-pre-line">{a.problemDescription || 'No complaint given.'}</p>
      </div>


      <div className="px-5 py-4 border-t border-line">
        <label htmlFor="apt-meet" className="text-sm text-ink-mute">Consultation link</label>
        <div className="mt-1.5 flex gap-2">
          <input id="apt-meet" type="url" value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="https://meet.google.com/…" className={`${inputClass} text-sm`} />
          <button
            type="button"
            disabled={!meetLink.trim() || meetLink.trim() === (a.meetingLink || '') || saving !== null}
            onClick={() => run('link', () => updateAppointmentFields(a, { meetingLink: meetLink.trim() }), 'Consultation link saved.')}
            className="shrink-0 px-3.5 border border-line rounded-md text-sm text-ink hover:border-primary disabled:opacity-40"
          >
            {saving === 'link' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </div>
        {a.meetingLink && (
          <a href={a.meetingLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary">
            Open link <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="px-5 py-4 border-t border-line">
        {error && (
          <p role="alert" className="mb-3 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </p>
        )}
        {notice && <p role="status" className="mb-3 text-sm text-primary">{notice}</p>}

        {confirmingCancel ? (
          <div className="space-y-3">
            <label htmlFor="cancel-reason" className={labelClass}>Reason (shown to the clinic only)</label>
            <input id="cancel-reason" type="text" value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="e.g. Patient asked to reschedule" className={`${inputClass} text-sm`} />
            <div className="flex gap-3">
              <button
                type="button"
                disabled={saving !== null}
                onClick={() => run('cancel', () => cancelAppointment(a, cancelReason.trim() || 'Cancelled by clinic'), 'Booking cancelled. The time is free again.')}
                className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-4 py-2 rounded-md disabled:opacity-60"
              >
                {saving === 'cancel' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Cancel booking
              </button>
              <button type="button" onClick={() => setConfirmingCancel(false)} className="text-sm text-ink-soft hover:text-ink">Keep it</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {isActive(a) && (
              <button
                type="button"
                disabled={saving !== null}
                onClick={() => run('complete', () => updateAppointmentFields(a, { status: 'Completed' }), 'Marked as completed.')}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-deep text-paper text-sm font-semibold px-4 py-2 rounded-md disabled:opacity-60"
              >
                {saving === 'complete' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Mark completed
              </button>
            )}
            {a.status === 'Pending' && (
              <button
                type="button"
                disabled={saving !== null}
                onClick={() => run('confirm', () => updateAppointmentFields(a, { status: 'Confirmed' }), 'Booking confirmed.')}
                className="px-4 py-2 border border-primary text-primary text-sm font-semibold rounded-md disabled:opacity-60"
              >
                Confirm
              </button>
            )}
            {isActive(a) && (
              <button type="button" onClick={() => setConfirmingCancel(true)} className="px-2 py-2 text-sm text-red-700 hover:text-red-800 underline underline-offset-4">
                Cancel booking
              </button>
            )}
            {!isActive(a) && (
              <button
                type="button"
                disabled={saving !== null}
                onClick={() => run('reopen', () => reopenAppointment(a, maxPerSlot), 'Booking reopened as confirmed.')}
                className="px-4 py-2 border border-line text-ink text-sm rounded-md hover:border-primary disabled:opacity-60"
              >
                Reopen as confirmed
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

// ---------------------------------------------------------------------------

interface SettingsProps {
  doctor?: Doctor;
  onDoctorUpdated?: (doctor: Doctor) => void;
  adminEmail: string;
}

type FormState = { busy: boolean; message: string; error: boolean };
const idle: FormState = { busy: false, message: '', error: false };
const failure = (err: unknown, fallback: string): FormState => ({
  busy: false,
  error: true,
  message: adminErrorMessage(err, fallback),
});

const Settings: React.FC<SettingsProps> = ({ doctor, onDoctorUpdated, adminEmail }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoState, setPhotoState] = useState<FormState>(idle);
  const [defaultLink, setDefaultLink] = useState('');
  const [linkState, setLinkState] = useState<FormState>(idle);

  useEffect(() => {
    getDefaultMeetingLink()
      .then(setDefaultLink)
      .catch(err => setLinkState(failure(err, 'The current link could not be loaded.')));
  }, []);

  const uploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoState({ busy: false, message: 'Choose a JPG, PNG or WEBP image.', error: true });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setPhotoState({ busy: false, message: 'The image is over 15 MB. Choose a smaller one.', error: true });
      return;
    }
    setPhotoState({ busy: true, message: '', error: false });
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = await shrinkImage(reader.result as string);
        await saveDoctorPhoto(dataUrl);
        if (doctor) onDoctorUpdated?.({ ...doctor, avatarUrl: dataUrl });
        setPhotoState({ busy: false, message: 'Photo updated on the website.', error: false });
      } catch (err) {
        setPhotoState(failure(err, 'The photo could not be uploaded. Try again.'));
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const saveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkState({ busy: true, message: '', error: false });
    try {
      await setDefaultMeetingLink(defaultLink.trim());
      setLinkState({ busy: false, message: 'Saved. New bookings will use this link.', error: false });
    } catch (err) {
      setLinkState(failure(err, 'The link could not be saved.'));
    }
  };

  const section = 'py-8 border-b border-line grid grid-cols-1 md:grid-cols-12 gap-6';

  return (
    <div className="border-t border-line">
      <SetupSection className={section} />

      <section className={section}>
        <div className="md:col-span-4">
          <h2 className="text-xl text-ink">Doctor's photo</h2>
          <p className="mt-1 text-sm text-ink-soft">Shown in the hero on the home page. A portrait, at least 800 px tall.</p>
        </div>
        <div className="md:col-span-8 flex items-start gap-5">
          {doctor && <DoctorPortrait doctor={doctor} className="w-28 aspect-[4/5] rounded-sm shrink-0" />}
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} className="sr-only" id="doctor-photo" />
            <label htmlFor="doctor-photo" className="inline-flex items-center gap-2 px-4 py-2 border border-line bg-white rounded-md text-sm text-ink cursor-pointer hover:border-primary">
              {photoState.busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {photoState.busy ? 'Uploading…' : 'Upload a new photo'}
            </label>
            {photoState.message && (
              <p className={`mt-2 text-sm ${photoState.error ? 'text-red-700' : 'text-primary'}`}>{photoState.message}</p>
            )}
          </div>
        </div>
      </section>

      <form onSubmit={saveLink} className={section}>
        <div className="md:col-span-4">
          <h2 className="text-xl text-ink">Default consultation link</h2>
          <p className="mt-1 text-sm text-ink-soft">Given to every new booking. You can change one booking's link from its details.</p>
        </div>
        <div className="md:col-span-8 max-w-lg">
          <label htmlFor="default-link" className={labelClass}>Link</label>
          <input id="default-link" type="url" required pattern="https://.*" value={defaultLink} onChange={e => setDefaultLink(e.target.value)} className={inputClass} />
          <button type="submit" disabled={linkState.busy} className="mt-3 inline-flex items-center gap-1.5 bg-primary hover:bg-primary-deep text-paper text-sm font-semibold px-4 py-2 rounded-md disabled:opacity-60">
            {linkState.busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save link
          </button>
          {linkState.message && (
            <p className={`mt-2 text-sm ${linkState.error ? 'text-red-700' : 'text-primary'}`}>{linkState.message}</p>
          )}
        </div>
      </form>

      <section className={section}>
        <div className="md:col-span-4">
          <h2 className="text-xl text-ink">Admin access</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Staff sign in with Google. To add someone, create a document named after their email in the admins collection in the Firebase console.
          </p>
        </div>
        <p className="md:col-span-8 text-ink">
          Signed in as <span className="font-semibold">{adminEmail}</span>
        </p>
      </section>
    </div>
  );
};

/** Resize and re-encode a photo so it fits in a Firestore document (well under 1 MB). */
function shrinkImage(dataUrl: string, maxSide = 900, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('That image could not be read.'));
    img.src = dataUrl;
  });
}

/** Shown until the site's starting content has been written to Firestore. */
const SetupSection: React.FC<{ className: string }> = ({ className }) => {
  const [state, setState] = useState<'checking' | 'needed' | 'done' | 'hidden'>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    isSiteSetUp()
      .then(done => setState(done ? 'hidden' : 'needed'))
      .catch(() => setState('hidden'));
  }, []);

  if (state === 'checking' || state === 'hidden') return null;

  const setUp = async () => {
    setBusy(true);
    setError('');
    try {
      await seedSiteContent();
      setState('done');
    } catch (err) {
      setError(adminErrorMessage(err, 'Setup could not be saved. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={className}>
      <div className="md:col-span-4">
        <h2 className="text-xl text-ink">First-time setup</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Copies the clinic details, time slots, services, FAQs and reviews into the database. Do this once.
        </p>
      </div>
      <div className="md:col-span-8">
        {state === 'done' ? (
          <p className="text-primary">Done. The website now reads its content from the database.</p>
        ) : (
          <>
            <button
              type="button"
              onClick={setUp}
              disabled={busy}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-deep text-paper text-sm font-semibold px-4 py-2 rounded-md disabled:opacity-60"
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Set up site content
            </button>
            {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
};
