import { ScrollReveal } from '../ScrollReveal';

export function IntroSection() {
  return (
    <section className="py-6 sm:py-8 lg:py-10" aria-labelledby="intro-heading">
      <ScrollReveal>
      <h2 id="intro-heading" className="text-center text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-6 max-w-4xl mx-auto px-4">
        Whether you need a newsletter, promo, or welcome email — our drag-and-drop editor makes it easy.
      </h2>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
        <p className="text-slate-300 text-center text-sm sm:text-base leading-relaxed">
          Free to use. No account required to start. Pick a template below and begin designing in seconds.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href="#templates"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>No coding needed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Export HTML instantly</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Works in any email client</span>
          </div>
        </div>
      </div>
      </ScrollReveal>
    </section>
  );
}
