import { MOCK_TRAPS, type ITrap } from '@/data/traps';
import { DESTINATION_PRICE_REFERENCE, type IDestinationPriceRange } from '@/data/priceReference';
import type { IRiskItem } from './storage';

export function levelToText(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return '高风险';
    case 'medium':
      return '中风险';
    case 'low':
      return '低风险';
  }
}

export function levelToColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'text-destructive';
    case 'medium':
      return 'text-warning';
    case 'low':
      return 'text-success';
  }
}

export function levelToBg(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'bg-destructive';
    case 'medium':
      return 'bg-warning';
    case 'low':
      return 'bg-success';
  }
}

export function levelToBgSoft(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'bg-destructive text-destructive-foreground';
    case 'medium':
      return 'bg-warning text-warning-foreground';
    case 'low':
      return 'bg-success text-success-foreground';
  }
}

// 波普风格：风险等级对应的粗边框色（文字色）
export function levelToBorder(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'border-destructive';
    case 'medium':
      return 'border-warning';
    case 'low':
      return 'border-success';
  }
}

/**
 * 根据关键词在信号/名称/描述中匹配套路（确定性规则，结果稳定）
 * 按命中信号数量从高到低排序，命中至少1个信号才算匹配
 * 同时支持价格正则检测：检测到「原价X现仅需Y」「仅需Y元」等超低价模式时，
 * 自动命中「低价购物团」套路，保证低价团不会因目的地不同而漏判。
 *
 * 信号权重分层：
 * - 强信号（直接指向套路本质）：每个 +1 分
 * - 弱信号（常见中性词，需结合其他信号）：每个 +0.3 分
 * - 套路名命中：+2 分
 * - 描述前4字命中：+0.5 分
 * - 价格模式命中：每个 +1.5 分
 *
 * 命中阈值：得分 >= 1.0 才算命中（避免单个弱信号误报）
 */
export function matchTrapsByKeywords(text: string): ITrap[] {
  const normalized = text.toLowerCase();
  const scored = new Map<string, { trap: ITrap; hits: number }>();

  // 1. 套路名命中（权重 2）
  for (const trap of MOCK_TRAPS) {
    if (normalized.includes(trap.name.toLowerCase())) {
      scored.set(trap.id, { trap, hits: 2 });
    }
  }

  // 2. 信号词命中（强信号 +1，弱信号 +0.3，否定语境下再减半）
  for (const trap of MOCK_TRAPS) {
    for (const sig of trap.signals || []) {
      if (!sig) continue;
      const sigLower = sig.toLowerCase();
      const idx = normalized.indexOf(sigLower);
      if (idx === -1) continue;
      let weight = isWeakSignal(sig) ? 0.3 : 1;
      // 否定前缀检测：信号词前 2-4 字内如果有否定词（不/无/没/绝/未/非），权重再减半
      // 例如「绝不强制消费」「无强制消费」「不强制购物」「没有强制消费」
      const prefix = normalized.slice(Math.max(0, idx - 5), idx);
      if (hasNegationPrefix(prefix)) {
        weight *= 0.5;
      }
      const cur = scored.get(trap.id);
      if (cur) {
        cur.hits += weight;
      } else {
        scored.set(trap.id, { trap, hits: weight });
      }
    }
  }

  // 3. 低价模式检测：识别「超低价数字 + 多日游/多晚/一价全含/往返机票」组合
  //    命中则自动追加「低价购物团」高分，避免因目的地不同而漏判
  const lowPricePatterns = detectLowPricePattern(text);
  if (lowPricePatterns.length > 0) {
    const lowPriceTrap = MOCK_TRAPS.find((t) => t.id === '1'); // 低价购物团
    if (lowPriceTrap) {
      const cur = scored.get(lowPriceTrap.id);
      if (cur) {
        cur.hits += lowPricePatterns.length * 1.5;
      } else {
        scored.set(lowPriceTrap.id, { trap: lowPriceTrap, hits: lowPricePatterns.length * 1.5 });
      }
    }
  }

  // 3.5 高价模式检测：解析行程报价，与目的地参考价区间对比
  //      明显超出上限（>1.5 倍）则命中「高价宰客/溢价」套路
  const highPriceInfo = detectHighPricePattern(text);
  if (highPriceInfo) {
    const highPriceTrap = MOCK_TRAPS.find((t) => t.id === '11'); // 高价宰客/溢价
    if (highPriceTrap) {
      // 按溢价倍率给分：1.5-2 倍给 1.5 分（刚够命中），>2 倍给 2.5 分（强信号）
      const ratio = highPriceInfo.price / highPriceInfo.refMaxPrice;
      const score = ratio >= 2 ? 2.5 : 1.5;
      const cur = scored.get(highPriceTrap.id);
      if (cur) {
        cur.hits += score;
      } else {
        scored.set(highPriceTrap.id, { trap: highPriceTrap, hits: score });
      }
    }
  }

  // 4. 描述中关键词命中（权重低，0.5）
  for (const trap of MOCK_TRAPS) {
    if (trap.description && normalized.includes(trap.description.slice(0, 4).toLowerCase())) {
      const cur = scored.get(trap.id);
      if (cur) {
        cur.hits += 0.5;
      } else {
        scored.set(trap.id, { trap, hits: 0.5 });
      }
    }
  }

  const result = Array.from(scored.values())
    .filter((x) => x.hits >= 1.0) // 命中阈值：得分 ≥ 1.0 才算命中
    .sort((a, b) => b.hits - a.hits)
    .map((x) => x.trap);

  return result;
}

