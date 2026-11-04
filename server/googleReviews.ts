import type { Testimonial } from '../src/types.js';

interface PlaceReview {
  rating: number;
  text?: { text: string; languageCode: string };
  authorAttribution?: { displayName: string; photoUri?: string };
  publishTime?: string;
}

interface PlaceDetailsResponse {
  reviews?: PlaceReview[];
}

interface ReviewCache {
  reviews: Testimonial[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 23 * 60 * 60_000; // 23 hours
let cache: ReviewCache | null = null;

function mapReview(r: PlaceReview, idx: number): Testimonial {
  return {
    id: `google-${idx}-${(r.publishTime ?? String(idx)).replace(/\W/g, '')}`,
    patientName: r.authorAttribution?.displayName ?? 'Anonymous',
    patientAge: 0,
    treatment: 'Google Review',
    rating: r.rating,
    comment: r.text?.text ?? '',
    photoUrl: r.authorAttribution?.photoUri,
    date: r.publishTime ?? new Date().toISOString(),
  };
}

async function fetchFromPlaces(): Promise<Testimonial[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    console.log('[googleReviews] GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not set.');
    return [];
  }

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'reviews',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[googleReviews] Places API error ${res.status}:`, body);
    return [];
  }

  const data: PlaceDetailsResponse = await res.json();
  return (data.reviews ?? [])
    .filter(r => r.rating >= 4 && r.text?.text)
    .map((r, i) => mapReview(r, i));
}

/** Returns cached Google reviews, refreshing if the cache is older than 23 hours. */
export async function getGoogleReviews(): Promise<Testimonial[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.reviews;
  }
  try {
    const reviews = await fetchFromPlaces();
    cache = { reviews, fetchedAt: Date.now() };
    console.log(`[googleReviews] Fetched ${reviews.length} reviews.`);
    return reviews;
  } catch (err) {
    console.error('[googleReviews] Fetch failed:', err);
    return cache?.reviews ?? [];
  }
}

/** Proactively refreshes the cache (called by the daily cron). */
export async function syncGoogleReviews(): Promise<void> {
  const reviews = await fetchFromPlaces();
  cache = { reviews, fetchedAt: Date.now() };
  console.log(`[googleReviews] Cron synced ${reviews.length} reviews.`);
}
