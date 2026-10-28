import nodemailer from 'nodemailer';
import { Timestamp, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import type { Appointment, ClinicInfo } from '../src/types.js';
import { INITIAL_CLINIC_INFO } from '../src/data/initialData.js';
import { whatsappLink } from '../src/utils/whatsapp.js';
import { serverFirestore } from './firestore.js';

// Same format as firestore.rules accepts.
const BOOKING_ID = /^APT-\d{4}-[A-HJ-NP-Z2-9]{6}$/;
// Only a booking made moments ago is emailed, so old bookings cannot be re-sent. Keep in step with firestore.rules.
const MAX_AGE_MS = 15 * 60_000;

export interface BookingEmailResult {
  status: number;
  message: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  notify: string;
}

function smtpConfig(): SmtpConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CLINIC_NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CLINIC_NOTIFY_EMAIL) return null;
  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: SMTP_FROM || SMTP_USER,
    notify: CLINIC_NOTIFY_EMAIL,
  };
}

/**
 * Emails the patient their confirmation and the clinic a new-booking alert.
 * The booking is read from Firestore, never taken from the request.
 */
export async function sendBookingEmails(bookingId: unknown): Promise<BookingEmailResult> {
  if (typeof bookingId !== 'string' || !BOOKING_ID.test(bookingId)) {
    return { status: 400, message: 'Invalid booking ID.' };
  }
  const smtp = smtpConfig();
  if (!smtp) return { status: 503, message: 'Email is not set up on the server.' };
  const store = serverFirestore();
  if (!store) return { status: 503, message: 'Firebase is not set up on the server.' };

  const snap = await getDoc(doc(store, 'appointments', bookingId));
  if (!snap.exists()) return { status: 404, message: 'No booking has that ID.' };
  const data = snap.data();
  const apt = data as Appointment;
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0;
  if (Date.now() - createdAt > MAX_AGE_MS) return { status: 410, message: 'That booking is too old to email.' };

  // A marker document per booking that can only be created once (see firestore.rules),
  // so a booking is emailed at most once however often this is called.
  try {
    await setDoc(doc(store, 'bookingEmails', bookingId), { sentAt: serverTimestamp() });
  } catch (err) {
    if ((err as { code?: string }).code === 'permission-denied') {
      console.warn(`[booking-email] ${bookingId}: marker refused. Already emailed, or firestore.rules not deployed.`);
      return { status: 409, message: 'Emails for this booking were already sent.' };
    }
    throw err;
  }

  const clinic = ((await getDoc(doc(store, 'settings', 'clinic'))).data() as ClinicInfo | undefined) ?? INITIAL_CLINIC_INFO;
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  const patient = renderPatientEmail(apt, clinic);
  const owner = renderClinicEmail(apt);
  const [toPatient, toClinic] = await Promise.allSettled([
    transport.sendMail({ from: smtp.from, to: apt.patientEmail, replyTo: clinic.email, ...patient }),
    transport.sendMail({ from: smtp.from, to: smtp.notify, replyTo: apt.patientEmail, ...owner }),
  ]);
  if (toPatient.status === 'rejected') console.error(`[booking-email] patient email for ${bookingId} failed:`, toPatient.reason);
  if (toClinic.status === 'rejected') console.error(`[booking-email] clinic email for ${bookingId} failed:`, toClinic.reason);

  if (toPatient.status === 'rejected' && toClinic.status === 'rejected') {
    return { status: 502, message: 'The emails could not be sent.' };
  }
  return { status: 200, message: 'Emails sent.' };
}

// ---------------------------------------------------------------- templates

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const DOCTOR = 'Dr. P. Sai Tejaswini';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function rows(items: [string, string][]): string {
  return items
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 0;color:#74849a;font-size:14px;vertical-align:top;width:150px">${escapeHtml(label)}</td>
        <td style="padding:8px 0;color:#14233a;font-size:14px;white-space:pre-line">${escapeHtml(value)}</td>
      </tr>`)
    .join('');
}

function layout(heading: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f8f9;font-family:Arial,Helvetica,sans-serif;color:#14233a">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d3dee3;border-radius:8px;overflow:hidden">
    <div style="background:#003078;padding:20px 24px">
      <div style="color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:0.02em">KRISHNAVENI <span style="color:#10a9cc">ADVANCED</span></div>
      <div style="color:#cfdbec;font-size:12px;margin-top:2px">Physiotherapy &amp; Rehabilitation Services</div>
    </div>
    <div style="padding:24px">
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:normal;font-family:Georgia,serif">${escapeHtml(heading)}</h1>
      ${body}
    </div>
  </div>
</body></html>`;
}

