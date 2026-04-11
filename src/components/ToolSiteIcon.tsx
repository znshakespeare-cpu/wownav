import { useEffect, useMemo, useState } from 'react';

/**
 * 优先用目标站点的 /favicon.ico，失败再用 DuckDuckGo 的域名图标服务，
 * 均失败或无法解析 URL 时用 emoji 兜底（不依赖 Google）。
 */
export default function ToolSiteIcon({ url, fallback }: { url: string; fallback: string }) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [url]);

  const { hostname, candidates } = useMemo(() => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      return {
        hostname: host,
        candidates: [
          `${parsed.origin}/favicon.ico`,
          `https://icons.duckduckgo.com/ip3/${host}.ico`,
        ],
      };
    } catch {
      return { hostname: '', candidates: [] as string[] };
    }
  }, [url]);

  if (!hostname) {
    return (
      <span className="text-xl leading-none select-none" aria-hidden>
        {fallback}
      </span>
    );
  }

  if (candidateIndex >= candidates.length) {
    return (
      <span className="text-xl leading-none select-none" aria-hidden>
        {fallback}
      </span>
    );
  }

  const src = candidates[candidateIndex];

  return (
    <img
      key={src}
      src={src}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="h-8 w-8 object-contain"
      referrerPolicy="no-referrer"
      onError={() => setCandidateIndex((i) => i + 1)}
    />
  );
}
