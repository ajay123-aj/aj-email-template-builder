import { ScrollReveal } from '../ScrollReveal';

const features = [
  {
    title: 'Drag & Drop',
    description: 'Build emails visually by dragging blocks. No coding required.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
  {
    title: 'Live Preview',
    description: 'See your email in real time as you edit. Toggle between edit and preview modes.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Export HTML',
    description: 'Download your design as HTML ready for any email campaign or marketing tool.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    title: 'AI Assist',
    description: 'Import HTML and let AI convert it into an editable template for you.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-6 sm:py-8 lg:py-10 scroll-mt-24" aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">
        Features
      </h2>
      <ScrollReveal>
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-400 mb-2">Why choose us</p>
        <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">
          Everything you need to build emails
        </h3>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          A simple, powerful editor designed for creating professional email templates.
        </p>
      </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 80}>
            <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 transition-all duration-300 hover:bg-white/10 hover:border-violet-500/30 hover:shadow-[0_0_30px_-8px_rgba(139,92,246,0.3)]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-violet-300 group-hover:text-violet-200 transition-colors mb-4">
                {feature.icon}
              </div>
              <h4 className="font-semibold text-white text-base sm:text-lg mb-2">{feature.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
