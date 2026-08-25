import type { Config } from 'tailwindcss';

/**
 * Voltaris design tokens, derived from the brand mark.
 *
 * Colours are sampled from the logo itself, not invented: the near-black field
 * (#00030C), the chrome of the V (#E8EAED down through #6C727C), and the electric
 * blue of the road light (#5CC8FF). There is no second accent — the mark does not
 * have one, and adding one would dilute it.
 *
 * The structural motif is the logo's vanishing point: perspective lines converging
 * on a light source. It appears as the hero backdrop, as section dividers, and as
 * the range meter's lane marking. That is where the boldness is spent; everything
 * else stays quiet.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces, darkest to lightest
        surface: '#00030C',
        abyss: '#050A16',
        slab: '#0B1220',
        hairline: '#1B2436',
        // Type and metal
        chrome: '#E8EAED',
        steel: { DEFAULT: '#A8AEB8', muted: '#6C727C' },
        // The single accent: the road light
        volt: {
          DEFAULT: '#5CC8FF',
          bright: '#9EE4FF',
          deep: '#0A63C4',
          wash: '#0A1B2E',
        },
        danger: '#FF6B60',
        success: '#4ADE9B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        data: ['var(--font-data)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        hero: ['clamp(2.75rem, 8vw, 6.5rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        display: ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        headline: ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
      },
      borderRadius: { xs: '2px', sm: '3px', DEFAULT: '4px', lg: '8px' },
      maxWidth: { shell: '82rem' },
      transitionTimingFunction: { out: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        'rise-in': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        'lane-pulse': { '0%,100%': { opacity: '0.35' }, '50%': { opacity: '0.9' } },
      },
      animation: {
        'rise-in': 'rise-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'lane-pulse': 'lane-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
