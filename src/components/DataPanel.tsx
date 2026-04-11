import { FormEvent, useEffect, useMemo, useState } from 'react';

interface AffixItem {
  id: number;
  name: string;
  description?: string;
}

interface AffixResponse {
  affix_details: AffixItem[];
}

interface DungeonItem {
  id: number;
  name: string;
}

interface StaticDataResponse {
  seasons?: Array<{ slug?: string; is_main_season?: boolean; dungeons?: DungeonItem[] }>;
  dungeons?: DungeonItem[];
}

interface RunRanking {
  rank: number;
  run: {
    dungeon?: { name?: string };
    mythic_level?: number;
    clear_time_ms?: number;
    roster?: Array<{ role?: string; character?: { name?: string; class?: { name?: string } } }>;
  };
}

interface RunsResponse {
  rankings?: RunRanking[];
}

interface RaidRankingItem {
  rank: number;
  guild?: {
    name?: string;
    realm?: { altName?: string; name?: string };
    region?: { short_name?: string; slug?: string };
  };
  encountersDefeated?: unknown[];
}

interface RaidResponse {
  raidRankings?: RaidRankingItem[];
}

interface RaidStaticDataResponse {
  raids?: Array<{ slug?: string; encounters?: unknown[] }>;
}

interface CharacterResponse {
  name?: string;
  realm?: string;
  mythic_plus_scores_by_season?: Array<{ scores?: { all?: number } }>;
  gear?: { item_level_equipped?: number };
  profile_url?: string;
}

const DUNGEON_ZH_MAP: Record<string, string> = {
  'Ara-Kara, City of Echoes': '阿拉卡拉',
  'City of Threads': '千丝之城',
  'The Stonevault': '矶石宝库',
  'The Dawnbreaker': '破晨号',
  'Mists of Tirna Scithe': '塞兹仙林的迷雾',
  'The Necrotic Wake': '通灵战潮',
  'Siege of Boralus': '围攻伯拉勒斯',
  'Grim Batol': '格瑞姆巴托尔',
  'Darkflame Cleft': '暗焰裂口',
  'Priory of the Sacred Flame': '圣焰隐修院',
  'The Rookery': '驭雷栖巢',
  'Cinderbrew Meadery': '烬酿酒庄',
  'Operation: Mechagon - Workshop': '麦卡贡行动',
  'Operation: Mechagon - Junkyard': '麦卡贡行动',
  'Operation Mechagon': '麦卡贡行动',
  'Theater of Pain': '伤逝剧场',
  "Algeth'ar Academy": '艾杰斯亚学院',
  "Magisters' Terrace": '魔导师平台',
  'Maisara Caverns': '迈萨拉洞窟',
  'Nexus-Point Xenas': '节点希纳斯',
  'Pit of Saron': '萨隆矿坑',
  'Seat of the Triumvirate': '执政团之座',
  Skyreach: '通天峰',
  'Windrunner Spire': '风行者之塔',
};

const AFFIX_ZH_MAP: Record<string, string> = {
  Fortified: '强韧',
  Tyrannical: '残暴',
  "Xal'atath's Bargain: Devour": '萨拉塔斯的交易：吞噬',
  "Xal'atath's Guile": '萨拉塔斯的诡计',
};

const AFFIX_DESC_ZH_MAP: Record<string, string> = {
  Fortified: '非首领敌人生命值提高，造成的伤害也会提高。',
  Tyrannical: '首领及其爪牙生命值提高，造成的伤害提高。',
  "Xal'atath's Bargain: Devour": '战斗中会出现吞噬裂隙，需要及时处理以避免负面影响。',
  "Xal'atath's Guile": '萨拉塔斯会撤回赐福并强化惩罚效果，死亡会额外扣除时间。',
};

const CLASS_COLOR_MAP: Record<string, string> = {
  Warrior: '#C69B6D',
  Paladin: '#F48CBA',
  Hunter: '#ABD473',
  Rogue: '#FFF468',
  Priest: '#FFFFFF',
  'Death Knight': '#C41E3A',
  Shaman: '#0070DE',
  Mage: '#3FC7EB',
  Warlock: '#8788EE',
  Monk: '#00FF98',
  Druid: '#FF7C0A',
  'Demon Hunter': '#A330C9',
  Evoker: '#33937F',
};

const friendlyError = '数据加载失败，请稍后重试';

function toZhDungeon(name?: string) {
  if (!name) return '-';
  return DUNGEON_ZH_MAP[name] ?? name;
}

function toZhAffix(name: string) {
  if (/[\u4e00-\u9fa5]/.test(name)) return name;
  return AFFIX_ZH_MAP[name] ?? name;
}