/**
 * 判断前缀字符串中是否包含否定词
 * 用于检测「无强制消费」「不强制购物」「绝不强制」「没有强制」这类否定+关键词组合
 */
function hasNegationPrefix(prefix: string): boolean {
  const negationPatterns = [
    '不',
    '无',
    '没',
    '绝',
    '拒',
    '未',
    '非',
    '禁',
    '杜',
    '谢',
    '避',
    '免',
    '零',
    '0',
    '绝对不',
    '绝不',
    '从不',
    '不会',
    '没有',
    '保证不',
    '承诺不',
  ];
  return negationPatterns.some((n) => prefix.endsWith(n) || prefix.includes(n));
}

/**
 * 判断一个信号词是否为「弱信号」——即常见的中性词，单独出现不足以判定为坑
 * 弱信号权重仅 0.3，需要多个弱信号或搭配强信号才会触发命中
 */
function isWeakSignal(sig: string): boolean {
  const weakSignals = new Set([
    // 中性行程描述词（高端团也会有）
    '一价全含',
    '含往返机票',
    '人均',
    '每人',
    '每位',
    '仅需',
    '现仅需',
    '原价',
    '全程门票',
    '专车接送',
    '品质酒店',
    '星级酒店',
    '深度游',
    '纯玩团',
    // 否定伪装词（此地无银三百两，单独出现权重低）
    '无强制消费',
    '不强制购物',
    '0自费',
    '零自费',
    '无购物',
    // 模糊数量词
    '只进',
    '进个',
  ]);
  return weakSignals.has(sig);
}

/**
 * 检测文本中的超低价模式
 * 识别逻辑：
 * - 价格数字 ≤ 1500 元（跟团游人均 7 天左右含机票酒店的合理下限约 2000+）
 * - 且伴随「天/晚/日游/一价全含/往返机票/含机票+酒店+门票」等全包式表述
 * - 或出现「原价X现仅需Y」「原价X现价Y」等大幅降价表述
 */
function detectLowPricePattern(text: string): string[] {
  const patterns: string[] = [];
  const t = text.toLowerCase();

  // 提取所有价格数字（元/块/人民币）
  const priceRegex = /(\d{2,6})(?:元|块钱|块|人民币|rmb|￥)/g;
  const prices: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = priceRegex.exec(text)) !== null) {
    prices.push(parseInt(m[1], 10));
  }

  // 1. 「原价X 现价/现仅需/仅需Y」大幅降价模式（降幅 ≥ 50%）
  const discountRegex = /原价[^\d]{0,6}(\d{2,6})[^\d]{0,10}(?:现价|现仅需|仅需|秒杀价|劲爆价|特价|限时价)[^\d]{0,6}(\d{2,6})/;
  const discountMatch = text.match(discountRegex);
  if (discountMatch) {
    const orig = parseInt(discountMatch[1], 10);
    const now = parseInt(discountMatch[2], 10);
    if (orig > 0 && now > 0 && now / orig <= 0.6) {
      patterns.push('大幅降价');
    }
  }

  // 2. 超低价 + 多日游/全包套餐模式
  //    价格 ≤ 1500 且包含「天X晚/日游/一价全含/往返机票/含机票+酒店」等
  const hasLongItinerary = /(\d+)[天日]\s*(?:\d+)?晚?/.test(text) || /(一价全含|全包|全程包含|全程门票|往返机票|含机票|机票\+酒店|机票+酒店)/.test(t);
  const hasLowPrice = prices.some((p) => p > 0 && p <= 1500);
  const hasPerPersonKeywords = /(人均|每人|每位)/.test(t);

  if (hasLongItinerary && hasLowPrice) {
    patterns.push('超低价全包团');
  } else if (hasPerPersonKeywords && hasLowPrice && prices.some((p) => p <= 800)) {
    // 人均超低价
    patterns.push('人均超低价');
  }

  // 3. 0 元 / 免费游 模式（单独判断，最危险）
  //    注意用 (?:^|[^\d]) 限定前后边界，避免被 1980元/999元 中的 0 误命中
  if (/(?:^|[^\d])0元|免费游|零元|0元购/.test(t)) {
    patterns.push('零元/免费游');
  }

  return patterns;
}

