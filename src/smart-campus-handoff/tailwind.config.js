/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#123B70', tint: '#EAF0F8' },
        brand: { DEFAULT: '#2563EB', hover: '#1D4ED8', active: '#1E40AF', tint: '#EFF4FF' },
        sky: { DEFAULT: '#60A5FA', soft: '#93C5FD', mist: '#C9D8EE' },
        ink: '#0F172A',
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        line: { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
        muted: '#64748B',
        body: '#475569',
        placeholder: '#94A3B8',
        success: { DEFAULT: '#16A34A', text: '#15803D', tint: '#DCFCE7' },
        notice: { DEFAULT: '#B45309', tint: '#FDF3E4' },
        error: { DEFAULT: '#DC2626', tint: '#FEE2E2' },
        cat: {
          lecture: '#2563EB', 'lecture-tint': '#EFF4FF',
          lab: '#0E7C86', 'lab-tint': '#E7F5F6',
          office: '#123B70', 'office-tint': '#EAF0F8',
          services: '#B45309', 'services-tint': '#FDF3E4',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '52px', letterSpacing: '-0.035em', fontWeight: '800' }],
        title: ['32px', { lineHeight: '40px', letterSpacing: '-0.03em', fontWeight: '800' }],
        section: ['22px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '700' }],
        card: ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '700' }],
        body: ['15px', { lineHeight: '24px' }],
        label: ['14px', { lineHeight: '20px', fontWeight: '600' }],
        meta: ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: { badge: '6px', control: '10px', card: '14px', panel: '20px' },
      boxShadow: {
        rest: '0 1px 2px rgba(15,23,42,.06)',
        lift: '0 8px 24px -10px rgba(18,59,112,.25)',
        hero: '0 10px 30px -12px rgba(0,0,0,.35)',
        focus: '0 0 0 4px rgba(37,99,235,.18)',
        'focus-on-navy': '0 0 0 5px rgba(96,165,250,.35)',
      },
      maxWidth: { container: '1200px' },
    },
  },
};
