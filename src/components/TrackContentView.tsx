'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export function TrackContentView({ slug, category }: { slug: string; category: string }) {
  useEffect(() => {
    track('content_view', { slug, category });
  }, [slug, category]);
  return null;
}
