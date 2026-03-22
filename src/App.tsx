import { useState } from 'react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
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
import { BlockIcon, IconClose } from './components/icons';
import { EditorFooter } from './components/EditorFooter';
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
  const [paletteDragging, setPaletteDragging] = useState(false); // mobile: keep drawer mounted during palette drag
  const [askAIOpen, setAskAIOpen] = useState(false);
  const askAIEnabled = (() => {
    const v = (import.meta.env.VITE_ASK_AI_ENABLED as string | undefined) ?? '';
    if (v === '' && import.meta.env.PROD) return true; // show in production by default
    return ['true', '1', 'on'].includes(String(v).toLowerCase());
  })();

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } })
  );

  const collisionDetection = closestCenter;

  const onDragStart = (e: DragStartEvent) => {
    actions.setDragActiveId(String(e.active.id));
    actions.setDragOver(null, null);
    // Mobile: slide drawer off-screen during palette drag (keep mounted so touch chain isn't broken)
    if (!isDesktop && String(e.active.id).startsWith('palette-')) {
      setPaletteDragging(true);
    }
  };

  const onDragCancel = () => {
    actions.setDragActiveId(null);
    actions.setDragOver(null, null);
    setPaletteDragging(false);
    if (!isDesktop) setLeftDrawerOpen(false);
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
    const state = useEditorStore.getState();
    const insertPosition = state.dragOverPosition ?? 'bottom';
    const overIdFromStore = state.dragOverId;
    actions.setDragActiveId(null);
    actions.setDragOver(null, null);
    const overId = e.over?.id ?? (overIdFromStore || null);
    const overIdStr = overId != null ? String(overId) : '';
    const activeIdStr = String(e.active.id);
    const currentTemplate = useEditorStore.getState().template;
    const data = e.active.data.current as { type?: string; block?: AnyBlock; blockType?: BlockType } | undefined;

    const sectionId = parseSectionDndId(activeIdStr);
    if (sectionId && overIdStr) {
      let targetSectionId: string | null = parseSectionDndId(overIdStr);
      if (!targetSectionId) {
        const drop = parseDropId(overIdStr);
        if (drop) targetSectionId = drop.sectionId;
        else {
          const blockLoc = findBlockLocation(currentTemplate, overIdStr);
          if (blockLoc) targetSectionId = blockLoc.sectionId;
        }
      }
      if (targetSectionId) {
        const sections = currentTemplate.sections;
        const fromIndex = sections.findIndex(s => s.id === sectionId);
        const toIndex = sections.findIndex(s => s.id === targetSectionId);
        if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
          const newIndex = insertPosition === 'bottom'
            ? (fromIndex < toIndex ? toIndex : toIndex + 1)
            : (fromIndex < toIndex ? toIndex - 1 : toIndex);
          actions.moveSection(sectionId, newIndex);
        }
        return;
      }
    }

    if (overIdStr === 'empty-canvas' && data?.type === 'palette' && data?.blockType) {
      const newBlock = createBlock(data.blockType);
      actions.addSection(1);
      const { template: t } = useEditorStore.getState();
      const sec = t.sections[t.sections.length - 1];
      if (sec?.columns[0]) actions.addBlock(sec.id, sec.columns[0].id, 0, newBlock);
      setPaletteDragging(false);
      if (!isDesktop) setLeftDrawerOpen(true);
      return;
    }

    if (!overIdStr) {
      if (data?.type === 'palette' && data?.blockType && currentTemplate.sections.length > 0) {
        const sec = currentTemplate.sections[0];
        const col = sec?.columns[0];
        if (sec && col) {
          const newBlock = createBlock(data.blockType);
          actions.addBlock(sec.id, col.id, 0, newBlock);
          setPaletteDragging(false);
          if (!isDesktop) setLeftDrawerOpen(true);
        }
      } else {
        setPaletteDragging(false);
      }
      return;
    }
    const drop = parseDropId(overIdStr);
    const loc = !drop ? findBlockLocation(currentTemplate, overIdStr) : null;

    const computeBlockIndex = (overIndex: number, fromIndex: number | null) => {
      if (fromIndex == null) return insertPosition === 'bottom' ? overIndex + 1 : overIndex;
      if (insertPosition === 'bottom') return fromIndex > overIndex ? overIndex + 1 : overIndex;
      return fromIndex < overIndex ? overIndex - 1 : overIndex;
    };
    if (data?.type === 'palette' && data?.blockType) {
      const blockType = data.blockType;
      const newBlock = createBlock(blockType);
      if (drop) {
        actions.addBlock(drop.sectionId, drop.columnId, 0, newBlock);
      } else if (loc) {
        const idx = insertPosition === 'bottom' ? loc.index + 1 : loc.index;
        actions.addBlock(loc.sectionId, loc.columnId, idx, newBlock);
      } else {
        const overSectionId = parseSectionDndId(overIdStr);
        if (overSectionId) {
          const sec = currentTemplate.sections.find(s => s.id === overSectionId);
          if (sec?.columns.length) {
            const col = sec.columns[0];
            actions.addBlock(sec.id, col.id, 0, newBlock);
          }
        }
      }
      setPaletteDragging(false);
      if (!isDesktop) setLeftDrawerOpen(true);
      return;
    }

    if (data?.type === 'block' && data?.block) {
      const block = data.block;
      if (drop) {
        const col = currentTemplate.sections.find(s => s.id === drop.sectionId)?.columns.find(c => c.id === drop.columnId);
        const index = col ? col.blocks.length : 0;
        actions.moveBlock(block.id, drop.sectionId, drop.columnId, index);
      } else if (loc) {
        const fromLoc = findBlockLocation(currentTemplate, block.id);
        const fromIndex = fromLoc && fromLoc.sectionId === loc.sectionId && fromLoc.columnId === loc.columnId ? fromLoc.index : null;
        const idx = computeBlockIndex(loc.index, fromIndex);
        actions.moveBlock(block.id, loc.sectionId, loc.columnId, idx);
      } else {
        const overSectionId = parseSectionDndId(overIdStr);
        if (overSectionId) {
          const sec = currentTemplate.sections.find(s => s.id === overSectionId);
          const col = sec?.columns[0];
          if (sec && col) {
            const index = col.blocks.length;
            actions.moveBlock(block.id, sec.id, col.id, index);
          }
        }
      }
    }
    setPaletteDragging(false);
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
    <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
      <div className="h-screen w-full flex flex-col bg-slate-100 dark:bg-slate-900 min-h-0 overflow-hidden overflow-x-hidden">
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
              <div className="h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-r border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
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
            <Panel defaultSize={18} minSize={12} maxSize={28} order={3} className="min-h-0">
              <div className="h-full flex flex-col min-h-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-l border-slate-200/80 dark:border-slate-700/80">
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
            {/* Mobile drawer: Blocks - stays mounted during palette drag to preserve touch chain */}
            {leftDrawerOpen && (
              <>
                <div
                  className={`fixed inset-0 z-40 lg:hidden transition-opacity ${paletteDragging ? 'bg-transparent pointer-events-none' : 'bg-black/40'}`}
                  onClick={() => !paletteDragging && setLeftDrawerOpen(false)}
                  aria-hidden
                />
                <aside
                  className={`fixed top-12 sm:top-14 left-0 bottom-0 w-[min(280px,85vw)] bg-white/98 dark:bg-slate-800/98 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-900/10 dark:shadow-black/20 z-50 flex flex-col lg:hidden transition-transform duration-200 ${paletteDragging ? '-translate-x-full' : 'translate-x-0'}`}
                >
                  <div className="flex-shrink-0 flex justify-end px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <button type="button" onClick={() => setLeftDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" aria-label="Close"><IconClose /></button>
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
                <aside className="fixed top-12 sm:top-14 right-0 bottom-0 w-[min(320px,85vw)] bg-white/98 dark:bg-slate-800/98 backdrop-blur-md border-l border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-900/10 dark:shadow-black/20 z-50 flex flex-col lg:hidden">
                  <div className="flex-shrink-0 flex justify-end px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <button type="button" onClick={() => setRightDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" aria-label="Close"><IconClose /></button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-auto">
                    <PropertiesPanel />
                  </div>
                </aside>
              </>
            )}
          </div>
        )}
        <EditorFooter
          leftDrawerOpen={leftDrawerOpen}
          rightDrawerOpen={rightDrawerOpen}
          onToggleLeftDrawer={() => { setLeftDrawerOpen((o) => !o); setRightDrawerOpen(false); }}
          onToggleRightDrawer={() => { setRightDrawerOpen((o) => !o); setLeftDrawerOpen(false); }}
          isDesktop={isDesktop}
          showPreview={showPreview}
          askAIEnabled={askAIEnabled}
          onAskAIOpen={() => setAskAIOpen(true)}
        />
        {askAIEnabled && askAIOpen && <AskAIModal onClose={() => setAskAIOpen(false)} />}
      </div>
      <DragOverlay dropAnimation={null}>
        {overlayBlock ? (
          <div className="w-fit max-w-[85vw] rounded-lg border-2 border-blue-500 bg-white dark:bg-slate-800 shadow-xl p-2 opacity-95 cursor-grabbing touch-manipulation">
            <BlockWrapper block={overlayBlock} sectionId={overlaySectionId} columnId={overlayColumnId} index={0} isOverlay />
          </div>
        ) : overlayPaletteType ? (
          <div className="w-fit max-w-[85vw] rounded-lg border-2 border-blue-500 bg-white dark:bg-slate-800 shadow-xl p-3 opacity-95 cursor-grabbing flex items-center gap-2 touch-manipulation shrink-0">
            <span className="w-10 h-10 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0"><BlockIcon type={overlayPaletteType} /></span>
            <span className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{BLOCK_LABELS[overlayPaletteType] ?? overlayPaletteType}</span>
          </div>
        ) : overlaySection ? (
          <div className="w-fit rounded-lg border-2 border-blue-500 bg-white dark:bg-slate-800 shadow-xl p-3 opacity-95 cursor-grabbing touch-manipulation">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Section (row)</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
