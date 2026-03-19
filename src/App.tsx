import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
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
import { createBlock, BLOCK_LABELS } from './blocks/blockRegistry';
import { BlockIcon, IconClose, IconEdit, IconPreview, IconSparkles } from './components/icons';
import { useMediaQuery } from './hooks/useMediaQuery';
import { parseSectionDndId } from './components/Canvas';
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

  const collisionDetection = pointerWithin;

  const onDragStart = (e: DragStartEvent) => {
    actions.setDragActiveId(String(e.active.id));
    actions.setDragOver(null, null);
  };

  const onDragOver = (e: DragOverEvent) => {
    const over = e.over;
    if (!over) {
      actions.setDragOver(null, null);
      return;
    }
    const activeRect = e.active.rect.current.translated;
    const overRect = over.rect;
    if (!activeRect || !overRect) {
      actions.setDragOver(String(over.id), 'bottom');
      return;
    }
    const activeCenterY = activeRect.top + activeRect.height / 2;
    const overCenterY = overRect.top + overRect.height / 2;
    const position: 'top' | 'bottom' = activeCenterY < overCenterY ? 'top' : 'bottom';
    actions.setDragOver(String(over.id), position);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const insertPosition = useEditorStore.getState().dragOverPosition ?? 'bottom';
    actions.setDragActiveId(null);
    actions.setDragOver(null, null);
    const overId = e.over?.id;
    const overIdStr = overId != null ? String(overId) : '';
    const activeIdStr = String(e.active.id);

    const sectionId = parseSectionDndId(activeIdStr);
    if (sectionId && overIdStr) {
      const overSectionId = parseSectionDndId(overIdStr);
      if (overSectionId) {
        const sections = template.sections;
        const fromIndex = sections.findIndex(s => s.id === sectionId);
        const toIndex = sections.findIndex(s => s.id === overSectionId);
        if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
          const newIndex = insertPosition === 'bottom'
            ? (fromIndex < toIndex ? toIndex : toIndex + 1)
            : (fromIndex < toIndex ? toIndex - 1 : toIndex);
          actions.moveSection(sectionId, newIndex);
        }
        return;
      }
    }

    if (!overIdStr) return;
    const drop = parseDropId(overIdStr);
    const loc = !drop ? findBlockLocation(template, overIdStr) : null;

    const computeBlockIndex = (overIndex: number, fromIndex: number | null) => {
      if (fromIndex == null) return insertPosition === 'bottom' ? overIndex + 1 : overIndex;
      if (insertPosition === 'bottom') return fromIndex > overIndex ? overIndex + 1 : overIndex;
      return fromIndex < overIndex ? overIndex - 1 : overIndex;
    };
    const data = e.active.data.current as { type?: string; block?: AnyBlock; blockType?: BlockType } | undefined;
    if (data?.type === 'palette' && data?.blockType) {
      const blockType = data.blockType;
      const newBlock = createBlock(blockType);
      if (drop) {
        actions.addBlock(drop.sectionId, drop.columnId, 0, newBlock);
      } else if (loc) {
        const idx = insertPosition === 'bottom' ? loc.index + 1 : loc.index;
        actions.addBlock(loc.sectionId, loc.columnId, idx, newBlock);
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
        const fromLoc = findBlockLocation(template, block.id);
        const fromIndex = fromLoc && fromLoc.sectionId === loc.sectionId && fromLoc.columnId === loc.columnId ? fromLoc.index : null;
        const idx = computeBlockIndex(loc.index, fromIndex);
        actions.moveBlock(block.id, loc.sectionId, loc.columnId, idx);
      }
    }
  };

  let overlayBlock: AnyBlock | null = null;
  let overlaySectionId = '';
  let overlayColumnId = '';
  let overlayPaletteType: BlockType | null = null;
  let overlaySection: typeof template.sections[0] | null = null;

  if (activeId && typeof activeId === 'string') {
    if (activeId.startsWith('palette-')) {
      overlayPaletteType = activeId.replace('palette-', '') as BlockType;
    } else if (activeId.startsWith('section:')) {
      const sid = parseSectionDndId(activeId);
      overlaySection = template.sections.find(s => s.id === sid) ?? null;
    } else {
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
  }

  return (
    <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
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
              <div className="h-full bg-white/95 backdrop-blur-sm border-r border-slate-200/80 overflow-hidden">
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
            <Panel defaultSize={30} minSize={20} maxSize={40} order={3} className="min-h-0">
              <div className="h-full flex flex-col min-h-0 bg-white/95 backdrop-blur-sm border-l border-slate-200/80">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                  <PropertiesPanel />
                </div>
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
                <aside className="fixed top-14 left-0 bottom-0 w-[min(280px,85vw)] bg-white/98 backdrop-blur-md border-r border-slate-200/80 shadow-xl shadow-slate-900/10 z-50 flex flex-col lg:hidden">
                  <div className="flex-shrink-0 flex justify-end px-3 py-2 border-b border-slate-200 bg-white">
                    <button type="button" onClick={() => setLeftDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" aria-label="Close"><IconClose /></button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <BlockPalette />
                  </div>
                </aside>
              </>
            )}
            {/* Mobile drawer: Properties */}
            {rightDrawerOpen && (
              <>
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setRightDrawerOpen(false)} aria-hidden />
                <aside className="fixed top-14 right-0 bottom-0 w-[min(320px,85vw)] bg-white/98 backdrop-blur-md border-l border-slate-200/80 shadow-xl shadow-slate-900/10 z-50 flex flex-col lg:hidden">
                  <div className="flex-shrink-0 flex justify-end px-3 py-2 border-b border-slate-200 bg-white">
                    <button type="button" onClick={() => setRightDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" aria-label="Close"><IconClose /></button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-auto">
                    <PropertiesPanel />
                  </div>
                </aside>
              </>
            )}
          </div>
        )}
        {/* Edit, Preview, Ask AI - fixed at bottom */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4">
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/80 bg-slate-100/80 backdrop-blur-xl p-2 ring-1 ring-slate-200/20 shadow-[0_4px_24px_rgba(15,23,42,0.12),0_0_0_1px_rgba(0,0,0,0.04)]">
            <button type="button" onClick={() => actions.setShowPreview(false)} className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${!showPreview ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'}`} title="Edit"><IconEdit /></button>
            <button type="button" onClick={() => actions.setShowPreview(true)} className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${showPreview ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'}`} title="Preview"><IconPreview /></button>
            {askAIEnabled && (
              <>
                <div className="w-px h-6 bg-slate-300/50 mx-0.5" />
                <button type="button" onClick={() => setAskAIOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-xl text-violet-600 hover:bg-violet-100/80 hover:text-violet-700 cursor-pointer transition-all duration-200" title="Ask AI"><IconSparkles /></button>
              </>
            )}
          </div>
        </div>
        {askAIEnabled && askAIOpen && <AskAIModal onClose={() => setAskAIOpen(false)} />}
      </div>
      <DragOverlay dropAnimation={null}>
        {overlayBlock ? (
          <div className="w-80 max-w-[85vw] rounded-lg border-2 border-blue-400 bg-white shadow-xl p-2 opacity-95 cursor-grabbing">
            <BlockWrapper block={overlayBlock} sectionId={overlaySectionId} columnId={overlayColumnId} index={0} isOverlay />
          </div>
        ) : overlayPaletteType ? (
          <div className="w-80 max-w-[85vw] rounded-lg border-2 border-blue-400 bg-white shadow-xl p-3 opacity-95 cursor-grabbing flex items-center gap-2">
            <span className="w-10 h-10 flex items-center justify-center rounded bg-slate-100 text-slate-600"><BlockIcon type={overlayPaletteType} /></span>
            <span className="font-medium text-slate-700">{BLOCK_LABELS[overlayPaletteType] ?? overlayPaletteType}</span>
          </div>
        ) : overlaySection ? (
          <div className="w-fit rounded-lg border-2 border-blue-400 bg-white shadow-xl p-3 opacity-95 cursor-grabbing">
            <span className="text-sm font-medium text-slate-700">Section (row)</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
