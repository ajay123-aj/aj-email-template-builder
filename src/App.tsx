import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { ResizeHandle } from './components/ResizeHandle';
import { Toolbar } from './components/Toolbar';
import { BlockPalette } from './components/BlockPalette';
import { Canvas } from './components/Canvas';
import { Preview } from './components/Preview';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AskAIModal } from './components/AskAIModal';
import { BlockWrapper } from './components/blocks/BlockWrapper';
import { useEditorStore, actions } from './store/useEditorStore';
import { createBlock } from './blocks/blockRegistry';
import { useMediaQuery } from './hooks/useMediaQuery';
import type { BlockType } from './types/template';
import type { AnyBlock } from './types/template';

const DROP_PREFIX = 'drop:';
function parseDropId(id: string): { sectionId: string; columnId: string } | null {
  if (!id.startsWith(DROP_PREFIX)) return null;
  const parts = id.slice(DROP_PREFIX.length).split(':');
  return parts.length >= 2 ? { sectionId: parts[0], columnId: parts[1] } : null;
}

function findBlockLocation(template: { sections: { id: string; columns: { id: string; blocks: { id: string }[] }[] }[] }, blockId: string): { sectionId: string; columnId: string; index: number } | null {
  for (const s of template.sections)
    for (const col of s.columns) {
      const i = col.blocks.findIndex(b => b.id === blockId);
      if (i >= 0) return { sectionId: s.id, columnId: col.id, index: i };
    }
  return null;
}

export default function App() {
  const showPreview = useEditorStore(s => s.showPreview);
  const template = useEditorStore(s => s.template);
  const activeId = useEditorStore(s => s.dragActiveId);
  // Desktop (>=1024px): Blocks & Properties visible by default in 3-panel layout. Mobile: hidden until user opens drawers.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);   // mobile only: Blocks drawer closed by default
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false); // mobile only: Properties drawer closed by default
  const [askAIOpen, setAskAIOpen] = useState(false);
  const askAIEnabled = (() => {
    const v = (import.meta.env.VITE_ASK_AI_ENABLED as string | undefined) ?? '';
    return ['true', '1', 'on'].includes(String(v).toLowerCase());
  })();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const onDragStart = (e: DragStartEvent) => {
    actions.setDragActiveId(String(e.active.id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    actions.setDragActiveId(null);
    const overId = e.over?.id;
    const overIdStr = overId != null ? String(overId) : '';
    if (!overIdStr) return;

    const drop = parseDropId(overIdStr);
    const loc = !drop ? findBlockLocation(template, overIdStr) : null;

    const data = e.active.data.current as { type?: string; block?: AnyBlock; blockType?: BlockType } | undefined;
    if (data?.type === 'palette' && data?.blockType) {
      const blockType = data.blockType;
      const newBlock = createBlock(blockType);
      if (drop) {
        actions.addBlock(drop.sectionId, drop.columnId, 0, newBlock);
      } else if (loc) {
        actions.addBlock(loc.sectionId, loc.columnId, loc.index, newBlock);
      }
      return;
    }

    if (data?.type === 'block' && data?.block) {
      const block = data.block;
      if (drop) {
        const col = template.sections.find(s => s.id === drop.sectionId)?.columns.find(c => c.id === drop.columnId);
        const index = col ? col.blocks.length : 0;
        actions.moveBlock(block.id, drop.sectionId, drop.columnId, index);
      } else if (loc) {
        actions.moveBlock(block.id, loc.sectionId, loc.columnId, loc.index);
      }
    }
  };

  let overlayBlock: AnyBlock | null = null;
  let overlaySectionId = '';
  let overlayColumnId = '';
  if (activeId && typeof activeId === 'string' && !activeId.startsWith('palette-')) {
    for (const s of template.sections)
      for (const col of s.columns) {
        const b = col.blocks.find(x => x.id === activeId);
        if (b) {
          overlayBlock = b;
          overlaySectionId = s.id;
          overlayColumnId = col.id;
          break;
        }
      }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="h-screen flex flex-col bg-slate-100 min-h-0 overflow-hidden">
        <Toolbar
          isMobile={!isDesktop}
          leftDrawerOpen={leftDrawerOpen}
          rightDrawerOpen={rightDrawerOpen}
          onToggleLeftDrawer={() => { setLeftDrawerOpen(o => !o); setRightDrawerOpen(false); }}
          onToggleRightDrawer={() => { setRightDrawerOpen(o => !o); setLeftDrawerOpen(false); }}
        />
        {isDesktop ? (
          /* Desktop: Blocks and Properties always visible by default in 3-panel layout */
          <PanelGroup direction="horizontal" className="flex-1 min-h-0">
            <Panel defaultSize={18} minSize={12} maxSize={28} order={1}>
              <div className="h-full bg-white border-r border-slate-200 overflow-hidden">
                <BlockPalette />
              </div>
            </Panel>
            <ResizeHandle />
            <Panel defaultSize={52} minSize={30} order={2}>
              <div className="h-full flex flex-col min-h-0">
                {showPreview ? <Preview /> : <Canvas />}
              </div>
            </Panel>
            <ResizeHandle />
            <Panel defaultSize={30} minSize={20} maxSize={40} order={3}>
              <div className="h-full bg-white border-l border-slate-200 overflow-hidden">
                <PropertiesPanel />
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          /* Mobile: Blocks and Properties hidden by default; open via toolbar "Blocks" / "Properties" */
          <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col">
              {showPreview ? <Preview /> : <Canvas />}
            </div>
            {/* Mobile drawer: Blocks */}
            {leftDrawerOpen && (
              <>
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setLeftDrawerOpen(false)} aria-hidden />
                <aside className="fixed top-12 left-0 bottom-0 w-[min(280px,85vw)] bg-white border-r border-slate-200 shadow-xl z-50 flex flex-col lg:hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                    <span className="text-sm font-semibold text-slate-800">Blocks</span>
                    <button type="button" onClick={() => setLeftDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Close">✕</button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <BlockPalette />
                  </div>
                </aside>
              </>
            )}
            {/* Mobile drawer: Properties */}
            {rightDrawerOpen && (
              <>
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setRightDrawerOpen(false)} aria-hidden />
                <aside className="fixed top-12 right-0 bottom-0 w-[min(320px,85vw)] bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col lg:hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                    <span className="text-sm font-semibold text-slate-800">Properties</span>
                    <button type="button" onClick={() => setRightDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Close">✕</button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <PropertiesPanel />
                  </div>
                </aside>
              </>
            )}
          </div>
        )}
        {/* Fixed Edit / Preview / Ask AI */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <div className="pointer-events-auto inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5 shadow-md">
            <button type="button" onClick={() => actions.setShowPreview(false)} className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${!showPreview ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}>Edit</button>
            <button type="button" onClick={() => actions.setShowPreview(true)} className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${showPreview ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}>Preview</button>
            {askAIEnabled && <button type="button" onClick={() => setAskAIOpen(true)} className="px-4 sm:px-6 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/80 transition-colors">Ask AI</button>}
          </div>
        </div>
        {askAIEnabled && askAIOpen && <AskAIModal onClose={() => setAskAIOpen(false)} />}
      </div>
      <DragOverlay>
        {overlayBlock ? (
          <div className="w-80 max-w-[85vw] rounded-lg border-2 border-blue-400 bg-white shadow-xl p-2 opacity-95">
            <BlockWrapper block={overlayBlock} sectionId={overlaySectionId} columnId={overlayColumnId} index={0} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
