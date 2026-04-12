import { FormEvent, useEffect, useMemo, useState } from 'react';
import { tools } from '../data/tools';
import RealmCombobox from './RealmCombobox';
import ToolSiteIcon from './ToolSiteIcon';

function canonicalToolUrl(url: string) {
  let u = url.trim().toLowerCase();
  while (u.endsWith('/')) u = u.slice(0, -1);
  return u;
}

function toolDescriptionForQuickLink(url: string) {
  const key = canonicalToolUrl(url);
  const hit = tools.find((t) => canonicalToolUrl(t.url) === key);
  return hit?.description ?? '';
}

interface DungeonItem {
  id: number;
  name: string;
  slug?: string;
}

interface StaticDataResponse {
  seasons?: Array<{ slug?: string; is_main_season?: boolean; dungeons?: DungeonItem[] }>;
  dungeons?: DungeonItem[];
}

interface RunRanking {
  rank: number;
  /** Raider.IO 该次大秘境的评分 */
  score?: number;
  run: {
    dungeon?: { name?: string };
    mythic_level?: number;
    clear_time_ms?: number;
    roster?: Array<{ role?: string; character?: { name?: string; class?: { name?: string } } }>;
  };
}

interface RunsResponse {
  rankings?: RunRanking[];
  /** 与当前列表数据一致的 Raider.IO 榜单页（含 strict 等参数） */
  leaderboard_url?: string;
}

interface RaidPulledEntry {
  slug?: string;
  bestPercent?: number;
  isDefeated?: boolean;
  numPulls?: number;
}

interface RaidRankingItem {
  rank: number;
  guild?: {
    name?: string;
    displayName?: string;
    faction?: string;
    realm?: { altName?: string; name?: string };
    region?: { short_name?: string; slug?: string };
    path?: string;
  };
  encountersDefeated?: Array<{ slug?: string }>;
  encountersPulled?: RaidPulledEntry[];
}

interface RaidResponse {
  raidRankings?: RaidRankingItem[];
}

interface RaidEncounterDef {
  id?: number;
  slug?: string;
  name?: string;
}

interface RaidStaticDataResponse {
  raids?: Array<{ slug?: string; name?: string; short_name?: string; encounters?: RaidEncounterDef[] }>;
}

/** Raider.IO 团本 slug → 国服常用层级名称（多团本赛季） */
const RAID_TIER_TITLE_ZH: Record<string, string> = {
  'tier-mn-1': '至暗之夜S1（尖塔/ 裂隙 / 奎尔丹纳斯）',
};

interface CharacterResponse {
  name?: string;
  realm?: string;
  mythic_plus_scores_by_season?: Array<{ scores?: { all?: number } }>;
  gear?: { item_level_equipped?: number };
  profile_url?: string;
}

const quickTools = [
  { name: 'Maxroll', url: 'https://maxroll.gg/wow', color: '#3B82F6', fallback: '📊' },
  { name: 'WarcraftLogs', url: 'https://www.warcraftlogs.com', color: '#F97316', fallback: '📖' },
  { name: 'Archon', url: 'https://www.archon.gg/wow', color: '#A855F7', fallback: '⬆️' },
  { name: 'Raidbots', url: 'https://www.raidbots.com', color: '#10B981', fallback: '🔧' },
  { name: 'Raider.IO', url: 'https://raider.io', color: '#EF4444', fallback: '🔴' },
  { name: 'MythicStats', url: 'https://mythicstats.com', color: '#FBBF24', fallback: '📈' },
] as const;

const videoGuides = [
  {
    fallback: '🏰',
    title: '团本攻略',
    subtitle: '夏一可的魔兽教室',
    url: 'https://space.bilibili.com/893053/lists/7672045?type=season',
  },
  {
    fallback: '🔑',
    title: '大秘境攻略',
    subtitle: '于笙的八本逐帧解析',
    url: 'https://space.bilibili.com/506324721/lists/7510028?type=season',
  },
  {
    fallback: '📺',
    title: '更多攻略',
    subtitle: '前往 B 站查看更多',
    url: `https://search.bilibili.com/all?keyword=${encodeURIComponent('魔兽12.0')}`,
  },
] as const;

const liveStreams = [
  { name: '斗鱼', url: 'https://www.douyu.com/g_WOW', color: '#FF6A00', fallback: '🐟' },
  { name: '抖音', url: 'https://www.douyin.com/search/%E9%AD%94%E5%85%BD?type=live', color: '#000000', fallback: '🎵' },
  {
    name: 'B站',
    url: 'https://live.bilibili.com/p/eden/area-tags?visit_id=7p2jx1nwbp00&areaId=83&parentAreaId=2',
    color: '#FB7299',
    fallback: '📺',
  },
  { name: '虎牙', url: 'https://www.huya.com/g/8', color: '#FFB800', fallback: '🐯' },
] as const;

const bluePostLinks = [
  {
    fallback: '🔵',
    label: 'EXWIND 蓝贴（中文翻译）',
    url: 'https://exwind.net/',
  },
  {
    fallback: '🔷',
    label: '暴雪蓝贴原文（英文）',
    url: 'https://us.forums.blizzard.com/en/wow/groups/blizzard-tracker/posts',
  },
] as const;

