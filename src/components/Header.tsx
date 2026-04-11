import { Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/** 与 public/logo.png 主色一致：亮黄 → 琥珀 → 暖橙（只用在 span 上，勿与 truncate 同元素，否则渐变会失效） */
const brandTitleGradient =
  'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent';

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gold-dim bg-void-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 min-w-0 items-center justify-between gap-4">
          <div className="flex min-w-0 min-h-0 flex-1 items-center gap-2">
            <img src="/logo.png" alt="WoW Day Day Logo" className="h-10 w-10 shrink-0" />
            <div className="hidden min-w-0 flex-1 overflow-hidden sm:block">
              <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold leading-snug tracking-wide">
                <span className={brandTitleGradient}>WoW Day Day - 魔兽天天看</span>
              </h1>
            </div>
            <div className="min-w-0 sm:hidden">
              <h1 className="text-base font-bold leading-snug">
                <span className={brandTitleGradient}>WoW Day Day</span>
              </h1>
            </div>
          </div>

          <div className="min-w-0 w-full max-w-md sm:shrink-0">
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
    </header>
  );
}
