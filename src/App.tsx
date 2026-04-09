import { useState, useMemo } from 'react';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import ToolGrid from './components/ToolGrid';
import Footer from './components/Footer';
import { tools, categories } from './data/tools';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      if (cat.id === 'all') return;
      counts[cat.id] = tools.filter((t) => t.category === cat.id).length;
    });
    return counts;
  }, []);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-void-dark text-slate-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(245,166,35,0.03)' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(245,166,35,0.04)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(245,166,35,0.03)' }} />
      </div>

      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(id) => {
          setActiveCategory(id);
          setSearchQuery('');
        }}
        counts={categoryCounts}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">
              {activeCategory === 'all'
                ? '全部工具'
                : categories.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {searchQuery
                ? `搜索「${searchQuery}」找到 ${filteredTools.length} 个工具`
                : `共 ${filteredTools.length} 个工具`}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
            >
              清除搜索
            </button>
          )}
        </div>

        <ToolGrid tools={filteredTools} searchQuery={searchQuery} />
      </main>

      <Footer />
    </div>
  );
}
