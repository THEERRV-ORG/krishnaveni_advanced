import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  CalendarCheck,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Service, ConsultationType, TimeSlot, Appointment } from '../types';
import { BookingError, createBooking, getTakenSeats, type SiteContent } from '../lib/data';
import { whatsappLink } from '../utils/whatsapp';
import { useScrollLock } from '../hooks/useScrollLock';

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getEndOfCurrentMonthDateString(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const y = lastDay.getFullYear();
  const m = String(lastDay.getMonth() + 1).padStart(2, '0');
  const d = String(lastDay.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseSlotMinutes(timeString: string): number {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function isSlotInFutureForDate(slotTimeString: string, dateStr: string): boolean {
  const todayStr = getTodayDateString();
  if (dateStr > todayStr) return true;
  if (dateStr < todayStr) return false;
  const now = new Date();
  return parseSlotMinutes(slotTimeString) > now.getHours() * 60 + now.getMinutes();
}

// Indian mobile: 10 digits, starts with 6-9, not all same digit
function isValidIndianPhone(phone: string): boolean {
  const d = phone.replace(/\s/g, '');
  if (!/^[6-9]\d{9}$/.test(d)) return false;
  if (/^(\d)\1{9}$/.test(d)) return false; // e.g. 9999999999
  return true;
}

function validateName(value: string): string {
  const t = value.trim();
  if (!t) return 'Full name is required.';
  if (t.length < 3) return 'Name must be at least 3 characters.';
  if (!/^[a-zA-ZÀ-ɏ\s'.'-]+$/.test(t)) return 'Name should contain letters only.';
  if (/^(.)\1+$/i.test(t.replace(/\s/g, ''))) return 'Please enter your real name.';
  return '';
}

function validateAge(value: number | ''): string {
  if (value === '') return '';
  if (value < 1 || value > 120) return 'Enter a valid age between 1 and 120.';
  return '';
}

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'trashmail.com', 'fakeinbox.com',
  'maildrop.cc', 'dispostable.com', 'mailnull.com', 'spamgourmet.com',
  'getairmail.com', 'spamherelots.com', 'tempr.email', 'discard.email',
  'mailnesia.com', 'spamex.com', 'trashmail.io', 'tempinbox.com',
]);

function validateEmail(value: string): string {
  const v = value.trim().toLowerCase();
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
  const domain = v.split('@')[1];
  if (DISPOSABLE_DOMAINS.has(domain)) return 'Disposable email addresses are not allowed.';
  const local = v.split('@')[0];
  if (/^(.)\1{4,}/.test(local)) return 'Enter a valid email address.'; // e.g. aaaa@gmail.com
  return '';
}

function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTimeRange(timeSlot: string): string {
  const match = timeSlot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeSlot;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const mer = match[3].toUpperCase();
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  const endTotal = h * 60 + m + 45;
  let eh = Math.floor(endTotal / 60) % 24;
  const em = endTotal % 60;
  const eMer = eh < 12 ? 'AM' : 'PM';
  if (eh > 12) eh -= 12;
  if (eh === 0) eh = 12;
  return `${timeSlot} – ${eh}:${String(em).padStart(2, '0')} ${eMer}`;
}

const inputClass =
  'w-full bg-white border border-line rounded-md px-3 py-2.5 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';
const labelClass = 'block text-sm text-ink-soft mb-1';

interface BookingModalProps {
  content: SiteContent;
  services?: Service[];
  preselectedService?: Service | null;
  initialType?: ConsultationType;
  initialReports?: { name: string; url: string; uploadedAt: string }[];
  initialProblemDescription?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (appointment: Appointment) => void;
}

const STEP_LABELS = ['Date and time', 'Your details', 'Submitted'];

export const BookingModal: React.FC<BookingModalProps> = ({
  content,
  preselectedService = null,
  initialProblemDescription = '',
  isOpen,
  onClose,
  onBookingComplete,
}) => {
  useScrollLock(isOpen);
  const [step, setStep] = useState<number>(1);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const visibleSlots = useMemo(
    () => timeSlots.filter(slot => isSlotInFutureForDate(slot.timeString, selectedDate)),
    [timeSlots, selectedDate],
  );

  useEffect(() => {
    if (visibleSlots.length > 0) {
      const isCurrentlyValid = visibleSlots.some(s => s.timeString === selectedSlot && s.isAvailable);
      if (!isCurrentlyValid) {
        const firstAvail = visibleSlots.find(s => s.isAvailable);
        setSelectedSlot(firstAvail ? firstAvail.timeString : '');
      }
    } else {
      setSelectedSlot('');
    }
  }, [visibleSlots, selectedSlot]);

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [problemDescription, setProblemDescription] = useState(initialProblemDescription || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copied, setCopied] = useState<'id' | 'details' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (!justOpened) return;
    setStep(1);
    setErrorMsg(null);
    setPhoneError(null);
    setNameError('');
    setAgeError('');
    setEmailError('');
    setPatientName('');
    setPatientAge('');
    setPatientGender('');
    setPatientPhone('');
    setPatientEmail('');
    setPatientAddress('');
    setProblemDescription(initialProblemDescription || '');
    setSubmitting(false);
    setConfirmedAppointment(null);
    setCopied(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const taken = await getTakenSeats(selectedDate);
        if (cancelled) return;
        setTimeSlots(content.schedule.timeSlots.map(slot => {
          const bookedCount = taken.get(slot.id)?.size ?? 0;
          return {
            ...slot,
            maxCapacity: content.schedule.maxPerSlot,
            bookedCount,
            isAvailable: slot.isAvailable && bookedCount < content.schedule.maxPerSlot,
          };
        }));
      } catch (err) {
        console.error('Failed to load free times', err);
        if (!cancelled) setTimeSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };
    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, isOpen, content.schedule]);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    setPatientPhone(digits);
    if (digits.length === 0) setPhoneError(null);
    else if (digits.length < 10) setPhoneError('Enter a 10-digit mobile number.');
    else if (!isValidIndianPhone(digits)) setPhoneError('Indian mobile numbers start with 6, 7, 8 or 9.');
    else setPhoneError(null);
  };

  const handleSubmitBooking = async () => {
    const nErr = validateName(patientName);
    const aErr = validateAge(patientAge);
    const pErr = patientPhone ? (isValidIndianPhone(patientPhone) ? '' : 'Indian mobile numbers start with 6, 7, 8 or 9.') : 'Mobile number is required.';
    const eErr = validateEmail(patientEmail);
    setNameError(nErr);
    setAgeError(aErr);
    setPhoneError(pErr || null);
    setEmailError(eErr);
    if (nErr || aErr || pErr || eErr) return;

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const slot = content.schedule.timeSlots.find(s => s.timeString === selectedSlot);
      if (!slot) throw new BookingError('Choose one of the available times.');
      const appointment = await createBooking(
        {
          patientName: patientName.trim(),
          patientAge: patientAge ? Number(patientAge) : undefined,
          patientGender: patientGender || undefined,
          patientPhone: patientPhone.trim(),
          patientEmail: patientEmail.trim(),
          patientAddress: patientAddress.trim(),
          problemDescription: problemDescription.trim() || 'Online Physiotherapy Consultation',
          service: preselectedService,
          date: selectedDate,
          slot,
        },
        content,
      );
      setConfirmedAppointment(appointment);
      setStep(3);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 0);
      onBookingComplete(appointment);
    } catch (err) {
      console.error('Booking failed', err);
      setErrorMsg(
        err instanceof BookingError
          ? err.message
          : 'The booking could not be saved. Try again, or contact us on WhatsApp.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (text: string, which: 'id' | 'details') => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="bg-paper w-full max-w-xl rounded-t-lg sm:rounded-lg shadow-xl flex flex-col max-h-[96vh]"
      >

        <div className={`px-6 border-b border-line flex items-start justify-between gap-4 shrink-0 ${step === 3 ? 'pt-3 pb-2' : 'pt-5 pb-4'}`}>
          <div>
            {step !== 3 && <h2 id="booking-title" className="text-2xl text-ink">Book a consultation</h2>}
            {step !== 3 && <p className="text-sm text-ink-mute mt-0.5">With Dr. P. Sai Tejaswini · 45 minutes on Google Meet</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 -mr-2 text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step !== 3 && (
        <ol className="px-6 py-3 flex gap-5 text-sm border-b border-line shrink-0">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1;
            return (
              <li
                key={label}
                aria-current={step === n ? 'step' : undefined}
                className={step === n ? 'text-ink font-semibold' : step > n ? 'text-primary' : 'text-ink-mute'}
              >
                {n}. {label}
              </li>
            );
          })}
        </ol>
        )}

        <div ref={scrollRef} className="overflow-y-auto overscroll-contain flex-1 px-6 py-6">

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="booking-date" className={labelClass}>Date</label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  min={getTodayDateString()}
                  max={getEndOfCurrentMonthDateString()}
                  onChange={e => setSelectedDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <p className={labelClass}>Time</p>
                {loadingSlots ? (
                  <p className="flex items-center gap-2 py-8 text-ink-mute">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading times…
                  </p>
                ) : visibleSlots.length === 0 ? (
                  <p className="py-8 text-ink-soft">No times left on this date. Choose another day.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {visibleSlots.map(slot => (
                      <button
                        key={slot.timeString}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot.timeString)}
                        aria-pressed={selectedSlot === slot.timeString}
                        className={`text-sm py-2.5 px-2 rounded-md border transition-colors ${
                          selectedSlot === slot.timeString
                            ? 'bg-primary border-primary text-paper'
                            : slot.isAvailable
                              ? 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100 hover:border-green-400'
                              : 'bg-gray-100 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {slot.timeString}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-ink-soft">
                {formatLongDate(selectedDate)}, {selectedSlot}
              </p>

              <div>
                <label htmlFor="p-name" className={labelClass}>Full name</label>
                <input
                  id="p-name"
                  type="text"
                  autoComplete="name"
                  value={patientName}
                  onChange={e => { setPatientName(e.target.value); if (nameError) setNameError(validateName(e.target.value)); }}
                  onBlur={() => setNameError(validateName(patientName))}
                  className={`${inputClass} ${nameError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                />
                {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="p-age" className={labelClass}>Age <span className="text-ink-mute">(optional)</span></label>
                  <input
                    id="p-age"
                    type="number"
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={e => { const v = e.target.value ? Number(e.target.value) : ''; setPatientAge(v); if (ageError) setAgeError(validateAge(v)); }}
                    onBlur={() => setAgeError(validateAge(patientAge))}
                    className={`${inputClass} ${ageError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                  {ageError && <p className="mt-1 text-sm text-red-600">{ageError}</p>}
                </div>
                <div>
                  <label htmlFor="p-gender" className={labelClass}>Gender <span className="text-ink-mute">(optional)</span></label>
                  <select id="p-gender" value={patientGender} onChange={e => setPatientGender(e.target.value as any)} className={inputClass}>
                    <option value="">—</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="p-phone" className={labelClass}>Mobile number</label>
                <div className="flex gap-2">
                  <span className="shrink-0 border border-line rounded-md px-3 py-2.5 text-ink-soft bg-paper-deep">+91</span>
                  <input
                    id="p-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={patientPhone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    aria-invalid={Boolean(phoneError)}
                    aria-describedby={phoneError ? 'p-phone-error' : undefined}
                    className={`${inputClass} ${phoneError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                </div>
                {phoneError && (
                  <p id="p-phone-error" className="mt-1 text-sm text-red-700">{phoneError}</p>
                )}
              </div>

              <div>
                <label htmlFor="p-email" className={labelClass}>Email</label>
                <input
                  id="p-email"
                  type="email"
                  autoComplete="email"
                  value={patientEmail}
                  onChange={e => { setPatientEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                  onBlur={() => setEmailError(validateEmail(patientEmail))}
                  className={`${inputClass} ${emailError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                />
                {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
              </div>

              <div>
                <label htmlFor="p-city" className={labelClass}>City <span className="text-ink-mute">(optional)</span></label>
                <input id="p-city" type="text" autoComplete="address-level2" value={patientAddress} onChange={e => setPatientAddress(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label htmlFor="p-problem" className={labelClass}>Describe your condition or concern</label>
                <textarea
                  id="p-problem"
                  rows={3}
                  maxLength={300}
                  placeholder="Where it hurts, for how long, and anything that makes it better or worse."
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-xs text-ink-mute text-right">{problemDescription.length}/300</p>
              </div>

              <p className="text-sm text-ink-soft bg-primary-wash rounded-md px-3 py-2.5">
                Have scans, X-rays or reports? Send them on{' '}
                <a
                  href={whatsappLink(content.clinic.whatsapp, 'Hello Dr. Tejaswini, I am sending my reports for my upcoming consultation.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-semibold underline underline-offset-4"
                >
                  WhatsApp
                </a>{' '}
                after booking, with your booking ID.
              </p>

              {errorMsg && (
                <p role="alert" className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {errorMsg}
                </p>
              )}
            </div>
          )}

          {step === 3 && confirmedAppointment && (() => {
            const meetLink = confirmedAppointment.meetingLink || '';
            const details =
              `Booking ID: ${confirmedAppointment.id}\n` +
              `Date: ${formatLongDate(confirmedAppointment.date)}\n` +
              `Time: ${confirmedAppointment.timeSlot}\n` +
              `With: Dr. P. Sai Tejaswini` +
              (meetLink ? `\nGoogle Meet: ${meetLink}` : '');
            const waUrl = `https://wa.me/?text=${encodeURIComponent(details)}`;

            return (
              <div>
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-6 h-6 text-green-600 shrink-0" />
                  <h3 className="text-xl text-ink">Appointment booking request submitted</h3>
                </div>
                <p className="mt-1 text-ink-soft">Your booking is awaiting clinic approval. Updates will be sent to you on WhatsApp.</p>

                <div className="mt-6 space-y-2">
                  <div className="bg-surface-soft border border-line rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-ink-mute mb-0.5">Booking ID</p>
                      <p className="font-mono text-sm text-ink">{confirmedAppointment.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(confirmedAppointment.id, 'id')}
                      className="text-sm text-primary flex items-center gap-1 shrink-0"
                    >
                      {copied === 'id' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === 'id' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-soft border border-line rounded-lg px-4 py-3">
                      <p className="text-xs text-ink-mute mb-0.5">Date</p>
                      <p className="text-sm text-ink">{formatLongDate(confirmedAppointment.date)}</p>
                    </div>
                    <div className="bg-surface-soft border border-line rounded-lg px-4 py-3">
                      <p className="text-xs text-ink-mute mb-0.5">Time</p>
                      <p className="text-sm text-ink">{formatTimeRange(confirmedAppointment.timeSlot)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-l-[3px] border-blue-500 bg-surface-muted rounded-r-md px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-ink">What happens next?</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-ink-mute" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-green-500" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.95 2C6.408 2 2 6.408 2 11.95c0 1.953.561 3.773 1.526 5.312L2 22l4.859-1.49A9.903 9.903 0 0 0 11.95 22C17.492 22 22 17.592 22 11.95S17.492 2 11.95 2z"/></svg>
                  </div>
                  <p className="text-sm text-ink-mute">Once the clinic approves your request, you'll receive the Google Meet link via email and WhatsApp.</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <button
                    type="button"
                    onClick={() => copyText(details, 'details')}
                    className="text-primary font-semibold underline underline-offset-4"
                  >
                    {copied === 'details' ? 'Details copied' : 'Copy all details'}
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

        <div className={`px-6 border-t border-line flex items-center justify-between shrink-0 ${step === 3 ? 'py-2' : 'py-4'}`}>
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <span />
          )}

          {step === 1 && (
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
              className="bg-accent hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              Continue
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              disabled={submitting || !patientName.trim() || !patientPhone || !patientEmail.trim() || Boolean(phoneError)}
              onClick={handleSubmitBooking}
              className="flex items-center gap-2 bg-accent hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Booking…' : 'Confirm booking'}
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={onClose}
              className="bg-ink hover:bg-ink/90 text-paper font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