// ===== 高价宰客检测 =====

interface HighPriceDetectionResult {
  price: number;                    // 解析出的报价（人均）
  destination: string;              // 匹配到的目的地
  refMaxPrice: number;              // 参考价上限（按天数比例换算后）
  refMinPrice: number;              // 参考价下限
  refRouteType: string;             // 匹配的线路类型
  ratio: number;                    // 报价 / 参考上限
  includesFlight: boolean;          // 行程是否含往返机票
  durationDays: number;             // 行程天数
}

/**
 * 检测高价宰客 / 溢价模式
 * 逻辑：
 * 1. 从文本中精确解析价格（带前后边界，避免子串误匹配）
 * 2. 识别目的地和行程天数
 * 3. 在参考价库中找最匹配的线路，按天数比例换算合理上限
 * 4. 若报价 > 上限 × 1.5 倍，判定为高价宰客
 *
 * 无法解析价格 / 找不到目的地 / 价格处于合理区间 → 返回 null（不误报）
 */
function detectHighPricePattern(text: string): HighPriceDetectionResult | null {
  // 1. 解析价格（取所有价格中的最高价作为报价，因为低价可能是定金/优惠价）
  const prices = extractPrices(text);
  if (prices.length === 0) return null;

  // 取最大价格作为参考报价（避免定金/尾数干扰）
  const mainPrice = Math.max(...prices);
  // 价格低于 500 的不做高价检测（大概率是门票/单日项目）
  if (mainPrice < 500) return null;

  // 2. 识别目的地
  const matchedDest = matchDestination(text);
  if (!matchedDest) return null;

  // 3. 识别行程天数
  const duration = detectDurationDays(text);
  if (duration < 2) return null; // 太短不算旅游套餐

  // 4. 识别是否含往返机票
  const includesFlight = /(往返机票|含机票|机票\+酒店|机票+酒店|含往返|飞机票|直飞)/.test(text.toLowerCase());

  // 5. 识别是否为高端团（影响参考区间选择）
  //    高端团线索：五星/豪华/私享/私团/定制/奢享/亚特兰蒂斯/海景套房 / 品质酒店/四星级以上/纯玩+多知名景点组合
  const hasLuxuryKeywords = /(高端|豪华|五星|五星级|四星级以上|私享|私团|定制|奢享|海景套房|亚特兰蒂斯|villa|别墅|管家服务|专属导游)/i.test(text);
  // 品质酒店 + 多景点 + 专车接送 等组合也算中高端（不是经济团）
  const hasPremiumComfort = /(品质酒店|星级酒店|四星级|四钻|五钻)/i.test(text);
  const isHighEnd = hasLuxuryKeywords || hasPremiumComfort;

  // 6. 找最匹配的参考线路
  const bestRef = findBestPriceReference(matchedDest, includesFlight, isHighEnd, duration);
  if (!bestRef) return null;

  // 7. 按天数比例换算参考价（线性换算，不精准但够用）
  const dayRatio = duration / bestRef.durationDays;
  const refMin = Math.round(bestRef.minPrice * dayRatio);
  const refMax = Math.round(bestRef.maxPrice * dayRatio);

  // 8. 判定是否明显溢价（>1.5 倍上限）
  const ratio = mainPrice / refMax;
  if (ratio <= 1.5) return null; // 未超过溢价阈值，属正常价格波动

  return {
    price: mainPrice,
    destination: matchedDest,
    refMinPrice: refMin,
    refMaxPrice: refMax,
    refRouteType: bestRef.routeType,
    ratio: Number(ratio.toFixed(2)),
    includesFlight,
    durationDays: duration,
  };
}

