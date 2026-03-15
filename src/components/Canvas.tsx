import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BlockWrapper } from './blocks/BlockWrapper';
import { useEditorStore, actions } from '../store/useEditorStore';
import { getBackgroundStyle } from '../utils/backgroundStyle';
import type { EmailSection, EmailColumn } from '../types/template';

const dropId = (sId: string, cId: string) => `drop:${sId}:${cId}`;

function ColumnZone({ sectionId, columnId, column, section, children }: { sectionId: string; columnId: string; column: EmailColumn; section: EmailSection; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId(sectionId, columnId) });
  const isRow = section.layout !== 'column';
  const useAuto = isRow && section.columns.length > 1 && (!column.width || column.width === 'auto' || column.width === '100%');
  const style: React.CSSProperties = section.layout === 'column' ? { width: '100%' } : useAuto ? { flex: '1 1 0', minWidth: 0 } : { flexBasis: column.width, width: column.width };
  return (
    <div ref={setNodeRef} style={style} className={`min-w-0 min-h-[48px] ${isOver ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/30 rounded' : ''}`}>
      {children}
    </div>
  );
}

function LiveSection({ section }: { section: EmailSection }) {
  const selected = useEditorStore(s => s.selectedSectionId) === section.id;
  const layout = section.layout ?? 'row';
  return (
    <div
      onClick={e => {
        if (!(e.target as HTMLElement).closest('[data-block-interact]')) {
          e.stopPropagation();
          actions.selectSection(section.id);
          actions.selectBlock(null);
        }
      }}
      className={`transition-all ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-2 ring-transparent ring-offset-2 hover:ring-slate-200'}`}
      style={{ padding: section.padding ?? '16px', background: getBackgroundStyle(section) }}
    >
      <div className="flex gap-2" style={{ flexDirection: layout === 'column' ? 'column' : 'row' }}>
        {section.columns.map(col => (
          <ColumnZone key={col.id} sectionId={section.id} columnId={col.id} column={col} section={section}>
            <SortableContext items={col.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {col.blocks.map((block, idx) => (
                <div key={block.id} className="mb-2" data-block-interact>
                  <BlockWrapper block={block} sectionId={section.id} columnId={col.id} index={idx} />
                </div>
              ))}
              {col.blocks.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-6 border border-dashed border-slate-200 rounded">Drop blocks here</div>
              )}
            </SortableContext>
          </ColumnZone>
        ))}
      </div>
    </div>
  );
}

export function Canvas() {
  const template = useEditorStore(s => s.template);
  const canvasWidth = 600;
  const bg = getBackgroundStyle(template);
  return (
    <div className="flex-1 min-h-0 overflow-auto bg-slate-200 p-4 sm:p-6" onClick={() => { actions.selectBlock(null); actions.selectSection(null); }}>
      <div className="flex justify-center items-start min-h-full">
        <div className="min-h-[400px] w-full max-w-full flex-shrink-0 bg-white shadow-lg" style={{ width: canvasWidth, maxWidth: '100%', background: bg }}>
          <div style={{ padding: template.padding ?? '24px' }}>
            {template.sections.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-slate-600 font-medium mb-1">Your email template</p>
                <p className="text-slate-500 text-sm mb-4">Add a row below. Then drag blocks from the left into the row. Click a section or block to change it in the right panel.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button type="button" className="px-3 py-1.5 rounded text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50" onClick={() => actions.addSection(1)}>+ Add row</button>
                  <button type="button" className="px-3 py-1.5 rounded text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50" onClick={() => actions.addSection(2)}>+ 2 columns</button>
                  <button type="button" className="px-3 py-1.5 rounded text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50" onClick={() => actions.addSection(3)}>+ 3 columns</button>
                </div>
              </div>
            ) : (
              template.sections.map(s => <LiveSection key={s.id} section={s} />)
            )}
            <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-slate-200">
              <button type="button" className="px-3 py-1.5 rounded text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50" onClick={() => actions.addSection(1)}>+ Add row</button>
              <button type="button" className="px-3 py-1.5 rounded text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50" onClick={() => actions.addSection(2)}>+ 2 columns</button>
              <button type="button" className="px-3 py-1.5 rounded text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50" onClick={() => actions.addSection(3)}>+ 3 columns</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
