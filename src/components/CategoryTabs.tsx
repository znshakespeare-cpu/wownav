import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  /** 视口滚动联动：仅更新高亮，不触发页面滚动 */
  onViewportCategoryChange?: (id: string) => void;
  sectionRefs?: MutableRefObject<Record<string, HTMLElement | null>>;
  counts: Record<string, number>;
}

const MOBILE_MAX = '(max-width: 767px)';

function getSectionEl(
  id: string,
  sectionRefs?: MutableRefObject<Record<string, HTMLElement | null>>,
): HTMLElement | null {
  return sectionRefs?.current[id] ?? document.getElementById(`section-${id}`);
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  onViewportCategoryChange,
  sectionRefs,
  counts,
}: CategoryTabsProps) {
  const totalTools = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const [compactNav, setCompactNav] = useState(false);
  const ignoreIORef = useRef(false);
  const tabStripRef = useRef<HTMLDivElement>(null);

  const handleTabClick = useCallback(
    (id: string) => {
      ignoreIORef.current = true;
      onCategoryChange(id);
      window.setTimeout(() => {
        ignoreIORef.current = false;
      }, 900);
    },
    [onCategoryChange],
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MAX);
    const onScroll = () => {
      if (!mq.matches) {
        setCompactNav(false);
        return;
      }
      setCompactNav(window.scrollY > 100);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    mq.addEventListener('change', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      mq.removeEventListener('change', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!onViewportCategoryChange) return;

    const elements = categories
      .map((c) => getSectionEl(c.id, sectionRefs))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const ratioById: Record<string, number> = {};
    categories.forEach((c) => {
      ratioById[c.id] = 0;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const raw = entry.target.id;
          if (!raw.startsWith('section-')) continue;
          const id = raw.slice('section-'.length);
          if (id in ratioById) {
            ratioById[id] = entry.intersectionRatio;
          }
        }

        if (ignoreIORef.current) return;

        let bestId: string | null = null;
        let bestRatio = -1;
        for (const c of categories) {
          const r = ratioById[c.id] ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = c.id;
          }
        }

        if (bestId !== null && bestRatio > 0.02) {
          onViewportCategoryChange(bestId);
        }
      },
      {
        root: null,
        rootMargin: '-18% 0px -42% 0px',
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.35, 0.5, 0.65, 0.8, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories, onViewportCategoryChange, sectionRefs]);

  useEffect(() => {
    if (!tabStripRef.current || !activeCategory) return;
    const strip = tabStripRef.current;
    const activeBtn = strip.querySelector<HTMLElement>(`[data-category-id="${activeCategory}"]`);
    if (!activeBtn) return;
    const pad = 12;
    const left = activeBtn.offsetLeft - strip.clientWidth / 2 + activeBtn.offsetWidth / 2;
    strip.scrollTo({ left: Math.max(0, left - pad), behavior: 'auto' });
  }, [activeCategory, compactNav]);

  const scrollHideRow =
    'max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden';

  return (
    <div
      className={[
        'sticky z-40 border-b border-slate-800/60 bg-void-dark/95 backdrop-blur-sm transition-all duration-300 max-sm:top-[8.25rem] sm:top-16',
        compactNav ? 'max-md:shadow-[0_8px_24px_rgba(0,0,0,0.35)]' : '',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto max-w-7xl px-4 transition-all duration-300 sm:px-6 lg:px-8',
          compactNav ? 'max-md:py-2' : 'max-md:pt-3 max-md:pb-2.5',
          'md:pt-3 md:pb-2',
        ].join(' ')}
      >
        <div className="mb-2 hidden items-center justify-between gap-3 md:flex">
          <p className="text-base font-semibold text-slate-200 sm:text-lg">
            分类导航，已收录 {totalTools} 个常用工具
          </p>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>🟢 直连流畅</span>
            <span>🟡 直连较慢</span>
            <span>🔴 需翻墙</span>
          </div>
        </div>

        <div
          className={[
            'md:hidden',
            compactNav ? 'mb-1.5 space-y-1.5' : 'mb-2.5 space-y-2',
          ].join(' ')}
        >
          {!compactNav && (
            <p className="text-xs font-medium leading-snug text-slate-400">
              分类导航 · 已收录 {totalTools} 个常用工具
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] leading-snug text-slate-500">
            <span>🟢 直连流畅</span>
            <span>🟡 直连较慢</span>
            <span>🔴 需翻墙</span>
          </div>
        </div>

        <div
          ref={tabStripRef}
          className={[
            'flex gap-1.5 transition-all duration-300',
            "after:shrink-0 after:content-[''] after:w-3",
            'max-md:flex-nowrap max-md:overflow-x-auto max-md:pb-2',
            'max-md:-mx-4 max-md:pl-4 max-md:pr-5 sm:max-md:-mx-6 sm:max-md:pl-6 sm:max-md:pr-7',
            'md:max-lg:flex-nowrap md:max-lg:overflow-x-auto md:max-lg:pb-3',
            'md:max-lg:-mx-6 md:max-lg:pl-6 md:max-lg:pr-8',
            'lg:flex-nowrap lg:overflow-x-auto lg:pb-3',
            'lg:-mx-8 lg:pl-8 lg:pr-10',
            scrollHideRow,
            compactNav ? 'max-md:pb-1.5 max-md:pt-0' : '',
          ].join(' ')}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = counts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                data-category-id={cat.id}
                onClick={() => handleTabClick(cat.id)}
                className={[
                  'flex flex-shrink-0 items-center rounded-lg border font-medium whitespace-nowrap transition-all duration-300',
                  'gap-1.5 px-2.5 py-1.5 text-sm',
                  'md:max-lg:gap-1.5 md:max-lg:px-2.5 md:max-lg:py-1.5',
                  compactNav
                    ? 'max-md:h-11 max-md:min-h-[44px] max-md:min-w-[44px] max-md:justify-center max-md:gap-0 max-md:px-2.5 max-md:py-2'
                    : 'max-md:gap-1.5 max-md:px-3 max-md:py-2.5',
                  'lg:gap-1.5 lg:px-2.5 lg:py-1.5',
                  isActive
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/20'
                    : 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                ].join(' ')}
              >
                <span className="flex shrink-0 items-center leading-none">
                  <img src={cat.icon} alt={cat.label} className="h-10 w-10" />
                </span>
                <span
                  className={[
                    'overflow-hidden transition-all duration-300 md:max-w-none md:opacity-100 md:w-auto',
                    compactNav
                      ? 'max-md:pointer-events-none max-md:w-0 max-md:max-w-0 max-md:opacity-0'
                      : 'max-md:max-w-[min(16rem,78vw)] max-md:opacity-100',
                  ].join(' ')}
                >
                  {cat.label}
                </span>
                <span
                  className={[
                    'rounded-full text-xs transition-all duration-300 md:max-w-none md:opacity-100 md:w-auto md:px-1.5 md:py-0.5',
                    isActive ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700/60 text-slate-500',
                    compactNav
                      ? 'max-md:pointer-events-none max-md:m-0 max-md:w-0 max-md:max-w-0 max-md:overflow-hidden max-md:p-0 max-md:opacity-0'
                      : 'max-md:px-2 max-md:py-0.5 max-md:opacity-100',
                    'lg:px-1.5 lg:py-0.5',
                  ].join(' ')}
                >
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
