import { Header } from '../components/landing/Header';
import { Footer } from '../components/landing/Footer';
import { ScrollReveal } from '../components/ScrollReveal';
import { HeroSlider } from '../components/landing/HeroSlider';
import { IntroSection } from '../components/landing/IntroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { TemplateCard } from '../components/landing/TemplateCard';
import { templates } from '../data/templates';

export function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.2),transparent),radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(236,72,153,0.12),transparent),radial-gradient(ellipse_60%_60%_at_0%_100%,rgba(6,182,212,0.1),transparent)]"
          style={{ animation: 'gradient-shift 10s ease-in-out infinite' }}
        />
        {/* Subtle grid pattern */}
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
        {/* Floating blobs */}
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
        {/* Extra accent blob */}
        <div
          className="absolute top-3/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl"
          style={{ animation: 'blob-float 22s ease-in-out infinite', animationDelay: '-7s' }}
        />
      </div>

      <Header />

      <main className="pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero section */}
        <section className="text-center mb-6 sm:mb-8 lg:mb-10" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 sm:mb-4 tracking-tight animate-fade-in-up">
            Create beautiful emails in minutes
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up-delay mb-6 sm:mb-8">
            Start from scratch or use a pre-designed template. No coding required.
          </p>
          <HeroSlider />
        </section>

        {/* Intro / value prop - bridges hero and features */}
        <IntroSection />

        {/* Features section */}
        <FeaturesSection />

        {/* How it works section */}
        <HowItWorksSection />

        {/* Templates section - centered layout */}
        <section id="templates" className="py-6 sm:py-8 lg:py-10 scroll-mt-24 w-full" aria-labelledby="templates-heading">
          <ScrollReveal>
            <div className="text-center mb-6 sm:mb-8">
              <h2 id="templates-heading" className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                Choose a Template
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Pick one to get started or create from blank
              </p>
            </div>
          </ScrollReveal>
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full">
              {templates.map((template, i) => (
                <ScrollReveal key={template.id} delay={i * 60} className="min-w-0">
                  <TemplateCard template={template} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
