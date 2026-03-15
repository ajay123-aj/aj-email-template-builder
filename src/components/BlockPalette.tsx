import { useDraggable } from '@dnd-kit/core';
import { createBlock, BLOCK_LABELS, PALETTE_ORDER } from '../blocks/blockRegistry';
import type { BlockType } from '../types/template';

function PaletteItem({ type }: { type: BlockType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette-${type}`, data: { type: 'palette', blockType: type } });
  return (
    <button ref={setNodeRef} type="button" {...listeners} {...attributes}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm ${isDragging ? 'opacity-50 bg-blue-50' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
      <span className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-600 font-semibold text-sm">{type[0].toUpperCase()}</span>
      <span className="font-medium text-slate-700">{BLOCK_LABELS[type]}</span>
    </button>
  );
}

export function BlockPalette() {
  return (
    <div className="p-3 h-full overflow-y-auto">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Blocks</h3>
      <div className="flex flex-col gap-2">
        {PALETTE_ORDER.map(type => <PaletteItem key={type} type={type} />)}
      </div>
    </div>
  );
}

export { createBlock };
