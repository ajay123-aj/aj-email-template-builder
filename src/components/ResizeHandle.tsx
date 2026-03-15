import { PanelResizeHandle } from 'react-resizable-panels';

export function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-2 bg-slate-200 hover:bg-slate-300 data-[resize-handle-active]:bg-blue-400 transition-colors" />
  );
}
