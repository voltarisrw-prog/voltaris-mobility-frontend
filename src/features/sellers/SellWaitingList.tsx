'use client';

import { HomeInquiryForm } from '@/features/home/HomeInquiryForm';

/**
 * Shown while seller self-service is unfinished.
 *
 * The alternative was leaving the full four-step form in place. It collects ten
 * minutes of work, uploads photos, and then loses everything because
 * `POST /seller-listings` does not exist yet. An honest form that reaches a
 * human is a better outcome for the seller and a better lead for Voltaris than
 * a polished one that fails at the last step.
 */
export function SellWaitingList() {
  return (
    <div>
      <div className="border border-volt/25 bg-volt-wash p-6">
        <h2 className="font-display text-xl tracking-tight">We are taking listings by hand</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
          Self-service listing is not open yet. Tell us about your vehicle below and a
          member of the team will come back within a working day to photograph it, agree
          a price, and put it in front of buyers.
        </p>
      </div>

      <div className="mt-10">
        <HomeInquiryForm />
      </div>
    </div>
  );
}
