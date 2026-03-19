import { useMemo, useRef, useState, useEffect } from 'react';
import { exportToEmailHtml } from '../../utils/exportHtml';
import { getMockTemplate } from '../../data/mockTemplates';

const CONTENT_WIDTH = 600;
const CONTENT_HEIGHT = 450;

interface TemplatePreviewProps {
  templateId: string;
  templateName: string;
  className?: string;
  scale?: number; // optional fallback; if not provided, auto-fit is used
}

export function TemplatePreview({ templateId, templateName, className = '', scale = 0.5 }: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(scale);

  const html = useMemo(() => {
    if (templateId === 'blank') return '';
    const template = getMockTemplate(templateId);
    if (!template) return '';
    return exportToEmailHtml(template);
  }, [templateId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const scaleX = width / CONTENT_WIDTH;
      const scaleY = height / CONTENT_HEIGHT;
      const s = Math.min(scaleX, scaleY, 1);
      setFitScale(s);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html]);

  if (templateId === 'blank') {
    return null;
  }

  if (!html) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-slate-100 ${className}`}>
        <span className="text-slate-400 text-xs">{templateName}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden bg-white flex items-center justify-center ${className}`}
    >
      <div
        style={{
          width: CONTENT_WIDTH,
          height: CONTENT_HEIGHT,
          transform: `scale(${fitScale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        <iframe
          title={templateName}
          srcDoc={html}
          sandbox="allow-same-origin"
          className="w-full h-full border-0 bg-white pointer-events-none block rounded"
          style={{ width: CONTENT_WIDTH, height: CONTENT_HEIGHT, display: 'block' }}
        />
      </div>
    </div>
  );
}
