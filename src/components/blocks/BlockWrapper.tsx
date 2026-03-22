import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback } from 'react';
import { BlockRenderer } from './BlockRenderer';
import { useEditorStore, actions } from '../../store/useEditorStore';
import type { AnyBlock } from '../../types/template';

interface Props { block: AnyBlock; sectionId: string; columnId: string; index: number; isOverlay?: boolean; sectionSelected?: boolean; }

export function BlockWrapper({ block, sectionId, columnId, index, isOverlay, sectionSelected }: Props) {
  const selected = useEditorStore(s => s.selectedBlockId) === block.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id, data: { type: 'block', block, sectionId, columnId, index } });
  const style = transform ? { transform: CSS.Transform.toString(transform), transition } : {};
  const onPatch = useCallback((_id: string, config: Record<string, unknown>) => {
    actions.updateBlock(block.id, (b: AnyBlock) => ({ ...b, config: { ...(b.config as object), ...config } } as AnyBlock));
  }, [block.id]);
  const showBlockMenu = !isOverlay && !sectionSelected && selected;
  return (
    <div ref={setNodeRef} style={style} onClick={e => { e.stopPropagation(); actions.selectBlock(block.id); actions.selectSection(sectionId); }}
      className={`relative rounded transition-all group ${selected ? 'ring-2 ring-inset ring-blue-500' : 'ring-2 ring-inset ring-transparent hover:ring-slate-400'} ${isDragging ? 'opacity-80 shadow-lg z-50' : ''}`}>
      {showBlockMenu && (
        <div className="absolute top-1 right-1 flex items-center z-10 shrink-0">
          <button type="button" className="p-1 rounded bg-slate-700/90 text-white shadow hover:bg-slate-600 cursor-grab active:cursor-grabbing touch-manipulation" {...listeners} {...attributes} title="Drag" aria-label="Drag">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" /></svg>
          </button>
        </div>
      )}
      <div className={`min-h-[24px] ${!isOverlay ? 'p-1' : 'p-2'}`}><BlockRenderer block={block} selected={selected} onPatch={onPatch} /></div>
    </div>
  );
}