type HotDiscussionLink = {
  fallback: string;
  label: string;
  url: string;
  access?: '🔴';
};

const hotDiscussionLinks: HotDiscussionLink[] = [
  {
    fallback: '💬',
    label: 'NGA 艾泽拉斯议事厅',
    url: 'https://bbs.nga.cn/thread.php?fid=7',
  },
  {
    fallback: '📌',
    label: '魔兽世界贴吧',
    url: `https://tieba.baidu.com/f?kw=${encodeURIComponent('魔兽世界')}`,
  },
];

interface AffixItem {
  id: number;
  name: string;
  description?: string;
}

interface AffixesResponse {
  affix_details?: AffixItem[];
}

interface BluePostCheckPost {
  title: string;
  time: string;
  author: string;
}

interface BluePostCheckResponse {
  success: boolean;
  posts?: BluePostCheckPost[];
}

const AFFIX_ZH_MAP: Record<string, string> = {
  Fortified: '强韧',
  Tyrannical: '残暴',
  Bursting: '崩裂',
  Raging: '暴怒',
  Sanguine: '血池',
  Bolstering: '激励',
  Grievous: '重伤',
  Explosive: '易爆',
  Quaking: '震荡',
  Volcanic: '火山',
  Teeming: '繁盛',
  Necrotic: '死疽',
  Skittish: '无常',
  Infested: '共生',
  Reaping: '收割',
  Beguiling: '迷醉',
  Awakened: '觉醒',
  Prideful: '傲慢',
  Inspiring: '鼓舞',
  Spiteful: '怨毒',
  Storming: '风雷',
  Tormented: '折磨',
  Encrypted: '加密',
  Shrouded: '伪装',
  Thundering: '雷霆',
  Afflicted: '受难',
  Entangling: '纠缠',
  Incorporeal: '虚体',
  "Xal'atath's Bargain: Ascendant": '萨拉塔斯交易：扬升',
  "Xal'atath's Bargain: Oblivion": '萨拉塔斯交易：湮灭',
  "Xal'atath's Bargain: Devourer": '萨拉塔斯交易：吞噬',
  "Xal'atath's Bargain: Devour": '萨拉塔斯的交易：吞噬',
  "Xal'atath's Guile": '萨拉塔斯的诡计',
  "Xal'atath's Bargain: Voidbound": '萨拉塔斯交易：虚空束缚',
  "Xal'atath's Bargain: Pulsar": '萨拉塔斯交易：脉冲星',
  'Xal\'atath\'s Bargain: Obliterated': '萨拉塔斯交易：湮灭',
  'Xal\'atath\'s Bargain: Frenzied': '萨拉塔斯交易：狂乱',
};

const AFFIX_DESC_ZH_MAP: Record<string, string> = {
  Fortified: '非首领敌人生命值提高20%，造成的伤害最高提高20%。',
  Tyrannical: '首领生命值提高30%，造成的伤害最高提高15%。',
  Bursting: '非首领敌人死亡时会爆炸，在4秒内对所有玩家造成周期性伤害。此效果可叠加。',
  Raging: '非首领敌人生命值低于30%时将被激怒，造成的伤害提高100%。',
  Sanguine: '非首领敌人死亡时在其位置留下一滩血池，治疗盟友并伤害玩家。',
  Bolstering: '任意非首领敌人死亡时，其临死的哀嚎将强化附近的盟友，使其实际生命值及伤害提高20%。',
  Grievous: '当你的生命值低于90%时，受到的周期性治疗效果降低1%。',
  Explosive: '在战斗中，会周期性地召唤爆裂宝珠，若不及时摧毁将对队伍造成伤害。',
  Quaking: '所有玩家会周期性地发出震荡波，对附近的盟友造成伤害并打断施法。',
  Volcanic: '在战斗中，远处的敌人会周期性地在远程玩家脚下召唤火山喷发。',
  Spiteful: '非首领敌人死亡时会留下怨毒影魔追击随机玩家。',
  Storming: '敌人会周期性地召唤旋风，穿过时造成伤害并击退。',
  Inspiring: '某些非首领敌人带有鼓舞光环，使附近盟友免疫群体控制效果。',
  Necrotic: '所有敌人的近战攻击会施加可叠加的减疗效果。',
  Skittish: '敌人对坦克的威胁值大幅降低。',
  Teeming: '地下城中有额外的非首领敌人。',
  Afflicted: '受难之魂出现，可被驱散技能影响。',
  Entangling: '周期性被藤蔓纠缠，需移动挣脱。',
  Incorporeal: '虚体生物出现，可被控制技能影响。',
  Thundering: '周期性获得雷霆标记，需与队友正确分摊。',
  "Xal'atath's Bargain: Devour": '战斗中会出现吞噬裂隙，需要及时处理以避免负面影响。',
  "Xal'atath's Guile": '萨拉塔斯会撤回赐福并强化惩罚效果，死亡会额外扣除时间。',
};

