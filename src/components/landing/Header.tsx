import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            AJ Email Editor
          </span>
          <span className="text-slate-400 text-xs sm:text-sm font-medium hidden sm:inline">
            Template Builder
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4" aria-label="Main navigation">
          {isHome && (
            <>
              <a
                href="#features"
                className="hidden sm:inline px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hidden sm:inline px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                How it works
              </a>
              <a
                href="#templates"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors rounded-lg hover:bg-white/5 border border-violet-500/30"
              >
                Create Template
              </a>
            </>
          )}
          <Link
            to="/contact"
            className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Contact
          </Link>
          <button
            type="button"
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>
  );
}
