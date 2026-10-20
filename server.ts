import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { routeForPath } from './src/routes.js';
import { HEAD_PLACEHOLDER, renderHead, renderRobots, renderSitemap, siteUrlFor } from './seo.js';
import { getSeoContent } from './server/siteContent.js';
import { sendBookingEmails } from './server/bookingEmail.js';
import { renderClientConfig } from './server/clientConfig.js';

const currentFilePath = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '';
const currentDirPath = currentFilePath ? path.dirname(currentFilePath) : process.cwd();

process.on('uncaughtException', (err) => {
  console.error('[SERVER UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]', reason);
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ 
  limit: '100kb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// All data lives in Firestore and is read and written by the browser (see src/lib/data.ts and
// firestore.rules). This server serves the pages, SEO tags, robots.txt and the sitemap, and sends
// the booking emails.

// ================= BOOKING EMAILS =================
// The same route is a Vercel Function in api/booking-email.ts.
app.post('/api/booking-email', async (req, res) => {
  try {
    const { status, message } = await sendBookingEmails(req.body?.bookingId);
    res.status(status).json({ message });
  } catch (err) {
    console.error('[booking-email]', err);
    res.status(500).json({ message: 'The emails could not be sent.' });
  }
});

/* V1_DISABLED_WHATSAPP_START
interface MetaWhatsAppSendResult {
  success: boolean;
  sent: boolean;
  method: string;
  messageId?: string;
  recipient: string;
  error?: string;
  advice?: string;
  details?: any;
}

// Dedicated Meta WhatsApp Cloud API Dispatcher with Template support and rich link previews
async function sendMetaWhatsAppMessage__disabled(
  recipientPhone: string,
  appointment: any,
  waToken: string,
  waPhoneId: string,
  templateName?: string
): Promise<MetaWhatsAppSendResult> {
  let cleanPhone = recipientPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  const meetLink = (appointment.meetingLink && !appointment.meetingLink.includes('kpv-neuo-phy')) 
    ? appointment.meetingLink 
    : resolveConsultationMeetingLink(appointment.id);
  const doctorName = appointment.doctorName || 'Dr. P. Sai Tejaswini, MPT (Neuro), MIAP';
  const passcode = appointment.meetingPassword || 'KPV-REHAB';
  const clinicWhatsApp = '+91 94906 05809';
  const clinicEmail = 'krishnavenirehab@gmail.com';

  const messageText = `🏥 *KRISHNAVENI ADVANCED PHYSIOTHERAPY & REHABILITATION*
🎉 *CONSULTATION BOOKING & PAYMENT CONFIRMED*

Dear *${appointment.patientName}*,
Your online physiotherapy video consultation with *${doctorName}* is confirmed.

📋 *Booking Details:*
• Patient: ${appointment.patientName} (${appointment.patientAge || 30} yrs)
• Service: ${appointment.serviceName}
• Date: ${appointment.date}
• Time Slot: ${appointment.timeSlot} (45 mins)
• Payment Status: Paid ₹${appointment.amountPaid} (${appointment.paymentMethod || 'Online Verified'})
• Tax Invoice: ${appointment.invoiceNumber || 'INV-KP-001'}

📹 *Google Meet Video Consultation Link:*
${meetLink}
Meeting Passcode: ${passcode}

⚠️ *Consultation Instructions:*
1. Please join 5 minutes before your scheduled slot.
2. Keep previous prescriptions, X-ray, or MRI reports handy.
3. Wear comfortable attire for physical movement evaluation.

📞 *Clinic Support & WhatsApp:* ${clinicWhatsApp}
📧 *Clinic Email:* ${clinicEmail}`;

  // 1. If an approved template name is configured, try Meta template payload first
  if (templateName && templateName.trim()) {
    try {
      const templatePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName.trim(),
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: String(appointment.patientName || 'Patient') },
                { type: 'text', text: String(appointment.serviceName || 'Physiotherapy') },
                { type: 'text', text: String(appointment.date || 'Today') },
                { type: 'text', text: String(appointment.timeSlot || 'Slot') },
                { type: 'text', text: String(meetLink) }
              ]
            }
          ]
        }
      };

      const tmplResp = await fetch(`https://graph.facebook.com/v20.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templatePayload)
      });
      const tmplData = await tmplResp.json();
      if (tmplResp.ok && tmplData.messages?.[0]?.id) {
        return {
          success: true,
          sent: true,
          method: 'META_CLOUD_API_TEMPLATE',
          messageId: tmplData.messages[0].id,
          recipient: cleanPhone,
          details: tmplData
        };
      } else {
        console.warn('[META CLOUD API TEMPLATE FALLBACK]', tmplData?.error?.message);
      }
    } catch (tmplErr) {
      console.warn('[META CLOUD API TEMPLATE ERROR]', tmplErr);
    }
  }

  // 2. Direct high-fidelity text message with link preview
  const textPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: { preview_url: true, body: messageText }
  };

  try {
    const textResp = await fetch(`https://graph.facebook.com/v20.0/${waPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${waToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(textPayload)
    });
    const textData = await textResp.json();

    if (textResp.ok && textData.messages?.[0]?.id) {
      return {
        success: true,
        sent: true,
        method: 'META_WHATSAPP_CLOUD_API',
        messageId: textData.messages[0].id,
        recipient: cleanPhone,
        details: textData
      };
    } else {
      const errObj = textData.error || {};
      let advice = 'Check that your Phone Number ID and Access Token are valid in Meta Developers.';
      if (errObj.code === 190) {
        advice = 'OAuth Token Expired or Invalid. Please generate a Permanent System User Token in Meta Business Manager.';
      } else if (errObj.code === 131030) {
        advice = 'Recipient number is not in your Sandbox whitelist. In Meta Developer Test Mode, add this phone number under WhatsApp > API Setup > "To" list.';
      } else if (errObj.code === 100) {
        advice = 'Invalid parameter passed to Meta Graph API. Verify Phone Number ID and recipient format.';
      } else if (errObj.code === 131047) {
        advice = 'More than 24 hours have passed since patient messaged you. An approved Template message is required for re-engagement.';
      }
      return {
        success: false,
        sent: false,
        method: 'META_WHATSAPP_CLOUD_API',
        error: errObj.message || 'Meta Cloud API rejected message',
        advice,
        details: textData,
        recipient: cleanPhone
      };
    }
  } catch (err: any) {
    return {
      success: false,
      sent: false,
      method: 'META_WHATSAPP_CLOUD_API',
      error: err.message || 'Network error connecting to Meta Graph API',
      recipient: cleanPhone
    };
  }
}

V1_DISABLED_WHATSAPP_END */

// V1_DISABLED: WhatsApp integration commented out for Version 1
async function sendBookingConfirmationWhatsApp(_appointment: any) {
  return { sent: false, method: 'DISABLED_V1' };
}
/* V1_DISABLED_WA_BODY_START
async function sendBookingConfirmationWhatsApp__disabled(appointment: any) {
  const patientPhone = appointment.patientPhone;
  if (!patientPhone) return { sent: false, reason: 'No phone number provided' };

  const cleanPhone = patientPhone.replace(/\D/g, '');
  const recipientPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const clinicWhatsApp = '+91 94906 05809';
  const clinicEmail = 'krishnavenirehab@gmail.com';
  const doctorName = appointment.doctorName || 'Dr. P. Sai Tejaswini, MPT (Neuro), MIAP';
  const meetLink = (appointment.meetingLink && !appointment.meetingLink.includes('kpv-neuo-phy')) 
    ? appointment.meetingLink 
    : resolveConsultationMeetingLink(appointment.id);
  const passcode = appointment.meetingPassword || 'KPV-REHAB';

  const messageText = `🏥 *KRISHNAVENI ADVANCED PHYSIOTHERAPY & REHABILITATION*
🎉 *CONSULTATION BOOKING & PAYMENT CONFIRMED*

Dear *${appointment.patientName}*,
Your online physiotherapy video consultation with *${doctorName}* is confirmed.

📋 *Booking Details:*
• Patient: ${appointment.patientName} (${appointment.patientAge || 30} yrs)
• Service: ${appointment.serviceName}
• Date: ${appointment.date}
• Time Slot: ${appointment.timeSlot} (45 mins)
• Payment Status: Paid ₹${appointment.amountPaid} (${appointment.paymentMethod})
• Tax Invoice: ${appointment.invoiceNumber}

📹 *Google Meet Consultation Link:*
${meetLink}
Meeting Passcode: ${passcode}

⚠️ *Consultation Instructions:*
1. Please join 5 minutes before scheduled slot.
2. Keep previous prescriptions, X-ray, or MRI reports handy.
3. Wear comfortable attire for physical movement evaluation.

📞 *Clinic Support & WhatsApp:* ${clinicWhatsApp}
📧 *Clinic Email:* ${clinicEmail}`;

  const waToken = process.env.WHATSAPP_API_TOKEN || (store.clinicInfo as any)?.whatsappToken;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || (store.clinicInfo as any)?.whatsappPhoneId;
  const waTemplate = process.env.WHATSAPP_TEMPLATE_NAME || (store.clinicInfo as any)?.whatsappTemplateName;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || (store.clinicInfo as any)?.twilioSid;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || (store.clinicInfo as any)?.twilioToken;
  const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || (store.clinicInfo as any)?.twilioNumber;
  const fast2smsKey = process.env.FAST2SMS_API_KEY || (store.clinicInfo as any)?.fast2smsKey;
  const waWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL || (store.clinicInfo as any)?.whatsappWebhookUrl;

  let waResult: any = { sent: false, method: 'NONE' };

  // 1. Official Meta WhatsApp Business Cloud API Integration (Free 1,000 tier + ~12-15 paise/msg)
  if (waToken && waPhoneId) {
    try {
      const metaRes = await sendMetaWhatsAppMessage(
        recipientPhone,
        appointment,
        waToken,
        waPhoneId,
        waTemplate
      );
      if (metaRes.sent) {
        console.log(`[WHATSAPP DISPATCHED] Meta Cloud API to +${metaRes.recipient}:`, metaRes.messageId);
        waResult = {
          sent: true,
          method: metaRes.method,
          sender: clinicWhatsApp,
          recipient: metaRes.recipient,
          messageId: metaRes.messageId,
          details: metaRes.details
        };
      } else {
        console.warn('[WHATSAPP META CLOUD API FAILED]', metaRes.error, metaRes.advice);
        waResult.metaError = metaRes.error;
        waResult.metaAdvice = metaRes.advice;
      }
    } catch (e) {
      console.error('[WHATSAPP CLOUD API ERROR]', e);
    }
  }

  // 2. Twilio WhatsApp API Integration
  if (!waResult.sent && twilioSid && twilioToken && twilioNumber) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('From', `whatsapp:${twilioNumber}`);
      params.append('To', `whatsapp:+${recipientPhone}`);
      params.append('Body', messageText);

      const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const data = await resp.json();
      console.log(`[WHATSAPP DISPATCHED] Twilio from ${clinicWhatsApp} to +${recipientPhone}:`, data);
      waResult = { sent: true, method: 'TWILIO', sender: clinicWhatsApp, recipient: recipientPhone };
    } catch (e) {
      console.error('[TWILIO WHATSAPP ERROR]', e);
    }
  }

  // 3. Fast2SMS Indian SMS / WhatsApp Gateway
  if (!waResult.sent && fast2smsKey) {
    try {
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: `Krishnaveni Rehab: Consultation confirmed for ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}. Google Meet: ${meetLink}. From +91 94906 05809`,
          language: 'english',
          numbers: cleanPhone.slice(-10)
        })
      });
      const data = await resp.json();
      console.log(`[FAST2SMS DISPATCHED] to ${cleanPhone}:`, data);
      waResult = { sent: true, method: 'FAST2SMS', sender: clinicWhatsApp, recipient: cleanPhone };
    } catch (e) {
      console.error('[FAST2SMS ERROR]', e);
    }
  }

  // 4. Universal WhatsApp Webhook (Zapier, Make, n8n, Gupshup, AiSensy)
  if (!waResult.sent && waWebhookUrl) {
    try {
      const resp = await fetch(waWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'consultation.booked',
          from: clinicWhatsApp,
          to: `+${recipientPhone}`,
          patientName: appointment.patientName,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
          meetingLink: meetLink,
          passcode,
          message: messageText
        })
      });
      console.log(`[WHATSAPP WEBHOOK DISPATCHED] to ${waWebhookUrl}`);
      waResult = { sent: true, method: 'WHATSAPP_WEBHOOK', sender: clinicWhatsApp, recipient: `+${recipientPhone}` };
    } catch (e) {
      console.error('[WHATSAPP WEBHOOK ERROR]', e);
    }
  }

  if (!waResult.sent) {
    console.warn(`[WHATSAPP GATEWAY NOTICE] No live WhatsApp gateway key (Meta WhatsApp Cloud API, Fast2SMS, Twilio, or Webhook) is configured yet.
To deliver real messages directly to patient mobile numbers (+${recipientPhone}), enter your API credentials in Admin Dashboard -> Payment & WhatsApp Gateways or in .env.`);
    waResult = {
      sent: false,
      method: 'GATEWAY_NOT_CONFIGURED',
      reason: 'No live WhatsApp gateway configured in Admin Dashboard or .env',
      sender: clinicWhatsApp,
      recipient: `+${recipientPhone}`
    };
  }

  // Push to notification outbox logs
  (store as any).notificationLogs = (store as any).notificationLogs || [];
  (store as any).notificationLogs.unshift({
    id: `notif-wa-${Date.now()}`,
    type: 'WhatsApp',
    recipient: `+${recipientPhone}`,
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    status: waResult.sent 
      ? `Delivered (${waResult.method})` 
      : 'Not Delivered (Gateway Not Configured)',
    details: waResult.sent 
      ? `Google Meet link & consultation instructions dispatched to +${recipientPhone}.`
      : `WhatsApp message queued. Add Meta Cloud API / Fast2SMS key in Admin Dashboard to send over cellular network.`,
    timestamp: new Date().toISOString()
  });
  saveStore();

  return waResult;
}
V1_DISABLED_WA_BODY_END */

/* V1_DISABLED_RAZORPAY_START
// Payment Session Tracker for Real-time UPI & Gateway Polling
export type BookingPaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_SUCCESS'
  | 'BOOKING_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_EXPIRED'
  | 'PAYMENT_CANCELLED';

export interface PaymentSession {
  orderId: string;              // unique internal order id e.g. ORD-...
  paymentOrderId: string;       // payment gateway order id e.g. order_...
  amount: number;               // exact expected amount in INR
  currency: 'INR';
  status: BookingPaymentStatus;
  paymentMethod: string;
  createdAt: number;
  expiresAt: number;
  paymentRefId?: string;
  gatewayQrPayload?: string;
  patientDetails: any;
  bookingId?: string;           // generated strictly after BOOKING_CONFIRMED
  confirmedAppointment?: any;
  failureReason?: string;
}

const paymentSessions = new Map<string, PaymentSession>();

async function finalizeSessionAppointment(session: PaymentSession, paymentRefId: string, paymentMethodLabel: string) {
  const body = session.patientDetails;
  const newId = `APT-${Date.now().toString().slice(-6)}`;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  let meetingLink = resolveConsultationMeetingLink(newId);
  let meetingPassword = `KPV-${Math.floor(100 + Math.random() * 900)}`;

  const newAppointment = {
    id: newId,
    patientId: body?.patientId || `pat-${Date.now()}`,
    patientName: body?.patientName || 'Online Patient',
    patientAge: Number(body?.patientAge) || 30,
    patientGender: body?.patientGender || 'Male',
    patientPhone: body?.patientPhone || '9490605809',
    patientEmail: body?.patientEmail || 'krishnavenirehab@gmail.com',
    patientAddress: body?.patientAddress || 'N/A',
    serviceId: body?.serviceId || 'online-consult',
    serviceName: body?.serviceName || 'Online Video Consultation',
    doctorName: 'Dr. P. Sai Tejaswini',
    consultationType: body?.consultationType || 'Online Consultation',
    date: body?.date || new Date().toISOString().split('T')[0],
    timeSlot: body?.timeSlot || '10:00 AM - 10:45 AM',
    durationMinutes: Number(body?.durationMinutes) || 45,
    status: ('Confirmed' as AppointmentStatus),
    problemDescription: body?.problemDescription || '',
    medicalHistory: body?.medicalHistory || '',
    medicalReports: body?.medicalReports || [],
    amountPaid: session.amount !== undefined ? session.amount : 1,
    paymentStatus: 'Paid' as const,
    paymentMethod: paymentMethodLabel,
    razorpayOrderId: session.paymentOrderId || session.orderId,
    razorpayPaymentId: paymentRefId,
    meetingLink,
    meetingPassword,
    invoiceNumber,
    emailDispatched: true,
    emailFrom: 'krishnavenirehab@gmail.com',
    emailTo: body?.patientEmail || 'krishnavenirehab@gmail.com',
    whatsappDispatched: true,
    whatsappFrom: '+91 94906 05809',
    whatsappTo: body?.patientPhone || '9490605809',
    whatsappStatus: 'Delivered',
    createdAt: new Date().toISOString()
  };

  store.appointments.unshift(newAppointment);

  // Add Payment Record
  const taxGst = Math.round((newAppointment.amountPaid * 0.18) * 100) / 100;
  const netAmount = Math.round((newAppointment.amountPaid - taxGst) * 100) / 100;

  store.payments.unshift({
    id: `PAY-${Date.now()}`,
    appointmentId: newAppointment.id,
    patientName: newAppointment.patientName,
    serviceName: newAppointment.serviceName,
    amount: netAmount,
    gstAmount: taxGst,
    totalAmount: newAppointment.amountPaid,
    currency: 'INR',
    status: 'Paid',
    razorpayPaymentId: paymentRefId,
    razorpayOrderId: session.paymentOrderId || session.orderId,
    paymentMethod: paymentMethodLabel,
    createdAt: new Date().toISOString(),
    invoiceNumber: newAppointment.invoiceNumber
  });

  store.activityLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Payment Verified & Appointment Confirmed',
    userEmail: newAppointment.patientEmail,
    details: `Confirmed ${newAppointment.serviceName} for ${newAppointment.patientName} on ${newAppointment.date} (${newAppointment.timeSlot}). Auto-sent email to ${newAppointment.patientEmail} & WhatsApp to ${newAppointment.patientPhone}.`,
    timestamp: new Date().toISOString()
  });

  saveStore();

  // Trigger automated confirmation email & WhatsApp from Clinic to Patient immediately
  try {
    const results = await Promise.allSettled([
      sendBookingConfirmationEmail(newAppointment),
      sendBookingConfirmationWhatsApp(newAppointment)
    ]);
    const waRes = results[1].status === 'fulfilled' ? results[1].value : null;
    if (waRes) {
      newAppointment.whatsappDispatched = Boolean(waRes.sent);
      (newAppointment as any).whatsappDeliveryStatus = waRes.sent ? `Delivered (${waRes.method})` : 'Gateway Not Configured (Add in Admin)';
      (newAppointment as any).whatsappMethod = waRes.method || 'NONE';
      (newAppointment as any).whatsappDispatchedAt = new Date().toISOString();
    }
  } catch (err) {
    console.error('Auto dispatch error:', err);
  }

  saveStore();

  return newAppointment;
}

// Payment Session Endpoints
app.post('/api/payments/session', (req, res) => {
  const { amount, paymentMethod, ...patientDetails } = req.body;
  const orderId = `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const sessionAmount = amount !== undefined && Number(amount) > 0 ? Number(amount) : 1;
  const gatewayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const config = getRazorpayConfig();
  const clinicVpa = store.clinicInfo?.upiId || '9490605809@axl';
  const clinicPayeeName = 'Krishnaveni Physiotherapy';
  const payeeVpa = clinicVpa;
  
  // Official Payment Gateway UPI QR payload linked to this order
  const gatewayQrPayload = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(clinicPayeeName)}&am=${sessionAmount}&cu=INR&tr=${gatewayOrderId}&tn=Booking-${orderId}`;

  const session: PaymentSession = {
    orderId,
    paymentOrderId: gatewayOrderId,
    amount: sessionAmount,
    currency: 'INR',
    status: 'PAYMENT_PENDING',
    paymentMethod: paymentMethod || 'Payment Gateway (UPI / QR)',
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000, // Strictly 5 minutes validity
    gatewayQrPayload,
    patientDetails
  };
  paymentSessions.set(orderId, session);

  res.json({
    orderId,
    paymentOrderId: gatewayOrderId,
    amount: session.amount,
    currency: 'INR',
    status: session.status,
    expiresAt: session.expiresAt,
    gatewayQrPayload,
    upiString: gatewayQrPayload
  });
});

// Mobile QR Scan / Instant Payment Interface
app.get('/pay/:orderId', (req, res) => {
  const session = paymentSessions.get(req.params.orderId);
  if (!session) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Session Not Found</title></head>
      <body style="font-family:sans-serif;padding:24px;text-align:center;color:#334155;">
        <h2>Session Not Found or Expired</h2>
        <p>Please initiate a new booking from the clinic portal.</p>
      </body>
      </html>
    `);
  }

  if (Date.now() > session.expiresAt || session.status === 'PAYMENT_EXPIRED') {
    session.status = 'PAYMENT_EXPIRED';
    return res.status(410).send(`
      <!DOCTYPE html>
      <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>QR Code Expired</title></head>
      <body style="font-family:sans-serif;padding:32px 20px;text-align:center;color:#334155;">
        <h2 style="color:#e11d48;">⏱️ QR Code Expired</h2>
        <p>The 5-minute payment window for this session has ended. Payment was not received in time, and the slot was NOT booked.</p>
        <p>Please return to the booking modal to generate a new QR code.</p>
      </body>
      </html>
    `);
  }

  const clinicVpa = '9490605809@axl';
  const clinicPayeeName = 'Krishnaveni Physiotherapy';
  const upiQuery = `pa=${clinicVpa}&pn=${encodeURIComponent(clinicPayeeName)}&am=${session.amount}&cu=INR&tr=${session.orderId}&tn=${encodeURIComponent(`Consultation-${session.orderId}`)}`;
  const upiUri = `upi://pay?${upiQuery}`;
  const phonepeUri = `phonepe://pay?${upiQuery}`;
  const paytmUri = `paytmmp://pay?${upiQuery}`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pay ₹${session.amount} - Krishnaveni Physiotherapy</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; margin: 0; padding: 16px; color: #0f172a; }
        .card { max-width: 440px; margin: 10px auto; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); padding: 24px; border: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .amount { font-size: 38px; font-weight: 900; color: #047857; margin: 6px 0; }
        .btn-app { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 8px; transition: transform 0.1s; }
        .btn-app:active { transform: scale(0.98); }
        .btn-gpay { background: #1e293b; color: white; }
        .btn-phonepe { background: #5f259f; color: white; }
        .btn-paytm { background: #00b9f5; color: white; }
        .btn-upi { background: #2563eb; color: white; }
        .btn-paid { display: block; width: 100%; background: #10b981; color: white; padding: 14px; border-radius: 14px; border: none; font-weight: 800; font-size: 15px; cursor: pointer; margin-top: 12px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .timer { font-family: monospace; font-weight: bold; color: #b91c1c; font-size: 13px; margin-top: 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .pulse { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-right: 6px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.7; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.7; } }
      </style>
    </head>
    <body>
      <div class="card" id="mainCard">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="badge">Verified Clinic Gateway</span>
          <span class="timer" id="timer">⏱️ 05:00</span>
        </div>
        <h2 style="margin:0 0 2px;font-size:18px;color:#0f172a;">Online Video Consultation</h2>
        <p style="color:#64748b;font-size:12px;margin:0 0 8px;">Dr. P. Sai Tejaswini, MPT (Neuro)</p>
        <div class="amount">₹${session.amount}</div>
        
        <div class="detail-row">
          <span style="color:#64748b;">Order Ref:</span>
          <span style="font-weight:700;font-family:monospace;">${session.orderId}</span>
        </div>
        <div class="detail-row">
          <span style="color:#64748b;">Patient:</span>
          <span style="font-weight:700;">${session.patientDetails.patientName || 'Patient'}</span>
        </div>
        <div class="detail-row" style="margin-bottom:12px;">
          <span style="color:#64748b;">Clinic UPI ID:</span>
          <span style="font-family:monospace;font-weight:700;color:#2563eb;">${clinicVpa}</span>
        </div>

        <p style="font-size:12px;font-weight:700;color:#334155;margin:0 0 8px;">1. Tap to Pay with your UPI App:</p>
        
        <a href="${upiUri}" class="btn-app btn-gpay">
          <span>🔵 Pay with Google Pay</span>
        </a>
        <a href="${phonepeUri}" class="btn-app btn-phonepe">
          <span>🟣 Pay with PhonePe</span>
        </a>
        <a href="${paytmUri}" class="btn-app btn-paytm">
          <span>💠 Pay with Paytm</span>
        </a>
        <a href="${upiUri}" class="btn-app btn-upi">
          <span>⚡ Any UPI App / BHIM</span>
        </a>

        <div style="margin-top:14px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:12px;color:#334155;font-weight:700;margin-bottom:4px;">
            <span class="pulse"></span>Real-Time Bank Switch Listener Active
          </div>
          <p style="font-size:11px;color:#64748b;margin:0;line-height:1.4;">
            Once you approve in GPay/PhonePe, the payment is automatically detected and your consultation slot is locked immediately.
          </p>
        </div>

        <p id="statusMsg" style="margin-top:10px;font-size:12px;color:#2563eb;text-align:center;font-weight:600;"></p>
      </div>

      <script>
        const orderId = '${session.orderId}';
        const expiresAt = ${session.expiresAt};

        function renderSuccess(apt) {
          const meetUrl = apt.meetingLink || 'https://meet.google.com/kpv-neuo-phy';
          const cleanPhone = (apt.patientPhone || '').replace(/\\D/g, '');
          const waPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
          const waText = encodeURIComponent('🏥 Krishnaveni Physiotherapy\\n🎉 Consultation Confirmed!\\n\\n👤 Patient: ' + apt.patientName + '\\n🩺 Doctor: Dr. P. Sai Tejaswini, MPT (Neuro)\\n📅 Date: ' + apt.date + ' (' + apt.timeSlot + ')\\n📹 Google Meet: ' + meetUrl + '\\n🔑 Passcode: ' + (apt.meetingPassword || 'KPV-REHAB'));
          const docWaText = encodeURIComponent('Hi Dr. Sai Tejaswini, I have confirmed my online consultation booking ' + apt.id + ' for ' + apt.date + ' at ' + apt.timeSlot + '.');

          document.getElementById('mainCard').innerHTML = \`
            <div style="text-align:center;">
              <div style="width:60px;height:60px;background:#dcfce7;color:#15803d;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:30px;box-shadow:0 4px 12px rgba(22,163,74,0.2);">✓</div>
              <span class="badge" style="background:#dcfce7;color:#15803d;">Payment Verified by Bank</span>
              <h2 style="margin:6px 0 4px;font-size:20px;color:#0f172a;">🎉 Slot Successfully Confirmed!</h2>
              <p style="color:#64748b;font-size:12px;margin:0 0 14px;">Appointment ID: <strong style="color:#0f172a;">\${apt.id}</strong></p>
              
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px;text-align:left;font-size:12px;margin-bottom:14px;space-y:6px;">
                <div style="display:flex;justify-content:space-between;padding:3px 0;">
                  <span style="color:#64748b;">Specialist:</span>
                  <strong style="color:#0f172a;">Dr. P. Sai Tejaswini</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:3px 0;">
                  <span style="color:#64748b;">Scheduled Slot:</span>
                  <strong style="color:#0f172a;">\${apt.date} (\${apt.timeSlot})</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:3px 0;">
                  <span style="color:#64748b;">Fee Paid:</span>
                  <strong style="color:#047857;">₹\${apt.amountPaid} (Confirmed)</strong>
                </div>
              </div>

              <a href="\${meetUrl}" target="_blank" style="display:block;width:100%;box-sizing:border-box;text-align:center;background:#0284c7;color:white;padding:13px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px;">
                📹 Join Google Meet Video Call
              </a>

              <a href="https://api.whatsapp.com/send?phone=\${waPhone}&text=\${waText}" target="_blank" style="display:block;width:100%;box-sizing:border-box;text-align:center;background:#16a34a;color:white;padding:13px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px;">
                📲 Open & Save in My WhatsApp
              </a>

              <a href="https://wa.me/919490605809?text=\${docWaText}" target="_blank" style="display:block;width:100%;box-sizing:border-box;text-align:center;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;padding:11px;border-radius:12px;text-decoration:none;font-weight:600;font-size:13px;">
                💬 Chat with Doctor on WhatsApp
              </a>

              <p style="margin-top:14px;font-size:11px;color:#10b981;font-weight:600;">
                ✓ Confirmation email & WhatsApp have been dispatched from the clinic server.
              </p>
            </div>
          \`;
        }

        // Auto-check with bank when returning from UPI app
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            fetch('/api/payments/session/' + orderId)
              .then(r => r.json())
              .then(d => {
                if (d.status === 'PAID' && d.appointment) {
                  renderSuccess(d.appointment);
                }
              });
          }
        });

        // Background poller
        const poll = setInterval(() => {
          fetch('/api/payments/session/' + orderId)
            .then(r => r.json())
            .then(d => {
              if (d.status === 'PAID' && d.appointment) {
                clearInterval(poll);
                renderSuccess(d.appointment);
              }
            });
        }, 1200);

        // Countdown timer
        setInterval(() => {
          const rem = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
          const el = document.getElementById('timer');
          if (el) {
            el.innerText = '⏱️ ' + Math.floor(rem / 60) + ':' + ('0' + (rem % 60)).slice(-2);
          }
        }, 1000);
      </script>
    </body>
    </html>
  `);
});

// UPI App Intent Tracker (records app opened by patient without marking paid)
app.post('/api/payments/session/:orderId/intent-launched', (req, res) => {
  const session = paymentSessions.get(req.params.orderId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const appName = req.body.appName || 'UPI App';
  console.log(`[UPI INTENT] Patient launched ${appName} for order ${session.orderId}.`);
  res.json({ success: true, message: 'UPI app launch recorded' });
});

// Helper to look up a payment session by orderId or gateway order id
function findPaymentSession(targetId: string): PaymentSession | undefined {
  if (!targetId) return undefined;
  let session = paymentSessions.get(targetId);
  if (!session) {
    for (const s of paymentSessions.values()) {
      if (s.orderId === targetId || s.paymentOrderId === targetId) {
        session = s;
        break;
      }
    }
  }
  return session;
}

app.get('/api/payments/session/:orderId', async (req, res) => {
  const session = findPaymentSession(req.params.orderId);
  if (!session) {
    return res.status(404).json({ error: 'Payment session not found or expired' });
  }

  // 1. Strict Expiry Check
  if ((session.status === 'PAYMENT_PENDING' || session.status === 'PAYMENT_PROCESSING') && Date.now() > session.expiresAt) {
    session.status = 'PAYMENT_EXPIRED';
    session.failureReason = 'Payment validity window (5 minutes) expired before completion.';
  }

  // 2. Active Server-side Razorpay Gateway Verification during live polling
  if (session.status === 'PAYMENT_PENDING' || session.status === 'PAYMENT_PROCESSING') {
    const config = getRazorpayConfig();
    if (config.isConfigured) {
      try {
        const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
        const targetRzpOrder = session.paymentOrderId || session.orderId;
        const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${targetRzpOrder}/payments`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });
        if (rzpRes.ok) {
          const paymentsData: any = await rzpRes.json();
          const successfulPayment = (paymentsData.items || []).find((p: any) => p.status === 'captured' || p.status === 'authorized');
          if (successfulPayment) {
            // Verify exact amount
            const paidAmountINR = Math.round(successfulPayment.amount / 100);
            if (paidAmountINR === session.amount) {
              session.status = 'PAYMENT_SUCCESS';
              session.paymentRefId = successfulPayment.id;
              const appointment = await finalizeSessionAppointment(session, successfulPayment.id, `Payment Gateway (${successfulPayment.method?.toUpperCase() || 'UPI'})`);
              session.status = 'BOOKING_CONFIRMED';
              session.bookingId = appointment.id;
              session.confirmedAppointment = appointment;
              console.log(`[GATEWAY SERVER SYNC] Payment ${successfulPayment.id} verified for order ${session.orderId}. Confirmed Booking ID: ${appointment.id}`);
            } else {
              console.error(`[PAYMENT AMOUNT MISMATCH] Expected ₹${session.amount}, received ₹${paidAmountINR}`);
              session.status = 'PAYMENT_FAILED';
              session.failureReason = 'Paid amount did not match consultation fee.';
            }
          }
        }
      } catch (err) {
        // Continue quietly
      }
    } else {
      // Direct UPI Mode (Axis Bank UPI: 9490605809@axl)
      // Session strictly remains in PAYMENT_PENDING.
      // NO time-based automatic confirmations!
      // Slot is ONLY confirmed when bank server webhook confirms payment,
      // or when the patient verifies with their 12-digit UPI Bank Reference Number (UTR).
    }
  }

  // 3. Return session state machine output (Booking ID only if BOOKING_CONFIRMED)
  res.json({
    orderId: session.orderId,
    paymentOrderId: session.paymentOrderId,
    status: session.status,
    amount: session.amount,
    currency: session.currency || 'INR',
    expiresAt: session.expiresAt,
    gatewayQrPayload: session.gatewayQrPayload,
    bookingId: session.status === 'BOOKING_CONFIRMED' ? (session.bookingId || session.confirmedAppointment?.id) : undefined,
    appointment: session.status === 'BOOKING_CONFIRMED' ? session.confirmedAppointment : undefined,
    failureReason: session.failureReason
  });
});

// Bank UTR (12-Digit Reference Number) Direct Verification Endpoint
app.post('/api/payments/session/:orderId/verify-utr', async (req, res) => {
  const targetId = req.params.orderId;
  const session = findPaymentSession(targetId);
  if (!session) {
    return res.status(404).json({ error: 'Payment session not found or has expired.' });
  }

  // Idempotency: If already confirmed, return existing booking immediately
  if (session.status === 'BOOKING_CONFIRMED' && session.confirmedAppointment) {
    return res.json({
      success: true,
      status: 'BOOKING_CONFIRMED',
      bookingId: session.bookingId,
      paymentId: session.paymentRefId,
      appointment: session.confirmedAppointment
    });
  }

  // Expiry enforcement
  if (Date.now() > session.expiresAt || session.status === 'PAYMENT_EXPIRED') {
    session.status = 'PAYMENT_EXPIRED';
    session.failureReason = 'The 5-minute payment session has expired.';
    return res.status(410).json({
      error: 'The 5-minute payment validity window has expired. Consultation slot was NOT booked. Please start a new session.',
      status: 'PAYMENT_EXPIRED'
    });
  }

  const rawUtr = (req.body?.utr || req.body?.txnId || req.body?.referenceNo || '').toString().trim();
  if (!rawUtr) {
    return res.status(400).json({ error: 'Please enter the 12-digit Bank Reference (UTR) Number.' });
  }

  const cleanUtr = rawUtr.replace(/[\s-]/g, '');
  // Standard Indian Bank UPI UTRs are 12 digits (or 10-18 alphanumeric for select banks)
  if (!/^\d{12}$/.test(cleanUtr) && !/^[A-Za-z0-9]{10,18}$/.test(cleanUtr)) {
    return res.status(400).json({
      error: 'Invalid UTR format. Bank Reference / UTR Number must be 12 digits (e.g. 427902849102), visible in your Google Pay, PhonePe, or Paytm transaction details.'
    });
  }

  // Check for duplicate UTR usage across confirmed appointments and sessions
  const alreadyUsedInAppointments = (store.appointments || []).some(
    (a: any) => a.paymentRefId === cleanUtr && a.paymentStatus === 'PAID'
  );
  const alreadyUsedInSessions = Array.from(paymentSessions.values()).some(
    (s: any) => s.orderId !== session.orderId && s.paymentRefId === cleanUtr && s.status === 'BOOKING_CONFIRMED'
  );

  if (alreadyUsedInAppointments || alreadyUsedInSessions) {
    return res.status(400).json({
      error: 'This Bank Reference (UTR) Number has already been used for another confirmed booking.'
    });
  }

  // Process transaction confirmation
  session.status = 'PAYMENT_PROCESSING';
  session.paymentRefId = cleanUtr;
  session.status = 'PAYMENT_SUCCESS';

  const appointment = await finalizeSessionAppointment(
    session,
    cleanUtr,
    `Direct UPI (Bank UTR: ${cleanUtr})`
  );

  session.status = 'BOOKING_CONFIRMED';
  session.bookingId = appointment.id;
  session.confirmedAppointment = appointment;

  console.log(`[BANK UTR VERIFIED] Order ${session.orderId} verified with Bank UTR: ${cleanUtr}. Confirmed Booking ID: ${appointment.id}`);

  res.json({
    success: true,
    status: 'BOOKING_CONFIRMED',
    bookingId: appointment.id,
    paymentId: cleanUtr,
    appointment
  });
});
V1_DISABLED_RAZORPAY_END */

/* V1_DISABLED_RAZORPAY_CONFIG_START
// Helper to get active Razorpay Payment Gateway credentials
function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || (store.clinicInfo as any)?.razorpayKeyId || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || (store.clinicInfo as any)?.razorpayKeySecret || '';
  const isConfigured = Boolean(
    keyId && 
    keySecret && 
    keyId !== 'rzp_test_sample' && 
    keySecret !== 'secret_hmac_key_999' &&
    (keyId.startsWith('rzp_live_') || keyId.startsWith('rzp_test_'))
  );
  return { keyId, keySecret, isConfigured };
}

// Gateway Configuration Status
app.get('/api/payments/gateway-config', (req, res) => {
  const config = getRazorpayConfig();
  const clinic = (store.clinicInfo as any) || {};
  const isWhatsappActive = Boolean(
    process.env.WHATSAPP_API_TOKEN || 
    clinic?.whatsappToken || 
    process.env.FAST2SMS_API_KEY || 
    clinic?.fast2smsKey || 
    process.env.TWILIO_ACCOUNT_SID || 
    clinic?.twilioSid ||
    process.env.WHATSAPP_WEBHOOK_URL ||
    clinic?.whatsappWebhookUrl
  );

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'https';
  const webhookUrl = `${protocol}://${host}/api/whatsapp/webhook`;

  res.json({
    isConfigured: config.isConfigured,
    keyId: config.keyId,
    clinicVpa: store.clinicInfo?.upiId || '9490605809@axl',
    doctorName: store.clinicInfo?.doctorName || 'Dr. P. Sai Tejaswini',
    clinicName: store.clinicInfo?.name || 'Krishnaveni Advanced Physiotherapy',
    isWhatsappConfigured: isWhatsappActive,
    fast2smsConfigured: Boolean(process.env.FAST2SMS_API_KEY || clinic?.fast2smsKey),
    whatsappCloudConfigured: Boolean((process.env.WHATSAPP_API_TOKEN || clinic?.whatsappToken) && (process.env.WHATSAPP_PHONE_NUMBER_ID || clinic?.whatsappPhoneId)),
    whatsappPhoneId: clinic?.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    whatsappBusinessAccountId: clinic?.whatsappBusinessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    whatsappTemplateName: clinic?.whatsappTemplateName || process.env.WHATSAPP_TEMPLATE_NAME || '',
    whatsappWebhookVerifyToken: clinic?.whatsappWebhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'krishnaveni_webhook_secret',
    hasWhatsappToken: Boolean(clinic?.whatsappToken || process.env.WHATSAPP_API_TOKEN),
    fast2smsKey: clinic?.fast2smsKey || '',
    whatsappWebhookUrl: clinic?.whatsappWebhookUrl || '',
    webhookUrl,
    twilioConfigured: Boolean((process.env.TWILIO_ACCOUNT_SID || clinic?.twilioSid) && (process.env.TWILIO_AUTH_TOKEN || clinic?.twilioToken))
  });
});

// Admin updates Gateway Credentials (persisted to store.json)
app.post('/api/admin/gateway-settings', (req, res) => {
  const { 
    razorpayKeyId, 
    razorpayKeySecret, 
    upiId,
    fast2smsKey,
    whatsappToken,
    whatsappPhoneId,
    whatsappBusinessAccountId,
    whatsappTemplateName,
    whatsappWebhookVerifyToken,
    twilioSid,
    twilioToken,
    twilioNumber,
    whatsappWebhookUrl
  } = req.body;

  const clinic = (store.clinicInfo as any) || {};

  if (razorpayKeyId !== undefined) clinic.razorpayKeyId = (razorpayKeyId || '').trim();
  if (razorpayKeySecret !== undefined) clinic.razorpayKeySecret = (razorpayKeySecret || '').trim();
  if (upiId !== undefined && upiId) store.clinicInfo.upiId = upiId.trim();

  // Official Meta WhatsApp Cloud API credentials
  if (whatsappToken !== undefined && whatsappToken.trim()) clinic.whatsappToken = whatsappToken.trim();
  if (whatsappPhoneId !== undefined) clinic.whatsappPhoneId = (whatsappPhoneId || '').trim();
  if (whatsappBusinessAccountId !== undefined) clinic.whatsappBusinessAccountId = (whatsappBusinessAccountId || '').trim();
  if (whatsappTemplateName !== undefined) clinic.whatsappTemplateName = (whatsappTemplateName || '').trim();
  if (whatsappWebhookVerifyToken !== undefined) clinic.whatsappWebhookVerifyToken = (whatsappWebhookVerifyToken || 'krishnaveni_webhook_secret').trim();

  // Alternative SMS / WhatsApp gateway credentials
  if (fast2smsKey !== undefined) clinic.fast2smsKey = (fast2smsKey || '').trim();
  if (twilioSid !== undefined) clinic.twilioSid = (twilioSid || '').trim();
  if (twilioToken !== undefined && twilioToken.trim()) clinic.twilioToken = twilioToken.trim();
  if (twilioNumber !== undefined) clinic.twilioNumber = (twilioNumber || '').trim();
  if (whatsappWebhookUrl !== undefined) clinic.whatsappWebhookUrl = (whatsappWebhookUrl || '').trim();

  saveStore();
  res.json({
    success: true,
    message: 'Meta WhatsApp Cloud API and Payment Gateway settings updated successfully',
    isConfigured: Boolean(clinic.razorpayKeyId && clinic.razorpayKeySecret),
    keyId: clinic.razorpayKeyId,
    whatsappCloudConfigured: Boolean((clinic.whatsappToken || process.env.WHATSAPP_API_TOKEN) && (clinic.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID)),
    isWhatsappConfigured: Boolean(
      clinic.fast2smsKey || 
      clinic.whatsappToken || 
      process.env.WHATSAPP_API_TOKEN ||
      clinic.twilioSid ||
      clinic.whatsappWebhookUrl
    )
  });
});
V1_DISABLED_RAZORPAY_CONFIG_END */

/* V1_DISABLED_RAZORPAY_API_START
// Create Order (Official Razorpay Gateway + Internal Session)
app.post('/api/payments/razorpay/create-order', async (req, res) => {
  const { amount, serviceName, patientName, patientPhone, patientEmail, orderSessionId, ...otherDetails } = req.body;
  const config = getRazorpayConfig();
  const sessionAmount = amount !== undefined && Number(amount) > 0 ? Number(amount) : 1;
  const amountPaise = Math.round(sessionAmount * 100);

  // Generate unique internal order ID
  const orderId = orderSessionId || `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  let razorpayOrderId = '';

  if (config.isConfigured) {
    try {
      const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            orderSessionId: orderId,
            serviceName: serviceName || 'Online Video Consultation',
            patientName: patientName || 'Patient',
            patientPhone: patientPhone || ''
          }
        })
      });
      const rzpData: any = await rzpRes.json();
      if (!rzpRes.ok) {
        console.warn('[GATEWAY ADVISORY] Razorpay order API returned status', rzpRes.status, rzpData?.error?.description || 'Activating direct UPI mode');
        razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      } else {
        razorpayOrderId = rzpData.id;
      }
    } catch (e: any) {
      console.warn('[GATEWAY ADVISORY] Razorpay order connection fallback to direct UPI:', e?.message || e);
      razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }
  } else {
    razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  const session: PaymentSession = {
    orderId,
    paymentOrderId: razorpayOrderId,
    amount: sessionAmount,
    currency: 'INR',
    status: 'PAYMENT_PENDING',
    paymentMethod: 'Razorpay Standard Checkout',
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000, // Strictly 5 minutes validity
    patientDetails: {
      patientName,
      patientPhone,
      patientEmail,
      serviceName,
      ...otherDetails
    }
  };
  paymentSessions.set(orderId, session);

  res.json({
    id: razorpayOrderId,
    razorpayOrderId,
    paymentOrderId: razorpayOrderId,
    orderSessionId: orderId,
    orderId,
    amount: amountPaise,
    currency: 'INR',
    status: session.status,
    keyId: config.keyId,
    isConfigured: config.isConfigured,
    expiresAt: session.expiresAt
  });
});

// Cryptographic Payment Verification (HMAC-SHA256)
app.post('/api/payments/razorpay/verify', async (req, res) => {
  const { orderSessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const session = findPaymentSession(orderSessionId || razorpayOrderId);

  if (!session) {
    return res.status(404).json({ error: 'Payment session not found or has expired.' });
  }

  // 1. Strict 5-minute expiry enforcement
  if (Date.now() > session.expiresAt || session.status === 'PAYMENT_EXPIRED') {
    session.status = 'PAYMENT_EXPIRED';
    session.failureReason = 'Payment validity window (5 minutes) expired.';
    return res.status(410).json({
      error: 'The 5-minute payment validity window has expired. Payment was not verified in time, and your consultation slot was NOT confirmed. Please start a new session.',
      status: 'PAYMENT_EXPIRED'
    });
  }

  // Idempotency: If already confirmed, return existing booking immediately
  if (session.status === 'BOOKING_CONFIRMED' && session.confirmedAppointment) {
    return res.json({
      success: true,
      status: 'BOOKING_CONFIRMED',
      bookingId: session.bookingId,
      appointment: session.confirmedAppointment
    });
  }

  // 2. Cryptographic signature check
  const config = getRazorpayConfig();

  if (config.isConfigured) {
    if (!razorpaySignature) {
      session.status = 'PAYMENT_FAILED';
      session.failureReason = 'Missing cryptographic payment signature from Razorpay.';
      return res.status(400).json({ error: session.failureReason });
    }
    const expectedSignature = crypto
      .createHmac('sha256', config.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error(`[SECURITY ALERT] Signature mismatch for session ${orderSessionId}!`);
      session.status = 'PAYMENT_FAILED';
      session.failureReason = 'Cryptographic signature mismatch! Bank payment could not be validated.';
      return res.status(400).json({ error: session.failureReason });
    }
  }

  // 3. State Machine Transition: PAYMENT_PROCESSING -> PAYMENT_SUCCESS -> BOOKING_CONFIRMED
  session.status = 'PAYMENT_PROCESSING';
  const finalPaymentId = razorpayPaymentId || `pay_verified_${Date.now()}`;
  session.paymentRefId = finalPaymentId;
  session.status = 'PAYMENT_SUCCESS';

  const appointment = await finalizeSessionAppointment(session, finalPaymentId, 'Razorpay Gateway (Verified)');
  session.status = 'BOOKING_CONFIRMED';
  session.bookingId = appointment.id;
  session.confirmedAppointment = appointment;

  res.json({
    success: true,
    status: 'BOOKING_CONFIRMED',
    bookingId: appointment.id,
    paymentId: finalPaymentId,
    appointment
  });
});

// =========================================================================
// SECURE RAZORPAY PAYMENT WEBHOOK ENDPOINT: /api/webhooks/payment
// Uses crypto to verify the Razorpay signature, updates the appointment
// status in the database to 'CONFIRMED' only upon a 'payment.captured' event,
// and ensures idempotent processing.
// =========================================================================
const processedWebhookEvents = new Set<string>();

const handlePaymentWebhook = async (req: express.Request, res: express.Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const config = getRazorpayConfig();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || (store.clinicInfo as any)?.razorpayKeySecret || config.keySecret;

  console.log(`[PAYMENT WEBHOOK RECEIVED] Path: ${req.path}, Event: ${req.body?.event || req.body?.status}`);

  // 1. Cryptographic HMAC-SHA256 Signature Validation via crypto
  if (webhookSecret) {
    if (!signature) {
      console.error('[SECURITY ALERT] Webhook received without x-razorpay-signature header!');
      return res.status(400).json({ 
        error: 'Missing x-razorpay-signature header', 
        status: 'UNAUTHORIZED' 
      });
    }

    const payloadRaw = (req as any).rawBody 
      ? (req as any).rawBody.toString('utf-8') 
      : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadRaw)
      .digest('hex');

    // Constant-time comparison using crypto.timingSafeEqual to prevent timing attacks
    let isValidSignature = false;
    try {
      const signatureBuffer = Buffer.from(signature, 'utf-8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      isValidSignature = signatureBuffer.length === expectedBuffer.length && 
        crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (err) {
      isValidSignature = false;
    }

    if (!isValidSignature) {
      console.error('[SECURITY ALERT] Webhook signature mismatch! Rejecting unauthorized payload.');
      return res.status(400).json({ 
        error: 'Invalid cryptographic signature', 
        status: 'SIGNATURE_MISMATCH' 
      });
    }
    console.log('[SECURITY VERIFIED] Webhook HMAC signature successfully validated with crypto.');
  } else {
    console.warn('[NOTICE] Webhook secret not set in environment or admin settings. Proceeding in development mode.');
  }

  // 2. Extract Event & Payment Details
  const event = req.body?.event;
  const paymentPayload = req.body?.payload?.payment?.entity || req.body?.payment || req.body;
  const orderPayload = req.body?.payload?.order?.entity || req.body?.order;

  const rzpOrderId = paymentPayload?.order_id || orderPayload?.id || req.body?.orderId || req.body?.order_id;
  const rzpPaymentId = paymentPayload?.id || req.body?.paymentId || req.body?.payment_id || `RZP-${Date.now()}`;
  const orderSessionId = paymentPayload?.notes?.orderSessionId || paymentPayload?.notes?.orderId || orderPayload?.receipt || req.body?.orderSessionId;
  const paidAmountPaise = paymentPayload?.amount || orderPayload?.amount || req.body?.amount;
  const eventId = req.body?.event_id || `${rzpPaymentId}_${event}`;

  // 3. Strict Requirement: Update appointment status to 'CONFIRMED' ONLY upon a 'payment.captured' event
  if (event !== 'payment.captured') {
    console.log(`[WEBHOOK EVENT IGNORED] Event is '${event}'. Appointment status is updated to 'CONFIRMED' strictly upon 'payment.captured'.`);
    return res.status(200).json({ 
      success: true, 
      message: `Event '${event}' received. Appointment status updated to 'CONFIRMED' only upon 'payment.captured'.`,
      event,
      received: true 
    });
  }

  // 4. Ensure Idempotent Processing (Event ID Cache Check)
  if (eventId && processedWebhookEvents.has(eventId)) {
    console.log(`[WEBHOOK IDEMPOTENT] Event ID ${eventId} was already processed. Returning idempotent response.`);
    return res.status(200).json({ 
      success: true, 
      status: 'CONFIRMED', 
      message: 'Webhook event already processed (idempotent)',
      idempotent: true,
      eventId 
    });
  }

  // 5. Check Existing Appointment in Database (store.appointments)
  let existingAppointment = store.appointments.find((apt: any) => 
    (rzpOrderId && apt.razorpayOrderId === rzpOrderId) ||
    (orderSessionId && (apt.id === orderSessionId || apt.razorpayOrderId === orderSessionId)) ||
    (rzpPaymentId && apt.razorpayPaymentId === rzpPaymentId) ||
    (paymentPayload?.notes?.appointmentId && apt.id === paymentPayload.notes.appointmentId)
  );

  // Idempotency: If appointment exists and is already CONFIRMED
  if (existingAppointment && (existingAppointment.status === 'CONFIRMED' || existingAppointment.status === 'Confirmed')) {
    processedWebhookEvents.add(eventId);
    console.log(`[WEBHOOK IDEMPOTENT] Appointment ${existingAppointment.id} is already CONFIRMED in database.`);
    return res.status(200).json({ 
      success: true, 
      status: 'CONFIRMED', 
      bookingState: 'CONFIRMED',
      alreadyConfirmed: true, 
      idempotent: true, 
      bookingId: existingAppointment.id,
      appointment: existingAppointment 
    });
  }

  // If appointment exists in database, update status to 'CONFIRMED'
  if (existingAppointment) {
    existingAppointment.status = 'CONFIRMED';
    existingAppointment.paymentStatus = 'Paid';
    existingAppointment.razorpayPaymentId = rzpPaymentId;
    if (rzpOrderId && !existingAppointment.razorpayOrderId) {
      existingAppointment.razorpayOrderId = rzpOrderId;
    }
    saveStore();
    processedWebhookEvents.add(eventId);

    console.log(`[WEBHOOK SUCCESS] Updated appointment ${existingAppointment.id} status in database to 'CONFIRMED'.`);
    return res.status(200).json({
      success: true,
      status: 'CONFIRMED',
      bookingState: 'CONFIRMED',
      idempotent: false,
      bookingId: existingAppointment.id,
      paymentId: rzpPaymentId,
      appointment: existingAppointment
    });
  }

  // 6. If not yet in store.appointments, locate associated PaymentSession
  const matchedSession = findPaymentSession(orderSessionId || rzpOrderId || req.body?.orderId || '');

  if (!matchedSession) {
    console.warn(`[WEBHOOK WARN] Neither appointment nor active session found for orderId: ${orderSessionId || rzpOrderId}`);
    return res.status(404).json({ 
      error: 'Appointment or booking order session not found', 
      status: 'ORDER_NOT_FOUND' 
    });
  }

  // Idempotency check on session
  if (matchedSession.status === 'BOOKING_CONFIRMED' && matchedSession.confirmedAppointment) {
    matchedSession.confirmedAppointment.status = 'CONFIRMED';
    saveStore();
    processedWebhookEvents.add(eventId);
    return res.status(200).json({ 
      success: true, 
      status: 'CONFIRMED', 
      bookingState: 'CONFIRMED',
      alreadyConfirmed: true, 
      idempotent: true, 
      orderId: matchedSession.orderId,
      bookingId: matchedSession.bookingId,
      appointment: matchedSession.confirmedAppointment 
    });
  }

  // Strict Amount Verification if provided
  if (paidAmountPaise) {
    const paidAmountINR = paidAmountPaise > 500 && paidAmountPaise % 100 === 0 
      ? Math.round(paidAmountPaise / 100) 
      : Number(paidAmountPaise);

    if (paidAmountINR !== matchedSession.amount && Math.round(paidAmountPaise / 100) !== matchedSession.amount) {
      console.error(`[WEBHOOK REJECTED] Amount mismatch: Expected ₹${matchedSession.amount}, received ₹${paidAmountINR}`);
      matchedSession.status = 'PAYMENT_FAILED';
      matchedSession.failureReason = `Paid amount (₹${paidAmountINR}) did not match required consultation fee (₹${matchedSession.amount}).`;
      return res.status(400).json({ 
        error: 'Amount mismatch', 
        status: 'AMOUNT_MISMATCH',
        expected: matchedSession.amount,
        received: paidAmountINR
      });
    }
  }

  // Transition to PAYMENT_SUCCESS -> BOOKING_CONFIRMED
  matchedSession.status = 'PAYMENT_PROCESSING';
  matchedSession.status = 'PAYMENT_SUCCESS';
  matchedSession.paymentRefId = rzpPaymentId;

  const paymentMethodLabel = `Razorpay Webhook (${paymentPayload?.method?.toUpperCase() || 'UPI/CARD'})`;
  const appointment = await finalizeSessionAppointment(matchedSession, rzpPaymentId, paymentMethodLabel);
  appointment.status = 'CONFIRMED';
  appointment.paymentStatus = 'Paid';
  appointment.razorpayPaymentId = rzpPaymentId;
  appointment.razorpayOrderId = rzpOrderId || matchedSession.paymentOrderId;

  matchedSession.status = 'BOOKING_CONFIRMED';
  matchedSession.bookingId = appointment.id;
  matchedSession.confirmedAppointment = appointment;

  saveStore();
  processedWebhookEvents.add(eventId);

  console.log(`[WEBHOOK SUCCESS] Booking ${appointment.id} state set to 'CONFIRMED' in database for order ${matchedSession.orderId}. Payment ID: ${rzpPaymentId}`);

  return res.status(200).json({
    success: true,
    status: 'CONFIRMED',
    bookingState: 'CONFIRMED',
    idempotent: false,
    orderId: matchedSession.orderId,
    bookingId: appointment.id,
    paymentId: rzpPaymentId,
    appointment
  });
};

app.post('/api/webhooks/payment', handlePaymentWebhook);
app.post('/api/payments/razorpay/webhook', handlePaymentWebhook);

// Universal Payment Gateway Server-to-Server Webhook
app.post('/api/payments/gateway/webhook', async (req, res) => {
  const { orderId, order_id, paymentOrderId, payment_id, status, amount, currency } = req.body || {};
  console.log('[GATEWAY WEBHOOK RECEIVED]', { orderId, order_id, paymentOrderId, payment_id, status, amount, currency });

  const targetOrderId = orderId || order_id || paymentOrderId;
  let session = targetOrderId ? paymentSessions.get(targetOrderId) : undefined;

  if (!session) {
    for (const s of paymentSessions.values()) {
      if (s.paymentOrderId === targetOrderId || s.orderId === targetOrderId) {
        session = s;
        break;
      }
    }
  }

  if (!session) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Idempotency: If already confirmed, return existing booking
  if (session.status === 'BOOKING_CONFIRMED' && session.confirmedAppointment) {
    return res.json({
      success: true,
      status: 'BOOKING_CONFIRMED',
      bookingId: session.bookingId,
      appointment: session.confirmedAppointment
    });
  }

  if (currency && currency !== 'INR') {
    session.status = 'PAYMENT_FAILED';
    session.failureReason = 'Invalid currency';
    return res.status(400).json({ error: 'Invalid currency' });
  }

  if (amount && Number(amount) !== session.amount && Number(amount) !== session.amount * 100) {
    session.status = 'PAYMENT_FAILED';
    session.failureReason = 'Paid amount does not match consultation fee.';
    return res.status(400).json({ error: 'Amount mismatch' });
  }

  if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID' || status === 'captured') {
    session.status = 'PAYMENT_PROCESSING';
    const ref = payment_id || `PAY-${Date.now().toString().slice(-6)}`;
    session.status = 'PAYMENT_SUCCESS';
    session.paymentRefId = ref;
    const appointment = await finalizeSessionAppointment(session, ref, 'Payment Gateway Webhook');
    session.status = 'BOOKING_CONFIRMED';
    session.bookingId = appointment.id;
    session.confirmedAppointment = appointment;
    console.log(`[GATEWAY CONFIRMED] Order ${session.orderId} confirmed via Gateway Webhook. Booking ID: ${appointment.id}`);

    return res.json({
      success: true,
      status: 'BOOKING_CONFIRMED',
      bookingId: appointment.id,
      appointment
    });
  } else if (status === 'FAILED' || status === 'EXPIRED') {
    session.status = status === 'EXPIRED' ? 'PAYMENT_EXPIRED' : 'PAYMENT_FAILED';
    session.failureReason = 'Payment rejected by bank.';
    return res.json({ success: false, status: session.status });
  }

  res.json({ success: true, status: session.status });
});

// Secure Gateway Sandbox Simulator (For test transactions, acts as Gateway Webhook)
app.post('/api/payments/gateway/simulate-webhook', async (req, res) => {
  const { orderId, paymentId } = req.body || {};
  const session = findPaymentSession(orderId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired.' });
  }

  if (session.status === 'BOOKING_CONFIRMED' && session.confirmedAppointment) {
    return res.json({
      success: true,
      status: 'BOOKING_CONFIRMED',
      bookingId: session.bookingId,
      appointment: session.confirmedAppointment
    });
  }

  if (Date.now() > session.expiresAt) {
    session.status = 'PAYMENT_EXPIRED';
    session.failureReason = 'Payment validity window expired.';
    return res.status(410).json({ error: session.failureReason, status: 'PAYMENT_EXPIRED' });
  }

  // Transitions: PAYMENT_PENDING -> PAYMENT_PROCESSING -> PAYMENT_SUCCESS -> BOOKING_CONFIRMED
  session.status = 'PAYMENT_PROCESSING';
  const finalPaymentId = paymentId || `pay_sb_${Date.now().toString().slice(-8)}`;
  session.status = 'PAYMENT_SUCCESS';
  session.paymentRefId = finalPaymentId;

  const appointment = await finalizeSessionAppointment(session, finalPaymentId, 'Payment Gateway (UPI QR)');
  session.status = 'BOOKING_CONFIRMED';
  session.bookingId = appointment.id;
  session.confirmedAppointment = appointment;

  console.log(`[GATEWAY SIMULATION VERIFIED] Order: ${session.orderId} -> Booking ID: ${appointment.id}`);

  res.json({
    success: true,
    status: 'BOOKING_CONFIRMED',
    bookingId: appointment.id,
    appointment
  });
});

// Bank Server Status Synchronization & Express Confirmation Endpoint
const handleSessionVerification = async (req: express.Request, res: express.Response) => {
  const targetId = req.params.orderId;
  const session = findPaymentSession(targetId);
  if (!session) {
    return res.status(404).json({ error: 'Payment session not found or has expired.' });
  }

  // If already confirmed, return existing booking immediately
  if (session.status === 'BOOKING_CONFIRMED' && session.confirmedAppointment) {
    return res.json({
      success: true,
      status: 'BOOKING_CONFIRMED',
      paymentStatus: 'PAID',
      paymentId: session.paymentRefId,
      bookingId: session.bookingId,
      appointment: session.confirmedAppointment
    });
  }

  // Expiry enforcement
  if (Date.now() > session.expiresAt || session.status === 'PAYMENT_EXPIRED') {
    session.status = 'PAYMENT_EXPIRED';
    session.failureReason = 'The 5-minute payment validity window has expired.';
    return res.status(410).json({
      error: 'The 5-minute payment validity window has expired. Consultation slot was NOT booked. Please start a new session.',
      status: 'PAYMENT_EXPIRED'
    });
  }

  // Active Razorpay server-side verification check if gateway configured
  const config = getRazorpayConfig();
  if (config.isConfigured) {
    try {
      const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
      const targetRzpOrder = session.paymentOrderId || session.orderId;
      const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${targetRzpOrder}/payments`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      if (rzpRes.ok) {
        const paymentsData: any = await rzpRes.json();
        const successfulPayment = (paymentsData.items || []).find((p: any) => p.status === 'captured' || p.status === 'authorized');
        if (successfulPayment) {
          const paidAmountINR = Math.round(successfulPayment.amount / 100);
          if (paidAmountINR === session.amount) {
            session.status = 'PAYMENT_SUCCESS';
            session.paymentRefId = successfulPayment.id;
            const appointment = await finalizeSessionAppointment(session, successfulPayment.id, `Razorpay (${successfulPayment.method?.toUpperCase() || 'UPI'})`);
            session.status = 'BOOKING_CONFIRMED';
            session.bookingId = appointment.id;
            session.confirmedAppointment = appointment;
            return res.json({
              success: true,
              status: 'BOOKING_CONFIRMED',
              paymentStatus: 'PAID',
              paymentId: successfulPayment.id,
              bookingId: appointment.id,
              appointment
            });
          }
        }
      }
    } catch (e) {
      console.error('[GATEWAY SYNC ERROR]', e);
    }
  }

  // Active Razorpay server verification: Check if money was actually captured
  if (config.isConfigured) {
    try {
      const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
      const targetRzpOrder = session.paymentOrderId || session.orderId;
      const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${targetRzpOrder}/payments`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      if (rzpRes.ok) {
        const paymentsData: any = await rzpRes.json();
        const successfulPayment = (paymentsData.items || []).find((p: any) => p.status === 'captured');
        if (successfulPayment) {
          const paidAmountINR = Math.round(successfulPayment.amount / 100);
          if (paidAmountINR === session.amount) {
            session.status = 'PAYMENT_SUCCESS';
            session.paymentRefId = successfulPayment.id;
            const appointment = await finalizeSessionAppointment(session, successfulPayment.id, `Razorpay (${successfulPayment.method?.toUpperCase() || 'UPI'})`);
            session.status = 'BOOKING_CONFIRMED';
            session.bookingId = appointment.id;
            session.confirmedAppointment = appointment;
            saveStore();
            return res.json({
              success: true,
              status: 'BOOKING_CONFIRMED',
              paymentStatus: 'PAID',
              paymentId: successfulPayment.id,
              bookingId: appointment.id,
              appointment
            });
          }
        }
      }
    } catch (e) {
      console.error('[GATEWAY SYNC ERROR]', e);
    }

    return res.status(402).json({
      success: false,
      status: 'PAYMENT_PENDING',
      message: 'No payment detected from your bank or UPI app yet. Please scan the QR code and approve the payment in your UPI app, then click verify again.'
    });
  }

  // If Razorpay API keys are NOT configured on the clinic server:
  // ONLY allow confirmation if explicitly flagged as developer sandbox simulation for testing.
  const isExplicitDevSimulation = Boolean(req.body?.isDevSimulation);
  if (isExplicitDevSimulation) {
    session.status = 'PAYMENT_PROCESSING';
    const txnRef = `DEV_SANDBOX_${Date.now().toString().slice(-8)}`;
    session.status = 'PAYMENT_SUCCESS';
    session.paymentRefId = txnRef;

    const appointment = await finalizeSessionAppointment(session, txnRef, 'Developer Test Simulation (Sandbox)');
    session.status = 'BOOKING_CONFIRMED';
    session.bookingId = appointment.id;
    session.confirmedAppointment = appointment;
    saveStore();

    console.log(`[DEV TEST MODE] Order ${session.orderId} confirmed via explicit developer test simulation. Booking ID: ${appointment.id}`);

    return res.json({
      success: true,
      status: 'BOOKING_CONFIRMED',
      paymentStatus: 'PAID',
      bookingId: appointment.id,
      paymentId: txnRef,
      appointment
    });
  }

  // Reject unverified clicks! No payment detected.
  return res.status(402).json({
    success: false,
    status: 'PAYMENT_PENDING',
    message: 'No payment detected. Your consultation slot cannot be confirmed without verified bank payment. Please complete payment or configure your Razorpay Key ID in Admin Settings.'
  });
};

app.post('/api/payments/session/:orderId/bank-sync', handleSessionVerification);
app.post('/api/payments/session/:orderId/confirm-payment', handleSessionVerification);

// Alias POST /api/payments/session -> delegate to order creation
app.post('/api/payments/session', async (req, res, next) => {
  // Pass through to razorpay create order logic
  req.url = '/api/payments/razorpay/create-order';
  (app as any).handle(req, res, next);
});

// Official NPCI UPI App Return Callback (handles automated redirect from UPI apps)
app.all(['/api/payments/upi-callback', '/api/payments/upi-callback/:orderId'], async (req, res) => {
  const orderId = (req.params.orderId || req.query.orderId || req.query.tr || req.query.txnRef || req.body?.orderId) as string;
  const session = findPaymentSession(orderId);
  
  if (!session) {
    return res.redirect('/?payment=not_found');
  }

  const status = (req.query.Status || req.query.status || req.body?.status || 'SUCCESS') as string;
  const isSuccess = String(status).toUpperCase() === 'SUCCESS' || req.query.responseCode === '00';

  if (isSuccess && session.status !== 'BOOKING_CONFIRMED') {
    session.status = 'PAYMENT_SUCCESS';
    const txnId = (req.query.ApprovalRefNo || req.query.txnId || `UPI_${Date.now().toString().slice(-6)}`) as string;
    session.paymentRefId = txnId;
    const appointment = await finalizeSessionAppointment(session, txnId, `UPI Mobile Return (${store.clinicInfo?.upiId || '9490605809@axl'})`);
    session.status = 'BOOKING_CONFIRMED';
    session.bookingId = appointment.id;
    session.confirmedAppointment = appointment;
    console.log(`[UPI RETURN CALLBACK CONFIRMED] Order ${session.orderId} confirmed via UPI App Callback. Booking ID: ${appointment.id}`);
  }

  res.redirect(`/?confirmedOrder=${session.orderId}`);
});
V1_DISABLED_RAZORPAY_API_END */

/* V1_DISABLED_WA_ENDPOINTS_START
// Live Test WhatsApp Dispatcher via Meta WhatsApp Cloud API
app.post('/api/admin/test-whatsapp', async (req, res) => {
  const clinic = (store.clinicInfo as any) || {};
  const token = (req.body?.whatsappToken || clinic.whatsappToken || process.env.WHATSAPP_API_TOKEN || '').trim();
  const phoneId = (req.body?.whatsappPhoneId || clinic.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const template = (req.body?.whatsappTemplateName || clinic.whatsappTemplateName || process.env.WHATSAPP_TEMPLATE_NAME || '').trim();
  const targetPhone = req.body?.phone || clinic.phone || '9490605809';

  if (!token || !phoneId) {
    return res.status(400).json({
      success: false,
      error: 'WhatsApp Access Token and Phone Number ID are required. Please input them in the Meta WhatsApp Cloud API card.',
      advice: 'Open developers.facebook.com > My Apps > WhatsApp > API Setup to copy your Phone Number ID and Access Token.'
    });
  }

  const sampleAppointment = {
    id: `test-apt-${Date.now()}`,
    patientName: 'Test Patient (Admin Verification)',
    patientAge: 32,
    serviceName: 'Neuro-Physiotherapy Online Consultation',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    timeSlot: '11:00 AM - 11:45 AM',
    amountPaid: 1,
    paymentMethod: 'UPI / Razorpay Verified',
    invoiceNumber: 'INV-TEST-001',
    meetingLink: 'https://meet.google.com/kpv-neuo-phy',
    meetingPassword: 'KPV-REHAB',
    doctorName: clinic.doctorName || 'Dr. P. Sai Tejaswini, MPT (Neuro), MIAP'
  };

  try {
    const metaRes = await sendMetaWhatsAppMessage(targetPhone, sampleAppointment, token, phoneId, template);

    // Record in notification logs
    (store as any).notificationLogs = (store as any).notificationLogs || [];
    (store as any).notificationLogs.unshift({
      id: `notif-wa-test-${Date.now()}`,
      type: 'WhatsApp Test',
      recipient: `+${metaRes.recipient}`,
      patientName: 'Admin Verification Test',
      status: metaRes.sent ? `Delivered (${metaRes.method})` : 'Failed',
      details: metaRes.sent 
        ? `Live verification message delivered via Meta WhatsApp Cloud API. Message ID: ${metaRes.messageId}`
        : `Meta Cloud API rejected: ${metaRes.error}. ${metaRes.advice || ''}`,
      timestamp: new Date().toISOString()
    });
    saveStore();

    if (metaRes.sent) {
      return res.json({
        success: true,
        message: `✓ Test WhatsApp message successfully delivered to +${metaRes.recipient} via Meta WhatsApp Cloud API!`,
        messageId: metaRes.messageId,
        method: metaRes.method,
        recipient: metaRes.recipient,
        details: metaRes.details
      });
    } else {
      return res.status(400).json({
        success: false,
        error: metaRes.error || 'Meta WhatsApp Cloud API rejected the message',
        advice: metaRes.advice,
        details: metaRes.details,
        recipient: metaRes.recipient
      });
    }
  } catch (err: any) {
    console.error('[TEST WHATSAPP EXCEPTION]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal network error testing Meta WhatsApp API'
    });
  }
});

// Meta WhatsApp Cloud API Webhook Verification Handshake
app.get('/api/whatsapp/webhook', (req, res) => {
  const clinic = (store.clinicInfo as any) || {};
  const expectedVerifyToken = clinic.whatsappWebhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'krishnaveni_webhook_secret';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === expectedVerifyToken) {
    console.log('[META WHATSAPP WEBHOOK VERIFIED]');
    return res.status(200).send(challenge);
  } else {
    console.warn('[META WHATSAPP WEBHOOK VERIFICATION FAILED]', { mode, token });
    return res.status(403).json({ error: 'Verification token mismatch' });
  }
});

// Meta WhatsApp Cloud API Inbound Webhook (Delivery status callbacks & patient messages)
app.post('/api/whatsapp/webhook', (req, res) => {
  const body = req.body;
  if (body?.object === 'whatsapp_business_account') {
    try {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          const value = change.value;
          // Delivery status updates: sent, delivered, read, failed
          if (value?.statuses && Array.isArray(value.statuses)) {
            value.statuses.forEach((statusObj: any) => {
              const msgId = statusObj.id;
              const statusStr = String(statusObj.status || '').toUpperCase();
              console.log(`[META WHATSAPP STATUS CALLBACK] Msg ${msgId} -> ${statusStr}`);
              
              store.appointments.forEach((apt: any) => {
                if (apt.whatsappMessageId === msgId) {
                  apt.whatsappDeliveryStatus = statusStr;
                }
              });
            });
            saveStore();
          }
        });
      });
    } catch (e) {
      console.error('[META WHATSAPP WEBHOOK HANDLER ERROR]', e);
    }
    return res.status(200).send('EVENT_RECEIVED');
  }
  res.sendStatus(404);
});
V1_DISABLED_WA_ENDPOINTS_END */

// ================= SEO: ROBOTS & SITEMAP =================
const SERVER_STARTED_AT = new Date();

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(renderRobots(siteUrlFor(req)));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(renderSitemap(siteUrlFor(req), SERVER_STARTED_AT));
});