export function renderPatientEmail(apt: Appointment, clinic: ClinicInfo): RenderedEmail {
  const date = longDate(apt.date);
  const reportsLink = whatsappLink(clinic.whatsapp, `Hello Dr. Tejaswini, I am sending my reports for booking ${apt.id}.`);
  const changeLink = whatsappLink(clinic.whatsapp, `Hello, I would like to cancel or reschedule booking ${apt.id} on ${apt.date} at ${apt.timeSlot}.`);
  const details: [string, string][] = [
    ['Booking ID', apt.id],
    ['Date', date],
    ['Time', `${apt.timeSlot} (45 minutes)`],
    ['With', DOCTOR],
  ];

  const html = layout('Your consultation is booked', `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Dear ${escapeHtml(apt.patientName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Your online physiotherapy consultation with ${DOCTOR} is booked. Keep your booking ID: you'll need it to track or change the booking.</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #d3dee3;border-bottom:1px solid #d3dee3;margin:0 0 20px">${rows(details)}</table>
    ${apt.meetingLink ? `
    <p style="margin:0 0 6px"><a href="${escapeHtml(apt.meetingLink)}" style="display:inline-block;background:#0048a8;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 22px;border-radius:6px">Join the consultation</a></p>
    <p style="margin:0 0 20px;font-size:13px;color:#74849a">Join five minutes before your time. Link: <a href="${escapeHtml(apt.meetingLink)}" style="color:#0048a8;word-break:break-all">${escapeHtml(apt.meetingLink)}</a></p>` : ''}
    <p style="margin:0 0 8px;font-size:15px;font-weight:bold">What to have ready</p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.7">
      <li>Loose, comfortable clothing</li>
      <li>A clear space about two metres long</li>
      <li>Phone or laptop propped up so your whole body is in view</li>
      <li>Your scans or reports, if you have them</li>
    </ul>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6">Have scans, X-rays or reports? <a href="${escapeHtml(reportsLink)}" style="color:#0048a8">Send them on WhatsApp</a> with your booking ID before the consultation.</p>
    <p style="margin:0;font-size:14px;line-height:1.6">Need to cancel or change the time? <a href="${escapeHtml(changeLink)}" style="color:#0048a8">Message us on WhatsApp</a> or call ${escapeHtml(clinic.phone)}.</p>`);

  const text = [
    `Dear ${apt.patientName},`,
    '',
    `Your online physiotherapy consultation with ${DOCTOR} is booked.`,
    '',
    ...details.map(([label, value]) => `${label}: ${value}`),
    ...(apt.meetingLink ? [`Consultation link: ${apt.meetingLink}`, 'Join five minutes before your time.'] : []),
    '',
    'Have scans or reports? Send them on WhatsApp with your booking ID before the consultation.',
    `To cancel or change the time, message us on WhatsApp or call ${clinic.phone}.`,
    '',
    clinic.name,
  ].join('\n');

  return { subject: `Booking confirmed: ${date}, ${apt.timeSlot}`, html, text };
}

export function renderClinicEmail(apt: Appointment): RenderedEmail {
  const date = longDate(apt.date);
  const details: [string, string][] = [
    ['Booking ID', apt.id],
    ['When', `${date}, ${apt.timeSlot}`],
    ['Patient', apt.patientName],
    ['Age and gender', [apt.patientAge, apt.patientGender].filter(Boolean).join(' · ') || '—'],
    ['Phone', `+91 ${apt.patientPhone}`],
    ['Email', apt.patientEmail],
    ['City', apt.patientAddress && apt.patientAddress !== 'N/A' ? apt.patientAddress : '—'],
    ['Complaint', apt.problemDescription || '—'],
    ['Consultation link', apt.meetingLink || '—'],
  ];
  const patientWhatsapp = whatsappLink(`91${apt.patientPhone}`, `Hello ${apt.patientName}, this is Krishnaveni Advanced Physiotherapy about your booking ${apt.id}.`);

  const html = layout(`New booking: ${apt.patientName}`, `
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #d3dee3;border-bottom:1px solid #d3dee3;margin:0 0 20px">${rows(details)}</table>
    <p style="margin:0;font-size:14px;line-height:1.6">
      <a href="${escapeHtml(patientWhatsapp)}" style="color:#0048a8">WhatsApp the patient</a> ·
      <a href="tel:+91${escapeHtml(apt.patientPhone)}" style="color:#0048a8">Call</a> ·
      Reply to this email to write to them.
    </p>`);

  const text = [`New booking: ${apt.patientName}`, '', ...details.map(([label, value]) => `${label}: ${value}`)].join('\n');

  return { subject: `New booking: ${apt.patientName}, ${date} ${apt.timeSlot}`, html, text };
}
