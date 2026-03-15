import { useEditorStore, actions } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';

export function Toolbar() {
  const { history, historyIndex, showPreview } = useEditorStore();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const exportJson = () => {
    const t = useEditorStore.getState().template;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' }));
    a.download = 'template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };
  const exportHtml = () => {
    const html = exportToEmailHtml(useEditorStore.getState().template);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = 'email.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };
  const importJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const t = JSON.parse(r.result as string); if (t?.sections) actions.setTemplate(t); } catch (_) {} };
      r.readAsText(f);
    };
    input.click();
  };

  return (
    <header className="h-12 flex-shrink-0 flex items-center gap-2 px-4 bg-white border-b border-slate-200">
      <button type="button" onClick={() => actions.undo()} disabled={!canUndo} className="px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Undo</button>
      <button type="button" onClick={() => actions.redo()} disabled={!canRedo} className="px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Redo</button>
      <div className="w-px h-6 bg-slate-200" />
      <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5">
        <button type="button" onClick={() => actions.setShowPreview(false)} className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer ${!showPreview ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Edit template</button>
        <button type="button" onClick={() => actions.setShowPreview(true)} className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer ${showPreview ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Preview</button>
      </div>
      <button type="button" onClick={exportHtml} className="px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">Export HTML</button>
      <button type="button" onClick={exportJson} className="px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">Save template</button>
      <button type="button" onClick={importJson} className="px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">Import</button>
      <div className="flex-1" />
      <span className="text-xs text-slate-500">Email Template Builder</span>
    </header>
  );
}