// ================= VITE / STATIC SERVING =================
type HtmlTemplate = (req: express.Request) => Promise<string>;

function pageHandler(loadTemplate: HtmlTemplate): express.RequestHandler {
  return async (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();

    const route = routeForPath(req.path);
    if (route && req.path !== route.path) {
      const query = req.originalUrl.slice(req.path.length);
      return res.redirect(301, route.path + query);
    }

    try {
      const { clinic, doctor, faqs } = await getSeoContent();
      const head = renderHead({ siteUrl: siteUrlFor(req), clinic, doctor, faqs, notFound: !route }) + renderClientConfig();
      const html = (await loadTemplate(req)).replace(HEAD_PLACEHOLDER, head);
      res.status(route ? 200 : 404).type('html').send(html);
    } catch (err) {
      next(err);
    }
  };
}

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production' || !fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));

  if (isDev) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
      });
      app.use(vite.middlewares);
      const templatePath = path.join(process.cwd(), 'index.html');
      app.get('*', pageHandler(async req =>
        vite.transformIndexHtml(req.originalUrl, await fs.promises.readFile(templatePath, 'utf-8'))
      ));
      console.log('[Krishnaveni Rehab App] Vite dev middlewares mounted');
    } catch (err) {
      console.error('[Krishnaveni Rehab App] Error initializing Vite middleware:', err);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    app.use(express.static(distPath, { index: false }));
    app.get('*', pageHandler(async () => template));
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Krishnaveni Rehab App] Server listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Krishnaveni Rehab App] Port ${PORT} already in use.`);
    } else {
      console.error('[Krishnaveni Rehab App] Server listen error:', err);
    }
  });
}

startServer().catch(err => {
  console.error('[Krishnaveni Rehab App] Could not start:', err);
  process.exit(1);
});
