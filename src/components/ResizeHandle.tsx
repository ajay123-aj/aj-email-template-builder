import { PanelResizeHandle } from 'react-resizable-panels';

export function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 data-[resize-handle-active]:bg-blue-600 transition-all duration-200" />
  );
}
