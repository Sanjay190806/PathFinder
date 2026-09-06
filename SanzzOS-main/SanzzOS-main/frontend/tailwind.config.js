/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgBase: 'var(--bg-base)',
        bgSurface: 'var(--bg-surface)',
        bgCard: 'var(--bg-card)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accentBlue: 'var(--accent-blue)',
        accentPurple: 'var(--accent-purple)',
        accentEmerald: 'var(--accent-emerald)',
        accentOrange: 'var(--accent-orange)',
        accentPink: 'var(--accent-pink)',
        accentCyan: 'var(--accent-cyan)',
        accentYellow: 'var(--accent-yellow)',
        accentRed: 'var(--accent-red)',
        'glass': 'var(--bg-glass)',
        'glass-hover': 'var(--bg-glass-hover)',
        'bg-glass': 'var(--bg-glass)',
        'bg-glass-hover': 'var(--bg-glass-hover)',
        'border-subtle': 'var(--border-subtle)',
        'border-accent': 'var(--border-accent)'
      },
      boxShadow: {
        'glow-blue': 'var(--shadow-glow-blue)',
        'glow-purple': '0 0 0 1px rgba(139, 92, 246, 0.2), 0 18px 36px rgba(139, 92, 246, 0.12)',
        'glow-emerald': '0 0 0 1px rgba(16, 185, 129, 0.2), 0 18px 36px rgba(16, 185, 129, 0.12)',
        'glow-orange': '0 0 0 1px rgba(249, 115, 22, 0.2), 0 18px 36px rgba(249, 115, 22, 0.12)',
        card: '0 18px 48px rgba(0, 0, 0, 0.35)'
      }
    },
  },
  plugins: [],
}
