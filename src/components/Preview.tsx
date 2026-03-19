import { useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';

const HEIGHT_SCRIPT = `<script>(function(){function s(){var h=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);try{window.parent.postMessage({type:'preview-height',height:h},'*')}catch(e){}}
if(document.readyState==='complete')s();else window.addEventListener('load',s);
new MutationObserver(s).observe(document.body,{childList:true,subtree:true})})();<\/script>`;

const NO_SCROLL_STYLE = '<style>html,body{overflow:hidden!important;}</style>';

export function Preview() {
  const template = useEditorStore(s => s.template);
  const html = exportToEmailHtml(template);
  const [iframeHeight, setIframeHeight] = useState(600);
  const width = 600;

  const htmlWithScript = html
    .replace('</head>', NO_SCROLL_STYLE + '</head>')
    .replace('</body>', HEIGHT_SCRIPT + '</body>');

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'preview-height' && typeof e.data.height === 'number') {
      setIframeHeight(Math.max(400, e.data.height));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-slate-300 p-4 sm:p-6 !pb-[100px]" style={{ minHeight: '100%' }}>
      <div className="flex justify-center items-start min-h-full">
        <div className="bg-white shadow-lg rounded-sm flex-shrink-0" style={{ width, maxWidth: '100%' }}>
          <iframe
            title="Preview"
            srcDoc={htmlWithScript}
            className="w-full border-0 block"
            style={{ height: iframeHeight, minHeight: 400 }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
