import type { Testimonial } from '../src/types.js';

interface FeaturableReview {
  reviewId: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  comment: string;
  starRating: number;
  createTime: string;
}

interface FeaturableResponse {
  success: boolean;
  example?: boolean;
  reviews?: FeaturableReview[];
}

interface ReviewCache {
  reviews: Testimonial[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 23 * 60 * 60_000; // 23 hours
let cache: ReviewCache | null = null;

const FEATURABLE_WIDGET_ID = process.env.FEATURABLE_WIDGET_ID ?? '852606f9-6534-4c8e-9333-c4e22bf3d873';

function mapReview(r: FeaturableReview): Testimonial {
  return {
    id: `google-${r.reviewId}`,
    patientName: r.reviewer.displayName ?? 'Anonymous',
    patientAge: 0,
    treatment: 'Google Review',
    rating: r.starRating,
    comment: r.comment ?? '',
    photoUrl: r.reviewer.profilePhotoUrl || undefined,
    date: r.createTime ?? new Date().toISOString(),
  };
}

async function fetchFromFeaturable(): Promise<Testimonial[]> {
  const res = await fetch(`https://api.featurable.com/v1/widgets/${FEATURABLE_WIDGET_ID}`);

  if (!res.ok) {
    console.error(`[googleReviews] Featurable API error ${res.status}`);
    return [];
  }

  const data: FeaturableResponse = await res.json();
  if (!data.success || !data.reviews) return [];
  if (data.example) console.log('[googleReviews] Featurable returning example reviews — connect real Google profile.');

  return data.reviews
    .filter(r => r.starRating >= 4 && r.comment)
    .map(r => mapReview(r));
}

/** Returns cached Google reviews, refreshing if the cache is older than 23 hours. */
export async function getGoogleReviews(): Promise<Testimonial[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.reviews;
  }
  try {
    const reviews = await fetchFromFeaturable();
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
  const reviews = await fetchFromFeaturable();
  cache = { reviews, fetchedAt: Date.now() };
  console.log(`[googleReviews] Cron synced ${reviews.length} reviews.`);
}
