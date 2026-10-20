import { sendBookingEmails } from '../server/bookingEmail.js';

// Vercel Function at /api/booking-email. Locally and in Docker, server.ts serves the same route.
export async function POST(request: Request): Promise<Response> {
  let body: { bookingId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid request.' }, { status: 400 });
  }
  try {
    const { status, message } = await sendBookingEmails(body?.bookingId);
    return Response.json({ message }, { status });
  } catch (err) {
    console.error('[booking-email]', err);
    return Response.json({ message: 'The emails could not be sent.' }, { status: 500 });
  }
}
