// EXPORTS: IPersonalityQuestion, MOCK_PERSONALITY_QUESTIONS, DIMENSIONS, IPersonalityType, PERSONALITY_TYPES, HIDDEN_TYPES
// 4 维度定义
export const DIMENSIONS = [
  {
    key: 'info',
    label: '信息度',
    emoji: '🧭',
    left: { code: 'P', label: '攻略党', desc: '出发前做足功课' },
    right: { code: 'F', label: '随性党', desc: '走到哪算到哪' },
  },
  {
    key: 'risk',
    label: '风险感',
    emoji: '🛡',
    left: { code: 'C', label: '谨慎家', desc: '凡事留个心眼' },
    right: { code: 'A', label: '冒险家', desc: '车到山前必有路' },
  },
  {
    key: 'role',
    label: '角色感',
    emoji: '👥',
    left: { code: 'O', label: '领队', desc: '行程我来安排' },
    right: { code: 'F', label: '跟随者', desc: '跟着走就行' },
  },
  {
    key: 'money',
    label: '消费观',
    emoji: '💰',
    left: { code: 'M', label: '精算师', desc: '每一分钱都要值' },
    right: { code: 'E', label: '体验派', desc: '开心最重要' },
  },
] as const;

export type DimensionKey = 'info' | 'risk' | 'role' | 'money';
export type Polarity = 'left' | 'right';

export interface IPersonalityOption {
  id: string;
  text: string;
  polarity: Polarity; // 该选项指向维度哪一端
}

export interface IPersonalityQuestion {
  id: string;
  dimension: DimensionKey;
  question: string;
  options: [IPersonalityOption, IPersonalityOption];
}

