import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useEditorStore, actions } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';
import { extractEmailContent } from '../utils/importHtml';
import { convertHtmlToTemplate } from '../utils/aiTemplate';
import { IconUndo, IconRedo, IconMenu, IconBlocks, IconProperties, IconExportHtml, IconSave, IconImport, IconHtml } from './icons';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      const inMenu = menuRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inMenu && !inDropdown) setMenuOpen(false);
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
        const content = extractEmailContent(html);
        try {
          const template = await convertHtmlToTemplate(content);
          actions.setTemplate(template);
          actions.setShowPreview(false);
        } catch {
          actions.setTemplateFromHtml(content);
        } finally {
          setHtmlImportLoading(false);
        }
      };
      r.readAsText(f);
    };
    input.click();
  };

  return (
    <>
    <header className="min-h-14 flex-shrink-0 flex flex-wrap items-center gap-3 px-4 sm:px-6 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xl shadow-slate-900/5">
      {/* Back button */}
      <Link
        to="/"
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors border border-slate-200/80"
        title="Back to Templates"
        aria-label="Back to Templates"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>
      <div className="w-px h-6 bg-slate-200/80" />
      {/* Brand - matches main page Header */}
      <div className="flex items-center gap-2">
        <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
          AJ Email Editor
        </span>
        <span className="text-slate-500 text-xs sm:text-sm font-medium hidden sm:inline">
          Template Builder
        </span>
      </div>
      <div className="w-px h-6 bg-slate-200/80" />
      {/* Blocks / Properties toggles only on mobile */}
      {isMobile && (
        <>
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
            <button type="button" onClick={onToggleLeftDrawer} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${leftDrawerOpen ? 'bg-slate-800 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`} aria-label="Blocks"><IconBlocks />Blocks</button>
            <button type="button" onClick={onToggleRightDrawer} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${rightDrawerOpen ? 'bg-slate-800 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`} aria-label="Properties"><IconProperties />Properties</button>
          </div>
          <div className="w-px h-5 bg-slate-200/80" />
        </>
      )}
      <div className="w-px h-6 bg-slate-200/80" />
      {/* Undo / Redo */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
        <button type="button" onClick={() => actions.undo()} disabled={!canUndo} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent" title="Undo"><IconUndo />Undo</button>
        <button type="button" onClick={() => actions.redo()} disabled={!canRedo} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent" title="Redo"><IconRedo />Redo</button>
      </div>
      <div className="flex-1 min-w-4" />
      {/* File Menu */}
      <div className="relative" ref={menuRef}>
        <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${menuOpen ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-sm'}`} aria-label="Menu" aria-expanded={menuOpen}>
          <IconMenu />
          <span>File</span>
        </button>
        {menuOpen && createPortal(
          <div
            ref={dropdownRef}
            className="fixed py-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-[9999] overflow-hidden"
            style={{
              top: (menuRef.current?.getBoundingClientRect().bottom ?? 0) + 8,
              right: typeof window !== 'undefined' ? window.innerWidth - (menuRef.current?.getBoundingClientRect().right ?? 0) : 0,
            }}
          >
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">File</p>
            </div>
            <div className="py-1">
              <button type="button" onClick={() => { exportHtml(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                <span className="mt-0.5 p-1.5 rounded-xl bg-emerald-50 text-emerald-600"><IconExportHtml /></span>
                <span><span className="block text-sm font-semibold text-slate-800">Export HTML</span>
                <span className="block text-xs text-slate-500 mt-0.5">Download email.html for your campaign</span></span>
              </button>
              <button type="button" onClick={() => { exportJson(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                <span className="mt-0.5 p-1.5 rounded-xl bg-blue-50 text-blue-600"><IconSave /></span>
                <span><span className="block text-sm font-semibold text-slate-800">Save template</span>
                <span className="block text-xs text-slate-500 mt-0.5">Save as .json to edit later</span></span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button type="button" onClick={() => { importJson(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                <span className="mt-0.5 p-1.5 rounded-xl bg-amber-50 text-amber-600"><IconImport /></span>
                <span><span className="block text-sm font-semibold text-slate-800">Import template</span>
                <span className="block text-xs text-slate-500 mt-0.5">Open a saved .json file</span></span>
              </button>
              <button type="button" onClick={() => { importHtml(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                <span className="mt-0.5 p-1.5 rounded-xl bg-violet-50 text-violet-600"><IconHtml /></span>
                <span><span className="block text-sm font-semibold text-slate-800">Import HTML</span>
                <span className="block text-xs text-slate-500 mt-0.5">Convert .html to template (AI)</span></span>
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </header>
    {htmlImportLoading && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 max-w-sm mx-4 border border-slate-100">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" aria-hidden />
          <p className="text-base font-semibold text-slate-800 text-center">Converting HTML to template…</p>
          <p className="text-sm text-slate-500 text-center">This may take up to 10 seconds.</p>
        </div>
      </div>
    )}
    </>
  );
}
