import { defineConfig } from '@playwright/test';

/**
 * Visual matrix: every width that matters, plus 200% zoom. Screenshots are
 * compared against committed baselines in e2e/visual.spec.ts-snapshots/.
 *
 *   npm run e2e:visual -- --update-snapshots   # first run, and after an intended change
 *   npm run e2e:visual                          # the check
 */
const widths = [360, 390, 430, 768, 1024, 1366, 1920, 2560, 3440] as const;

export default defineConfig({
  testDir: './e2e',
  testMatch: /visual\.spec\.ts/,
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    ...widths.map((w) => ({
      name: `w${w}`,
      use: {
        viewport: { width: w, height: w < 768 ? 800 : 1000 },
        hasTouch: w < 1024,
        isMobile: w < 1024,
        deviceScaleFactor: w < 1024 ? 2 : 1,
      },
    })),
    // Browser zoom 200%: same CSS pixels as a 683px-wide window at 2x, via viewport + deviceScaleFactor.
    { name: 'zoom200', use: { viewport: { width: 683, height: 500 }, deviceScaleFactor: 2 } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'NEXT_PUBLIC_DEMO_DATA=true NEXT_PUBLIC_FEATURE_CHECKOUT=true npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