// 20 题，每维度 5 题
export const MOCK_PERSONALITY_QUESTIONS: IPersonalityQuestion[] = [
  // ===== 信息度 (info): 攻略党 P / 随性党 F =====
  {
    id: 'info_1',
    dimension: 'info',
    question: '出发去一个新城市旅行，你通常会？',
    options: [
      { id: 'info_1_l', text: '提前查好景点、餐厅、交通路线，做详细攻略', polarity: 'left' },
      { id: 'info_1_r', text: '订好机票酒店就行，到了当地再说', polarity: 'right' },
    ],
  },
  {
    id: 'info_2',
    dimension: 'info',
    question: '看到网红景点的美图，但搜不到真实游客评价，你会？',
    options: [
      { id: 'info_2_l', text: '翻遍各大平台找实拍照和避雷帖，确认了再去', polarity: 'left' },
      { id: 'info_2_r', text: '先去打卡，踩雷了大不了换地方', polarity: 'right' },
    ],
  },
  {
    id: 'info_3',
    dimension: 'info',
    question: '旅行社发的行程单写得很模糊，你会？',
    options: [
      { id: 'info_3_l', text: '一条条追问清楚，确认每个景点停留时间和购物点', polarity: 'left' },
      { id: 'info_3_r', text: '大概知道去哪就行，细节懒得抠', polarity: 'right' },
    ],
  },
  {
    id: 'info_4',
    dimension: 'info',
    question: '朋友约你明天出发去周边玩，你的第一反应？',
    options: [
      { id: 'info_4_l', text: '等我先查一下路线、门票和天气', polarity: 'left' },
      { id: 'info_4_r', text: '走啊！说走就走才是旅行', polarity: 'right' },
    ],
  },
  {
    id: 'info_5',
    dimension: 'info',
    question: '景区门口有人说"里面在修路，带你走另一条路"，你会？',
    options: [
      { id: 'info_5_l', text: '打开地图搜一下景区公告，核实真假', polarity: 'left' },
      { id: 'info_5_r', text: '跟着走看看，不行再回来', polarity: 'right' },
    ],
  },

  // ===== 风险感 (risk): 谨慎家 C / 冒险家 A =====
  {
    id: 'risk_1',
    dimension: 'risk',
    question: '看到"999元云南6天5晚"的超低价团，你会？',
    options: [
      { id: 'risk_1_l', text: '肯定有坑，直接划走', polarity: 'left' },
      { id: 'risk_1_r', text: '先点进去看看详情，万一是真的呢', polarity: 'right' },
    ],
  },
  {
    id: 'risk_2',
    dimension: 'risk',
    question: '订酒店时，"特价房不退不换"比正常价格便宜一半，你选？',
    options: [
      { id: 'risk_2_l', text: '选可退改的，多花点钱买安心', polarity: 'left' },
      { id: 'risk_2_r', text: '选特价房，反正我肯定去', polarity: 'right' },
    ],
  },
  {
    id: 'risk_3',
    dimension: 'risk',
    question: '景区门口有私人说"内部快速通道，不用排队"，你会？',
    options: [
      { id: 'risk_3_l', text: '大概率是骗子，老老实实排队', polarity: 'left' },
      { id: 'risk_3_r', text: '问问价格，合适就试试', polarity: 'right' },
    ],
  },
  {
    id: 'risk_4',
    dimension: 'risk',
    question: '直播间主播说"免费升级五星酒店"，但合同里没写，你会？',
    options: [
      { id: 'risk_4_l', text: '没写进合同就不算，必须白纸黑字', polarity: 'left' },
      { id: 'risk_4_r', text: '人家大主播不会骗我，口头承诺也行', polarity: 'right' },
    ],
  },
  {
    id: 'risk_5',
    dimension: 'risk',
    question: '陌生人说他是景区工作人员，可以帮你买到内部票，你会？',
    options: [
      { id: 'risk_5_l', text: '不信，官方渠道购票最稳妥', polarity: 'left' },
      { id: 'risk_5_r', text: '他穿得挺像的，说不定真是内部票', polarity: 'right' },
    ],
  },

  // ===== 角色感 (role): 领队 O / 跟随者 F =====
  {
    id: 'role_1',
    dimension: 'role',
    question: '和朋友一起旅行，通常是谁做攻略订行程？',
    options: [
      { id: 'role_1_l', text: '我来安排，朋友跟着走就行', polarity: 'left' },
      { id: 'role_1_r', text: '别人安排好，我跟着玩', polarity: 'right' },
    ],
  },
  {
    id: 'role_2',
    dimension: 'role',
    question: '旅行中发现行程安排有坑，你会？',
    options: [
      { id: 'role_2_l', text: '立刻站出来沟通，想办法调整方案', polarity: 'left' },
      { id: 'role_2_r', text: '看别人怎么处理，跟着走就行', polarity: 'right' },
    ],
  },
  {
    id: 'role_3',
    dimension: 'role',
    question: '报团旅行时，导游临时加自费项目，你会？',
    options: [
      { id: 'role_3_l', text: '当场提出质疑，要求按合同来', polarity: 'left' },
      { id: 'role_3_r', text: '大家都去我也去吧，不想当异类', polarity: 'right' },
    ],
  },
  {
    id: 'role_4',
    dimension: 'role',
    question: '迷路了，手机又没信号，你会？',
    options: [
      { id: 'role_4_l', text: '找人问路、看路牌，自己想办法', polarity: 'left' },
      { id: 'role_4_r', text: '原地等，或者跟着路人走', polarity: 'right' },
    ],
  },
  {
    id: 'role_5',
    dimension: 'role',
    question: '朋友被坑了很生气，你的第一反应是？',
    options: [
      { id: 'role_5_l', text: '帮 TA 维权、投诉、找证据', polarity: 'left' },
      { id: 'role_5_r', text: '安慰一下，吃个饭就算了', polarity: 'right' },
    ],
  },

  // ===== 消费观 (money): 精算师 M / 体验派 E =====
  {
    id: 'money_1',
    dimension: 'money',
    question: '景区里一瓶水卖 10 块，你会？',
    options: [
      { id: 'money_1_l', text: '忍忍，出去再买，凭什么被宰', polarity: 'left' },
      { id: 'money_1_r', text: '渴了就买，出来玩不差这点', polarity: 'right' },
    ],
  },
  {
    id: 'money_2',
    dimension: 'money',
    question: '旅行时你对购物/特产的态度是？',
    options: [
      { id: 'money_2_l', text: '比价再买，避免被宰，只买真需要的', polarity: 'left' },
      { id: 'money_2_r', text: '来都来了，想买就买，开心最重要', polarity: 'right' },
    ],
  },
  {
    id: 'money_3',
    dimension: 'money',
    question: '看到"限时特价、错过不再有"的旅游产品，你会？',
    options: [
      { id: 'money_3_l', text: '先冷静对比一下其他平台价格，不急着下单', polarity: 'left' },
      { id: 'money_3_r', text: '手慢无！赶紧抢了再说', polarity: 'right' },
    ],
  },
  {
    id: 'money_4',
    dimension: 'money',
    question: '网红餐厅排队 2 小时起，你会？',
    options: [
      { id: 'money_4_l', text: '换一家，不值得花这么多时间排队', polarity: 'left' },
      { id: 'money_4_r', text: '来都来了，排！必须吃到', polarity: 'right' },
    ],
  },
  {
    id: 'money_5',
    dimension: 'money',
    question: '导游说"这个景点特别值，强烈推荐自费去"，你会？',
    options: [
      { id: 'money_5_l', text: '先查一下门票价格和评价，值不值再说', polarity: 'left' },
      { id: 'money_5_r', text: '来都来了，去看看', polarity: 'right' },
    ],
  },
];

