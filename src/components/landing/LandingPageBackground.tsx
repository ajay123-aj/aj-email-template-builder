/** Shared animated backdrop for marketing pages (home, contact). */
export function LandingPageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.2),transparent),radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(236,72,153,0.12),transparent),radial-gradient(ellipse_60%_60%_at_0%_100%,rgba(6,182,212,0.1),transparent)]"
        style={{ animation: 'gradient-shift 10s ease-in-out infinite' }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          animation: 'grid-pulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl"
        style={{ animation: 'blob-float 15s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        style={{ animation: 'blob-float 18s ease-in-out infinite', animationDelay: '-5s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"
        style={{ animation: 'blob-float 20s ease-in-out infinite', animationDelay: '-10s' }}
      />
      <div
        className="absolute top-3/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl"
        style={{ animation: 'blob-float 22s ease-in-out infinite', animationDelay: '-7s' }}
      />
    </div>
  );
}
