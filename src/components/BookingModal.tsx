import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  Phone,
  Mail,
  Upload,
  CheckCircle2,
  Video,
  FileText,
  ArrowLeft,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  PenLine,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Service, ConsultationType, TimeSlot, Appointment } from '../types';

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
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
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = parseSlotMinutes(slotTimeString);
  return slotMinutes > currentMinutes;
}

// Indian mobile: 10 digits, starts with 6-9
function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

interface BookingModalProps {
  services?: Service[];
  preselectedService?: Service | null;
  initialType?: ConsultationType;
  initialReports?: { name: string; url: string; uploadedAt: string }[];
  initialProblemDescription?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  preselectedService = null,
  initialReports = [],
  initialProblemDescription = '',
  isOpen,
  onClose,
  onBookingComplete
}) => {
  const [step, setStep] = useState<number>(1);

  // Date & Slot
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const visibleSlots = useMemo(() => {
    return timeSlots.filter(slot => isSlotInFutureForDate(slot.timeString, selectedDate));
  }, [timeSlots, selectedDate]);

  useEffect(() => {
    if (visibleSlots.length > 0) {
      const isCurrentlyValid = visibleSlots.some(s => s.timeString === selectedSlot && s.isAvailable);
      if (!isCurrentlyValid) {
        const firstAvail = visibleSlots.find(s => s.isAvailable);
        setSelectedSlot(firstAvail ? firstAvail.timeString : visibleSlots[0].timeString);
      }
    } else {
      setSelectedSlot('');
    }
  }, [visibleSlots, selectedSlot]);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [problemDescription, setProblemDescription] = useState(initialProblemDescription || '');
  const [medicalReports, setMedicalReports] = useState<{ name: string; url: string; uploadedAt: string }[]>(initialReports);
  const [uploadingReport, setUploadingReport] = useState(false);

  // Phone validation state
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation state
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const prevIsOpenRef = React.useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (!justOpened) return;
    setStep(1);
    setErrorMsg(null);
    setPhoneError(null);
    setPatientName('');
    setPatientAge('');
    setPatientGender('');
    setPatientPhone('');
    setPatientEmail('');
    setPatientAddress('');
    setProblemDescription(initialProblemDescription || '');
    setMedicalReports(initialReports && initialReports.length > 0 ? initialReports : []);
    setSubmitting(false);
    setConfirmedAppointment(null);
    setCopiedMsg(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/slots?date=${selectedDate}`);
        const data = await res.json();
        setTimeSlots(data.slots || []);
        if (data.slots && data.slots.length > 0) {
          const available = data.slots.find((s: TimeSlot) => s.isAvailable);
          if (available) setSelectedSlot(available.timeString);
        }
      } catch (err) {
        console.error('Failed to fetch slots', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReport(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, fileData: base64 })
        });
        const data = await res.json();
        setMedicalReports(prev => [...prev, data]);
      } catch {
        setMedicalReports(prev => [
          ...prev,
          { name: file.name, url: URL.createObjectURL(file), uploadedAt: new Date().toISOString().split('T')[0] }
        ]);
      } finally {
        setUploadingReport(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    setPatientPhone(digits);
    if (digits.length === 0) {
      setPhoneError(null);
    } else if (digits.length < 10) {
      setPhoneError('Enter a 10-digit Indian mobile number');
    } else if (!isValidIndianPhone(digits)) {
      setPhoneError('Number must start with 6, 7, 8, or 9');
    } else {
      setPhoneError(null);
    }
  };

  const handleSubmitBooking = async () => {
    if (!patientName.trim()) { setErrorMsg('Please enter your name.'); return; }
    if (!patientPhone.trim()) { setErrorMsg('Please enter your phone number.'); return; }
    if (!isValidIndianPhone(patientPhone)) { setErrorMsg('Please enter a valid 10-digit Indian mobile number.'); return; }
    if (!patientEmail.trim()) { setErrorMsg('Please enter your email.'); return; }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          patientAge: patientAge ? Number(patientAge) : undefined,
          patientGender: patientGender || undefined,
          patientPhone: patientPhone.trim(),
          patientEmail: patientEmail.trim(),
          patientAddress: patientAddress.trim() || 'N/A',
          serviceId: preselectedService?.id || 'online-consult',
          consultationType: 'Online Consultation',
          date: selectedDate,
          timeSlot: selectedSlot || '10:00 AM - 10:45 AM',
          problemDescription: problemDescription.trim() || 'Online Physiotherapy Consultation',
          medicalReports,
          amountPaid: 0,
          paymentMethod: 'Pending'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Booking failed. Please try again.');
      }

      const appointment: Appointment = await res.json();
      setConfirmedAppointment(appointment);
      onBookingComplete(appointment);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Stepper ────────────────────────────────────────────────────────────────
  const stepLabels = ['Date & Slot', 'Your Details', 'Confirmed!'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden flex flex-col max-h-[96vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-sm sm:text-base leading-tight">
                Book a Consultation
              </h2>
              <p className="text-blue-100 text-[10px] sm:text-xs font-medium">
                Dr. P. Sai Tejaswini, MPT (Neuro)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="bg-slate-50 px-5 py-3 flex items-center gap-1 shrink-0 border-b border-slate-200">
          {stepLabels.map((label, idx) => {
            const n = idx + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <React.Fragment key={n}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                    isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : n}
                  </div>
                  <span className={`text-[11px] font-bold hidden sm:block ${isActive ? 'text-blue-700' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-5">

          {/* ── STEP 1: Date & Slot ── */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              {/* Date picker */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayDateString()}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Time slots */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Available Slots
                </label>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading slots…</span>
                  </div>
                ) : visibleSlots.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No slots available for this date. Please choose another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {visibleSlots.map(slot => (
                      <button
                        key={slot.timeString}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot.timeString)}
                        className={`text-xs font-bold py-2.5 px-2 rounded-xl border-2 transition-all text-center ${
                          selectedSlot === slot.timeString
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                            : slot.isAvailable
                              ? 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer'
                              : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.timeString}
                        {!slot.isAvailable && (
                          <span className="block text-[9px] font-normal mt-0.5">Booked</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: Patient Details ── */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-blue-800 font-semibold">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                <span>{selectedDate} · {selectedSlot}</span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 32"
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={e => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">Gender</label>
                  <select
                    value={patientGender}
                    onChange={e => setPatientGender(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-600 font-bold">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={patientPhone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    className={`flex-1 border rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:outline-none ${
                      phoneError ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="flex items-center gap-1 text-red-600 text-[11px] font-semibold mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {phoneError}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={patientEmail}
                  onChange={e => setPatientEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">Address</label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={patientAddress}
                  onChange={e => setPatientAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Problem */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">
                  <PenLine className="w-3.5 h-3.5 text-blue-600" />
                  Problem / Chief Complaint
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your symptoms or reason for consultation…"
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Medical Reports */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Medical Reports (optional)
                </label>
                {medicalReports.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {medicalReports.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-emerald-900 truncate flex-1">{r.name}</span>
                        <button
                          type="button"
                          onClick={() => setMedicalReports(prev => prev.filter((_, j) => j !== i))}
                          className="text-slate-400 hover:text-red-500 ml-1 shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl px-4 py-3 transition-colors group">
                  {uploadingReport ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                  )}
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600">
                    {uploadingReport ? 'Uploading…' : 'Attach a report (PDF, JPG, PNG)'}
                  </span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Confirmed ── */}
          {step === 3 && confirmedAppointment && (() => {
            const meetLink = confirmedAppointment.meetingLink || '';
            const waMsg = encodeURIComponent(
              `Hi! I've booked a physiotherapy consultation.\n\nBooking ID: ${confirmedAppointment.id}\nDate: ${confirmedAppointment.date}\nSlot: ${confirmedAppointment.timeSlot}\nDoctor: Dr. P. Sai Tejaswini\n\nMeet Link: ${meetLink}`
            );
            const waUrl = `https://wa.me/?text=${waMsg}`;

            const copyDetails = () => {
              navigator.clipboard.writeText(
                `Booking ID: ${confirmedAppointment.id}\nDate: ${confirmedAppointment.date}\nSlot: ${confirmedAppointment.timeSlot}\nMeet: ${meetLink}`
              );
              setCopiedMsg(true);
              setTimeout(() => setCopiedMsg(false), 2500);
            };

            return (
              <div className="space-y-4 animate-in zoom-in-95 text-left py-1">
                {/* Success banner */}
                <div className="text-center space-y-2 pb-3 border-b border-slate-100">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Booking Confirmed!</h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    Online Video Consultation with Dr. P. Sai Tejaswini, MPT (Neuro)
                  </p>
                </div>

                {/* Booking ID card */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-lg border border-blue-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 block">
                    Booking Reference ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-black text-white tracking-wider">
                      {confirmedAppointment.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(confirmedAppointment.id);
                        setCopiedMsg(true);
                        setTimeout(() => setCopiedMsg(false), 2000);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-cyan-200 text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedMsg ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-xs text-cyan-200 font-medium">
                    {confirmedAppointment.date} · {confirmedAppointment.timeSlot}
                  </div>
                </div>

                {/* Meet link */}
                {meetLink && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-blue-950 text-sm">Google Meet Video Consultation</h4>
                        <p className="text-xs text-blue-900 font-medium mt-0.5 leading-relaxed">
                          Join 5 minutes before your scheduled slot.
                        </p>
                      </div>
                    </div>
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      Join Consultation Room
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>
                )}

                {/* Share & copy */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 px-3 rounded-xl transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={copyDetails}
                    className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-3 rounded-xl transition-all"
                  >
                    {copiedMsg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    {copiedMsg ? 'Copied!' : 'Copy Details'}
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Footer navigation */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all ml-auto cursor-pointer"
            >
              Next: Your Details
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              disabled={submitting || !patientName.trim() || !patientPhone.trim() || !patientEmail.trim() || !!phoneError}
              onClick={handleSubmitBooking}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all ml-auto cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  Confirm Booking
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all ml-auto cursor-pointer"
            >
              Done &amp; Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