// ===== 16 种基础人格类型 =====
export interface IPersonalityType {
  code: string; // 4字母代号，如 PCOM
  name: string; // 中文名
  emoji: string;
  portraitImage: string; // low-poly 卡通形象 URL
  slogan: string; // 人设梗
  traits: {
    antiPitLevel: string; // 防坑等级
    commonPit: string; // 容易踩的坑
    bestBuddy: string; // 最适合的旅行搭子
  };
  tips: string[]; // 防坑建议（3 条）
  beatPercent: number; // 基础击败百分比
  isHidden?: boolean;
  rarity?: string;
}

export const PERSONALITY_TYPES: IPersonalityType[] = [
  // ---- P 攻略党 ----
  {
    code: 'PCOM',
    name: '精明团长',
    emoji: '🦊',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxyrycg6fu_ve_miaoda',
    slogan: '做我的朋友旅行只有一个字：爽。攻略我做，雷我踩，你负责玩。',
    traits: {
      antiPitLevel: 'S 级 · 避天花板',
      commonPit: '偶尔因为太自信漏看细节',
      bestBuddy: 'PAFE 潇洒旅伴',
    },
    tips: [
      '你的防坑能力已经很强了，重点警惕"看似合理"的高级套路',
      '做攻略时记得留一手 Plan B，不怕一万就怕万一',
      '带朋友出行时提前给大家打预防针，别让队友拖后腿',
    ],
    beatPercent: 92,
  },
  {
    code: 'PCOE',
    name: '严选领队',
    emoji: '🦁',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxytmtyuju_ve_miaoda',
    slogan: '行程可以不完美，但绝对不能有坑。标准在我这，谁也别想蒙混过关。',
    traits: {
      antiPitLevel: 'A 级 · 火眼金睛',
      commonPit: '对体验项目的溢价容忍度低，容易错过惊喜',
      bestBuddy: 'FCFE 惬意游伴',
    },
    tips: [
      '你的鉴别能力很强，但偶尔会因为抠细节错过好体验',
      '区分"真坑"和"小溢价"，有些钱花出去是买时间和心情',
      '跟团时多留个心眼，合同逐字看，口头承诺一律不算',
    ],
    beatPercent: 85,
  },
  {
    code: 'PCFM',
    name: '谨慎跟班',
    emoji: '🐰',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxy5wchwuw_ve_miaoda',
    slogan: '跟紧靠谱的人，是我最高效的避坑方式。你说东我绝不往西。',
    traits: {
      antiPitLevel: 'B+ 级 · 稳扎稳打',
      commonPit: '如果领队不靠谱，容易一起被坑',
      bestBuddy: 'PCOM 精明团长',
    },
    tips: [
      '选对同行人比做对攻略更重要，跟靠谱的人一起出行',
      '不要全程躺平，关键节点（签合同、付款前）还是要自己把关',
      '遇到拿不准的事多问一句"为什么"，别不好意思',
    ],
    beatPercent: 68,
  },
  {
    code: 'PCFE',
    name: '靠谱陪游',
    emoji: '🐻',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxyu7gqecu_ve_miaoda',
    slogan: '我不做决定，但我管得住钱包。想坑我？门都没有。',
    traits: {
      antiPitLevel: 'B 级 · 守财能手',
      commonPit: '在集体氛围下容易跟着乱花钱',
      bestBuddy: 'PCOE 严选领队',
    },
    tips: [
      '管好钱包就是最大的胜利，你的消费直觉通常是对的',
      '警惕"大家都买了"的从众压力，冷静 10 分钟再决定',
      '提前跟领队约定好预算上限，避免现场被带节奏',
    ],
    beatPercent: 60,
  },
  {
    code: 'PAOM',
    name: '敢闯买手',
    emoji: '🐆',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzlcc3cvs_ve_miaoda',
    slogan: '我敢冒险，但我不傻。值不值得花，心里有杆秤。',
    traits: {
      antiPitLevel: 'B 级 · 胆大心细',
      commonPit: '低估风险时容易栽大跟头',
      bestBuddy: 'FAOM 随性猎手',
    },
    tips: [
      '冒险精神是好事，但涉及大额支出时务必冷静 24 小时',
      '多查一下"XX 骗局""XX 避坑"，负面信息比正面推荐更有价值',
      '给自己设一个"冲动消费上限"，超过就必须做功课',
    ],
    beatPercent: 55,
  },
  {
    code: 'PAOE',
    name: '豪爽领队',
    emoji: '🐯',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzz7y4cdw_ve_miaoda',
    slogan: '出来玩最重要就是开心！……等下，这多少钱？哦没事没事。',
    traits: {
      antiPitLevel: 'C 级 · 钱多人爽',
      commonPit: '各种溢价消费、高价自费项目',
      bestBuddy: 'PCFM 谨慎跟班',
    },
    tips: [
      '开心重要，钱包也重要，建议出发前设个总预算',
      '警惕"来都来了"四个字，它是你钱包最大的敌人',
      '找一个会省钱的朋友一起出行，能帮你把好关',
    ],
    beatPercent: 38,
  },
  {
    code: 'PAFM',
    name: '心大捡漏',
    emoji: '🐱',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxyytkoyes_ve_miaoda',
    slogan: '我这人有个优点：不太会被坑——因为我根本不下单。',
    traits: {
      antiPitLevel: 'B 级 · 佛系避坑',
      commonPit: '错过真·优惠也错过真·坑，五五开',
      bestBuddy: 'PAOM 敢闯买手',
    },
    tips: [
      '心大是你的保护色，但完全不做功课也可能错过好机会',
      '重点保护好个人信息和付款码，不看清楚别乱点',
      '遇到"限时特价"至少等 10 分钟再决定，很多套路怕你冷静',
    ],
    beatPercent: 50,
  },
  {
    code: 'PAFE',
    name: '潇洒旅伴',
    emoji: '🦋',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzojh52lu_ve_miaoda',
    slogan: '人生得意须尽欢，被坑了也是一种体验。……下次还敢。',
    traits: {
      antiPitLevel: 'C- 级 · 优质客户',
      commonPit: '各种坑都可能踩，全凭心情',
      bestBuddy: 'PCOM 精明团长',
    },
    tips: [
      '你是旅行社最喜欢的那种游客，出门一定要带个靠谱的朋友',
      '把大额支付交给更理性的朋友管，能少花很多冤枉钱',
      '记住三个"不要"：不要现场签合同、不要转私人账户、不要买没听说过的特产',
    ],
    beatPercent: 25,
  },

  // ---- F 随性党 ----
  {
    code: 'FCOM',
    name: '佛系管家',
    emoji: '🐼',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzlcc4ils_ve_miaoda',
    slogan: '我不做攻略，但我守得住底线。随便玩可以，被坑不行。',
    traits: {
      antiPitLevel: 'A- 级 · 大智若愚',
      commonPit: '信息不足时容易被专业骗子忽悠',
      bestBuddy: 'PCOE 严选领队',
    },
    tips: [
      '你的直觉很准，但遇到话术特别溜的人要多留个心眼',
      '出发前至少了解一下目的地的"三大坑"，有个心理预期',
      '涉及钱的事一律慢半拍，再急也不差这 10 分钟',
    ],
    beatPercent: 78,
  },
  {
    code: 'FCOE',
    name: '悠闲向导',
    emoji: '🐳',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzr7guasw_ve_miaoda',
    slogan: '不赶路，不省钱，只图舒服。想坑我？你得先过了我的审美这关。',
    traits: {
      antiPitLevel: 'B+ 级 · 品质主义',
      commonPit: '为"品质感"溢价买单的概率高',
      bestBuddy: 'FCOM 佛系管家',
    },
    tips: [
      '你对品质有追求，但"看起来高级"不等于"真的值"',
      '预订前多看几页差评，好评可以刷，差评更真实',
      '不要迷信"五星""高端"这些词，看真实房间照片和位置',
    ],
    beatPercent: 65,
  },
  {
    code: 'FCFM',
    name: '省心跟团',
    emoji: '🐑',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzr7guatw_ve_miaoda',
    slogan: '报团不就是图省心吗？希望这次的团……真的省心。',
    traits: {
      antiPitLevel: 'C 级 · 听天由命',
      commonPit: '低价购物团、强制自费、甩客',
      bestBuddy: 'PCOM 精明团长',
    },
    tips: [
      '跟团前一定要看清楚合同里的"购物点数量"和"自费项目"',
      '低于正常价格 30% 的团基本都是购物团，别心存侥幸',
      '保存好合同和付款凭证，被坑了直接打 12345 投诉',
    ],
    beatPercent: 32,
  },
  {
    code: 'FCFE',
    name: '惬意游伴',
    emoji: '🦦',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzfu7d2jw_ve_miaoda',
    slogan: '旅行的意义就是放空自己。被坑？啊？刚才发生了什么？',
    traits: {
      antiPitLevel: 'D+ 级 · 后知后觉',
      commonPit: '被坑了都没反应过来',
      bestBuddy: 'PCOE 严选领队',
    },
    tips: [
      '出门在外别太信任陌生人，特别是主动搭话的"好心人"',
      '付款前先拍个照发给朋友问问，比你自己判断靠谱',
      '记住：免费的东西最贵，送你的东西迟早要还',
    ],
    beatPercent: 18,
  },
  {
    code: 'FAOM',
    name: '随性猎手',
    emoji: '🦉',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzkhphanw_ve_miaoda',
    slogan: '攻略是什么？走到哪挖到哪。直觉告诉我——这家有坑，走。',
    traits: {
      antiPitLevel: 'B 级 · 野生直觉派',
      commonPit: '直觉失灵时翻车翻得特别彻底',
      bestBuddy: 'PAOM 敢闯买手',
    },
    tips: [
      '你的直觉很准，但纯靠直觉容易在新型套路面前翻车',
      '拿不准的时候搜一下手机，几秒钟的事，别嫌麻烦',
      '多关注当地官方文旅号，比网红推荐靠谱 100 倍',
    ],
    beatPercent: 58,
  },
  {
    code: 'FAOE',
    name: '自由玩家',
    emoji: '🦁‍⬛',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzfu7eagw_ve_miaoda',
    slogan: '被坑也是旅行的一部分——当然，能不被坑还是别被坑。',
    traits: {
      antiPitLevel: 'C- 级 · 随遇而安',
      commonPit: '黑车加价、景区临时加价、餐厅天价菜',
      bestBuddy: 'FCOM 佛系管家',
    },
    tips: [
      '自由行最容易踩"交通"和"吃饭"的坑，打车用正规软件',
      '餐厅点菜前先确认单价和份量，别不好意思',
      '买东西留好小票，有问题直接找市场监管局',
    ],
    beatPercent: 30,
  },
  {
    code: 'FAFM',
    name: '躺平捡漏',
    emoji: '🐢',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzojiaclu_ve_miaoda',
    slogan: '动是不可能动的。坑？坑在哪？我看不见，就等于没有。',
    traits: {
      antiPitLevel: 'C+ 级 · 以静制动',
      commonPit: '因为懒得查证错过好deal，也躲过坑',
      bestBuddy: 'FAOM 随性猎手',
    },
    tips: [
      '"懒"有时候是保护色，但该查的还是得查，比如机票酒店真假',
      '不要在第三方小平台买"特价票"，官方渠道最稳',
      '朋友推荐的也要自己核实一下，朋友也可能被坑过',
    ],
    beatPercent: 42,
  },
  {
    code: 'FAFE',
    name: '放空旅人',
    emoji: '🌸',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzpkikchs_ve_miaoda',
    slogan: '我出来玩就是为了开心。被坑？没事，开心过了。',
    traits: {
      antiPitLevel: 'D 级 · 行走的钱包',
      commonPit: '所有坑都可能踩一遍',
      bestBuddy: 'PCOM 精明团长 + PCOE 严选领队',
    },
    tips: [
      '真诚建议：永远跟避坑大师做朋友，他们会救你的钱包',
      '出门前把信用卡额度调低一点，物理防坑',
      '每天睡前看一眼账单，你会清醒很多',
    ],
    beatPercent: 12,
  },
];

