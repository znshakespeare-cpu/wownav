import { useEffect, useState } from 'react';

interface AffixItem {
  id: number;
  name: string;
  description?: string;
}

interface RaiderAffixResponse {
  title: string;
  affix_details: AffixItem[];
}

const AFFIX_ZH_MAP: Record<string, string> = {
  Fortified: '强韧',
  Tyrannical: '残暴',
  Raging: '暴怒',
  Bolstering: '激励',
  Sanguine: '血池',
  Bursting: '崩裂',
  Volcanic: '火山',
  Grievous: '重伤',
  Quaking: '震荡',
  Explosive: '易爆',
  Spiteful: '怨毒',
  Storming: '风雷',
  Inspiring: '鼓舞',
  Entangling: '纠缠',
  Afflicted: '受难',
  Incorporeal: '无形',
  Thundering: '雷霆',
  Shrouded: '隐秘',
  Encrypted: '密文',
  Tormented: '折磨',
  Prideful: '傲慢',
  Reaping: '收割',
  Beguiling: '迷醉',
  Teeming: '繁盛',
  Overflowing: '溢出',
  Necrotic: '死疽',
  Skittish: '繁乱',
  Seasonal: '赛季词缀',
  "Xal'atath's Bargain: Devour": "萨拉塔斯的交易：吞噬",
  "Xal'atath's Guile": '萨拉塔斯的诡计',
};

const AFFIX_DESC_ZH_MAP: Record<string, string> = {
  Fortified: '非首领敌人生命值提高，造成的伤害也会提高。',
  Tyrannical: '首领及其爪牙生命值提高，造成的伤害提高。',
  Raging: '非首领敌人在低血量时会进入暴怒状态，造成更多伤害。',
  Bolstering: '非首领敌人死亡时会强化附近敌人，提高其生命和伤害。',
  Sanguine: '非首领敌人死亡后在地面生成血池，治疗敌人并伤害玩家。',
  Bursting: '非首领敌人死亡会叠加持续伤害效果。',
  Volcanic: '战斗中玩家脚下会喷发火山，造成伤害并击飞。',
  Grievous: '受伤玩家会持续流血，直到被治疗至较高生命值。',
  Quaking: '周期性震荡会对附近玩家造成伤害并打断施法。',
  Explosive: '战斗中会出现易爆球，需要尽快击杀。',
  Spiteful: '非首领敌人死亡后会召唤怨毒之影追击玩家。',
  Storming: '战斗中会生成旋风，对玩家造成伤害并击飞。',
  Inspiring: '部分非首领敌人会鼓舞周围单位，使其免疫控制。',
  Entangling: '战斗中会生成缠绕藤蔓，若不及时脱离会被定身。',
  Afflicted: '战斗中出现受难之魂，需要驱散或治疗。',
  Incorporeal: '战斗中出现无形生物，需要控制或驱散。',
  "Xal'atath's Bargain: Devour": '战斗中会出现吞噬裂隙，需要及时处理以避免负面影响。',
  "Xal'atath's Guile": '萨拉塔斯会撤回赐福并强化惩罚效果，死亡会额外扣除时间。',
};

function toChineseName(name: string) {
  if (/[\u4e00-\u9fa5]/.test(name)) return name;
  return AFFIX_ZH_MAP[name] ?? name;
}

function getAffixDescription(affix: AffixItem) {
  if (affix.description && /[\u4e00-\u9fa5]/.test(affix.description)) return affix.description;
  return AFFIX_DESC_ZH_MAP[affix.name] ?? affix.description ?? '暂无词缀说明';
}

export default function WeeklyAffixes() {
  const [affixes, setAffixes] = useState<AffixItem[]>([]);

  useEffect(() => {
    const fetchAffixes = async () => {
      try {
        const res = await fetch('https://raider.io/api/v1/mythic-plus/affixes?region=cn&locale=zh');
        if (!res.ok) return;
        const data: RaiderAffixResponse = await res.json();
        setAffixes(Array.isArray(data.affix_details) ? data.affix_details : []);
      } catch {
        // Keep fallback UI as requested when request fails.
      }
    };

    fetchAffixes();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="bg-void-mid border border-slate-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-base font-semibold text-slate-100 mb-3">⚔️ 本周大秘境词缀</h2>

        {affixes.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pb-1">
            {affixes.map((affix) => (
              <span
                key={affix.id}
                className="group relative inline-flex text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/70 whitespace-nowrap flex-shrink-0"
                title={getAffixDescription(affix)}
              >
                {toChineseName(affix.name)}
                <span className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 w-64 max-w-[80vw] whitespace-normal rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs leading-relaxed text-slate-200 shadow-lg">
                  {getAffixDescription(affix)}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">数据加载中...</p>
        )}
      </div>
    </section>
  );
}
