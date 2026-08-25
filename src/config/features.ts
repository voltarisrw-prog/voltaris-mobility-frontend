/**
 * Feature flags.
 *
 * These exist so an unfinished capability is *absent* rather than broken. A
 * "Buy now" button that leads to a dead checkout costs more trust than no button
 * at all, and a Sell form that collects ten minutes of work before 404ing on
 * submit is worse than a waiting list.
 *
 * Every flag defaults to OFF. Turning one on is a deliberate act after the
 * backend capability behind it actually exists — the safe direction for a
 * missing environment variable is "hide it".
 */

import { envFlag } from '@/lib/env';

export const features = {
  /**
   * Online purchase and the checkout flow.
   * Requires: a real payment provider adapter in the backend. `StubProvider`
   * refuses to run in production, so this must stay off until one exists.
   */
  checkout: envFlag(process.env.NEXT_PUBLIC_FEATURE_CHECKOUT),

  /**
   * Seller self-service listing submission.
   * Requires: `POST /seller-listings`. Media upload already works, but without
   * the listing endpoint the form loses everything on submit.
   */
  sellerListings: envFlag(process.env.NEXT_PUBLIC_FEATURE_SELLER_LISTINGS),

  /**
   * Password reset and email verification links.
   * Requires: an email transport. Without one the endpoints accept the request
   * and nothing ever arrives, which is worse than not offering it.
   */
  passwordReset: envFlag(process.env.NEXT_PUBLIC_FEATURE_PASSWORD_RESET),

  /** Rentals. Needs an availability calendar, not just a daily price. */
  rentals: envFlag(process.env.NEXT_PUBLIC_FEATURE_RENTALS),
} as const;

export type Feature = keyof typeof features;
