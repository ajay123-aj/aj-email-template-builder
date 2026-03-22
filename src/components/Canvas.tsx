import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';

const EMPTY_CANVAS_DROP_ID = 'empty-canvas';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { ConfirmTooltip } from './ConfirmTooltip';
import { CSS } from '@dnd-kit/utilities';
import { BlockWrapper } from './blocks/BlockWrapper';
import { IconAddRow, IconColumns, IconLayoutRow } from './icons';
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
    <div ref={setNodeRef} style={style} className={`min-h-[48px] flex flex-col min-w-0 ${isOver ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/30' : ''}`}>
      {showLineTop && <InsertionLine />}
      {children}
      {showLineBottom && <InsertionLine />}
    </div>
  );
}

function SortableSection({ section, index }: { section: EmailSection; index: number }) {
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
  const innerStyle: React.CSSProperties = {
    padding: (section.padding || '16px').trim() || '16px',
    margin: (section.margin || '0').trim() || '0',
    background: getBackgroundStyle(section),
    ...(transform ? { transform: CSS.Transform.toString(transform), transition } : {}),
  };
  const showToolbar = selected || isDragging;
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
      className={`relative transition-all duration-200 group overflow-hidden ${selected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md' : 'ring-1 ring-slate-200/80 hover:ring-slate-300 hover:shadow-sm'} ${isDragging ? 'opacity-90 shadow-xl z-50 scale-[1.02]' : ''}`}
      style={innerStyle}
    >
      {/* Section header toolbar - visible on hover or when selected */}
      <div
        data-section-menu
        className={`absolute top-0 left-0 right-0 flex items-center justify-between gap-2 px-3 py-1.5 z-20 transition-opacity duration-200 ${
          showToolbar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-600/90 px-2 py-0.5 rounded-md bg-white/80 shadow-sm">Section {index + 1}</span>
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${layout === 'row' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            onClick={e => { e.stopPropagation(); actions.setSectionLayout(section.id, 'row'); }}
            title="Row layout (side by side)"
          >
            <IconLayoutRow />
          </button>
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${layout === 'column' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            onClick={e => { e.stopPropagation(); actions.setSectionLayout(section.id, 'column'); }}
            title="Column layout"
          >
            <IconColumns />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="p-1.5 rounded-lg bg-white/90 shadow-sm text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-manipulation" {...listeners} {...attributes} title="Drag to reorder">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" /></svg>
          </button>
          <ConfirmTooltip message="Remove this section?" onConfirm={() => actions.removeSection(section.id)} placement="bottom">
            <button type="button" className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 shadow-sm" title="Remove section">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </ConfirmTooltip>
        </div>
      </div>
      <div className="flex gap-2 min-w-0" style={{ flexDirection: layout === 'column' ? 'column' : 'row' }}>
        {section.columns.map(col => (
          <ColumnZone key={col.id} sectionId={section.id} columnId={col.id} column={col} section={section}>
            <SortableContext items={col.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {col.blocks.map((block, idx) => (
                <BlockItem key={block.id} block={block} sectionId={section.id} columnId={col.id} index={idx} sectionSelected={selected && !sectionHasSelectedBlock} />
              ))}
              {col.blocks.length === 0 && (
                <div className="min-h-[72px] flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <svg className="w-8 h-8 mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  <span className="font-medium">Drop blocks here</span>
                  <span className="text-xs mt-0.5">or drag from the left</span>
                </div>
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

const SECTION_OPTIONS: { n: number; label: string; icon: 'row' | 'columns' }[] = [
  { n: 1, label: 'Add row', icon: 'row' },
  { n: 2, label: '2 columns', icon: 'columns' },
  { n: 3, label: '3 columns', icon: 'columns' },
  { n: 4, label: '4 columns', icon: 'columns' },
  { n: 5, label: '5 columns', icon: 'columns' },
  { n: 6, label: '6 columns', icon: 'columns' },
];

function AddSectionDropdown({ onAdd, onClose }: { onAdd: (n: number) => void; onClose: () => void }) {
  return (
    <div className="absolute left-0 bottom-full mb-1 py-1.5 min-w-[160px] bg-white rounded-xl border border-slate-200 shadow-xl z-50">
      {SECTION_OPTIONS.map(({ n, label, icon }) => (
        <button
          key={n}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={() => { onAdd(n); onClose(); }}
          title={n === 1 ? 'Add single row' : `Add row with ${n} columns`}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {icon === 'row' ? <IconAddRow /> : <IconColumns />}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function AddSectionDropdownBelow({ onAdd, onClose }: { onAdd: (n: number) => void; onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-1 py-1.5 min-w-[160px] bg-white rounded-xl border border-slate-200 shadow-xl z-50">
      {SECTION_OPTIONS.map(({ n, label, icon }) => (
        <button
          key={n}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={() => { onAdd(n); onClose(); }}
          title={n === 1 ? 'Add single row' : `Add row with ${n} columns`}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {icon === 'row' ? <IconAddRow /> : <IconColumns />}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyCanvasDropZone({
  menuRef,
  buttonRef,
  addMenuOpen,
  setAddMenuOpen,
  dropdownAbove,
}: {
  menuRef: React.RefObject<HTMLDivElement | null>;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  addMenuOpen: boolean;
  setAddMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownAbove: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: EMPTY_CANVAS_DROP_ID });
  return (
    <div
      ref={setNodeRef}
      className={`text-center py-12 px-6 min-h-[160px] border-2 border-dashed transition-all duration-200 ${
        isOver ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-200' : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
      }`}
    >
      <p className="text-slate-700 font-semibold mb-1">Your email template</p>
      <p className="text-slate-500 text-sm mb-4">Add a section below, or drag blocks here to start building.</p>
      <div className="relative inline-block" ref={menuRef as React.Ref<HTMLDivElement>}>
        <button
          ref={buttonRef as React.Ref<HTMLButtonElement>}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm transition-all duration-200"
          onClick={(e) => { e.stopPropagation(); setAddMenuOpen(o => !o); }}
          title="Add row or columns"
        >
          <IconAddRow />
          <span>Add section</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {addMenuOpen && (dropdownAbove ? <AddSectionDropdown onAdd={actions.addSection} onClose={() => setAddMenuOpen(false)} /> : <AddSectionDropdownBelow onAdd={actions.addSection} onClose={() => setAddMenuOpen(false)} />)}
      </div>
    </div>
  );
}

export function Canvas() {
  const template = useEditorStore(s => s.template);
  const canvasWidth = 600;
  const bg = getBackgroundStyle(template);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [dropdownAbove, setDropdownAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!addMenuOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 280;
    setDropdownAbove(spaceBelow < dropdownHeight && spaceAbove >= spaceBelow);
  }, [addMenuOpen]);

  useEffect(() => {
    if (!addMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [addMenuOpen]);
  return (
    <div className="flex-1 min-h-0 overflow-auto bg-slate-200 px-0 py-3 sm:p-6 pb-20 lg:pb-32" onClick={() => { actions.selectBlock(null); actions.selectSection(null); }}>
      <div className="flex justify-center items-start min-h-full w-full">
        <div className="min-h-[400px] w-full max-w-full flex-shrink-0 bg-white shadow-xl overflow-hidden" style={{ width: canvasWidth, maxWidth: '100%', background: bg }}>
          <div style={paddingBlockToStyle(template.padding, '24px')}>
            {template.sections.length === 0 ? (
              <EmptyCanvasDropZone menuRef={menuRef} buttonRef={buttonRef} addMenuOpen={addMenuOpen} setAddMenuOpen={setAddMenuOpen} dropdownAbove={dropdownAbove} />
            ) : (
              <SortableContext items={template.sections.map(s => sectionDndId(s.id))} strategy={verticalListSortingStrategy}>
                {template.sections.map((s, i) => (
                  <SortableSection key={s.id} section={s} index={i} />
                ))}
              </SortableContext>
            )}
            <div className="flex pt-4 mt-4 border-t border-slate-200">
              <div className="relative" ref={menuRef}>
                <button
                  ref={buttonRef}
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); setAddMenuOpen(o => !o); }}
                  title="Add row or columns"
                >
                  <IconAddRow />
                  <span>Add section</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {addMenuOpen && (dropdownAbove ? <AddSectionDropdown onAdd={actions.addSection} onClose={() => setAddMenuOpen(false)} /> : <AddSectionDropdownBelow onAdd={actions.addSection} onClose={() => setAddMenuOpen(false)} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
