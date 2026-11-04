import { getGoogleReviews } from '../server/googleReviews.js';

// Vercel Function at /api/google-reviews. Locally, server.ts serves the same route.
export async function GET(): Promise<Response> {
  try {
    const reviews = await getGoogleReviews();
    return Response.json(reviews);
  } catch (err) {
    console.error('[google-reviews]', err);
    return Response.json([], { status: 500 });
  }
}
