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
      className={`relative rounded border-2 transition-colors ${selected ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:border-slate-300 bg-white'} ${isDragging ? 'opacity-80 shadow-lg z-50' : ''}`}>
      {!isOverlay && (
        <div className="absolute -top-8 left-0 right-0 flex items-center gap-1 opacity-0 hover:opacity-100">
          <button type="button" className="px-2 py-1 text-xs rounded bg-slate-700 text-white" {...listeners} {...attributes} title="Drag">⋮⋮</button>
          <button type="button" className="px-2 py-1 text-xs rounded bg-slate-600 text-white" onClick={e => { e.stopPropagation(); actions.duplicateBlock(block.id); }}>Copy</button>
          <button type="button" className="px-2 py-1 text-xs rounded bg-red-600 text-white" onClick={e => { e.stopPropagation(); actions.deleteBlock(block.id); }}>×</button>
        </div>
      )}
      <div className="p-2 min-h-[24px]"><BlockRenderer block={block} selected={selected} onPatch={onPatch} /></div>
    </div>
  );
}
