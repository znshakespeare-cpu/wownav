import { useState, useMemo } from 'react';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import ToolGrid from './components/ToolGrid';
import Footer from './components/Footer';
import { tools, categories } from './data/tools';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');

  const q = searchQuery.toLowerCase().trim();

  const matchesSearch = (tool: (typeof tools)[number]) => {
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.id] = tools.filter((t) => t.category === cat.id).length;
    });
    return counts;
  }, []);

  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, typeof tools> = {};
    categories.forEach((cat) => {
      grouped[cat.id] = tools.filter((tool) => tool.category === cat.id && matchesSearch(tool));
    });
    return grouped;
  }, [q]);

  const filteredAllTools = useMemo(() => tools.filter(matchesSearch), [q]);

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
          const target = document.getElementById(`section-${id}`);
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        counts={categoryCounts}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">分类导航</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {searchQuery
                ? `搜索「${searchQuery}」找到 ${filteredAllTools.length} 个工具`
                : `共 ${tools.length} 个工具`}
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

        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category.id} id={`section-${category.id}`} className="scroll-mt-36">
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200">
                  {category.icon} {category.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {toolsByCategory[category.id]?.length ?? 0} 个工具
                </p>
              </div>
              <ToolGrid tools={toolsByCategory[category.id] ?? []} searchQuery={searchQuery} />
            </section>
          ))}

          <section id="section-all-tools" className="scroll-mt-36 pt-2">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200">🌟 全部工具卡片</h3>
              <p className="text-xs text-slate-500 mt-1">
                {filteredAllTools.length} 个工具
              </p>
            </div>
            <ToolGrid tools={filteredAllTools} searchQuery={searchQuery} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
