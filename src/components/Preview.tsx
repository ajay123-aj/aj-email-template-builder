import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';

function measureIframeHeight(iframe: HTMLIFrameElement): number {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc?.body) return 0;
    const wrapper = doc.querySelector('.email-wrapper') as HTMLElement;
    if (wrapper) {
      return Math.ceil(wrapper.offsetTop + wrapper.offsetHeight);
    }
    const b = doc.body;
    const de = doc.documentElement;
    return Math.max(de.scrollHeight, de.offsetHeight, b.scrollHeight, b.offsetHeight);
  } catch {
    return 0;
  }
}

export function Preview() {
  const template = useEditorStore(s => s.template);
  const html = exportToEmailHtml(template);
  const sectionCount = template.sections.filter(s => s.columns.length > 0).length;
  const initialHeight = Math.max(400, sectionCount * 150);
  const [iframeHeight, setIframeHeight] = useState(initialHeight);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const width = 600;

  const updateHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const h = measureIframeHeight(iframe);
    if (h > 0) {
      setIframeHeight(Math.ceil(h) + 1);
    }
  }, []);

  const onIframeLoad = useCallback(() => {
    updateHeight();
    requestAnimationFrame(updateHeight);
    setTimeout(updateHeight, 50);
    setTimeout(updateHeight, 200);
    setTimeout(updateHeight, 600);
    setTimeout(updateHeight, 1200);
  }, [updateHeight]);

  useEffect(() => {
    const t1 = setTimeout(updateHeight, 100);
    const t2 = setTimeout(updateHeight, 500);
    const t3 = setTimeout(updateHeight, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [html, updateHeight]);

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-slate-300 px-0 py-3 sm:p-6 pb-20 lg:pb-32" style={{ minHeight: '100%' }}>
      <div className="flex flex-col items-center w-full">
        <div className="bg-white shadow-lg rounded-sm w-fit" style={{ width, maxWidth: '100%' }}>
          <iframe
            ref={iframeRef}
            title="Preview"
            srcDoc={html}
            className="w-full border-0 block"
            style={{ height: iframeHeight, display: 'block' }}
            sandbox="allow-same-origin"
            onLoad={onIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
