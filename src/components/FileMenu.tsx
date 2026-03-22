import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore, actions } from '../store/useEditorStore';
import { exportToEmailHtml } from '../utils/exportHtml';
import { extractEmailContent } from '../utils/importHtml';
import { convertHtmlToTemplate } from '../utils/aiTemplate';
import { normalizeImportedTemplate } from '../utils/normalizeTemplate';
import { IconMenu, IconExportHtml, IconSave, IconImport, IconHtml } from './icons';
import { Tooltip } from './Tooltip';

export function FileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [htmlImportLoading, setHtmlImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !dropdownRef.current?.contains(target)) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

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
    input.accept = '.json,application/json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      setImportMessage(null);
      const r = new FileReader();
      r.onload = () => {
        try {
          const parsed = JSON.parse(r.result as string);
          const template = normalizeImportedTemplate(parsed);
          if (template) {
            actions.setTemplate(template);
            actions.setShowPreview(false);
            setImportMessage({ type: 'success', text: 'Template imported' });
            setTimeout(() => setImportMessage(null), 2500);
          } else {
            setImportMessage({ type: 'error', text: 'Invalid file. Use a template saved with Save template.' });
            setTimeout(() => setImportMessage(null), 4000);
          }
        } catch {
          setImportMessage({ type: 'error', text: 'Invalid file. Use a template saved with Save template.' });
          setTimeout(() => setImportMessage(null), 4000);
        }
      };
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
      setImportMessage(null);
      const r = new FileReader();
      r.onload = async () => {
        const html = r.result as string;
        if (!html?.trim()) {
          setImportMessage({ type: 'error', text: 'File is empty. Choose an HTML file with content.' });
          setTimeout(() => setImportMessage(null), 4000);
          return;
        }
        setHtmlImportLoading(true);
        try {
          const content = extractEmailContent(html);
          try {
            const template = await convertHtmlToTemplate(content);
            actions.setTemplate(template);
            actions.setShowPreview(false);
            setImportMessage({ type: 'success', text: 'HTML imported' });
            setTimeout(() => setImportMessage(null), 2500);
          } catch {
            actions.setTemplateFromHtml(content);
            actions.setShowPreview(false);
            setImportMessage({ type: 'success', text: 'HTML imported' });
            setTimeout(() => setImportMessage(null), 2500);
          }
        } catch {
          setImportMessage({ type: 'error', text: 'Failed to parse HTML file.' });
          setTimeout(() => setImportMessage(null), 4000);
        } finally {
          setHtmlImportLoading(false);
        }
      };
      r.readAsText(f);
    };
    input.click();
  };

  const dropdownContent = menuOpen && (
    <div
      ref={dropdownRef}
      className="fixed top-12 sm:top-14 right-4 py-2 w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl z-[9999] overflow-hidden"
    >
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">File</p>
      </div>
      <div className="py-1 max-h-[60vh] overflow-y-auto">
        <button type="button" onClick={() => { exportHtml(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Download your email as an HTML file">
          <span className="mt-0.5 p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"><IconExportHtml /></span>
          <span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Export HTML</span><span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Download your email as a ready-to-use HTML file</span></span>
        </button>
        <button type="button" onClick={() => { exportJson(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Save your work for later">
          <span className="mt-0.5 p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"><IconSave /></span>
          <span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Save template</span><span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Save your work to continue editing later</span></span>
        </button>
        <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
        <button type="button" onClick={() => { importJson(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Open a saved template">
          <span className="mt-0.5 p-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"><IconImport /></span>
          <span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Import template</span><span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Open a template you saved earlier</span></span>
        </button>
        <button type="button" onClick={() => { importHtml(); setMenuOpen(false); }} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Turn HTML into a template">
          <span className="mt-0.5 p-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"><IconHtml /></span>
          <span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Import HTML</span><span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Turn an HTML email into an editable template</span></span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Tooltip text="Save, export & import" placement="bottom">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border transition-colors ${menuOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200'}`}
            aria-expanded={menuOpen}
            aria-label="File menu"
          >
            <IconMenu />
          </button>
        </Tooltip>
        {createPortal(dropdownContent, document.body)}
      </div>
      {htmlImportLoading &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 max-w-sm mx-4 border border-slate-600">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" aria-hidden />
              <p className="text-base font-semibold text-slate-200 text-center">Converting HTML to template…</p>
            </div>
          </div>,
          document.body
        )}
      {importMessage &&
        createPortal(
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]" style={{ animation: 'fade-in 0.3s ease-out' }}>
            <div
              className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
                importMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {importMessage.text}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
