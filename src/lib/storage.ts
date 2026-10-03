import { scopedStorage } from '@lark-apaas/client-toolkit-lite';

const HISTORY_KEY = 'aipit_history';
const FAVORITES_KEY = 'aipit_favorites';
const PERSONALITY_COLLECTION_KEY = 'aipit_personality_collection';
const REPORTS_KEY = 'aipit_reports';
const TRAP_HEAT_KEY = 'aipit_trap_heat';

export interface IRiskItem {
  id: string;
  trapName: string;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

export interface IRiskResult {
  id: string;
  inputText: string;
  overallLevel: 'high' | 'medium' | 'low';
  conclusion: string;
  riskItems: IRiskItem[];
  reportMarkdown: string;
  createdAt: number;
}

export interface IHistoryItem {
  id: string;
  inputSummary: string;
  overallLevel: 'high' | 'medium' | 'low';
  createdAt: number;
  resultId: string;
  trapIds: string[];
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getHistory(): IHistoryItem[] {
  const raw = scopedStorage.getItem(HISTORY_KEY);
  return safeParse<IHistoryItem[]>(raw, []);
}

export function addHistory(item: IHistoryItem) {
  const list = getHistory();
  list.unshift(item);
  // 最多保留 20 条
  scopedStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 20)));

  // 同步累加套路热度（检测命中）
  if (item.trapIds && item.trapIds.length > 0) {
    item.trapIds.forEach((id) => incrementTrapHeat(id, 'detect'));
  }
}

export function clearHistory() {
  scopedStorage.removeItem(HISTORY_KEY);
}

export function getResult(id: string): IRiskResult | null {
  const raw = scopedStorage.getItem(`aipit_result_${id}`);
  return safeParse<IRiskResult | null>(raw, null);
}

export function saveResult(result: IRiskResult) {
  scopedStorage.setItem(`aipit_result_${result.id}`, JSON.stringify(result));
}

export function getFavorites(): string[] {
  const raw = scopedStorage.getItem(FAVORITES_KEY);
  return safeParse<string[]>(raw, []);
}

export function toggleFavorite(trapId: string): boolean {
  const list = getFavorites();
  const idx = list.indexOf(trapId);
  if (idx >= 0) {
    list.splice(idx, 1);
    scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    return false;
  } else {
    list.push(trapId);
    scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    // 收藏时累加热度
    incrementTrapHeat(trapId, 'favorite');
    return true;
  }
}

export function clearFavorites() {
  scopedStorage.removeItem(FAVORITES_KEY);
}

// ===== 举报踩坑（众包知识库） =====
export interface IReportItem {
  id: string;
  trapType: string;           // 套路类型/名称
  location: string;           // 地点/对象
  description: string;        // 详细描述
  contact?: string;           // 联系方式（可选）
  createdAt: number;
  status: 'pending' | 'verified' | 'rejected';
}

export function getReports(): IReportItem[] {
  const raw = scopedStorage.getItem(REPORTS_KEY);
  return safeParse<IReportItem[]>(raw, []);
}

export function addReport(report: Omit<IReportItem, 'id' | 'createdAt' | 'status'>): IReportItem {
  const list = getReports();
  const item: IReportItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: Date.now(),
    status: 'pending',
    ...report,
  };
  list.unshift(item);
  scopedStorage.setItem(REPORTS_KEY, JSON.stringify(list.slice(0, 50)));

  // 同步累加套路热度
  incrementTrapHeatByName(report.trapType, 'report');

  return item;
}

export function clearReports() {
  scopedStorage.removeItem(REPORTS_KEY);
}

// ===== 套路热度统计 =====
// 热度来源：检测命中（detect） + 举报（report） + 收藏（favorite）
export interface ITrapHeat {
  [trapId: string]: {
    detect: number;
    report: number;
    favorite: number;
    total: number;
  };
}

function recalcTotal(heat: ITrapHeat) {
  Object.values(heat).forEach((h) => {
    // 权重：检测命中x1 + 举报x3 + 收藏x2
    h.total = h.detect * 1 + h.report * 3 + h.favorite * 2;
  });
}

export function getTrapHeat(): ITrapHeat {
  const raw = scopedStorage.getItem(TRAP_HEAT_KEY);
  const heat = safeParse<ITrapHeat>(raw, {});
  recalcTotal(heat);
  return heat;
}

function saveHeat(heat: ITrapHeat) {
  recalcTotal(heat);
  scopedStorage.setItem(TRAP_HEAT_KEY, JSON.stringify(heat));
}

export function incrementTrapHeat(trapId: string, source: 'detect' | 'report' | 'favorite') {
  const heat = getTrapHeat();
  if (!heat[trapId]) {
    heat[trapId] = { detect: 0, report: 0, favorite: 0, total: 0 };
  }
  heat[trapId][source] += 1;
  saveHeat(heat);
}

// 根据套路名称模糊匹配并累加热度（举报时可能只有名称没有id）
export function incrementTrapHeatByName(name: string, source: 'detect' | 'report' | 'favorite') {
  // 这里只存名称作为 key，后续展示时做名称匹配
  const heat = getTrapHeat();
  if (!heat[name]) {
    heat[name] = { detect: 0, report: 0, favorite: 0, total: 0 };
  }
  heat[name][source] += 1;
  saveHeat(heat);
}

// ===== 人格图鉴收集 =====
export interface IPersonalityRecord {
  code: string;
  name: string;
  emoji: string;
  portraitImage: string;
  isHidden: boolean;
  firstUnlockedAt: number;
  count: number; // 测出次数
}

export function getPersonalityCollection(): IPersonalityRecord[] {
  const raw = scopedStorage.getItem(PERSONALITY_COLLECTION_KEY);
  return safeParse<IPersonalityRecord[]>(raw, []);
}

/**
 * 记录一次测出的人格类型，返回是否为新解锁
 */
export function recordPersonality(
  code: string,
  name: string,
  emoji: string,
  portraitImage: string,
  isHidden: boolean,
): { isNew: boolean; record: IPersonalityRecord } {
  const list = getPersonalityCollection();
  const existing = list.find((r) => r.code === code);
  if (existing) {
    existing.count += 1;
    // 画像字段可能在旧数据中缺失，补齐
    if (!existing.portraitImage && portraitImage) {
      existing.portraitImage = portraitImage;
    }
    scopedStorage.setItem(PERSONALITY_COLLECTION_KEY, JSON.stringify(list));
    return { isNew: false, record: existing };
  }
  const record: IPersonalityRecord = {
    code,
    name,
    emoji,
    portraitImage,
    isHidden,
    firstUnlockedAt: Date.now(),
    count: 1,
  };
  list.push(record);
  scopedStorage.setItem(PERSONALITY_COLLECTION_KEY, JSON.stringify(list));
  return { isNew: true, record };
}

export function getPersonalityUnlockedCount(): number {
  return getPersonalityCollection().length;
}

export function clearPersonalityCollection() {
  scopedStorage.removeItem(PERSONALITY_COLLECTION_KEY);
}
