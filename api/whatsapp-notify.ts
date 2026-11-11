import { sendWhatsAppNotifications, type WhatsAppEvent } from '../server/whatsappMsg91.js';

// Vercel Function at /api/whatsapp-notify. Locally, server.ts serves the same route.
export async function POST(request: Request): Promise<Response> {
  let body: { bookingId?: unknown; event?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid request.' }, { status: 400 });
  }
  const validEvents: WhatsAppEvent[] = ['pending', 'confirmed', 'cancelled'];
  if (!validEvents.includes(body?.event as WhatsAppEvent)) {
    return Response.json({ message: 'Invalid event. Must be pending, confirmed, or cancelled.' }, { status: 400 });
  }
  try {
    const { status, message } = await sendWhatsAppNotifications(body?.bookingId, body.event as WhatsAppEvent);
    return Response.json({ message }, { status });
  } catch (err) {
    console.error('[whatsapp-notify]', err);
    return Response.json({ message: 'WhatsApp notification could not be sent.' }, { status: 500 });
  }
}
