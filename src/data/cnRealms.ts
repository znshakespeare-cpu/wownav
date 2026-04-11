/**
 * 国服常用服务器：Raider.IO 查询用的英文服务器标识 + 中文名（本地模糊匹配）。
 * 未收录的服务器仍可手动输入 Raider 上使用的英文服名。
 */
export interface CnRealmOption {
  slug: string;
  aliases: string[];
}

export const CN_REALM_OPTIONS: CnRealmOption[] = [
  { slug: 'silvermoon', aliases: ['银月'] },
  { slug: 'illidan', aliases: ['伊利丹'] },
  { slug: 'barrens', aliases: ['贫瘠之地', '贫瘠'] },
  { slug: 'icecrown', aliases: ['冰风岗', '冰风'] },
  { slug: 'kingsgorge', aliases: ['国王之谷', '国王'] },
  { slug: 'ansu', aliases: ['安苏'] },
  { slug: 'deathwing', aliases: ['死亡之翼', '死翼'] },
  { slug: 'burning-blade', aliases: ['燃烧之刃', '燃烧'] },
  { slug: 'grim-batol', aliases: ['格瑞姆巴托', '格瑞'] },
  { slug: 'scarlet-crusade', aliases: ['血色十字军', '血色'] },
  { slug: 'echoing-ridge', aliases: ['回音山', '回音'] },
  { slug: 'silver-hand', aliases: ['白银之手', '白银'] },
  { slug: 'the-masters-glaive', aliases: ['主宰之剑', '主宰'] },
  { slug: 'bloodfurnace', aliases: ['血环'] },
  { slug: 'lightninghoof', aliases: ['闪电之刃', '闪电'] },
  { slug: 'skywall', aliases: ['天空之墙'] },
  { slug: 'sunstrider', aliases: ['逐日者'] },
  { slug: 'windrunner', aliases: ['风行者'] },
  { slug: 'whisperwind', aliases: ['轻风之语'] },
  { slug: 'ysera', aliases: ['伊瑟拉'] },
  { slug: 'kelthuzad', aliases: ['克尔苏加德'] },
  { slug: 'dalaran', aliases: ['达拉然'] },
  { slug: 'ragnaros', aliases: ['拉格纳罗斯', '大螺丝'] },
  { slug: 'ravencrest', aliases: ['拉文凯斯'] },
  { slug: 'cenarius', aliases: ['塞纳留斯'] },
  { slug: 'fenris', aliases: ['芬里斯'] },
  { slug: 'norgannon', aliases: ['诺甘农'] },
  { slug: 'shadowmoon', aliases: ['影月'] },
  { slug: 'stormrage', aliases: ['风暴之怒'] },
  { slug: 'thrall', aliases: ['萨尔'] },
  { slug: 'guldan', aliases: ['古尔丹'] },
  { slug: 'hellscream', aliases: ['地狱之石'] },
  { slug: 'uldum', aliases: ['奥丹姆'] },
  { slug: 'zuljin', aliases: ['祖尔金'] },
  { slug: 'lothar', aliases: ['洛萨'] },
  { slug: 'medivh', aliases: ['麦迪文'] },
  { slug: 'khadgar', aliases: ['卡德加'] },
  { slug: 'jaina', aliases: ['吉安娜'] },
  { slug: 'sargeras', aliases: ['萨格拉斯'] },
  { slug: 'proudmoore', aliases: ['普罗德摩尔'] },
  { slug: 'turalyon', aliases: ['图拉扬'] },
  { slug: 'terenas', aliases: ['泰瑞纳斯'] },
  { slug: 'mannoroth', aliases: ['玛诺洛斯'] },
  { slug: 'magtheridon', aliases: ['玛瑟里顿'] },
  { slug: 'kiljaeden', aliases: ['基尔加丹'] },
  { slug: 'nerzhul', aliases: ['耐奥祖'] },
  { slug: 'moonrunner', aliases: ['月魔'] },
  { slug: 'garona', aliases: ['迦罗娜'] },
  { slug: 'dreadmaul', aliases: ['恐怖图腾'] },
  { slug: 'cairne', aliases: ['凯恩'] },
  { slug: 'lightbringer', aliases: ['光明使者'] },
  { slug: 'onyxia', aliases: ['奥妮克希亚'] },
  { slug: 'tichondrius', aliases: ['提克迪奥斯'] },
  { slug: 'wyrmrest-accord', aliases: ['巨龙之吼'] },
  { slug: 'emerald-dream', aliases: ['翡翠梦境'] },
  { slug: 'area-52', aliases: ['五十二区'] },
  { slug: 'blackrock', aliases: ['黑铁'] },
  { slug: 'hyjal', aliases: ['海加尔'] },
  { slug: 'naxxramas', aliases: ['纳克萨玛斯'] },
  { slug: 'uldaman', aliases: ['奥达曼'] },
  { slug: 'ahnqiraj', aliases: ['安其拉'] },
  { slug: 'balnazzar', aliases: ['巴纳扎尔'] },
  { slug: 'bladefist', aliases: ['刃拳'] },
  { slug: 'bonechewer', aliases: ['噬骨者'] },
  { slug: 'burning-legion', aliases: ['燃烧军团'] },
  { slug: 'chromaggus', aliases: ['克洛玛古斯'] },
  { slug: 'daggerspine', aliases: ['匕脊'] },
  { slug: 'destromath', aliases: ['迪瑟洛克'] },
  { slug: 'doomhammer', aliases: ['毁灭之锤'] },
  { slug: 'dragonmaw', aliases: ['龙喉'] },
  { slug: 'drenden', aliases: ['德兰登'] },
  { slug: 'dunemaul', aliases: ['沙丘'] },
  { slug: 'eredar', aliases: ['艾瑞达'] },
  { slug: 'frostwolf', aliases: ['霜狼'] },
  { slug: 'greymane', aliases: ['格雷迈恩'] },
  { slug: 'gurubashi', aliases: ['古拉巴什'] },
  { slug: 'hakkar', aliases: ['哈卡'] },
  { slug: 'kilrogg', aliases: ['基尔罗格'] },
  { slug: 'kirin-tor', aliases: ['肯瑞托'] },
  { slug: 'laughing-skull', aliases: ['嘲颅'] },
  { slug: 'mugthol', aliases: ['穆戈尔'] },
  { slug: 'nefarian', aliases: ['奈法利安'] },
  { slug: 'nozdormu', aliases: ['诺兹多姆'] },
  { slug: 'obsidian', aliases: ['黑曜石'] },
  { slug: 'perenolde', aliases: ['佩诺尔'] },
  { slug: 'queldorei', aliases: ['奎尔多雷'] },
  { slug: 'rexxar', aliases: ['雷克萨'] },
  { slug: 'runetotem', aliases: ['符文图腾'] },
  { slug: 'saurfang', aliases: ['萨鲁法尔'] },
  { slug: 'shadow-council', aliases: ['暗影议会'] },
  { slug: 'shattered-hand', aliases: ['碎手'] },
  { slug: 'skullcrusher', aliases: ['碎颅者'] },
  { slug: 'sporeggar', aliases: ['孢子村'] },
  { slug: 'stonemaul', aliases: ['石槌'] },
  { slug: 'stormreaver', aliases: ['风暴掠夺者'] },
  { slug: 'terokkar', aliases: ['泰罗卡'] },
  { slug: 'thunderhorn', aliases: ['雷角'] },
  { slug: 'twisting-nether', aliases: ['扭曲虚空'] },
  { slug: 'undermine', aliases: ['安德麦'] },
  { slug: 'veknilash', aliases: ['维克尼拉斯'] },
  { slug: 'whisperwind-cn', aliases: ['语风'] },
  { slug: 'wilde', aliases: ['野性'] },
  { slug: 'xavius', aliases: ['萨维斯'] },
];

