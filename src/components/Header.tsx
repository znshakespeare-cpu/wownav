import { Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gold-dim bg-void-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-lg">⚔️</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-wide text-amber-400 leading-none">
                WoW Day Day - 魔兽天天看
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">艾泽拉斯冒险者的每日基地</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-amber-400">WoW Day Day</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-void-mid border border-slate-700/70 rounded-lg px-2.5 py-1">
              <span>🟢 直连流畅</span>
              <span className="text-slate-600">|</span>
              <span>🟡 直连较慢</span>
              <span className="text-slate-600">|</span>
              <span>🔴 需翻墙</span>
            </div>
            <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索工具名称或标签..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-void-mid border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
        <div className="lg:hidden pb-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>🟢 直连流畅</span>
            <span>🟡 直连较慢</span>
            <span>🔴 需翻墙</span>
          </div>
        </div>
      </div>
    </header>
  );
}
