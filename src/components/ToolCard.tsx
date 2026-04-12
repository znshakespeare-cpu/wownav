import { Tool } from '../types';
import ToolSiteIcon from './ToolSiteIcon';

interface ToolCardProps {
  tool: Tool;
  searchQuery: string;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-500/30 text-amber-300 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ToolCard({ tool, searchQuery }: ToolCardProps) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-void-mid border border-slate-800 rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(245,166,35,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-amber-500/30 transition-colors">
            <ToolSiteIcon url={tool.url} fallback={tool.icon} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors leading-tight">
              {highlight(tool.name, searchQuery)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {new URL(tool.url).hostname}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700/70"
            title="国内访问状态：🟢直连流畅 / 🟡直连较慢 / 🔴需翻墙"
          >
            {tool.access}
          </span>
          <span
            className="shrink-0 text-sm leading-none text-amber-500/50 group-hover:text-amber-400/90 mt-0.5 transition-colors select-none"
            aria-hidden
          >
            ↗
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {highlight(tool.description, searchQuery)}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 group-hover:border-amber-500/20 group-hover:text-slate-300 transition-colors"
          >
            {highlight(tag, searchQuery)}
          </span>
        ))}
      </div>
    </a>
  );
}