function norm(s: string) {
  return s.trim().toLowerCase();
}

function fuzzyMatch(text: string, pattern: string): boolean {
  const p = norm(pattern);
  if (!p) return true;
  let i = 0;
  const t = text.toLowerCase();
  for (let j = 0; j < t.length && i < p.length; j++) {
    if (t[j] === p[i]) i++;
  }
  return i === p.length;
}

export function searchCnRealms(query: string, limit = 20): { slug: string; label: string }[] {
  const q = query.trim();
  if (!q) return [];

  const lower = norm(q);
  const scored: { slug: string; label: string; score: number }[] = [];

  for (const r of CN_REALM_OPTIONS) {
    const primaryZh = r.aliases[0] ?? r.slug;
    const label = primaryZh;
    const slugLower = r.slug.toLowerCase();
    const allText = [r.slug, ...r.aliases].join(' ');

    let score = 100;
    if (slugLower === lower) score = 0;
    else if (slugLower.startsWith(lower)) score = 1;
    else if (r.aliases.some((a) => a === q || a.startsWith(q))) score = 2;
    else if (slugLower.includes(lower)) score = 3;
    else if (r.aliases.some((a) => a.includes(q))) score = 4;
    else if (fuzzyMatch(slugLower, q)) score = 5;
    else if (r.aliases.some((a) => fuzzyMatch(a, q))) score = 6;
    else if (fuzzyMatch(allText, q)) score = 7;
    else continue;

    scored.push({ slug: r.slug, label, score });
  }

  scored.sort((a, b) => a.score - b.score || a.label.localeCompare(b.label, 'zh-CN'));
  return scored.slice(0, limit).map(({ slug, label }) => ({ slug, label }));
}
