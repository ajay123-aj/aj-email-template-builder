import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';

const EMPTY_CANVAS_DROP_ID = 'empty-canvas';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockWrapper } from './blocks/BlockWrapper';
import { IconAddRow, IconColumns } from './icons';
import { useEditorStore, actions } from '../store/useEditorStore';
import { getBackgroundStyle } from '../utils/backgroundStyle';
import { paddingBlockToStyle } from '../utils/paddingUtils';
import type { EmailSection, EmailColumn, AnyBlock, SectionConfig } from '../types/template';

const dropId = (sId: string, cId: string) => `drop:${sId}:${cId}`;

/** Split column blocks into groups by section markers. Each group has a section block (or null) and the blocks to render. */
function splitIntoSectionGroups(blocks: AnyBlock[]): { sectionBlock: AnyBlock | null; blocksInGroup: AnyBlock[] }[] {
  const out: { sectionBlock: AnyBlock | null; blocksInGroup: AnyBlock[] }[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === 'section') {
      const sectionBlock = blocks[i];
      const blocksInGroup: AnyBlock[] = [sectionBlock];
      i++;
      while (i < blocks.length && blocks[i].type !== 'section') {
        blocksInGroup.push(blocks[i]);
        i++;
      }
      out.push({ sectionBlock, blocksInGroup });
    } else {
      const blocksInGroup: AnyBlock[] = [];
      while (i < blocks.length && blocks[i].type !== 'section') {
        blocksInGroup.push(blocks[i]);
        i++;
      }
      if (blocksInGroup.length) out.push({ sectionBlock: null, blocksInGroup });
    }
  }
  return out;
}
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

function ColumnZone({ sectionId, columnId, column, section, columnIndex, children }: { sectionId: string; columnId: string; column: EmailColumn; section: EmailSection; columnIndex: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId(sectionId, columnId) });
  const dragOverId = useEditorStore(s => s.dragOverId);
  const dragOverPosition = useEditorStore(s => s.dragOverPosition);
  const dropZoneId = dropId(sectionId, columnId);
  const showLineTop = dragOverId === dropZoneId && dragOverPosition === 'top';
  const showLineBottom = dragOverId === dropZoneId && dragOverPosition === 'bottom';
  const isRow = section.layout !== 'column';
  const n = section.columns.length;
  const useAuto = isRow && n > 1 && (!column.width || column.width === 'auto' || column.width === '100%');
  const separator = section.columnSeparator ?? 'none';
  const sepColor = section.columnSeparatorColor ?? '#e5e7eb';
  const showSeparator = isRow && n > 1 && columnIndex > 0 && separator !== 'none';
  const style: React.CSSProperties = {
    ...(section.layout === 'column'
      ? { width: '100%' }
      : useAuto
        ? { flex: '1 1 0', minWidth: 0 }
        : { flexBasis: column.width, width: column.width }),
    ...(showSeparator && { borderLeft: `${separator === 'line' ? '1px' : '2px'} solid ${sepColor}` }),
  };
  return (
    <div ref={setNodeRef} style={style} className={`min-h-[48px] flex flex-col min-w-0 ${isOver ? 'ring-2 ring-inset ring-blue-400 dark:ring-blue-500 bg-blue-50/30 dark:bg-blue-900/30' : ''}`}>
      {showLineTop && <InsertionLine />}
      {children}
      {showLineBottom && <InsertionLine />}
    </div>
  );
}

function SortableSection({ section, index: _index }: { section: EmailSection; index: number }) {
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
      className={`relative transition-all duration-200 group overflow-hidden ${selected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md' : 'ring-1 ring-slate-200/80 dark:ring-slate-500/80 hover:ring-slate-300 dark:hover:ring-slate-400 hover:shadow-sm'} ${isDragging ? 'opacity-90 shadow-xl z-50 scale-[1.02]' : ''}`}
      style={innerStyle}
    >
      {/* Section drag handle - only when section selected and no block selected */}
      {selected && !sectionHasSelectedBlock && (
        <div data-section-menu className="absolute top-1 right-1 z-30">
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 rounded-md bg-white/95 dark:bg-slate-700/95 shadow-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-grab active:cursor-grabbing touch-manipulation"
            {...listeners}
            {...attributes}
            title="Drag to reorder"
            aria-label="Drag to reorder section"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" /></svg>
          </button>
        </div>
      )}
      <div className="flex min-w-0" style={{ flexDirection: layout === 'column' ? 'column' : 'row', gap: section.columnGap ?? '8px' }}>
        {section.columns.map((col, idx) => (
          <ColumnZone key={col.id} sectionId={section.id} columnId={col.id} column={col} section={section} columnIndex={idx}>
            <SortableContext items={col.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {splitIntoSectionGroups(col.blocks).map(g => {
                const sectionStyle: React.CSSProperties | undefined = g.sectionBlock
                  ? (() => {
                      const sc = g.sectionBlock.config as SectionConfig;
                      return {
                        background: getBackgroundStyle(sc),
                        ...paddingBlockToStyle(sc.padding, '16px'),
                        margin: (sc.margin ?? '').trim() || '0',
                      };
                    })()
                  : undefined;
                const inner = g.blocksInGroup.map(block => {
                  const idx = col.blocks.findIndex(b => b.id === block.id);
                  return (
                    <BlockItem key={block.id} block={block} sectionId={section.id} columnId={col.id} index={idx} sectionSelected={selected && !sectionHasSelectedBlock} />
                  );
                });
                return g.sectionBlock && sectionStyle ? (
                  <div key={g.sectionBlock.id} className="rounded mb-3" style={sectionStyle}>
                    {inner}
                  </div>
                ) : (
                  <React.Fragment key={g.blocksInGroup[0]?.id ?? 'unwrap'}>{inner}</React.Fragment>
                );
              })}
              {col.blocks.length === 0 && (
                <div className="min-h-[72px] flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-200 dark:border-slate-500 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-sm transition-colors hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20">
                  <svg className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
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
    <div className="absolute left-0 bottom-full mb-1 py-1.5 min-w-[160px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl z-50">
      {SECTION_OPTIONS.map(({ n, label, icon }) => (
        <button
          key={n}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => { onAdd(n); onClose(); }}
          title={n === 1 ? 'Add single row' : `Add row with ${n} columns`}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
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
    <div className="absolute left-0 top-full mt-1 py-1.5 min-w-[160px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl z-50">
      {SECTION_OPTIONS.map(({ n, label, icon }) => (
        <button
          key={n}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => { onAdd(n); onClose(); }}
          title={n === 1 ? 'Add single row' : `Add row with ${n} columns`}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
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
        isOver ? 'border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-400' : 'border-slate-200 dark:border-slate-300 bg-slate-50/30 dark:bg-slate-50/50 hover:border-slate-300 dark:hover:border-slate-400'
      }`}
    >
      <p className="text-slate-700 font-semibold mb-1">Your email template</p>
      <p className="text-slate-500 text-sm mb-4">Add a section below, or drag blocks here to start building.</p>
      <div className="relative inline-block" ref={menuRef as React.Ref<HTMLDivElement>}>
        <button
          ref={buttonRef as React.Ref<HTMLButtonElement>}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200/80 dark:border-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white shadow-sm transition-all duration-200"
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
    <div className="flex-1 min-h-0 overflow-auto bg-slate-200 dark:bg-slate-900 px-0 py-3 sm:p-6 pb-20 lg:pb-32" onClick={() => { actions.selectBlock(null); actions.selectSection(null); }}>
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed border-slate-200 dark:border-slate-300 bg-slate-50/50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-white transition-all duration-200"
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
