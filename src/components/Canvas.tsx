import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { ConfirmTooltip } from './ConfirmTooltip';
import { CSS } from '@dnd-kit/utilities';
import { BlockWrapper } from './blocks/BlockWrapper';
import { useEditorStore, actions } from '../store/useEditorStore';
import { getBackgroundStyle } from '../utils/backgroundStyle';
import { paddingBlockToStyle } from '../utils/paddingUtils';
import type { EmailSection, EmailColumn, AnyBlock } from '../types/template';

const dropId = (sId: string, cId: string) => `drop:${sId}:${cId}`;
const SECTION_PREFIX = 'section:';
export const sectionDndId = (id: string) => SECTION_PREFIX + id;
export const parseSectionDndId = (id: string) => id.startsWith(SECTION_PREFIX) ? id.slice(SECTION_PREFIX.length) : null;

const InsertionLine = () => (
  <div className="h-0.5 -my-px bg-blue-500 rounded-full shadow-sm z-[60] flex-shrink-0" aria-hidden />
);

function BlockItem({ block, sectionId, columnId, index, sectionSelected }: { block: AnyBlock; sectionId: string; columnId: string; index: number; sectionSelected: boolean }) {
  const selectedBlockId = useEditorStore(s => s.selectedBlockId);
  const dragOverId = useEditorStore(s => s.dragOverId);
  const dragOverPosition = useEditorStore(s => s.dragOverPosition);
  const isSelected = selectedBlockId === block.id;
  const showLineTop = dragOverId === block.id && dragOverPosition === 'top';
  const showLineBottom = dragOverId === block.id && dragOverPosition === 'bottom';
  return (
    <div className={`mb-2 ${isSelected ? 'relative z-10' : ''}`} data-block-interact>
      {showLineTop && <InsertionLine />}
      <BlockWrapper block={block} sectionId={sectionId} columnId={columnId} index={index} sectionSelected={sectionSelected} />
      {showLineBottom && <InsertionLine />}
    </div>
  );
}

function ColumnZone({ sectionId, columnId, column, section, children }: { sectionId: string; columnId: string; column: EmailColumn; section: EmailSection; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId(sectionId, columnId) });
  const dragOverId = useEditorStore(s => s.dragOverId);
  const dragOverPosition = useEditorStore(s => s.dragOverPosition);
  const dropZoneId = dropId(sectionId, columnId);
  const showLineTop = dragOverId === dropZoneId && dragOverPosition === 'top';
  const showLineBottom = dragOverId === dropZoneId && dragOverPosition === 'bottom';
  const isRow = section.layout !== 'column';
  const n = section.columns.length;
  const useAuto = isRow && n > 1 && (!column.width || column.width === 'auto' || column.width === '100%');
  const style: React.CSSProperties = section.layout === 'column'
    ? { width: '100%' }
    : useAuto
      ? { flex: '1 1 0', minWidth: 0 }
      : { flexBasis: column.width, width: column.width };
  return (
    <div ref={setNodeRef} style={style} className={`min-h-[48px] flex flex-col min-w-0 ${isOver ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/30 rounded' : ''}`}>
      {showLineTop && <InsertionLine />}
      {children}
      {showLineBottom && <InsertionLine />}
    </div>
  );
}

