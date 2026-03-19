import { ScrollReveal } from '../ScrollReveal';

const steps = [
  {
    number: '1',
    title: 'Choose a template',
    description: 'Start from a blank canvas or pick from our pre-designed templates.',
  },
  {
    number: '2',
    title: 'Edit & customize',
    description: 'Drag blocks, edit text, change colors, and style your email.',
  },
  {
    number: '3',
    title: 'Export & use',
    description: 'Download as HTML and use it in your email campaigns.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-6 sm:py-8 lg:py-10 scroll-mt-24" aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading" className="sr-only">
        How it works
      </h2>
      <ScrollReveal>
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-400 mb-2">Simple process</p>
        <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">
          How it works
        </h3>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Create professional emails in three easy steps.
        </p>
      </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
        {steps.map((step, i) => (
          <ScrollReveal key={step.number} delay={i * 100}>
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center text-xl font-bold text-white mb-4">
              {step.number}
            </div>
            <h4 className="font-semibold text-white text-base sm:text-lg mb-2">{step.title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
          </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
