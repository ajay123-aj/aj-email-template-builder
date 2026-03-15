import { useEditorStore } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';

export function Preview() {
  const template = useEditorStore(s => s.template);
  const html = exportToEmailHtml(template);
  const width = 600;
  return (
    <div className="flex-1 overflow-auto bg-slate-300 flex justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width, maxWidth: '100%' }}>
        <iframe title="Preview" srcDoc={html} className="w-full border-0" style={{ minHeight: '500px', height: '80vh' }} sandbox="allow-same-origin" />
      </div>
    </div>
  );
}
