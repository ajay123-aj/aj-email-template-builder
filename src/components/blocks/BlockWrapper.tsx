import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback } from 'react';
import { BlockRenderer } from './BlockRenderer';
import { useEditorStore, actions } from '../../store/useEditorStore';
import type { AnyBlock } from '../../types/template';

interface Props { block: AnyBlock; sectionId: string; columnId: string; index: number; isOverlay?: boolean; }

export function BlockWrapper({ block, sectionId, columnId, index, isOverlay }: Props) {
  const selected = useEditorStore(s => s.selectedBlockId) === block.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id, data: { type: 'block', block, sectionId, columnId, index } });
  const style = transform ? { transform: CSS.Transform.toString(transform), transition } : {};
  const onPatch = useCallback((_id: string, config: Record<string, unknown>) => {
    actions.updateBlock(block.id, (b: AnyBlock) => ({ ...b, config: { ...(b.config as object), ...config } } as AnyBlock));
  }, [block.id]);

  return (
    <div ref={setNodeRef} style={style} onClick={e => { e.stopPropagation(); actions.selectBlock(block.id); actions.selectSection(sectionId); }}
      className={`relative rounded transition-all group ${selected ? 'ring-2 ring-blue-500 ring-offset-1' : 'ring-2 ring-transparent ring-offset-1 hover:ring-slate-300'} ${isDragging ? 'opacity-80 shadow-lg z-50' : ''}`}>
      {!isOverlay && (
        <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 z-10">
          <button type="button" className="px-1.5 py-0.5 text-xs rounded bg-slate-700/90 text-white shadow hover:bg-slate-600" {...listeners} {...attributes} title="Drag">⋮⋮</button>
          <button type="button" className="px-1.5 py-0.5 text-xs rounded bg-slate-600/90 text-white hover:bg-slate-500" onClick={e => { e.stopPropagation(); actions.duplicateBlock(block.id); }}>Copy</button>
          <button type="button" className="px-1.5 py-0.5 text-xs rounded bg-red-600/90 text-white hover:bg-red-500" onClick={e => { e.stopPropagation(); actions.deleteBlock(block.id); }}>×</button>
        </div>
      )}
      <div className={`min-h-[24px] ${!isOverlay ? 'p-1' : 'p-2'}`}><BlockRenderer block={block} selected={selected} onPatch={onPatch} /></div>
    </div>
  );
}
