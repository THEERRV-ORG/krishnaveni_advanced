import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore/lite';
import { db, isFirebaseConfigured } from './firebase';
import type { Appointment, AppointmentStatus, ClinicInfo, Doctor, FAQItem, Service, Testimonial, TimeSlot } from '../types';
import {
  INITIAL_CLINIC_INFO,
  INITIAL_DOCTOR,
  INITIAL_FAQS,
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_TIME_SLOTS,
} from '../data/initialData';

export type SlotConfig = Omit<TimeSlot, 'bookedCount'>;
export interface Schedule {
  timeSlots: SlotConfig[];
  maxPerSlot: number;
}

export interface SiteContent {
  clinic: ClinicInfo;
  doctor: Doctor;
  services: Service[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  schedule: Schedule;
}

const DEFAULT_SCHEDULE: Schedule = {
  timeSlots: INITIAL_TIME_SLOTS.map(({ bookedCount: _unused, ...slot }) => slot),
  maxPerSlot: 2,
};

export const FALLBACK_CONTENT: SiteContent = {
  clinic: INITIAL_CLINIC_INFO,
  doctor: INITIAL_DOCTOR,
  services: INITIAL_SERVICES,
  testimonials: INITIAL_TESTIMONIALS,
  faqs: INITIAL_FAQS,
  schedule: DEFAULT_SCHEDULE,
};

export class BookingError extends Error {
  name = 'BookingError';
}

// ---------------------------------------------------------------- public content

/** Site content from Firestore; anything not set up yet falls back to the built-in copy. */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isFirebaseConfigured) return FALLBACK_CONTENT;
  const store = db();
  const [clinic, doctor, schedule, photo, services, testimonials, faqs] = await Promise.all([
    getDoc(doc(store, 'settings', 'clinic')),
    getDoc(doc(store, 'settings', 'doctor')),
    getDoc(doc(store, 'settings', 'schedule')),
    getDoc(doc(store, 'media', 'doctorPhoto')),
    getDocs(collection(store, 'services')),
    getDocs(query(collection(store, 'testimonials'), orderBy('date', 'desc'))),
    getDocs(query(collection(store, 'faqs'), orderBy('order'))),
  ]);

  const doctorData = { ...((doctor.data() as Doctor) ?? INITIAL_DOCTOR) };
  // The photo is stored as an image data URL; DoctorPortrait shows it when present.
  doctorData.avatarUrl = (photo.data()?.dataUrl as string) || '';

  return {
    clinic: (clinic.data() as ClinicInfo) ?? INITIAL_CLINIC_INFO,
    doctor: doctorData,
    schedule: (schedule.data() as Schedule) ?? DEFAULT_SCHEDULE,
    services: services.empty ? INITIAL_SERVICES : services.docs.map(d => d.data() as Service),
    testimonials: testimonials.empty ? INITIAL_TESTIMONIALS : testimonials.docs.map(d => d.data() as Testimonial),
    faqs: faqs.empty
      ? INITIAL_FAQS
      : faqs.docs.map(d => {
          const { order: _order, ...faq } = d.data();
          return faq as FAQItem;
        }),
  };
}

// ---------------------------------------------------------------- slots

/** Seats already taken in each slot on a date, keyed by slot ID. */
export async function getTakenSeats(date: string): Promise<Map<string, Set<number>>> {
  const taken = new Map<string, Set<number>>();
  if (!isFirebaseConfigured) return taken;
  const snap = await getDocs(query(collection(db(), 'slotHolds'), where('date', '==', date)));
  snap.docs.forEach(d => {
    const { slotId, seat } = d.data() as { slotId: string; seat: number };
    if (!taken.has(slotId)) taken.set(slotId, new Set());
    taken.get(slotId)!.add(seat);
  });
  return taken;
}

// ---------------------------------------------------------------- bookings

const ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Booking IDs are the key patients use to look up a booking, so they must not be guessable.
function randomCode(length: number): string {
  const out: string[] = [];
  const bytes = new Uint8Array(1);
  while (out.length < length) {
    crypto.getRandomValues(bytes);
    // Reject values that would bias the distribution.
    if (bytes[0] < 256 - (256 % ID_ALPHABET.length)) out.push(ID_ALPHABET[bytes[0] % ID_ALPHABET.length]);
  }
  return out.join('');
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function holdId(date: string, slotId: string, seat: number): string {
  return `${date}_${slotId}_${seat}`;
}

function toAppointment(data: Record<string, any>): Appointment {
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt ?? '');
  return { ...data, createdAt, medicalReports: data.medicalReports ?? [] } as Appointment;
}

export interface BookingInput {
  patientName: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  problemDescription: string;
  service?: Service | null;
  date: string;
  slot: SlotConfig;
}

export async function createBooking(input: BookingInput, content: SiteContent): Promise<Appointment> {
  const store = db();
  const meetingLink = content.clinic.googleMeetLink || content.clinic.teleConsultationLink || '';

  for (let attempt = 0; attempt < 3; attempt++) {
    const taken = (await getTakenSeats(input.date)).get(input.slot.id) ?? new Set<number>();
    const seat = Array.from({ length: content.schedule.maxPerSlot }, (_, i) => i + 1).find(n => !taken.has(n));
    if (!seat) throw new BookingError('That time is fully booked. Choose another.');

    const id = `APT-${input.date.slice(0, 4)}-${randomCode(6)}`;
    const hold = holdId(input.date, input.slot.id, seat);
    const record: Record<string, unknown> = {
      id,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      patientEmail: input.patientEmail.toLowerCase(),
      patientAddress: input.patientAddress || 'N/A',
      serviceId: input.service?.id ?? 'online-consult',
      serviceName: input.service?.title ?? 'Online Physiotherapy Consultation',
      doctorName: 'Dr. P. Sai Tejaswini',
      consultationType: 'Online Consultation',
      date: input.date,
      timeSlot: input.slot.timeString,
      slotId: input.slot.id,
      durationMinutes: 45,
      status: 'Confirmed',
      problemDescription: input.problemDescription,
      medicalReports: [],
      amountPaid: 0,
      paymentStatus: 'Pending',
      meetingLink: meetingLink || `https://meet.jit.si/KrishnaveniRehab_${id.replace(/[^A-Z0-9]/g, '')}`,
      invoiceNumber: id.replace('APT-', 'INV-'),
      holdId: hold,
      createdAt: serverTimestamp(),
    };
    if (input.patientAge) record.patientAge = input.patientAge;
    if (input.patientGender) record.patientGender = input.patientGender;

    const batch = writeBatch(store);
    batch.set(doc(store, 'slotHolds', hold), {
      date: input.date,
      slotId: input.slot.id,
      seat,
      bookingHash: await sha256Hex(id),
    });
    batch.set(doc(store, 'appointments', id), record);

    try {
      await batch.commit();
      return toAppointment({ ...record, createdAt: new Date().toISOString() });
    } catch (err: any) {
      // A seat that already exists cannot be written again, so the commit is refused.
      // If that seat is now taken, someone got there first: try the next one.
      const nowTaken = (await getTakenSeats(input.date)).get(input.slot.id);
      if (err?.code === 'permission-denied' && nowTaken?.has(seat)) continue;
      throw err;
    }
  }
  throw new BookingError('That time was just booked by someone else. Choose another.');
}

export async function getBookingById(id: string): Promise<Appointment | null> {
  const snap = await getDoc(doc(db(), 'appointments', id));
  return snap.exists() ? toAppointment(snap.data()) : null;
}

// ---------------------------------------------------------------- admin (rules require admins/{email})

export async function isAdminAccount(email: string): Promise<boolean> {
  const snap = await getDoc(doc(db(), 'admins', email));
  return snap.exists();
}

