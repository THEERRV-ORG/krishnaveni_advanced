import { Timestamp, doc, getDoc } from 'firebase/firestore/lite';
import type { Appointment } from '../src/types.js';
import { serverFirestore } from './firestore.js';

// Booking IDs accepted by this module.
const BOOKING_ID = /^APT-\d{4}-[A-HJ-NP-Z2-9]{6}$/;

export type WhatsAppEvent = 'pending' | 'confirmed' | 'cancelled';

export interface WhatsAppNotifyResult {
  status: number;
  message: string;
}

function msg91Config() {
  const authKey = process.env.MSG91_AUTH_KEY || '';
  const senderNumber = process.env.MSG91_SENDER_NUMBER || '';
  const templatePending = process.env.MSG91_TEMPLATE_PENDING || '';
  const templateConfirmed = process.env.MSG91_TEMPLATE_CONFIRMED || '';
  const templateRejected = process.env.MSG91_TEMPLATE_REJECTED || '';
  const templateDoctorAlert = process.env.MSG91_TEMPLATE_DOCTOR_ALERT || '';
  const doctorNumber = process.env.DOCTOR_WHATSAPP_NUMBER || '';
  return { authKey, senderNumber, templatePending, templateConfirmed, templateRejected, templateDoctorAlert, doctorNumber };
}

function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

/** Send a single MSG91 WhatsApp template message. Returns true on success. */
async function sendMsg91Template(
  authKey: string,
  senderNumber: string,
  toNumber: string,
  templateName: string,
  variables: string[],
): Promise<boolean> {
  if (!authKey || !templateName) return false;

  const parameters = variables.map(v => ({ type: 'text', text: String(v) }));

  const payload = {
    integrated_number: senderNumber,
    content_type: 'template',
    payload: {
      to: toNumber,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          { type: 'body', parameters },
        ],
      },
    },
  };

  try {
    const res = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      console.error(`[whatsapp-msg91] MSG91 error for ${toNumber} (${templateName}):`, data);
      return false;
    }
    console.log(`[whatsapp-msg91] Sent ${templateName} to ${toNumber}`);
    return true;
  } catch (err) {
    console.error(`[whatsapp-msg91] Network error sending ${templateName} to ${toNumber}:`, err);
    return false;
  }
}

const WEBSITE_URL = 'https://krishnavenirehab.com';

/**
 * Reads the booking from Firestore and sends the appropriate WhatsApp messages.
 * Never throws; failures are logged and a result object is returned.
 */
export async function sendWhatsAppNotifications(
  bookingId: unknown,
  event: WhatsAppEvent,
): Promise<WhatsAppNotifyResult> {
  if (typeof bookingId !== 'string' || !BOOKING_ID.test(bookingId)) {
    return { status: 400, message: 'Invalid booking ID.' };
  }

  const cfg = msg91Config();
  if (!cfg.authKey) {
    return { status: 503, message: 'MSG91 is not configured (MSG91_AUTH_KEY missing).' };
  }

  const store = serverFirestore();
  if (!store) return { status: 503, message: 'Firebase is not set up on the server.' };

  const snap = await getDoc(doc(store, 'appointments', bookingId));
  if (!snap.exists()) return { status: 404, message: 'No booking has that ID.' };

  const data = snap.data();
  const apt = data as Appointment;
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0;

  // Only allow sends for bookings made in the last 7 days.
  const MAX_AGE_MS = 7 * 24 * 60 * 60_000;
  if (Date.now() - createdAt > MAX_AGE_MS) {
    return { status: 410, message: 'Booking is too old to notify.' };
  }

  const patientPhone = normalisePhone(apt.patientPhone || '');
  if (!patientPhone || patientPhone.length < 10) {
    return { status: 422, message: 'Patient has no valid phone number.' };
  }

  const results: boolean[] = [];

  if (event === 'pending') {
    // Template 1: booking_pending → patient
    if (cfg.templatePending) {
      const sent = await sendMsg91Template(
        cfg.authKey, cfg.senderNumber, patientPhone,
        cfg.templatePending,
        [apt.patientName, apt.date, apt.timeSlot, apt.doctorName || 'Dr. P. Sai Tejaswini', bookingId, WEBSITE_URL],
      );
      results.push(sent);
    }

    // Template 3: new_booking_alert → doctor (only if doctor number is configured)
    if (cfg.templateDoctorAlert && cfg.doctorNumber) {
      const doctorPhone = normalisePhone(cfg.doctorNumber);
      const sent = await sendMsg91Template(
        cfg.authKey, cfg.senderNumber, doctorPhone,
        cfg.templateDoctorAlert,
        [apt.patientName, apt.date, apt.timeSlot, apt.patientPhone, apt.patientEmail, apt.problemDescription || '—'],
      );
      results.push(sent);
    }
  } else if (event === 'confirmed') {
    // Template 2: booking_confirmed → patient (with meet link)
    if (cfg.templateConfirmed) {
      const sent = await sendMsg91Template(
        cfg.authKey, cfg.senderNumber, patientPhone,
        cfg.templateConfirmed,
        [apt.patientName, apt.date, apt.timeSlot, apt.doctorName || 'Dr. P. Sai Tejaswini', apt.meetingLink || '', bookingId],
      );
      results.push(sent);
    }
  } else if (event === 'cancelled') {
    // Template 4: booking_rejected → patient
    if (cfg.templateRejected) {
      const clinicPhone = process.env.CLINIC_PHONE || '919490605809';
      const sent = await sendMsg91Template(
        cfg.authKey, cfg.senderNumber, patientPhone,
        cfg.templateRejected,
        [apt.patientName, apt.date, apt.timeSlot, clinicPhone, WEBSITE_URL],
      );
      results.push(sent);
    }
  }

  if (results.length === 0) {
    return { status: 503, message: `No template configured for event '${event}'.` };
  }

  const anySuccess = results.some(Boolean);
  return anySuccess
    ? { status: 200, message: 'WhatsApp notification(s) sent.' }
    : { status: 502, message: 'WhatsApp notification(s) failed to send.' };
}
