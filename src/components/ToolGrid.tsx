import { Tool } from '../types';
import ToolCard from './ToolCard';

interface ToolGridProps {
  tools: Tool[];
  searchQuery: string;
}

export default function ToolGrid({ tools, searchQuery }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-5xl opacity-30">🔍</div>
        <p className="text-slate-500 text-sm">没有找到匹配的工具</p>
        <p className="text-slate-600 text-xs">尝试搜索其他关键词</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} searchQuery={searchQuery} />
      ))}
    </div>
  );
}