function toZhAffixDesc(item: AffixItem) {
  if (item.description && /[\u4e00-\u9fa5]/.test(item.description)) return item.description;
  return AFFIX_DESC_ZH_MAP[item.name] ?? item.description ?? '暂无词缀说明';
}

function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '-';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function panelCardClass(extra = '') {
  return `bg-void-mid border border-slate-800 rounded-xl p-4 shadow-[0_0_24px_rgba(245,166,35,0.06)] ${extra}`;
}

function roleOrder(role?: string) {
  if (role === 'tank') return 0;
  if (role === 'healer') return 1;
  return 2;
}

function toWclSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\s+/g, '-');
}

export default function DataPanel() {
  const [affixes, setAffixes] = useState<AffixItem[]>([]);
  const [dungeons, setDungeons] = useState<DungeonItem[]>([]);
  const [runs, setRuns] = useState<RunRanking[]>([]);
  const [raid, setRaid] = useState<RaidRankingItem[]>([]);

  const [loadingAffixes, setLoadingAffixes] = useState(true);
  const [loadingDungeons, setLoadingDungeons] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [loadingRaid, setLoadingRaid] = useState(true);

  const [errorAffixes, setErrorAffixes] = useState('');
  const [errorDungeons, setErrorDungeons] = useState('');
  const [errorRuns, setErrorRuns] = useState('');
  const [errorRaid, setErrorRaid] = useState('');
  const [runsUpdatedAt, setRunsUpdatedAt] = useState('');
  const [raidUpdatedAt, setRaidUpdatedAt] = useState('');
  const [raidTotalBosses, setRaidTotalBosses] = useState(0);
  /** 用于「更多」跳转 Raider.io 大秘境页面（与 API season 一致） */
  const [mythicSeasonSlug, setMythicSeasonSlug] = useState<string | null>(null);
  /** 用于「更多」跳转 Raider.io 团本世界榜（与 API raid slug 一致） */
  const [raidWorldSlug, setRaidWorldSlug] = useState<string | null>(null);

  const [realm, setRealm] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [character, setCharacter] = useState<CharacterResponse | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await fetch('https://raider.io/api/v1/mythic-plus/affixes?region=cn&locale=zh');
        if (!res.ok) throw new Error('affixes');
        const data: AffixResponse = await res.json();
        setAffixes(Array.isArray(data.affix_details) ? data.affix_details : []);
      } catch {
        setErrorAffixes(friendlyError);
      } finally {
        setLoadingAffixes(false);
      }

      try {
        const res = await fetch('https://raider.io/api/v1/mythic-plus/static-data?expansion_id=11');
        if (!res.ok) throw new Error('static-data');
        const data: StaticDataResponse = await res.json();
        const mainSeason = data.seasons?.find((s) => s.is_main_season) ?? data.seasons?.[0];
        const seasonDungeons = mainSeason?.dungeons ?? data.dungeons ?? [];
        setDungeons(seasonDungeons);

        const seasonSlug = mainSeason?.slug ?? 'season-mn-1';
        setMythicSeasonSlug(seasonSlug);
        try {
          const runsRes = await fetch(`https://raider.io/api/v1/mythic-plus/runs?season=${seasonSlug}&region=cn&dungeon=all&affixes=all&page=0`);
          if (!runsRes.ok) throw new Error('runs');
          const runsData: RunsResponse = await runsRes.json();
          setRuns((runsData.rankings ?? []).slice(0, 10));
          setRunsUpdatedAt(new Date().toLocaleString('zh-CN', { hour12: false }));
        } catch {
          setErrorRuns(friendlyError);
        } finally {
          setLoadingRuns(false);
        }
      } catch {
        setErrorDungeons(friendlyError);
        setErrorRuns(friendlyError);
        setLoadingRuns(false);
      } finally {
        setLoadingDungeons(false);
      }

      try {
        const res = await fetch('https://raider.io/api/v1/raiding/static-data?expansion_id=11');
        if (!res.ok) throw new Error('raid-static');
        const data: RaidStaticDataResponse = await res.json();
        const currentRaid = data.raids?.[0];
        const currentRaidSlug = currentRaid?.slug;
        if (!currentRaidSlug) throw new Error('raid-slug-missing');
        setRaidTotalBosses(currentRaid?.encounters?.length ?? 0);
        setRaidWorldSlug(currentRaidSlug);

        const raidRes = await fetch(`https://raider.io/api/v1/raiding/raid-rankings?raid=${currentRaidSlug}&difficulty=mythic&region=world`);
        if (!raidRes.ok) throw new Error('raid-rankings');
        const raidData: RaidResponse = await raidRes.json();
        setRaid((raidData.raidRankings ?? []).slice(0, 10));
        setRaidUpdatedAt(new Date().toLocaleString('zh-CN', { hour12: false }));
      } catch {
        setErrorRaid(friendlyError);
      } finally {
        setLoadingRaid(false);
      }
    };

    loadAll();
    const timer = window.setInterval(() => {
      loadAll();
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const onQueryCharacter = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!realm.trim() || !characterName.trim()) {
      setQueryError('请输入服务器和角色名');
      setCharacter(null);
      return;
    }

    setQueryLoading(true);
    setQueryError('');
    setCharacter(null);

    try {
      const url = `https://raider.io/api/v1/characters/profile?region=cn&realm=${encodeURIComponent(realm.trim())}&name=${encodeURIComponent(characterName.trim())}&fields=mythic_plus_scores_by_season:current,gear`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('not-found');
      const data: CharacterResponse = await res.json();
      setCharacter(data);
    } catch {
      setQueryError('未找到该角色，请检查输入');
    } finally {
      setQueryLoading(false);
    }
  };

  const raidRows = useMemo(
    () =>
      raid.map((item) => ({
        rank: item.rank,
        name: item.guild?.name ?? '-',
        server: item.guild?.realm?.altName || item.guild?.realm?.name || '-',
        region: item.guild?.region?.short_name || item.guild?.region?.slug?.toUpperCase() || '-',
        progress: `${item.encountersDefeated?.length ?? 0}/${raidTotalBosses || '-'}`,
      })),
    [raid, raidTotalBosses]
  );

  const raiderMythicRunsMoreHref = useMemo(
    () =>
      mythicSeasonSlug
        ? `https://raider.io/cn/mythic-plus-rankings/${encodeURIComponent(mythicSeasonSlug)}/all/world/leaderboards`
        : null,
    [mythicSeasonSlug],
  );

  const raiderRaidWorldMoreHref = useMemo(
    () =>
      raidWorldSlug
        ? `https://raider.io/${encodeURIComponent(raidWorldSlug)}/rankings/world/mythic/0`
        : null,
    [raidWorldSlug],
  );

  const raiderMoreLinkClass =
    'absolute right-4 top-4 z-10 shrink-0 rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 transition-colors';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={panelCardClass()}>
          <h3 className="text-sm font-semibold text-slate-100 mb-3">⚔️ 本周词缀</h3>
          {loadingAffixes ? (
            <p className="text-sm text-slate-400">加载中...</p>
          ) : errorAffixes ? (
            <p className="text-sm text-rose-300">{errorAffixes}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {affixes.map((affix) => (
                <span
                  key={affix.id}
                  className="group relative inline-flex w-fit text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/70 whitespace-nowrap"
                  title={toZhAffixDesc(affix)}
                >
                  {toZhAffix(affix.name)}
                  <span className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 w-64 max-w-[80vw] whitespace-normal rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs leading-relaxed text-slate-200 shadow-lg">
                    {toZhAffixDesc(affix)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={panelCardClass()}>
          <h3 className="text-sm font-semibold text-slate-100 mb-3">📅 本赛季地下城</h3>
          {loadingDungeons ? (
            <p className="text-sm text-slate-400">加载中...</p>
          ) : errorDungeons ? (
            <p className="text-sm text-rose-300">{errorDungeons}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dungeons.map((dungeon) => (
                <span
                  key={dungeon.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/70"
                  title={dungeon.name}
                >
                  {toZhDungeon(dungeon.name)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={panelCardClass('lg:col-span-2')}>
          <h3 className="text-sm font-semibold text-slate-100 mb-3">🔍 角色查询</h3>
          <form
            onSubmit={onQueryCharacter}
            className="flex w-full min-w-0 flex-col gap-2 mb-3 lg:flex-row lg:items-stretch"
          >
            <input
              type="text"
              value={realm}
              onChange={(e) => setRealm(e.target.value)}
              placeholder="服务器名（如 silvermoon / 银月）"
              className="w-full min-w-0 flex-1 bg-void-dark border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="角色名"
              className="w-full min-w-0 flex-1 bg-void-dark border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            <button
              type="submit"
              className="w-full shrink-0 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors text-sm font-medium lg:w-auto"
            >
              {queryLoading ? '查询中...' : '查询'}
            </button>
          </form>
          {queryError ? (
            <p className="text-sm text-rose-300">{queryError}</p>
          ) : character ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/60">
                  <p className="text-slate-500 text-xs">角色</p>
                  <p className="text-slate-200 mt-0.5">{character.name ?? '-'}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/60">
                  <p className="text-slate-500 text-xs">服务器</p>
                  <p className="text-slate-200 mt-0.5">{character.realm ?? '-'}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/60">
                  <p className="text-slate-500 text-xs">M+总分</p>
                  <p className="text-slate-200 mt-0.5">{character.mythic_plus_scores_by_season?.[0]?.scores?.all ?? '-'}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/60">
                  <p className="text-slate-500 text-xs">装等</p>
                  <p className="text-slate-200 mt-0.5">{character.gear?.item_level_equipped ?? '-'}</p>
                </div>
              </div>
              {character.profile_url && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={character.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-500/25 transition-colors"
                  >
                    前往 Raider.IO
                  </a>
                  <a
                    href={`https://www.warcraftlogs.com/character/cn/${toWclSlug(character.realm || realm)}/${toWclSlug(character.name || characterName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-sm text-sky-300 hover:bg-sky-500/25 transition-colors"
                  >
                    前往 Warcraft Logs
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">输入服务器和角色名查询M+分数</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className={`${panelCardClass()} relative`}>
          {raiderMythicRunsMoreHref ? (
            <a
              href={raiderMythicRunsMoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className={raiderMoreLinkClass}
            >
              更多
            </a>
          ) : null}
          <div
            className={`mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 ${raiderMythicRunsMoreHref ? 'pr-[4.25rem]' : ''}`}
          >
            <h3 className="text-sm font-semibold text-slate-100">🏆 国服大秘境排行 TOP10</h3>
            <span className="text-[11px] font-normal text-slate-500">更新时间：{runsUpdatedAt || '-'}</span>
          </div>
          {loadingRuns ? (
            <p className="text-sm text-slate-400">加载中...</p>
          ) : errorRuns ? (
            <p className="text-sm text-rose-300">{errorRuns}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="text-left py-2 pr-2">排名</th>
                    <th className="text-left py-2 pr-2">地下城</th>
                    <th className="text-left py-2 pr-2">层数</th>
                    <th className="text-left py-2 pr-2">时间</th>
                    <th className="text-left py-2">队伍</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((item) => (
                    <tr key={`${item.rank}-${item.run?.mythic_level}`} className="border-b border-slate-800/60 text-slate-300">
                      <td className="py-2 pr-2">{item.rank}</td>
                      <td className="py-2 pr-2">{toZhDungeon(item.run?.dungeon?.name)}</td>
                      <td className="py-2 pr-2">+{item.run?.mythic_level ?? '-'}</td>
                      <td className="py-2 pr-2">{formatDuration(item.run?.clear_time_ms)}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                          {[...(item.run?.roster ?? [])]
                            .sort((a, b) => roleOrder(a.role) - roleOrder(b.role))
                            .map((r, idx) => {
                            const className = r.character?.class?.name ?? '';
                            const charName = r.character?.name ?? '未知';
                            const color = CLASS_COLOR_MAP[className] ?? '#E2E8F0';
                            return (
                              <span key={`${charName}-${idx}`} style={{ color }}>
                                {charName}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`${panelCardClass()} relative`}>
          {raiderRaidWorldMoreHref ? (
            <a
              href={raiderRaidWorldMoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className={raiderMoreLinkClass}
            >
              更多
            </a>
          ) : null}
          <div
            className={`mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 ${raiderRaidWorldMoreHref ? 'pr-[4.25rem]' : ''}`}
          >
            <h3 className="text-sm font-semibold text-slate-100">🌍 全球团本进度</h3>
            <span className="text-[11px] font-normal text-slate-500">更新时间：{raidUpdatedAt || '-'}</span>
          </div>
          {loadingRaid ? (
            <p className="text-sm text-slate-400">加载中...</p>
          ) : errorRaid ? (
            <p className="text-sm text-rose-300">{errorRaid}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="text-left py-2 pr-2">排名</th>
                    <th className="text-left py-2 pr-2">公会</th>
                    <th className="text-left py-2 pr-2">服务器/地区</th>
                    <th className="text-left py-2">击杀进度</th>
                  </tr>
                </thead>
                <tbody>
                  {raidRows.map((row) => (
                    <tr key={`${row.rank}-${row.name}`} className="border-b border-slate-800/60 text-slate-300">
                      <td className="py-2 pr-2">{row.rank}</td>
                      <td className="py-2 pr-2">{row.name}</td>
                      <td className="py-2 pr-2">{row.server} / {row.region}</td>
                      <td className="py-2">{row.progress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
