import { Link } from 'react-router-dom';
import { FileMenu } from './FileMenu';
import { useEditorTheme } from '../context/EditorThemeContext';
import { IconSun, IconMoon } from './icons';

interface ToolbarProps {
  isMobile?: boolean;
  leftDrawerOpen?: boolean;
  rightDrawerOpen?: boolean;
  onToggleLeftDrawer?: () => void;
  onToggleRightDrawer?: () => void;
}

export function Toolbar(_props: ToolbarProps = {}) {
  const { theme, toggleTheme } = useEditorTheme();

  return (
    <>
    <header className="min-h-12 sm:min-h-14 flex-shrink-0 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-900/10 dark:shadow-black/10">
      {/* Back button */}
      <Link
        to="/"
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors border border-slate-200 dark:border-slate-600/80 flex-shrink-0"
        title="Back to Templates"
        aria-label="Back to Templates"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>
      <div className="w-px h-5 sm:h-6 bg-slate-200 dark:bg-slate-600/80 hidden sm:block" />
      {/* Brand - compact on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <span className="text-sm sm:text-xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent truncate">
          AJ Email Editor
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium hidden md:inline">
          Template Builder
        </span>
      </div>
      <div className="flex-1 min-w-4" />
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-600/80 flex-shrink-0"
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>
      <div className="w-px h-5 sm:h-6 bg-slate-200 dark:bg-slate-600/80 hidden sm:block" />
      <FileMenu />
    </header>
    </>
  );
}
