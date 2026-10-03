// EXPORTS: IDestinationPriceRange, DESTINATION_PRICE_REFERENCE
//
// 目的地 / 线路合理价格区间参考库
// 市场参考价（人民币 / 人），运营可按实际行情校准
//
// 价格基准说明：
// - 价格均为「人均」参考价，单位：元
// - "纯玩团" 通常指当地跟团游（不含出发地往返大交通），价格区间按 2-3 星住宿 + 门票 + 餐 + 导游 估算
// - "高端纯玩" 指 4-5 星住宿 + 小团 + 私导 等升级配置
// - "含往返机票" 指从国内主要城市（北上广深/成都/重庆等）出发的往返经济舱 + 当地接待
// - 价格参考 2024-2025 年市场行情，旺季上浮 20%-30% 属正常
// - "自由行" 指机票 + 酒店 + 门票的自助组合，不含导游和团餐

export interface IDestinationPriceRange {
  destination: string;        // 目的地名称
  aliases?: string[];         // 别名/别称（匹配用）
  routeType: string;          // 线路类型描述
  durationDays: number;       // 典型天数（用于和用户行程天数做比例换算）
  minPrice: number;           // 合理价格区间下限（人均元）
  maxPrice: number;           // 合理价格区间上限（人均元）
  includesFlight: boolean;    // 是否含往返机票
  isHighEnd: boolean;         // 是否为高端团（含星级酒店/小团等）
}

// 市场参考价，运营可按实际行情校准
export const DESTINATION_PRICE_REFERENCE: IDestinationPriceRange[] = [
  // ===== 重庆 =====
  {
    destination: '重庆',
    aliases: ['山城', '洪崖洞'],
    routeType: '市区经典 3 日游（纯玩团，当地参团）',
    durationDays: 3,
    minPrice: 800,
    maxPrice: 1500,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '重庆',
    routeType: '深度 5-7 日游（纯玩团，当地参团）',
    durationDays: 6,
    minPrice: 1500,
    maxPrice: 2800,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '重庆',
    routeType: '深度 7 日游（含往返机票 + 四星酒店）',
    durationDays: 7,
    minPrice: 2500,
    maxPrice: 4500,
    includesFlight: true,
    isHighEnd: false,
  },

  // ===== 成都 =====
  {
    destination: '成都',
    aliases: ['蓉城', '天府'],
    routeType: '市区 3-4 日自由行（机票 + 酒店）',
    durationDays: 4,
    minPrice: 2000,
    maxPrice: 3500,
    includesFlight: true,
    isHighEnd: false,
  },
  {
    destination: '成都',
    routeType: '纯玩 4-5 日跟团（当地参团，含都江堰/青城山/熊猫基地）',
    durationDays: 4,
    minPrice: 1200,
    maxPrice: 2200,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '成都',
    routeType: '6 日高端纯玩团（含往返机票 + 品质酒店 + 三星堆/乐山大佛）',
    durationDays: 6,
    minPrice: 5000,
    maxPrice: 9000,
    includesFlight: true,
    isHighEnd: true,
  },

  // ===== 北京 =====
  {
    destination: '北京',
    aliases: ['京城', '帝都'],
    routeType: '经典 3-4 日纯玩团（当地参团）',
    durationDays: 4,
    minPrice: 1200,
    maxPrice: 2500,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '北京',
    routeType: '5 日游（含往返机票 + 酒店）',
    durationDays: 5,
    minPrice: 2500,
    maxPrice: 4500,
    includesFlight: true,
    isHighEnd: false,
  },

  // ===== 三亚 =====
  {
    destination: '三亚',
    aliases: ['海南', '海口'],
    routeType: '5 日自由行（机票 + 酒店，经济型）',
    durationDays: 5,
    minPrice: 3000,
    maxPrice: 5500,
    includesFlight: true,
    isHighEnd: false,
  },
  {
    destination: '三亚',
    routeType: '5 日高端自由行（机票 + 五星海景酒店）',
    durationDays: 5,
    minPrice: 6000,
    maxPrice: 12000,
    includesFlight: true,
    isHighEnd: true,
  },

  // ===== 云南/丽江/大理/昆明 =====
  {
    destination: '丽江',
    aliases: ['云南', '大理', '昆明', '香格里拉', '西双版纳'],
    routeType: '6 天 5 晚跟团游（当地参团，含丽江/大理/玉龙雪山）',
    durationDays: 6,
    minPrice: 1800,
    maxPrice: 3500,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '丽江',
    routeType: '6 天 5 晚跟团游（含往返机票）',
    durationDays: 6,
    minPrice: 3000,
    maxPrice: 5500,
    includesFlight: true,
    isHighEnd: false,
  },

  // ===== 张家界 =====
  {
    destination: '张家界',
    aliases: ['凤凰', '湘西'],
    routeType: '4-5 日纯玩团（当地参团）',
    durationDays: 5,
    minPrice: 1500,
    maxPrice: 2800,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '张家界',
    routeType: '5 日游（含往返机票 + 酒店）',
    durationDays: 5,
    minPrice: 2800,
    maxPrice: 5000,
    includesFlight: true,
    isHighEnd: false,
  },

  // ===== 西安 =====
  {
    destination: '西安',
    aliases: ['长安', '兵马俑'],
    routeType: '3-4 日纯玩团（当地参团）',
    durationDays: 4,
    minPrice: 900,
    maxPrice: 1800,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '西安',
    routeType: '5 日游（含往返机票 + 酒店）',
    durationDays: 5,
    minPrice: 2200,
    maxPrice: 4000,
    includesFlight: true,
    isHighEnd: false,
  },

  // ===== 杭州 =====
  {
    destination: '杭州',
    aliases: ['西湖', '乌镇', '西塘'],
    routeType: '3-4 日游（当地参团，含乌镇/西湖）',
    durationDays: 4,
    minPrice: 900,
    maxPrice: 1800,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '杭州',
    routeType: '5 日游（含往返机票 + 酒店）',
    durationDays: 5,
    minPrice: 2000,
    maxPrice: 3800,
    includesFlight: true,
    isHighEnd: false,
  },

  // ===== 桂林 =====
  {
    destination: '桂林',
    aliases: ['阳朔', '漓江'],
    routeType: '4-5 日纯玩团（当地参团）',
    durationDays: 5,
    minPrice: 1200,
    maxPrice: 2500,
    includesFlight: false,
    isHighEnd: false,
  },
  {
    destination: '桂林',
    routeType: '5 日游（含往返机票 + 酒店）',
    durationDays: 5,
    minPrice: 2300,
    maxPrice: 4200,
    includesFlight: true,
    isHighEnd: false,
  },

  // ===== 泰国/普吉/曼谷（出境参考）=====
  {
    destination: '泰国',
    aliases: ['普吉', '曼谷', '芭提雅', '清迈'],
    routeType: '6-7 日跟团游（含往返机票）',
    durationDays: 6,
    minPrice: 3500,
    maxPrice: 6500,
    includesFlight: true,
    isHighEnd: false,
  },
];