// ===== 4 种稀有隐藏型 =====
export const HIDDEN_TYPES: Array<
  IPersonalityType & { trigger: (scores: Record<DimensionKey, { left: number; right: number }>) => boolean }
> = [
  {
    code: 'ANTI_MASTER',
    name: '反套路之王',
    emoji: '👑',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxy2hnhybu_ve_miaoda',
    slogan: '我走过最远的路，就是你们的套路。想坑我？你还嫩了点。',
    traits: {
      antiPitLevel: 'SSS 级 · 传说中的存在',
      commonPit: '几乎没有，唯一的敌人是无聊',
      bestBuddy: '自己就是最好的搭子',
    },
    tips: [
      '你是旅行圈的反套路天花板，普通人学不来',
      '帮身边的朋友也避避坑吧，拯救一个是一个',
      '警惕新型骗局，再强的反套路能力也架不住骗子创新',
    ],
    beatPercent: 99,
    isHidden: true,
    rarity: '传说级 ✨',
    trigger: (scores) => {
      // 信息度全攻略党 + 风险感全谨慎 = 反套路之王
      return (
        scores.info.left === 5 && scores.risk.left === 5
      );
    },
  },
  {
    code: 'TIANXUAN',
    name: '天选被骗体质',
    emoji: '🎯',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzf76lueu_ve_miaoda',
    slogan: '骗子在茫茫人海中一眼就看到了我——"就你了，看着好骗。"',
    traits: {
      antiPitLevel: 'Z 级 · 骗子灯塔',
      commonPit: '所有坑，一个不落',
      bestBuddy: '反套路之王',
    },
    tips: [
      '你是老天爷赏饭给骗子吃的那种人',
      '出门一定一定要跟避坑大师一起，别自己乱跑',
      '付款前必须经过至少一个朋友同意，建立人工审核机制',
    ],
    beatPercent: 2,
    isHidden: true,
    rarity: '稀有 🌟',
    trigger: (scores) => {
      // 信息度全随性 + 风险感全冒险 = 天选被骗
      return (
        scores.info.right === 5 && scores.risk.right === 5
      );
    },
  },
  {
    code: 'BAIPIAO',
    name: '白嫖战神',
    emoji: '🤑',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzixqpsms_ve_miaoda',
    slogan: '不花钱就是赚。能省一分是一分，羊毛党的终极形态。',
    traits: {
      antiPitLevel: 'S+ 级 · 铁公鸡成精',
      commonPit: '为了省钱反而花更多时间精力',
      bestBuddy: '氪金大佬（带我飞）',
    },
    tips: [
      '你是消费主义的逆行者，白嫖界的标杆人物',
      '警惕"免费"和"0元购"，那是白嫖党的阿克琉斯之踵',
      '有时候花点钱省时间更划算，别把时间都用来省小钱',
    ],
    beatPercent: 97,
    isHidden: true,
    rarity: '稀有 🌟',
    trigger: (scores) => {
      // 消费观全精算师 + 角色感领队 = 白嫖战神
      return (
        scores.money.left === 5 && scores.role.left === 5
      );
    },
  },
  {
    code: 'KEJIN',
    name: '氪金大佬',
    emoji: '💎',
    portraitImage: '/spark/app/app_17f661tmntr/runtime/api/v1/storage/object/bucket_aadkxymx4mamu_static/static%2Faadkxzguss4iu_ve_miaoda',
    slogan: '能用钱解决的问题都不是问题。被坑？那叫交个朋友。',
    traits: {
      antiPitLevel: 'F 级 · 人傻钱多速来',
      commonPit: '所有需要花钱的坑',
      bestBuddy: '白嫖战神（帮我省钱）',
    },
    tips: [
      '有钱是好事，但被人当冤大头就不好了',
      '找一个会持家的旅行搭子，能帮你省出一辆车',
      '大额消费设冷却期：超过 1000 元的东西，第二天再决定买不买',
    ],
    beatPercent: 5,
    isHidden: true,
    rarity: '传说级 ✨',
    trigger: (scores) => {
      // 消费观全体验派 + 风险感全冒险 = 氪金大佬
      return (
        scores.money.right === 5 && scores.risk.right === 5
      );
    },
  },
];