/** 团本首领：Raider.IO slug / 英文名为键，国服常用译名（随版本可补） */
const RAID_ENCOUNTER_ZH: Record<string, string> = {
  'chimaerus-the-undreamt-god': '奇美鲁斯，无梦之神',
  'Chimaerus, the Undreamt God': '奇美鲁斯，无梦之神',
  'imperator-averzian': '统治者阿维尔齐安',
  'Imperator Averzian': '统治者阿维尔齐安',
  vorasius: '沃拉修斯',
  Vorasius: '沃拉修斯',
  'fallenking-salhadaar': '陨落之王萨洛达尔',
  'Fallenking Salhadaar': '陨落之王萨洛达尔',
  'vaelgor-ezzorak': '维尔戈尔·埃佐拉克',
  'Vaelgor Ezzorak': '维尔戈尔·埃佐拉克',
  'lightblinded-vanguard': '盲光先锋',
  'Lightblinded Vanguard': '盲光先锋',
  'crown-of-the-cosmos': '星穹之冠',
  'Crown of the Cosmos': '星穹之冠',
  'beloren-child-of-alar': '贝洛伦，奥尔之子',
  'Beloren, Child of Al\'ar': '贝洛伦，奥尔之子',
  'midnight-falls': '午夜陨落',
  'Midnight Falls': '午夜陨落',
};

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

/** 大秘境排行表格展示条数（TOP N） */
const MYTHIC_RANKING_PAGE_SIZE = 10;
const RAID_RANKING_PAGE_SIZE = 10;

/** 与 Raider.IO 网页「非 strict」榜单一致；接口返回的 leaderboard_url 多为 strict */
function toNonStrictMythicLeaderboardUrl(url: string) {
  return url.replace(/leaderboards-strict/g, 'leaderboards');
}

function mythicMoreHrefFromApi(leaderboardUrl: string | undefined, seasonSlug: string, dungeonSlug: 'all' | string) {
  if (leaderboardUrl) return toNonStrictMythicLeaderboardUrl(leaderboardUrl);
  if (dungeonSlug === 'all') {
    return `https://raider.io/mythic-plus-rankings/${encodeURIComponent(seasonSlug)}/all/world/leaderboards`;
  }
  return `https://raider.io/mythic-plus-rankings/${encodeURIComponent(seasonSlug)}/${encodeURIComponent(dungeonSlug)}/world/leaderboards`;
}

function toZhDungeon(name?: string) {
  if (!name) return '-';
  return DUNGEON_ZH_MAP[name] ?? name;
}

function toZhRaidEncounter(enc: { slug?: string; name?: string }) {
  if (enc.slug) {
    const z = RAID_ENCOUNTER_ZH[enc.slug];
    if (z) return z;
  }
  if (enc.name) {
    const z = RAID_ENCOUNTER_ZH[enc.name];
    if (z) return z;
  }
  if (enc.name && /[\u4e00-\u9fff]/.test(enc.name)) return enc.name;
  return enc.name ?? enc.slug ?? '-';
}

function toAffixDisplayName(name?: string) {
  if (!name) return '-';
  if (/[\u4e00-\u9fff]/.test(name)) return name;
  return AFFIX_ZH_MAP[name] ?? name;
}

function getAffixTooltipText(affix: AffixItem) {
  const desc = affix.description?.trim();
  if (desc && /[\u4e00-\u9fff]/.test(desc)) return desc;
  const byEnName = affix.name ? AFFIX_DESC_ZH_MAP[affix.name] : undefined;
  if (byEnName) return byEnName;
  if (affix.name && !/[\u4e00-\u9fff]/.test(affix.name)) {
    for (const [en, zh] of Object.entries(AFFIX_ZH_MAP)) {
      if (zh === affix.name) {
        return AFFIX_DESC_ZH_MAP[en] ?? desc ?? '暂无词缀说明';
      }
    }
  }
  return desc || '暂无词缀说明';
}

