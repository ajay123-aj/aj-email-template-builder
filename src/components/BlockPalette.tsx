import { useDraggable } from '@dnd-kit/core';
import { createBlock, BLOCK_LABELS, PALETTE_ORDER } from '../blocks/blockRegistry';
import type { BlockType } from '../types/template';
import { BlockIcon, IconBlocks } from './icons';

function PaletteItem({ type }: { type: BlockType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette-${type}`, data: { type: 'palette', blockType: type } });
  return (
    <button ref={setNodeRef} type="button" {...listeners} {...attributes}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-sm transition-all duration-200 select-none touch-manipulation ${isDragging ? 'opacity-50 bg-blue-50 dark:bg-blue-900/50 border-blue-400 dark:border-blue-500' : 'bg-white dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600/80'}`}>
      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300"><BlockIcon type={type} /></span>
      <span className="font-semibold text-slate-700 dark:text-slate-200">{BLOCK_LABELS[type]}</span>
    </button>
  );
}

export function BlockPalette() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 dark:bg-blue-700 flex items-center justify-center text-white">
            <IconBlocks />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Blocks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Drag blocks into the canvas to build your email.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 dark:bg-slate-800/50">
        <div className="flex flex-col gap-2">
          {PALETTE_ORDER.map(type => <PaletteItem key={type} type={type} />)}
        </div>
      </div>
    </div>
  );
}

export { createBlock };
