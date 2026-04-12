import { useEffect, useMemo, useState } from 'react';

const ICON_PATHS = ['favicon.ico', 'favicon.png', 'favicon.svg', 'apple-touch-icon.png'] as const;

/** Archon 同源无 favicon 时使用的站内默认图（放在 public/icons） */
const ARCHON_BRAND_FALLBACK_SRC = '/icons/archon-fallback.png';

/**
 * 这些域名在根路径常无标准 favicon，而 DuckDuckGo 等返回的「有效」占位图无法触发 onError，
 * 用户只能看到灰块/假图标；因此不再请求第三方，同源失败后直接用 emoji。
 * （匹配时按「去掉 www 的根域名」比较。）
 */
/** 根域名（不含 www）：同源路径失败后不再请求 DDG，避免占位图挡掉 emoji */
const ROOT_HOSTS_SKIP_REMOTE_ICONS = new Set([
  'archon.gg',
  'exwind.net',
  'us.forums.blizzard.com',
]);

function rootHostKey(hostname: string): string {
  const h = hostname.toLowerCase();
  return h.startsWith('www.') ? h.slice(4) : h;
}

/** 同一站点带 www / 不带 www 两种 origin，尽量多试同源图标 */
function hostVariants(hostname: string): string[] {
  const h = hostname.toLowerCase();
  const set = new Set<string>([h]);
  if (h.startsWith('www.')) {
    set.add(h.slice(4));
  } else {
    set.add(`www.${h}`);
  }
  return [...set];
}

function sameOriginIconCandidates(parsed: URL): string[] {
  const proto = parsed.protocol || 'https:';
  const list: string[] = [];
  for (const host of hostVariants(parsed.hostname)) {
    const origin = `${proto}//${host}`;
    for (const p of ICON_PATHS) {
      list.push(`${origin}/${p}`);
    }
  }
  return [...new Set(list)];
}

function shouldSkipRemoteIcons(hostname: string): boolean {
  return ROOT_HOSTS_SKIP_REMOTE_ICONS.has(rootHostKey(hostname));
}

/**
 * 全站统一的站点图标逻辑：
 * 1. 依次尝试「当前协议 + www/apex」下常见 favicon 路径；
 * 2. 若域名未列入跳过名单，最后再试 DuckDuckGo ip3（按无 www 的根域）；
 * 3. 对 archon.gg，在同源路径均失败后尝试站内默认品牌图 `/icons/archon-fallback.png`；
 * 4. 仍失败则用 emoji 兜底。
 *
 * 不使用 Google s2：其常返回「有效」的通用占位图，onError 不会触发。
 */
export default function ToolSiteIcon({
  url,
  fallback,
  imgClassName = 'h-8 w-8 object-contain',
}: {
  url: string;
  fallback: string;
  imgClassName?: string;
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  const { hostname, candidates } = useMemo(() => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      const same = sameOriginIconCandidates(parsed);
      const hostKey = rootHostKey(host);
      const archonBrand =
        hostKey === 'archon.gg' ? ([ARCHON_BRAND_FALLBACK_SRC] as const) : ([] as const);

      if (shouldSkipRemoteIcons(host)) {
        return { hostname: host, candidates: [...same, ...archonBrand] };
      }
      const root = rootHostKey(host);
      const ddg = `https://icons.duckduckgo.com/ip3/${root}.ico`;
      return { hostname: host, candidates: [...same, ...archonBrand, ddg] };
    } catch {
      return { hostname: '', candidates: [] as string[] };
    }
  }, [url]);

  useEffect(() => {
    setCandidateIndex(0);
  }, [url]);

  const fallbackTextClass =
    /\bh-5\b|\bh-6\b|\bh-7\b/.test(imgClassName) ? 'text-sm' : 'text-xl';

  if (!hostname) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center leading-none select-none ${imgClassName} ${fallbackTextClass}`}
        aria-hidden
      >
        {fallback}
      </span>
    );
  }

  if (candidateIndex >= candidates.length) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center leading-none select-none ${imgClassName} ${fallbackTextClass}`}
        aria-hidden
      >
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
      className={`shrink-0 ${imgClassName}`}
      referrerPolicy="strict-origin-when-cross-origin"
      onError={() => setCandidateIndex((i) => i + 1)}
    />
  );
}
