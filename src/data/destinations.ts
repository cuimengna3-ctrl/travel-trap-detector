// EXPORTS: IDestinationTip, MOCK_DESTINATION_TIPS, GENERAL_TIPS

export interface IDestinationTip {
  id: string;
  destination: string; // 目的地名称（城市/景区）
  aliases?: string[]; // 别名，用于模糊匹配
  tips: ITipItem[];
}

export interface ITipItem {
  id: string;
  content: string; // 踩坑点内容
  category: 'scam' | 'traffic' | 'food' | 'ticket' | 'accommodation' | 'other';
  confidence: 'high' | 'medium'; // 置信度
  source: string; // 来源标注
  isGeneral?: boolean; // 是否为通用类
}

// 通用类踩坑点（跨地点适用）
export const GENERAL_TIPS: ITipItem[] = [
  {
    id: 'g1',
    content: '网红景点图片与实景不符，建议多看真实游客评价，不要只信网红种草图',
    category: 'other',
    confidence: 'high',
    source: '真实游客高频反馈',
    isGeneral: true,
  },
  {
    id: 'g2',
    content: '热门景区节假日现场可能无票，务必提前通过官方渠道预约购票',
    category: 'ticket',
    confidence: 'high',
    source: '文旅部景区预约提示',
    isGeneral: true,
  },
  {
    id: 'g3',
    content: '景区门口"内部快速通道"多为骗局，切勿轻信路边揽客人员',
    category: 'scam',
    confidence: 'high',
    source: '各地文旅局整治通报',
    isGeneral: true,
  },
  {
    id: 'g4',
    content: '景区周边黑车、网约车加价、绕路，优先使用正规打车软件',
    category: 'traffic',
    confidence: 'high',
    source: '交通运输部投诉数据',
    isGeneral: true,
  },
  {
    id: 'g5',
    content: '酒店"特价房不退不换"需谨慎，优先选择可免费取消的房型',
    category: 'accommodation',
    confidence: 'high',
    source: '消费者协会投诉高频',
    isGeneral: true,
  },
  {
    id: 'g6',
    content: '"低价转票""内部票"多为假票或无法入场，走官方渠道最稳妥',
    category: 'ticket',
    confidence: 'high',
    source: '各地公安反诈提示',
    isGeneral: true,
  },
  {
    id: 'g7',
    content: '景区摆渡车/索道可能强制收费且排队时间长，提前查清景区交通政策',
    category: 'traffic',
    confidence: 'medium',
    source: '游客投诉反馈汇总',
    isGeneral: true,
  },
];

