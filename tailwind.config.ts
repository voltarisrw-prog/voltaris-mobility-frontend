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
        // Night system: every colour is a CSS variable (RGB channels, so opacity
        // modifiers like bg-surface/90 keep working). Values live in globals.css:
        // the logo's blue-black field, chrome text, and its blues as the accent.
        // Surfaces, darkest to lightest
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        abyss: 'rgb(var(--c-abyss) / <alpha-value>)',
        slab: 'rgb(var(--c-slab) / <alpha-value>)',
        hairline: 'rgb(var(--c-hairline) / <alpha-value>)',
        // Type and metal
        chrome: 'rgb(var(--c-chrome) / <alpha-value>)',
        steel: {
          DEFAULT: 'rgb(var(--c-steel) / <alpha-value>)',
          muted: 'rgb(var(--c-steel-muted) / <alpha-value>)',
        },
        bronze: '#6B4A2B',
        // The accent: the logo's road light
        volt: {
          DEFAULT: 'rgb(var(--c-volt) / <alpha-value>)',
          bright: 'rgb(var(--c-volt-bright) / <alpha-value>)',
          deep: 'rgb(var(--c-volt-deep) / <alpha-value>)',
          wash: 'rgb(var(--c-volt-wash) / <alpha-value>)',
        },
        danger: '#FF6B60',
        success: '#4ADE9B',
        // The logo field and the chrome of the V.
        ink: '#00030C',
        metal: { DEFAULT: '#E8EAED', deep: '#6C727C' },
      },
      fontFamily: {
        display: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        data: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.06em' }],
        hero: ['clamp(2.75rem, 7vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        display: ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        headline: ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        // Two mid-steps so nothing between headline and body has to be improvised.
        title: ['clamp(1.25rem, 1.05rem + 0.9vw, 1.625rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        lead: ['clamp(1.0625rem, 0.95rem + 0.4vw, 1.25rem)', { lineHeight: '1.55' }],
      },
      borderRadius: { none: '0', xs: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0', full: '9999px' },
      maxWidth: { shell: '76rem', measure: '62ch' },
      // Rhythm: py-section between sections, gap-block inside them, px-gutter at
      // the page edge. Fluid, and the same numbers the CSS side reads.
      spacing: {
        gutter: 'var(--vds-gutter)',
        block: 'var(--vds-block)',
        section: 'var(--vds-section)',
      },
      boxShadow: { none: 'none', sm: 'none', DEFAULT: 'none', md: 'none', lg: 'none', xl: 'none', '2xl': 'none' },
      transitionTimingFunction: { out: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        'rise-in': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        'lane-pulse': { '0%,100%': { opacity: '0.35' }, '50%': { opacity: '0.9' } },
        'sheet-in': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'backdrop-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'panel-in': { from: { opacity: '0', transform: 'translate(-50%, -6px)' }, to: { opacity: '1', transform: 'translate(-50%, 0)' } },
      },
      animation: {
        'rise-in': 'rise-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'lane-pulse': 'lane-pulse 4s ease-in-out infinite',
        'sheet-in': 'sheet-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'backdrop-in': 'backdrop-in 200ms ease-out both',
        'panel-in': 'panel-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
export default config;
