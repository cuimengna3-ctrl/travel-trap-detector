// EXPORTS: ITestQuestion, ITestOption, MOCK_TEST_QUESTIONS
export interface ITestOption {
  id: string
  text: string
  score: number
}

export interface ITestQuestion {
  id: string
  question: string
  options: ITestOption[]
}

export const MOCK_TEST_QUESTIONS: ITestQuestion[] = [
  {
    id: '1',
    question: '你看到"999元云南6天5晚，还送礼品"的广告，第一反应是？',
    options: [
      { id: '1-1', text: '太划算！马上报名', score: 3 },
      { id: '1-2', text: '有点怀疑，但想先问问', score: 2 },
      { id: '1-3', text: '肯定是购物团，直接划走', score: 0 },
    ],
  },
  {
    id: '2',
    question: '旅行社说"到了当地可以免费升级酒店"，但合同里没写，你会？',
    options: [
      { id: '2-1', text: '口头答应就行，人家不会骗我', score: 3 },
      { id: '2-2', text: '有点担心，但也懒得较真', score: 2 },
      { id: '2-3', text: '必须写进合同才放心', score: 0 },
    ],
  },
  {
    id: '3',
    question: '旅行团安排了多个"土特产展销中心"，你觉得？',
    options: [
      { id: '3-1', text: '正好买点伴手礼', score: 3 },
      { id: '3-2', text: '去看看不买就是了', score: 2 },
      { id: '3-3', text: '这就是购物团，果断避雷', score: 0 },
    ],
  },
  {
    id: '4',
    question: '网红景点照特别好看，但你搜不到真实游客照，你会？',
    options: [
      { id: '4-1', text: '相信网图，去了再说', score: 3 },
      { id: '4-2', text: '有点犹豫但还是想去打卡', score: 2 },
      { id: '4-3', text: '大概率货不对板，先观望', score: 0 },
    ],
  },
  {
    id: '5',
    question: '景区门口有"内部通道、不用排队"的人揽客，你会？',
    options: [
      { id: '5-1', text: '省时间，跟着走', score: 3 },
      { id: '5-2', text: '问问价格，合适就去', score: 2 },
      { id: '5-3', text: '肯定是骗子，不理会', score: 0 },
    ],
  },
  {
    id: '6',
    question: '订酒店时看到"特价房不退不换"，你会？',
    options: [
      { id: '6-1', text: '便宜就行，反正我肯定去', score: 3 },
      { id: '6-2', text: '纠结一下，但还是会订', score: 2 },
      { id: '6-3', text: '选可退改的，保险点', score: 0 },
    ],
  },
]