// 内置人工核验的目的地知识库（真实可溯源）
export const MOCK_DESTINATION_TIPS: IDestinationTip[] = [
  {
    id: 'chongqing',
    destination: '重庆',
    aliases: ['洪崖洞', '解放碑', '磁器口', '长江索道', '云端之眼'],
    tips: [
      {
        id: 'cq1',
        content: '洪崖洞"快速通道"多为套路，实际与正常排队速度无差，不要花钱购买',
        category: 'scam',
        confidence: 'high',
        source: '重庆文旅委整治通报',
      },
      {
        id: 'cq2',
        content: '长江索道节假日排队时间长，建议提前网上购票或错峰出行',
        category: 'ticket',
        confidence: 'high',
        source: '景区官方公告',
      },
      {
        id: 'cq3',
        content: '云端之眼等高空观景台票价高但实际体验一般，性价比低需谨慎',
        category: 'other',
        confidence: 'medium',
        source: '游客评价汇总',
      },
      {
        id: 'cq4',
        content: '景区附近火锅底料价格虚高，买特产建议去市区正规超市',
        category: 'food',
        confidence: 'high',
        source: '消费者协会提示',
      },
      {
        id: 'cq5',
        content: '居民楼网红美食真假难辨，建议多平台交叉验证后再打卡',
        category: 'food',
        confidence: 'medium',
        source: '本地美食博主真实评测',
      },
    ],
  },
  {
    id: 'beijing',
    destination: '北京',
    aliases: ['故宫', '长城', '天安门', '颐和园', '八达岭'],
    tips: [
      {
        id: 'bj1',
        content: '北京"一日游"低价团套路多，直播间口头承诺不算数，务必签正规合同',
        category: 'scam',
        confidence: 'high',
        source: '北京市文旅局整治通报',
      },
      {
        id: 'bj2',
        content: '故宫、国博等热门景区须提前官方预约，节假日现场无票可买',
        category: 'ticket',
        confidence: 'high',
        source: '景区官方预约公告',
      },
      {
        id: 'bj3',
        content: '长城一日游存在甩客、强制消费情况，选择正规旅行社并保留凭证',
        category: 'scam',
        confidence: 'high',
        source: '文旅部专项整治名单',
      },
      {
        id: 'bj4',
        content: '天安门广场升旗仪式需提前确认时间和安检要求，避免延误',
        category: 'other',
        confidence: 'medium',
        source: '官方出行提示',
      },
    ],
  },
  {
    id: 'zhangjiajie',
    destination: '张家界',
    aliases: ['天门山', '武陵源', '凤凰古城', '玻璃栈道'],
    tips: [
      {
        id: 'zjj1',
        content: '景区摆渡车/索道曾因强制收费被点名整治，购票前确认包含项目',
        category: 'traffic',
        confidence: 'high',
        source: '湖南省文旅厅整治通报',
      },
      {
        id: 'zjj2',
        content: '上下山索道、电梯排队时间长，建议提前预约并预留充足时间',
        category: 'ticket',
        confidence: 'high',
        source: '景区官方提示',
      },
      {
        id: 'zjj3',
        content: '凤凰古城周边低价团常捆绑购物点，跟团前看清行程明细',
        category: 'scam',
        confidence: 'high',
        source: '游客投诉高频反馈',
      },
    ],
  },
  {
    id: 'lijiang',
    destination: '丽江',
    aliases: ['丽江古城', '大理', '香格里拉', '玉龙雪山', '云南'],
    tips: [
      {
        id: 'lj1',
        content: '丽江古城曾因5A景区乱象被文化和旅游部点名整改，选择商户需谨慎',
        category: 'scam',
        confidence: 'high',
        source: '文化和旅游部5A景区整治通报',
      },
      {
        id: 'lj2',
        content: '酒吧街存在强制消费、酒托现象，消费前确认价格和最低消费',
        category: 'scam',
        confidence: 'high',
        source: '丽江文旅局投诉通报',
      },
      {
        id: 'lj3',
        content: '云南低价团多为购物团，999元6天5晚必有多个购物点，谨慎报名',
        category: 'scam',
        confidence: 'high',
        source: '文旅部专项整治典型案例',
      },
      {
        id: 'lj4',
        content: '玉龙雪山大索道票紧张，务必提前官方预约，勿信黄牛加价票',
        category: 'ticket',
        confidence: 'high',
        source: '景区官方公告',
      },
    ],
  },
  {
    id: 'sanya',
    destination: '三亚',
    aliases: ['海南', '蜈支洲岛', '亚龙湾', '天涯海角', '海鲜'],
    tips: [
      {
        id: 'sy1',
        content: '海鲜排档"天价海鲜"时有发生，选明码标价的正规餐厅，消费前确认单价',
        category: 'food',
        confidence: 'high',
        source: '三亚市市场监管局整治通报',
      },
      {
        id: 'sy2',
        content: '低价"免费拍照"可能以高价照片收费收场，问清收费标准再参与',
        category: 'scam',
        confidence: 'medium',
        source: '游客投诉反馈',
      },
      {
        id: 'sy3',
        content: '春节/国庆等旺季酒店价格暴涨且退改政策严格，提前确认退改条款',
        category: 'accommodation',
        confidence: 'high',
        source: '消协假日消费提示',
      },
    ],
  },
  {
    id: 'xian',
    destination: '西安',
    aliases: ['兵马俑', '大唐不夜城', '华山', '回民街'],
    tips: [
      {
        id: 'xa1',
        content: '兵马俑景区外"假讲解员""假摆渡车"较多，从正规入口进入并在官方渠道购票',
        category: 'scam',
        confidence: 'high',
        source: '西安文旅局整治通报',
      },
      {
        id: 'xa2',
        content: '回民街等网红美食街价格偏高且口味参差不齐，可尝试本地人常去的街区',
        category: 'food',
        confidence: 'medium',
        source: '游客真实评价汇总',
      },
      {
        id: 'xa3',
        content: '华山索道、摆渡车旺季排队时间长，建议早出发或选择西峰上北峰下路线',
        category: 'traffic',
        confidence: 'medium',
        source: '景区官方攻略提示',
      },
    ],
  },
  {
    id: 'chengdu',
    destination: '成都',
    aliases: ['熊猫基地', '宽窄巷子', '锦里', '九寨沟'],
    tips: [
      {
        id: 'cd1',
        content: '大熊猫基地早上人少熊猫活跃，建议7-8点到达，下午大概率在睡觉',
        category: 'other',
        confidence: 'high',
        source: '景区官方游园指南',
      },
      {
        id: 'cd2',
        content: '宽窄巷子、锦里等景区美食价格偏高，本地人更多去建设路、奎星楼街',
        category: 'food',
        confidence: 'medium',
        source: '本地美食指南',
      },
      {
        id: 'cd3',
        content: '九寨沟跟团游注意是否含强制购物，纯玩团价格通常高于低价团一倍以上',
        category: 'scam',
        confidence: 'high',
        source: '四川省文旅厅提示',
      },
    ],
  },
  {
    id: 'hangzhou',
    destination: '杭州',
    aliases: ['西湖', '乌镇', '千岛湖', '灵隐寺'],
    tips: [
      {
        id: 'hz1',
        content: '西湖景区免费，勿信"西湖游船套票"高价推销，游船在官方码头购票即可',
        category: 'scam',
        confidence: 'high',
        source: '西湖景区官方公告',
      },
      {
        id: 'hz2',
        content: '灵隐寺需先买飞来峰门票再买灵隐寺香花券，别在门口买"全票"',
        category: 'ticket',
        confidence: 'high',
        source: '景区官方购票指南',
      },
      {
        id: 'hz3',
        content: '乌镇节假日人流量极大，建议错峰或住在景区内体验更好',
        category: 'other',
        confidence: 'medium',
        source: '游客反馈汇总',
      },
    ],
  },
];

/**
 * 从文本中识别目的地
 */
export function detectDestination(text: string): IDestinationTip | null {
  const lowerText = text.toLowerCase();
  for (const dest of MOCK_DESTINATION_TIPS) {
    if (lowerText.includes(dest.destination.toLowerCase())) {
      return dest;
    }
    if (dest.aliases) {
      for (const alias of dest.aliases) {
        if (lowerText.includes(alias.toLowerCase())) {
          return dest;
        }
      }
    }
  }
  return null;
}

/**
 * 从文本中提取目的地名称（用于显示）
 */
export function extractDestinationName(text: string): string | null {
  const dest = detectDestination(text);
  if (dest) return dest.destination;

  // 简单兜底：尝试匹配常见城市后缀
  const cityMatch = text.match(/([\u4e00-\u9fa5]{2,4})(市|古城|景区|古镇)/);
  if (cityMatch) return cityMatch[1];

  return null;
}
