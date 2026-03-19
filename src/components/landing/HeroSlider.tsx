import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { TemplatePreview } from './TemplatePreview';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Professional newsletters that keep your audience engaged.',
    templateId: 'newsletter',
  },
  {
    id: 'promotion',
    title: 'Promotion',
    description: 'Eye-catching promos that drive sales and conversions.',
    templateId: 'promotion',
  },
  {
    id: 'welcome',
    title: 'Welcome Email',
    description: 'Warm welcome emails for new subscribers.',
    templateId: 'welcome',
  },
  {
    id: 'product',
    title: 'Product Showcase',
    description: 'Showcase products with stunning layouts.',
    templateId: 'product',
  },
  {
    id: 'event',
    title: 'Event Invite',
    description: 'Invite guests to your events in style.',
    templateId: 'event',
  },
];

export function HeroSlider() {
  const isMd = useMediaQuery('(min-width: 768px)');
  const heroScale = isMd ? 0.42 : 0.32;

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6 sm:mt-8 lg:mt-10">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={600}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        className="hero-swiper !overflow-hidden !rounded-2xl !border !border-white/10 !bg-white/5 !backdrop-blur-xl !shadow-2xl !shadow-black/20"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-4 sm:p-6">
              {/* Content */}
              <div className="w-full sm:w-1/2 flex flex-col items-center sm:items-start text-center sm:text-left order-1">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{slide.title}</h3>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 max-w-md">
                  {slide.description}
                </p>
                <Link
                  to={`/editor?template=${slide.templateId}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
                >
                  Use this template
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              {/* Preview */}
              <div className="w-full sm:w-1/2 max-w-[280px] sm:max-w-[320px] aspect-[4/3] rounded-xl overflow-hidden bg-white border border-white/20 shadow-xl flex-shrink-0 order-2">
                <div className="w-full h-full relative">
                  <TemplatePreview
                    templateId={slide.templateId}
                    templateName={slide.title}
                    className="!relative w-full h-full"
                    scale={heroScale}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