/**
 * 根据答案计算 4 维度得分及人格类型
 */
export function calcPersonality(
  questions: IPersonalityQuestion[],
  answers: Record<string, string>, // questionId -> optionId
): {
  type: IPersonalityType;
  dimensionScores: Record<DimensionKey, { left: number; right: number; leftPercent: number }>;
  isHidden: boolean;
} {
  // 按维度统计左右端得分
  const scores: Record<DimensionKey, { left: number; right: number }> = {
    info: { left: 0, right: 0 },
    risk: { left: 0, right: 0 },
    role: { left: 0, right: 0 },
    money: { left: 0, right: 0 },
  };

  for (const q of questions) {
    const optId = answers[q.id];
    const opt = q.options.find((o) => o.id === optId);
    if (!opt) continue;
    if (opt.polarity === 'left') {
      scores[q.dimension].left++;
    } else {
      scores[q.dimension].right++;
    }
  }

  // 检查隐藏型
  for (const hidden of HIDDEN_TYPES) {
    if (hidden.trigger(scores)) {
      const dimensionScores = buildDimensionScores(scores);
      return { type: hidden, dimensionScores, isHidden: true };
    }
  }

  // 计算 4 字母代号
  const infoCode = scores.info.left >= scores.info.right ? 'P' : 'F';
  const riskCode = scores.risk.left >= scores.risk.right ? 'C' : 'A';
  const roleCode = scores.role.left >= scores.role.right ? 'O' : 'F';
  const moneyCode = scores.money.left >= scores.money.right ? 'M' : 'E';
  const code = infoCode + riskCode + roleCode + moneyCode;

  const type = PERSONALITY_TYPES.find((t) => t.code === code) || PERSONALITY_TYPES[0];
  const dimensionScores = buildDimensionScores(scores);

  return { type, dimensionScores, isHidden: false };
}

function buildDimensionScores(scores: Record<DimensionKey, { left: number; right: number }>) {
  const result: Record<DimensionKey, { left: number; right: number; leftPercent: number }> = {
    info: { left: 0, right: 0, leftPercent: 50 },
    risk: { left: 0, right: 0, leftPercent: 50 },
    role: { left: 0, right: 0, leftPercent: 50 },
    money: { left: 0, right: 0, leftPercent: 50 },
  };

  for (const key of Object.keys(scores) as DimensionKey[]) {
    const total = scores[key].left + scores[key].right || 5;
    result[key] = {
      left: scores[key].left,
      right: scores[key].right,
      leftPercent: Math.round((scores[key].left / total) * 100),
    };
  }

  return result;
}
