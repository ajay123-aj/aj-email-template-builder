import { useState, useRef, useEffect } from 'react';
import { useEditorStore, actions } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';
import { extractEmailContent } from '../utils/importHtml';
import { convertHtmlToTemplate } from '../utils/aiTemplate';

interface ToolbarProps {
  isMobile?: boolean;
  leftDrawerOpen?: boolean;
  rightDrawerOpen?: boolean;
  onToggleLeftDrawer?: () => void;
  onToggleRightDrawer?: () => void;
}

export function Toolbar({ isMobile, leftDrawerOpen, rightDrawerOpen, onToggleLeftDrawer, onToggleRightDrawer }: ToolbarProps = {}) {
  const { history, historyIndex } = useEditorStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [htmlImportLoading, setHtmlImportLoading] = useState(false);
  const [importElapsedSec, setImportElapsedSec] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const importTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);
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
  const importHtml = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,text/html';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = async () => {
        const html = r.result as string;
        if (!html?.trim()) return;
        setHtmlImportLoading(true);
        setImportElapsedSec(0);
        if (importTimerRef.current) clearInterval(importTimerRef.current);
        importTimerRef.current = setInterval(() => setImportElapsedSec((s) => s + 1), 1000);
        const content = extractEmailContent(html);
        try {
          const template = await convertHtmlToTemplate(content);
          actions.setTemplate(template);
          actions.setShowPreview(false);
        } catch {
          actions.setTemplateFromHtml(content);
        } finally {
          if (importTimerRef.current) {
            clearInterval(importTimerRef.current);
            importTimerRef.current = null;
          }
          setHtmlImportLoading(false);
        }
      };
      r.readAsText(f);
    };
    input.click();
  };

  return (
    <>
    <header className="min-h-12 flex-shrink-0 flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 bg-white border-b border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
        <span className="text-sm font-semibold text-slate-800">AJ Email Template Editor</span>
        <span className="text-xs text-slate-500 hidden sm:inline">Build template → Preview → Export HTML to use when sending emails</span>
      </div>
      <div className="w-px h-5 sm:h-6 bg-slate-200" />
      {/* Blocks / Properties toggles only on mobile; desktop always shows both panels */}
      {isMobile && (
        <>
          <button type="button" onClick={onToggleLeftDrawer} className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer ${leftDrawerOpen ? 'bg-slate-200 text-slate-800' : 'text-slate-700 hover:bg-slate-100'}`} aria-label="Blocks">Blocks</button>
          <button type="button" onClick={onToggleRightDrawer} className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer ${rightDrawerOpen ? 'bg-slate-200 text-slate-800' : 'text-slate-700 hover:bg-slate-100'}`} aria-label="Properties">Properties</button>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
        </>
      )}
      <button type="button" onClick={() => actions.undo()} disabled={!canUndo} className="px-2 sm:px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Undo</button>
      <button type="button" onClick={() => actions.redo()} disabled={!canRedo} className="px-2 sm:px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Redo</button>
      <div className="flex-1 min-w-2" />
      <div className="relative" ref={menuRef}>
        <button type="button" onClick={() => setMenuOpen(o => !o)} className="p-2 rounded text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-300 bg-white" aria-label="Menu" aria-expanded={menuOpen}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 py-1 w-56 bg-white rounded-lg border border-slate-200 shadow-lg z-50">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-500">Use your template</p>
            </div>
            <button type="button" onClick={() => { exportHtml(); setMenuOpen(false); }} className="w-full px-3 py-2.5 text-left hover:bg-slate-50 rounded-t-lg">
              <span className="block text-sm font-medium text-slate-800">Export HTML</span>
              <span className="block text-xs text-slate-500">Download email.html to paste into your email campaign or sender</span>
            </button>
            <button type="button" onClick={() => { exportJson(); setMenuOpen(false); }} className="w-full px-3 py-2.5 text-left hover:bg-slate-50">
              <span className="block text-sm font-medium text-slate-800">Save template</span>
              <span className="block text-xs text-slate-500">Save as .json to edit again later</span>
            </button>
            <button type="button" onClick={() => { importJson(); setMenuOpen(false); }} className="w-full px-3 py-2.5 text-left hover:bg-slate-50">
              <span className="block text-sm font-medium text-slate-800">Import template</span>
              <span className="block text-xs text-slate-500">Open a saved .json template</span>
            </button>
            <button type="button" onClick={() => { importHtml(); setMenuOpen(false); }} className="w-full px-3 py-2.5 text-left hover:bg-slate-50 rounded-b-lg">
              <span className="block text-sm font-medium text-slate-800">Import HTML</span>
              <span className="block text-xs text-slate-500">Load .html and convert to template blocks (AI). Falls back to one HTML block if no API key.</span>
            </button>
          </div>
        )}
      </div>
    </header>
    {htmlImportLoading && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 max-w-sm mx-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" aria-hidden />
          <p className="text-sm font-medium text-slate-800 text-center">Converting HTML to template…</p>
          <p className="text-xs text-slate-500 text-center">Please wait. This may take up to 10 seconds.</p>
          <p className="text-lg font-semibold tabular-nums text-slate-700">{importElapsedSec} sec</p>
        </div>
      </div>
    )}
    </>
  );
}