/**
 * 从文本中精确提取所有价格数字（单位：元）
 * 使用零宽断言限定数字前后边界，避免「8480元」里的「0元」这类子串误匹配
 */
function extractPrices(text: string): number[] {
  const prices: number[] = [];
  // 匹配规则：
  // - 数字前面不能是数字（避免子串）
  // - 数字后跟「元/块/块钱/人民币/rmb/￥」等单位
  // - 支持「￥」在前的格式
  const regex = /(?:(?<!\d)(\d{2,6})(?:元|块钱|块|人民币|rmb)|￥(\d{2,6})(?!\d))/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const val = parseInt(m[1] || m[2] || '0', 10);
    if (val > 0 && !isNaN(val)) {
      prices.push(val);
    }
  }
  return prices;
}

/**
 * 从文本中识别目的地
 * 遍历参考价库中的目的地 + 别名，找到首个匹配的
 */
function matchDestination(text: string): string | null {
  const t = text.toLowerCase();
  for (const ref of DESTINATION_PRICE_REFERENCE) {
    const names = [ref.destination, ...(ref.aliases || [])];
    for (const name of names) {
      if (t.includes(name.toLowerCase())) {
        return ref.destination;
      }
    }
  }
  return null;
}

/**
 * 识别行程天数（如「7天6晚」「5日游」「3天2夜」）
 * 返回天数，找不到返回 0
 */
function detectDurationDays(text: string): number {
  // 匹配 X天Y晚 / X日游 / X天 / X日 等模式
  const patterns = [
    /(\d+)\s*天\s*(?:\d+\s*晚|\d+\s*夜)?/,
    /(\d+)\s*日(?:游|行|行程)?/,
    /(\d+)day/i,
    /(\d+)nights/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const days = parseInt(m[1], 10);
      if (days >= 1 && days <= 30) return days;
    }
  }
  return 0;
}

/**
 * 从参考价库中找最匹配的线路
 * 优先级：含机票匹配 > 高端匹配 > 天数最接近
 */
function findBestPriceReference(
  destination: string,
  includesFlight: boolean,
  isHighEnd: boolean,
  durationDays: number,
): IDestinationPriceRange | null {
  const candidates = DESTINATION_PRICE_REFERENCE.filter((r) => r.destination === destination);
  if (candidates.length === 0) return null;

  // 按匹配度打分排序
  const scored = candidates.map((r) => {
    let score = 0;
    // 机票是否一致（权重最高）
    if (r.includesFlight === includesFlight) score += 10;
    // 高端属性是否一致
    if (r.isHighEnd === isHighEnd) score += 5;
    // 天数接近度（差值越小越好，最多加 5 分）
    const dayDiff = Math.abs(r.durationDays - durationDays);
    score += Math.max(0, 5 - dayDiff);
    return { ref: r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].ref;
}

/**
 * 根据分类名称从套路库中匹配 ITrap 对象
 */
export function matchTrapsByNames(names: string[]): ITrap[] {
  const result: ITrap[] = [];
  for (const name of names) {
    const n = name.trim();
    if (!n) continue;
    // 精确匹配优先
    let trap = MOCK_TRAPS.find((t) => t.name === n);
    // 双向包含（模糊匹配）
    if (!trap) {
      trap = MOCK_TRAPS.find(
        (t) => n.includes(t.name) || t.name.includes(n),
      );
    }
    // 关键词匹配兜底
    if (!trap) {
      trap = matchTrapsByKeywords(n)[0];
    }
    if (trap && !result.find((r) => r.id === trap.id)) {
      result.push(trap);
    }
  }
  return result;
}

/**
 * 根据匹配到的套路计算整体风险等级
 */
export function calcOverallLevel(traps: ITrap[]): 'high' | 'medium' | 'low' {
  if (traps.length === 0) return 'low';
  const hasHigh = traps.some((t) => t.riskLevel === 'high');
  if (hasHigh) return 'high';
  return 'medium';
}

/**
 * 将 ITrap 转换为 IRiskItem
 */
export function trapsToRiskItems(traps: ITrap[]): IRiskItem[] {
  return traps.map((t) => ({
    id: t.id,
    trapName: t.name,
    riskLevel: t.riskLevel === 'high' ? 'high' : 'medium',
    description: t.description,
    suggestion: t.suggestion,
  }));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
