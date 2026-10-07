/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        watch: '#000000',
        accent: { primary: '#00E5FF' },
        phase: {
          safe: '#38BDF8',
          warning: '#F59E0B',
          critical: '#FB923C',
        },
        target: { success: '#10B981' },
        hazard: { overshoot: '#EF4444' },
        ring: { track: '#18181B' },
      },
    },
  },
  plugins: [],
};
