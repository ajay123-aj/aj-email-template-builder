import { useEditorStore, actions } from '../store/useEditorStore';
import { IconUndo, IconRedo, IconBlocks, IconProperties, IconEdit, IconPreview, IconSparkles } from './icons';
import { Tooltip } from './Tooltip';

interface EditorFooterProps {
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
  onToggleLeftDrawer: () => void;
  onToggleRightDrawer: () => void;
  isDesktop: boolean;
  showPreview: boolean;
  askAIEnabled: boolean;
  onAskAIOpen: () => void;
}

const barBase = 'rounded-2xl border border-white/80 dark:border-slate-600/80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl ring-1 ring-slate-200/20 dark:ring-slate-700/50 shadow-[0_4px_24px_rgba(15,23,42,0.08),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(30,41,59,0.5)]';
const btnIconSize = 'w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0';

export function EditorFooter({
  leftDrawerOpen,
  rightDrawerOpen,
  onToggleLeftDrawer,
  onToggleRightDrawer,
  isDesktop,
  showPreview,
  askAIEnabled,
  onAskAIOpen,
}: EditorFooterProps) {
  const history = useEditorStore(s => s.history);
  const historyIndex = useEditorStore(s => s.historyIndex);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  if (isDesktop) {
    return (
      <>
        {/* Desktop: Fit content, no extra space */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-fit">
          <div className={`flex items-center ${barBase} p-1 gap-1`}>
            {/* Left: Undo, Redo, File */}
            <div className="flex items-center gap-1">
              <Tooltip text="Undo" placement="top">
                <button
                  type="button"
                  onClick={() => actions.undo()}
                  disabled={!canUndo}
                  className={`${btnIconSize} text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed`}
                  aria-label="Undo last change"
                >
                  <IconUndo />
                </button>
              </Tooltip>
              <Tooltip text="Redo" placement="top">
                <button
                  type="button"
                  onClick={() => actions.redo()}
                  disabled={!canRedo}
                  className={`${btnIconSize} text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed`}
                  aria-label="Redo last change"
                >
                  <IconRedo />
                </button>
              </Tooltip>
            </div>
            {/* Right: Edit, Preview, Ask AI */}
            <div className="flex items-center gap-1">
              <Tooltip text="Edit mode" placement="top">
                <button
                  type="button"
                  onClick={() => actions.setShowPreview(false)}
                  className={`${btnIconSize} ${!showPreview ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  aria-label="Edit mode"
                >
                  <IconEdit />
                </button>
              </Tooltip>
              <Tooltip text="Preview email" placement="top">
                <button
                  type="button"
                  onClick={() => actions.setShowPreview(true)}
                  className={`${btnIconSize} ${showPreview ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  aria-label="Preview"
                >
                  <IconPreview />
                </button>
              </Tooltip>
              {askAIEnabled && (
                <>
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
                  <Tooltip text="Ask AI for suggestions" placement="top">
                    <button
                      type="button"
                      onClick={onAskAIOpen}
                      className={`${btnIconSize} text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/50`}
                      aria-label="Ask AI"
                    >
                      <IconSparkles />
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile: Fit content, no extra space */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-fit">
        <div className={`flex items-center ${barBase} p-1 gap-0.5`}>
          <Tooltip text="Open blocks panel" placement="top">
            <button type="button" onClick={onToggleLeftDrawer} className={`${btnIconSize} ${leftDrawerOpen ? 'bg-slate-800 dark:bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Blocks"><IconBlocks /></button>
          </Tooltip>
          <Tooltip text="Open properties panel" placement="top">
            <button type="button" onClick={onToggleRightDrawer} className={`${btnIconSize} ${rightDrawerOpen ? 'bg-slate-800 dark:bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Properties"><IconProperties /></button>
          </Tooltip>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
          <Tooltip text="Undo" placement="top">
            <button type="button" onClick={() => actions.undo()} disabled={!canUndo} className={`${btnIconSize} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40`} aria-label="Undo"><IconUndo /></button>
          </Tooltip>
          <Tooltip text="Redo" placement="top">
            <button type="button" onClick={() => actions.redo()} disabled={!canRedo} className={`${btnIconSize} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40`} aria-label="Redo"><IconRedo /></button>
          </Tooltip>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
          <Tooltip text="Edit mode" placement="top">
            <button type="button" onClick={() => actions.setShowPreview(false)} className={`${btnIconSize} ${!showPreview ? 'bg-slate-800 dark:bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Edit"><IconEdit /></button>
          </Tooltip>
          <Tooltip text="Preview email" placement="top">
            <button type="button" onClick={() => actions.setShowPreview(true)} className={`${btnIconSize} ${showPreview ? 'bg-slate-800 dark:bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Preview"><IconPreview /></button>
          </Tooltip>
          {askAIEnabled && (
            <>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
              <Tooltip text="Ask AI for suggestions" placement="top">
                <button type="button" onClick={onAskAIOpen} className={`${btnIconSize} text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/50`} aria-label="Ask AI"><IconSparkles /></button>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </>
  );
}