function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '-';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatRunScore(score?: number) {
  if (score == null || Number.isNaN(score)) return '-';
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

/** 公会名：联盟蓝 / 部落红（与常见进度页一致） */
const GUILD_FACTION_NAME_COLOR: Record<string, string> = {
  alliance: '#5882FA',
  horde: '#FF4040',
};

function regionBadgeCn(region?: { slug?: string; short_name?: string }) {
  const slug = (region?.slug || '').toLowerCase();
  if (slug === 'cn') return '国服';
  if (slug === 'us') return '美服';
  if (slug === 'eu') return '欧服';
  if (slug === 'kr') return '韩服';
  if (slug === 'tw') return '台服';
  return region?.short_name || region?.slug?.toUpperCase() || '';
}

function getRaidWipPull(item: RaidRankingItem, encounterOrder: RaidEncounterDef[]) {
  const pulled = item.encountersPulled ?? [];
  if (pulled.length === 0 || encounterOrder.length === 0) return null;
  const bySlug = new Map(pulled.filter((p) => p.slug).map((p) => [p.slug as string, p]));
  for (const enc of encounterOrder) {
    if (!enc.slug) continue;
    const p = bySlug.get(enc.slug);
    if (p && p.isDefeated === false) return { pull: p, encounter: enc };
  }
  return null;
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

const raiderMoreLinkClass =
  'shrink-0 rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 transition-colors';

export default function DataPanel() {
  const [rankingTab, setRankingTab] = useState<'mythic' | 'raid'>('mythic');
  const [selectedRunDungeon, setSelectedRunDungeon] = useState<DungeonItem | null>(null);

  const [dungeons, setDungeons] = useState<DungeonItem[]>([]);
  const [worldRuns, setWorldRuns] = useState<RunRanking[]>([]);
  const [dungeonRuns, setDungeonRuns] = useState<RunRanking[]>([]);
  const [loadingDungeonRuns, setLoadingDungeonRuns] = useState(false);
  const [errorDungeonRuns, setErrorDungeonRuns] = useState('');
  const [raid, setRaid] = useState<RaidRankingItem[]>([]);

  const [loadingDungeons, setLoadingDungeons] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [loadingRaid, setLoadingRaid] = useState(true);

  const [errorDungeons, setErrorDungeons] = useState('');
  const [errorRuns, setErrorRuns] = useState('');
  const [errorRaid, setErrorRaid] = useState('');
  const [runsUpdatedAt, setRunsUpdatedAt] = useState('');
  const [raidUpdatedAt, setRaidUpdatedAt] = useState('');
  const [raidTotalBosses, setRaidTotalBosses] = useState(0);
  const [raidEncounters, setRaidEncounters] = useState<RaidEncounterDef[]>([]);
  const [raidTierTitleZh, setRaidTierTitleZh] = useState('');
  const [mythicSeasonSlug, setMythicSeasonSlug] = useState<string | null>(null);
  const [raidWorldSlug, setRaidWorldSlug] = useState<string | null>(null);
  const [mythicWorldMoreHref, setMythicWorldMoreHref] = useState<string | null>(null);
  const [mythicDungeonMoreHref, setMythicDungeonMoreHref] = useState<string | null>(null);

  const [affixes, setAffixes] = useState<AffixItem[]>([]);
  const [loadingAffixes, setLoadingAffixes] = useState(true);
  const [errorAffixes, setErrorAffixes] = useState('');

  const [realm, setRealm] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [character, setCharacter] = useState<CharacterResponse | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [bluePostCheckLoading, setBluePostCheckLoading] = useState(true);

  useEffect(() => {
    const checkBluePosts = async () => {
      try {
        const response = await fetch('/api/bluepost-check');
        if (!response.ok) return;
        const data = (await response.json()) as BluePostCheckResponse;
        if (!data.success || !data.posts || data.posts.length === 0) return;

        const lastClickTime = localStorage.getItem('bluepost_last_click');
        if (!lastClickTime) {
          setUnreadCount(Math.min(data.posts.length, 5));
        } else {
          const lastClick = new Date(lastClickTime).getTime();
          const newPosts = data.posts.filter((post) => {
            const postTime = new Date(post.time).getTime();
            return postTime > lastClick;
          });
          setUnreadCount(newPosts.length);
        }
      } catch (e) {
        console.log('BluePosts check failed:', e);
      } finally {
        setBluePostCheckLoading(false);
      }
    };

    checkBluePosts();
  }, []);

  const handleBluePostClick = (url: string) => {
    localStorage.setItem('bluepost_last_click', new Date().toISOString());
    setUnreadCount(0);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const loadAll = async () => {
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
          const runsRes = await fetch(
            `https://raider.io/api/v1/mythic-plus/runs?season=${seasonSlug}&region=world&dungeon=all&affixes=all&page=0`,
          );
          if (!runsRes.ok) throw new Error('runs');
          const runsData: RunsResponse = await runsRes.json();
          setWorldRuns((runsData.rankings ?? []).slice(0, MYTHIC_RANKING_PAGE_SIZE));
          setMythicWorldMoreHref(mythicMoreHrefFromApi(runsData.leaderboard_url, seasonSlug, 'all'));
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
        setRaidEncounters(currentRaid?.encounters ?? []);
        setRaidWorldSlug(currentRaidSlug);
        setRaidTierTitleZh(
          RAID_TIER_TITLE_ZH[currentRaidSlug] ?? currentRaid?.name ?? currentRaid?.short_name ?? '',
        );

        const raidRes = await fetch(
          `https://raider.io/api/v1/raiding/raid-rankings?raid=${currentRaidSlug}&difficulty=mythic&region=world`,
        );
        if (!raidRes.ok) throw new Error('raid-rankings');
        const raidData: RaidResponse = await raidRes.json();
        setRaid((raidData.raidRankings ?? []).slice(0, RAID_RANKING_PAGE_SIZE));
        setRaidUpdatedAt(new Date().toLocaleString('zh-CN', { hour12: false }));
      } catch {
        setErrorRaid(friendlyError);
      } finally {
        setLoadingRaid(false);
      }
    };

    const loadAffixes = async () => {
      setLoadingAffixes(true);
      setErrorAffixes('');
      try {
        const res = await fetch('https://raider.io/api/v1/mythic-plus/affixes?region=cn&locale=zh');
        if (!res.ok) throw new Error('affixes');
        const data: AffixesResponse = await res.json();
        setAffixes(data.affix_details ?? []);
      } catch {
        setErrorAffixes(friendlyError);
        setAffixes([]);
      } finally {
        setLoadingAffixes(false);
      }
    };

    loadAll();
    loadAffixes();
    const timer = window.setInterval(() => {
      loadAll();
      loadAffixes();
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!mythicSeasonSlug) {
      setLoadingDungeonRuns(false);
      return;
    }
    if (!selectedRunDungeon) {
      setDungeonRuns([]);
      setErrorDungeonRuns('');
      setMythicDungeonMoreHref(null);
      setLoadingDungeonRuns(false);
      return;
    }
    if (!selectedRunDungeon.slug) {
      setDungeonRuns([]);
      setErrorDungeonRuns('该地下城暂不支持单独排行查询');
      setLoadingDungeonRuns(false);
      return;
    }

    let cancelled = false;
    const slug = selectedRunDungeon.slug;

    (async () => {
      setLoadingDungeonRuns(true);
      setErrorDungeonRuns('');
      try {
        const runsRes = await fetch(
          `https://raider.io/api/v1/mythic-plus/runs?season=${encodeURIComponent(mythicSeasonSlug)}&region=world&dungeon=${encodeURIComponent(slug)}&affixes=all&page=0`,
        );
        if (!runsRes.ok) throw new Error('dungeon-runs');
        const runsData: RunsResponse = await runsRes.json();
        if (!cancelled) {
          setDungeonRuns((runsData.rankings ?? []).slice(0, MYTHIC_RANKING_PAGE_SIZE));
          setMythicDungeonMoreHref(mythicMoreHrefFromApi(runsData.leaderboard_url, mythicSeasonSlug, slug));
          setRunsUpdatedAt(new Date().toLocaleString('zh-CN', { hour12: false }));
        }
      } catch {
        if (!cancelled) {
          setErrorDungeonRuns(friendlyError);
          setDungeonRuns([]);
        }
      } finally {
        if (!cancelled) setLoadingDungeonRuns(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRunDungeon, mythicSeasonSlug]);

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

  const raiderMythicRunsMoreHref = useMemo(() => {
    const fromState = selectedRunDungeon ? mythicDungeonMoreHref : mythicWorldMoreHref;
    if (fromState) return fromState;
    if (!mythicSeasonSlug) return null;
    if (!selectedRunDungeon?.slug) {
      return `https://raider.io/mythic-plus-rankings/${encodeURIComponent(mythicSeasonSlug)}/all/world/leaderboards`;
    }
    return `https://raider.io/mythic-plus-rankings/${encodeURIComponent(mythicSeasonSlug)}/${encodeURIComponent(selectedRunDungeon.slug)}/world/leaderboards`;
  }, [
    selectedRunDungeon,
    mythicDungeonMoreHref,
    mythicWorldMoreHref,
    mythicSeasonSlug,
  ]);

  const raiderRaidWorldMoreHref = useMemo(
    () =>
      raidWorldSlug
        ? `https://raider.io/${encodeURIComponent(raidWorldSlug)}/rankings/world/mythic/0`
        : null,
    [raidWorldSlug],
  );

  const mythicRunsVisible = selectedRunDungeon ? dungeonRuns : worldRuns;
  const mythicRunsLoading = selectedRunDungeon ? loadingDungeonRuns : loadingRuns;
  const mythicRunsError = selectedRunDungeon ? errorDungeonRuns : errorRuns;

  const mythicRunsTable = (
    <>
      {mythicRunsLoading ? (
        <p className="text-sm text-slate-400">加载中...</p>
      ) : mythicRunsError ? (
        <p className="text-sm text-rose-300">{mythicRunsError}</p>
      ) : mythicRunsVisible.length === 0 ? (
        <p className="text-sm text-slate-500">暂无排行数据</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-2 pr-2">排名</th>
                <th className="text-left py-2 pr-2">地下城</th>
                <th className="text-left py-2 pr-2">层数</th>
                <th className="text-left py-2 pr-2">时间</th>
                <th className="text-left py-2 pr-2">队伍</th>
                <th className="text-right py-2">分数</th>
              </tr>
            </thead>
            <tbody>
              {mythicRunsVisible.map((item) => (
                <tr
                  key={`${item.rank}-${item.run?.mythic_level}-${item.run?.dungeon?.name ?? selectedRunDungeon?.id ?? 'all'}`}
                  className="border-b border-slate-800/60 text-slate-300"
                >
                  <td className="py-2 pr-2">{item.rank}</td>
                  <td className="py-2 pr-2">{toZhDungeon(item.run?.dungeon?.name)}</td>
                  <td className="py-2 pr-2">+{item.run?.mythic_level ?? '-'}</td>
                  <td className="py-2 pr-2">{formatDuration(item.run?.clear_time_ms)}</td>
                  <td className="py-2 pr-2">
                    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                      {[...(item.run?.roster ?? [])]
                        .sort((a, b) => roleOrder(a.role) - roleOrder(b.role))
                        .map((r, idx) => {
                          const cName = r.character?.class?.name ?? '';
                          const charName = r.character?.name ?? '未知';
                          const color = CLASS_COLOR_MAP[cName] ?? '#E2E8F0';
                          return (
                            <span key={`${charName}-${idx}`} style={{ color }}>
                              {charName}
                            </span>
                          );
                        })}
                    </div>
                  </td>
                  <td className="py-2 text-right tabular-nums text-slate-200">{formatRunScore(item.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const raidTable = (
    <>
      {raidTierTitleZh ? (
        <p className="mb-2 text-xs leading-snug text-slate-300 sm:text-sm" title={raidTierTitleZh}>
          <span className="font-semibold text-slate-100">{raidTierTitleZh}</span>
          <span className="font-normal text-slate-500"> · 史诗进度</span>
        </p>
      ) : null}
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
                <th className="text-left py-2 pr-2 min-w-[8rem]">公会</th>
                <th className="text-right py-2 pr-2 whitespace-nowrap">击杀进度</th>
                <th className="text-right py-2 pr-2 whitespace-nowrap">血量 / 阶段</th>
                <th className="text-center py-2 pl-1 min-w-[8rem]">首领</th>
              </tr>
            </thead>
            <tbody>
              {raid.map((item) => {
                const guild = item.guild;
                const gName = guild?.displayName || guild?.name || '-';
                const faction = (guild?.faction || '').toLowerCase();
                const nameColor = GUILD_FACTION_NAME_COLOR[faction] ?? '#E2E8F0';
                const realm = guild?.realm?.altName || guild?.realm?.name || '-';
                const badge = regionBadgeCn(guild?.region);
                const defeatedCount = item.encountersDefeated?.length ?? 0;
                const total = raidTotalBosses || 0;
                const cleared = total > 0 && defeatedCount >= total;
                const wip = getRaidWipPull(item, raidEncounters);
                const pct =
                  wip?.pull.bestPercent != null && wip.pull.bestPercent > 0
                    ? `${wip.pull.bestPercent.toFixed(2)}%`
                    : null;
                const defeatedSlugs = new Set(
                  (item.encountersDefeated ?? []).map((e) => e.slug).filter(Boolean) as string[],
                );
                const guildInner = (
                  <>
                    <span className="font-semibold" style={{ color: nameColor }}>
                      {gName}
                    </span>
                    <div className="mt-0.5 text-[11px] leading-snug text-slate-400">
                      {badge ? `（${badge}）` : ''}
                      {realm}
                    </div>
                  </>
                );
                return (
                  <tr key={`${item.rank}-${gName}`} className="border-b border-slate-800/60 text-slate-300">
                    <td className="py-2 pr-2 align-top tabular-nums text-slate-400">{item.rank}</td>
                    <td className="py-2 pr-2 align-top">
                      {guild?.path ? (
                        <a
                          href={`https://raider.io${guild.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded hover:opacity-90"
                        >
                          {guildInner}
                        </a>
                      ) : (
                        <div>{guildInner}</div>
                      )}
                    </td>
                    <td className="py-2 pr-2 align-top text-right">
                      <span className="inline-flex items-center rounded-md border border-slate-600/90 bg-slate-800/90 px-2 py-0.5 font-semibold text-slate-100 tabular-nums">
                        {defeatedCount}/{total || '-'} M
                      </span>
                    </td>
                    <td
                      className="py-2 pr-2 align-top text-right"
                      title={
                        cleared
                          ? undefined
                          : '血量：Raider.IO 当前首领最佳纪录（剩余血量百分比）。下列为当前首领（中文译名随版本维护）。'
                      }
                    >
                      {cleared ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <>
                          <div className="tabular-nums text-slate-100">
                            {pct ?? <span className="text-slate-500">—</span>}
                          </div>
                          {wip ? (
                            <div
                              className="mt-0.5 max-w-[9rem] truncate text-[10px] text-slate-500 sm:ml-auto"
                              title={toZhRaidEncounter(wip.encounter)}
                            >
                              {toZhRaidEncounter(wip.encounter)}
                            </div>
                          ) : (
                            <div className="mt-0.5 text-[10px] text-slate-500">—</div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="py-2 pl-1 align-top">
                      <div className="flex justify-center gap-0.5 flex-nowrap">
                        {raidEncounters.map((enc) => {
                          if (!enc.slug) return null;
                          const killed = defeatedSlugs.has(enc.slug);
                          const current = wip?.encounter.slug === enc.slug;
                          return (
                            <div
                              key={enc.slug}
                              title={toZhRaidEncounter(enc)}
                              className={[
                                'h-6 w-6 shrink-0 rounded border text-[9px] font-medium leading-6 text-center',
                                killed
                                  ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-200'
                                  : current
                                    ? 'border-sky-500/60 bg-sky-950/35 text-sky-200 ring-1 ring-sky-400/25'
                                    : 'border-slate-700/80 bg-slate-900/60 text-slate-600',
                              ].join(' ')}
                            >
                              {killed ? '✓' : current ? '…' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 md:gap-4 lg:gap-4">
        <div
          className={`${panelCardClass()} order-6 md:order-none md:col-start-1 md:row-start-1 lg:col-span-2 lg:col-start-1 lg:row-start-1 h-full flex flex-col`}
        >
          <h3 className="text-sm font-semibold leading-tight text-slate-100 mb-2">
            <div className="flex items-center gap-1.5">
              <span>📰 最新蓝贴</span>
              {!bluePostCheckLoading && unreadCount > 0 ? (
                <span className="inline-flex h-3.5 min-h-3.5 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </div>
          </h3>
          <p className="text-xs leading-relaxed text-slate-400 mb-3">暴雪官方蓝贴，中文翻译实时更新</p>
          <ul className="flex flex-col gap-2 flex-1 min-h-0">
            {bluePostLinks.map((item) => (
              <li key={item.url}>
                <button
                  type="button"
                  onClick={() => handleBluePostClick(item.url)}
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/35 px-3 py-2.5 text-left transition-all hover:border-amber-500/40 hover:bg-slate-800/55"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/80 group-hover:border-amber-500/30">
                    <ToolSiteIcon url={item.url} fallback={item.fallback} imgClassName="h-6 w-6 object-contain" />
                  </div>
                  <span className="min-w-0 flex-1 text-xs font-semibold text-slate-200 group-hover:text-amber-200 leading-snug">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-3 text-[10px] leading-relaxed text-slate-500 border-t border-slate-800/80">
            数据来源：EXWIND · Blizzard Forums
          </p>
        </div>

        <div
          className={`${panelCardClass()} order-7 md:order-none md:col-start-1 md:row-start-2 lg:col-span-2 lg:col-start-3 lg:row-start-1 h-full flex flex-col`}
        >
          <h3 className="text-sm font-semibold text-slate-100 mb-2">🔥 热议事件</h3>
          <p className="text-xs leading-relaxed text-slate-400 mb-3">魔兽世界社区热门讨论</p>
          <ul className="flex flex-col gap-2 flex-1 min-h-0">
            {hotDiscussionLinks.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/35 px-3 py-2.5 transition-all hover:border-amber-500/40 hover:bg-slate-800/55"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/80 group-hover:border-amber-500/30">
                    <ToolSiteIcon url={item.url} fallback={item.fallback} imgClassName="h-6 w-6 object-contain" />
                  </div>
                  <span className="min-w-0 flex-1 text-xs font-semibold text-slate-200 group-hover:text-amber-200 leading-snug">
                    {item.label}
                  </span>
                  {item.access ? (
                    <span
                      className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700/70"
                      title="国内访问状态：🟢直连流畅 / 🟡直连较慢 / 🔴需翻墙"
                    >
                      {item.access}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-3 text-[10px] text-slate-500 border-t border-slate-800/80">社区讨论入口</p>
        </div>

        <div
          className={`${panelCardClass()} order-1 md:order-none md:col-start-2 md:row-start-1 md:row-span-2 md:self-stretch lg:col-span-2 lg:col-start-5 lg:row-start-1 lg:row-span-1 h-full flex flex-col`}
        >
          <h3 className="text-sm font-semibold text-slate-100 mb-3">⭐ 常用工具</h3>
          <div className="grid grid-cols-3 gap-2 flex-1 content-start">
            {quickTools.map((tool) => (
              <a
                key={tool.url}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                title={toolDescriptionForQuickLink(tool.url) || tool.name}
                className="group flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/40 px-1 py-2.5 text-center transition-all hover:border-amber-500/45 hover:bg-slate-800/70"
                style={{ boxShadow: `inset 0 0 0 1px ${tool.color}22` }}
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/80 group-hover:border-amber-500/30">
                  <ToolSiteIcon url={tool.url} fallback={tool.fallback} imgClassName="h-7 w-7 object-contain" />
                </div>
                <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-slate-200 group-hover:text-amber-200 sm:text-xs">
                  {tool.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div
          className={`${panelCardClass('relative overflow-visible')} order-2 md:order-none md:col-span-2 md:row-start-3 lg:col-span-4 lg:col-start-1 lg:row-start-2`}
        >
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-900/50 p-1">
              <button
                type="button"
                onClick={() => setRankingTab('mythic')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  rankingTab === 'mythic'
                    ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-500/10'
                    : 'border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                大秘境排名
              </button>
              <button
                type="button"
                onClick={() => setRankingTab('raid')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  rankingTab === 'raid'
                    ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-500/10'
                    : 'border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                团本进度排名
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="text-[11px] text-slate-500">
                更新时间：
                {rankingTab === 'mythic' ? runsUpdatedAt || '-' : raidUpdatedAt || '-'}
              </span>
              {rankingTab === 'mythic' && raiderMythicRunsMoreHref ? (
                <a href={raiderMythicRunsMoreHref} target="_blank" rel="noopener noreferrer" className={raiderMoreLinkClass}>
                  更多
                </a>
              ) : null}
              {rankingTab === 'raid' && raiderRaidWorldMoreHref ? (
                <a href={raiderRaidWorldMoreHref} target="_blank" rel="noopener noreferrer" className={raiderMoreLinkClass}>
                  更多
                </a>
              ) : null}
            </div>
          </div>

          <div key={rankingTab} className="animate-panel-fade">
            {rankingTab === 'mythic' ? (
              <div className="space-y-3">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-2 overflow-x-auto overflow-y-visible pb-1">
                  <span className="shrink-0 text-sm font-semibold text-slate-100">本周词缀：</span>
                  {loadingAffixes ? (
                    <span className="text-xs leading-relaxed text-slate-400">加载中…</span>
                  ) : errorAffixes ? (
                    <span className="text-xs leading-relaxed text-rose-400">{errorAffixes}</span>
                  ) : affixes.length === 0 ? (
                    <span className="text-xs leading-relaxed text-slate-400">暂无词缀数据</span>
                  ) : (
                    <div
                      className="flex min-w-0 flex-1 flex-wrap items-baseline gap-y-1 text-sm text-slate-200"
                      role="list"
                      aria-label="本周大秘境词缀"
                    >
                      {affixes.map((affix, index) => {
                        const tip = getAffixTooltipText(affix);
                        return (
                          <span key={affix.id} className="inline-flex shrink-0 items-baseline" role="listitem">
                            {index > 0 ? (
                              <span className="mr-2 select-none text-slate-500" aria-hidden>
                                ·
                              </span>
                            ) : null}
                            <span
                              className="group relative cursor-help border-b border-dotted border-slate-500/60 pb-px transition-colors hover:border-amber-400/55 hover:text-amber-100/95"
                              title={tip}
                            >
                              {toAffixDisplayName(affix.name)}
                              <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 max-w-[min(18rem,calc(100vw-2rem)))] -translate-x-1/2 whitespace-normal rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs leading-relaxed text-slate-200 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                                {tip}
                              </span>
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  {loadingDungeons ? (
                    <p className="text-xs text-slate-500">地下城列表加载中…</p>
                  ) : errorDungeons ? (
                    <p className="text-xs text-rose-400">{errorDungeons}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRunDungeon(null)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          !selectedRunDungeon
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                            : 'border-slate-700/70 bg-slate-800 text-slate-300 hover:border-amber-500/45 hover:bg-slate-700/80 hover:text-amber-200'
                        }`}
                      >
                        全部
                      </button>
                      {dungeons.map((dungeon) => {
                        const active = selectedRunDungeon?.id === dungeon.id;
                        return (
                          <button
                            key={dungeon.id}
                            type="button"
                            onClick={() =>
                              setSelectedRunDungeon((prev) => (prev?.id === dungeon.id ? null : dungeon))
                            }
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              active
                                ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                                : 'border-slate-700/70 bg-slate-800 text-slate-300 hover:border-amber-500/45 hover:bg-slate-700/80 hover:text-amber-200'
                            }`}
                            title={dungeon.name}
                          >
                            {toZhDungeon(dungeon.name)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {mythicRunsTable}
              </div>
            ) : (
              raidTable
            )}
          </div>
        </div>

        <div className="max-lg:contents lg:col-span-2 lg:col-start-5 lg:row-start-2 lg:flex lg:flex-col lg:gap-4">
          <div
            className={`${panelCardClass()} order-3 md:order-none md:col-span-2 md:row-start-4 lg:w-full`}
          >
            <h3 className="text-sm font-semibold text-slate-100 mb-3">🔍 角色分数查询</h3>
            <form
              onSubmit={onQueryCharacter}
              className="flex w-full min-w-0 flex-col gap-2 mb-3 lg:flex-row lg:flex-wrap lg:items-stretch"
            >
              <RealmCombobox
                value={realm}
                onChange={setRealm}
                placeholder="服务器名"
                className="w-full min-w-0 bg-void-dark border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 lg:min-w-0 lg:flex-1"
              />
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="角色名"
                className="w-full min-w-0 bg-void-dark border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 lg:flex-1 lg:basis-0"
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
                <div className="grid grid-cols-2 gap-2 text-sm">
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
              <p className="text-sm text-slate-400">输入服务器和角色名查询分数</p>
            )}
          </div>

          <div
            className={`${panelCardClass()} order-4 md:order-none md:col-span-2 md:row-start-5 lg:w-full`}
          >
            <h3 className="text-sm font-semibold text-slate-100 mb-3">🎬 视频攻略</h3>
            <ul className="flex flex-col gap-2">
              {videoGuides.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/35 px-3 py-2.5 transition-all hover:border-amber-500/40 hover:bg-slate-800/55"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/80 group-hover:border-amber-500/30">
                      <ToolSiteIcon url={item.url} fallback={item.fallback} imgClassName="h-6 w-6 object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-200">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.subtitle}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`${panelCardClass()} order-5 md:order-none md:col-span-2 md:row-start-6 lg:w-full`}
          >
            <h3 className="text-sm font-semibold text-slate-100 mb-3">📺 正在直播</h3>
            <div className="grid grid-cols-4 gap-2">
              {liveStreams.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/40 px-1 py-2 text-center transition-all hover:brightness-110"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${item.color}33`,
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-slate-700/70 bg-slate-900/80 group-hover:border-amber-500/25">
                    <ToolSiteIcon url={item.url} fallback={item.fallback} imgClassName="h-5 w-5 object-contain" />
                  </div>
                  <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-slate-200 sm:text-[11px]">
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