function SortableSection({ section }: { section: EmailSection }) {
  const selected = useEditorStore(s => s.selectedSectionId) === section.id;
  const selectedBlockId = useEditorStore(s => s.selectedBlockId);
  const dragOverId = useEditorStore(s => s.dragOverId);
  const dragOverPosition = useEditorStore(s => s.dragOverPosition);
  const sectionHasSelectedBlock = selectedBlockId != null && section.columns.some(col => col.blocks.some(b => b.id === selectedBlockId));
  const sectionDnd = sectionDndId(section.id);
  const showLineTop = dragOverId === sectionDnd && dragOverPosition === 'top';
  const showLineBottom = dragOverId === sectionDnd && dragOverPosition === 'bottom';
  const layout = section.layout ?? 'row';
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionDndId(section.id),
    data: { type: 'section', section },
  });
  const style: React.CSSProperties = {
    padding: (section.padding || '16px').trim() || '16px',
    margin: (section.margin || '0').trim() || '0',
    background: getBackgroundStyle(section),
    ...(transform ? { transform: CSS.Transform.toString(transform), transition } : {}),
  };
  const showMenu = selected || isDragging;
  return (
    <>
      {showLineTop && <InsertionLine />}
    <div
      ref={setNodeRef}
      onClick={e => {
        if (!(e.target as HTMLElement).closest('[data-block-interact]') && !(e.target as HTMLElement).closest('[data-section-menu]')) {
          e.stopPropagation();
          actions.selectSection(section.id);
          actions.selectBlock(null);
        }
      }}
      className={`relative transition-all group ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-2 ring-transparent ring-offset-0 hover:ring-slate-200'} ${isDragging ? 'opacity-80 shadow-lg z-50' : ''}`}
      style={style}
    >
      <div
        data-section-menu
        className={`absolute top-1 right-1 flex items-center gap-0.5 z-20 ${showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button type="button" className="px-1.5 py-0.5 text-xs rounded bg-slate-700/90 text-white shadow hover:bg-slate-600 cursor-grab active:cursor-grabbing touch-none" {...listeners} {...attributes} title="Drag to reorder">⋮⋮</button>
        <ConfirmTooltip message="Remove this section?" onConfirm={() => actions.removeSection(section.id)} placement="bottom">
          <button type="button" className="px-1.5 py-0.5 text-xs rounded bg-red-600/90 text-white hover:bg-red-500" title="Remove section">×</button>
        </ConfirmTooltip>
      </div>
      <div className="flex gap-2 min-w-0" style={{ flexDirection: layout === 'column' ? 'column' : 'row' }}>
        {section.columns.map(col => (
          <ColumnZone key={col.id} sectionId={section.id} columnId={col.id} column={col} section={section}>
            <SortableContext items={col.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {col.blocks.map((block, idx) => (
                <BlockItem key={block.id} block={block} sectionId={section.id} columnId={col.id} index={idx} sectionSelected={selected && !sectionHasSelectedBlock} />
              ))}
              {col.blocks.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-6 border border-dashed border-slate-200 rounded">Drop blocks here</div>
              )}
            </SortableContext>
          </ColumnZone>
        ))}
      </div>
    </div>
      {showLineBottom && <InsertionLine />}
    </>
  );
}

const COLUMN_OPTIONS = [2, 3, 4, 5, 6] as const;

export function Canvas() {
  const template = useEditorStore(s => s.template);
  const canvasWidth = 600;
  const bg = getBackgroundStyle(template);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [dropdownAbove, setDropdownAbove] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!columnsOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 220;
    setDropdownAbove(spaceBelow < dropdownHeight && spaceAbove >= spaceBelow);
  }, [columnsOpen]);

  useEffect(() => {
    if (!columnsOpen) return;
    const close = (e: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) setColumnsOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [columnsOpen]);
  return (
    <div className="flex-1 min-h-0 overflow-auto bg-slate-200 p-4 sm:p-6 !pb-[100px]" onClick={() => { actions.selectBlock(null); actions.selectSection(null); }}>
      <div className="flex justify-center items-start min-h-full">
        <div className="min-h-[400px] w-full max-w-full flex-shrink-0 bg-white shadow-lg" style={{ width: canvasWidth, maxWidth: '100%', background: bg }}>
          <div style={paddingBlockToStyle(template.padding, '24px')}>
            {template.sections.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-slate-600 font-medium mb-1">Your email template</p>
                <p className="text-slate-500 text-sm mb-4">Add a row below. Then drag blocks from the left into the row. Click a section or block to change it in the right panel.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button type="button" className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm transition-all duration-200" onClick={() => actions.addSection(1)}>+ Add row</button>
                  <div className="relative" ref={columnsRef}>
                    <button ref={buttonRef} type="button" className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm transition-all duration-200" onClick={(e) => { e.stopPropagation(); setColumnsOpen(o => !o); }}>+ Add columns ▾</button>
                    {columnsOpen && (
                      <div className={`absolute left-0 py-1 min-w-[120px] bg-white rounded-xl border border-slate-200 shadow-lg z-50 ${dropdownAbove ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                        {COLUMN_OPTIONS.map(n => (
                          <button key={n} type="button" className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => { actions.addSection(n); setColumnsOpen(false); }}>{n} columns</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <SortableContext items={template.sections.map(s => sectionDndId(s.id))} strategy={verticalListSortingStrategy}>
                {template.sections.map(s => <SortableSection key={s.id} section={s} />)}
              </SortableContext>
            )}
            <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-slate-200/80">
              <button type="button" className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm transition-all duration-200" onClick={() => actions.addSection(1)}>+ Add row</button>
              <div className="relative" ref={columnsRef}>
                <button ref={buttonRef} type="button" className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm transition-all duration-200" onClick={(e) => { e.stopPropagation(); setColumnsOpen(o => !o); }}>+ Add columns ▾</button>
                {columnsOpen && (
                  <div className={`absolute left-0 py-1 min-w-[120px] bg-white rounded-xl border border-slate-200 shadow-lg z-50 ${dropdownAbove ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    {COLUMN_OPTIONS.map(n => (
                      <button key={n} type="button" className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => { actions.addSection(n); setColumnsOpen(false); }}>{n} columns</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
