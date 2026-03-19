import { PanelResizeHandle } from 'react-resizable-panels';

export function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-2 bg-slate-200/80 hover:bg-slate-300 data-[resize-handle-active]:bg-slate-400 transition-all duration-200" />
  );
}
