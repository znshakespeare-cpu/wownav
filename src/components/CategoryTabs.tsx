import { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  counts: Record<string, number>;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  counts,
}: CategoryTabsProps) {
  const totalTools = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="sticky top-16 z-40 bg-void-dark/95 backdrop-blur-sm border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 pt-3 pb-2">
          <p className="text-base sm:text-lg font-semibold text-slate-200">
            分类导航，已收录 {totalTools} 个常用工具
          </p>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>🟢 直连流畅</span>
            <span>🟡 直连较慢</span>
            <span>🔴 需翻墙</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pb-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = counts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700/60 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
