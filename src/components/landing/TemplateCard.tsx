import { useNavigate } from 'react-router-dom';
import { TemplatePreview } from './TemplatePreview';
import type { Template } from '../../data/templates';

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/editor?template=${template.id}`);
  };

  const isBlank = template.type === 'blank';

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm text-left transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/40 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-violet-500/10 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 min-w-0 w-full"
    >
      {/* Preview area - full bleed, no inner card */}
      <div className="relative aspect-[4/3] w-full min-h-[100px] sm:min-h-[120px] overflow-hidden rounded-t-xl sm:rounded-t-2xl bg-slate-800/40">
        {isBlank ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-dashed border-violet-400/50 flex items-center justify-center bg-violet-500/10">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-slate-200 sm:text-slate-100 text-sm sm:text-base font-semibold">Start from scratch</span>
              <span className="text-slate-400 text-xs sm:text-sm">Blank canvas</span>
            </div>
          </div>
        ) : (
          <TemplatePreview templateId={template.id} templateName={template.name} />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-semibold shadow-lg">
            Use template
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
      {/* Card footer */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-2 border-t border-white/5 bg-white/[0.03]">
        <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors text-sm sm:text-base truncate">
          {template.name}
        </h3>
        <svg className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 flex-shrink-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