export async function listAppointments(): Promise<Appointment[]> {
  const snap = await getDocs(query(collection(db(), 'appointments'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toAppointment(d.data()));
}

export async function updateAppointmentFields(
  apt: Appointment,
  changes: { status?: AppointmentStatus; cancellationReason?: string; meetingLink?: string },
): Promise<Appointment> {
  await setDoc(doc(db(), 'appointments', apt.id), changes, { merge: true });
  return { ...apt, ...changes };
}

/** Cancel and free the seat so someone else can book the time. */
export async function cancelAppointment(apt: Appointment & { holdId?: string }, reason: string): Promise<Appointment> {
  const store = db();
  const batch = writeBatch(store);
  batch.set(doc(store, 'appointments', apt.id), { status: 'Cancelled', cancellationReason: reason }, { merge: true });
  if (apt.holdId) batch.delete(doc(store, 'slotHolds', apt.holdId));
  await batch.commit();
  return { ...apt, status: 'Cancelled', cancellationReason: reason };
}

/** Put a cancelled or completed booking back to confirmed, taking a seat again if it gave one up. */
export async function reopenAppointment(
  apt: Appointment & { holdId?: string; slotId?: string },
  maxPerSlot: number,
): Promise<Appointment> {
  const store = db();
  const holdStillThere = apt.holdId ? (await getDoc(doc(store, 'slotHolds', apt.holdId))).exists() : false;
  if (holdStillThere || !apt.slotId) {
    return updateAppointmentFields(apt, { status: 'Confirmed' });
  }

  const taken = (await getTakenSeats(apt.date)).get(apt.slotId) ?? new Set<number>();
  const seat = Array.from({ length: maxPerSlot }, (_, i) => i + 1).find(n => !taken.has(n));
  if (!seat) throw new BookingError('That time is now full, so the booking cannot be reopened.');

  const hold = holdId(apt.date, apt.slotId, seat);
  const batch = writeBatch(store);
  batch.set(doc(store, 'slotHolds', hold), { date: apt.date, slotId: apt.slotId, seat, bookingHash: await sha256Hex(apt.id) });
  batch.set(doc(store, 'appointments', apt.id), { status: 'Confirmed', holdId: hold }, { merge: true });
  await batch.commit();
  return { ...apt, status: 'Confirmed', holdId: hold } as Appointment;
}

export async function getDefaultMeetingLink(): Promise<string> {
  const snap = await getDoc(doc(db(), 'settings', 'clinic'));
  const clinic = snap.data() as ClinicInfo | undefined;
  return clinic?.googleMeetLink || clinic?.teleConsultationLink || '';
}

export async function setDefaultMeetingLink(link: string): Promise<void> {
  await setDoc(doc(db(), 'settings', 'clinic'), { googleMeetLink: link, teleConsultationLink: link }, { merge: true });
}

export async function saveDoctorPhoto(dataUrl: string): Promise<void> {
  await setDoc(doc(db(), 'media', 'doctorPhoto'), { dataUrl, updatedAt: serverTimestamp() });
}

export async function isSiteSetUp(): Promise<boolean> {
  return (await getDoc(doc(db(), 'settings', 'schedule'))).exists();
}

/** First-time setup: writes the site's starting content. Existing documents are overwritten. */
export async function seedSiteContent(): Promise<void> {
  const store = db();
  const batch = writeBatch(store);
  batch.set(doc(store, 'settings', 'clinic'), { ...INITIAL_CLINIC_INFO });
  batch.set(doc(store, 'settings', 'doctor'), { ...INITIAL_DOCTOR, avatarUrl: '', consultationFee: 0 });
  batch.set(doc(store, 'settings', 'schedule'), DEFAULT_SCHEDULE);
  INITIAL_SERVICES.forEach(s => batch.set(doc(store, 'services', s.id), { ...s, feeINR: 0 }));
  INITIAL_TESTIMONIALS.forEach(t => batch.set(doc(store, 'testimonials', t.id), t));
  INITIAL_FAQS.forEach((f, order) => batch.set(doc(store, 'faqs', f.id), { ...f, order }));
  await batch.commit();
}
