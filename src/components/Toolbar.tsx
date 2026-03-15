import { useState, useRef, useEffect } from 'react';
import { useEditorStore, actions } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';

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
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="min-h-12 flex-shrink-0 flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 bg-white border-b border-slate-200">
      <span className="text-sm font-medium text-slate-700 mr-1">Email Template Builder</span>
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
          <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-50">
            <button type="button" onClick={() => { exportHtml(); setMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 rounded-t-lg">Export HTML</button>
            <button type="button" onClick={() => { exportJson(); setMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">Save template</button>
            <button type="button" onClick={() => { importJson(); setMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 rounded-b-lg">Import</button>
          </div>
        )}
      </div>
    </header>
  );
}
