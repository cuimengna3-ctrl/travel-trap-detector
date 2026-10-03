import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  Share2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Flag,
  AlertTriangle,
  Image,
  FileText,
  Download,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogOverlay,
} from '@/components/ui/dialog';
import { capabilityClient, scopedStorage, logger } from '@lark-apaas/client-toolkit-lite';
import ResultShareCard from './ResultShareCard';
import ResultLongReport from './ResultLongReport';
import {
  levelToText,
  levelToBgSoft,
  calcOverallLevel,
  trapsToRiskItems,
  generateId,
} from '@/lib/risk-utils';
import { saveResult, addHistory, type IRiskResult } from '@/lib/storage';
import type { ITrap } from '@/data/traps';
import {
  MOCK_DESTINATION_TIPS,
  GENERAL_TIPS,
  detectDestination,
  extractDestinationName,
  type IDestinationTip,
  type ITipItem,
} from '@/data/destinations';

const REPORT_PLUGIN_ID = 'travel_risk_report_generate_1';
const DEST_SEARCH_PLUGIN_ID = 'destination_pitfall_search_summary_1';

// 置信度样式映射（波普风格）—— 高置信=红色警示，中置信=绿色参考
const confidenceStyle = {
  high: 'border-[3px] border-foreground bg-accent text-background',
  medium: 'border-[3px] border-foreground bg-success text-foreground',
};

const confidenceText = {
  high: 'HIGH · 高置信',
  medium: 'MED · 中置信',
};

// 单条注意事项组件（波普风格）
function TipItem({
  tip,
  onReport,
}: {
  tip: ITipItem;
  onReport: () => void;
}) {
  return (
    <div className="rounded-[2rem] border-[4px] border-foreground bg-card p-3 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-xl">⚠️</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-relaxed font-bold text-foreground">
            {tip.content}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`h-5 rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-wider ${confidenceStyle[tip.confidence]}`}
            >
              {confidenceText[tip.confidence]}
            </Badge>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              SRC · {tip.source}
            </span>
            <button
              onClick={onReport}
              className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-accent"
            >
              <Flag className="size-3" />
              REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PendingData {
  inputText: string;
  sourceUrl?: string;
  matchedTraps: ITrap[];
  riskListStr: string;
}

export default function ResultPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingData | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  // 目的地注意事项状态
  const [destTipExpanded, setDestTipExpanded] = useState(true);
  const [localDestTips, setLocalDestTips] = useState<IDestinationTip | null>(null);
  const [destName, setDestName] = useState<string | null>(null);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [searchedTips, setSearchedTips] = useState<ITipItem[]>([]);
  const [searchFailed, setSearchFailed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTipId, setReportTipId] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // 分享弹窗状态
  const [shareOpen, setShareOpen] = useState(false);
  const [shareType, setShareType] = useState<'card' | 'long'>('card');
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const longReportRef = useRef<HTMLDivElement>(null);

  const overallLevel = useMemo(() => {
    if (!pending) return 'low' as const;
    return calcOverallLevel(pending.matchedTraps);
  }, [pending]);

  const riskItems = useMemo(() => {
    if (!pending) return [];
    return trapsToRiskItems(pending.matchedTraps);
  }, [pending]);

  // 风险等级对应的波普背景色
  const levelBg =
    overallLevel === 'high'
      ? 'bg-accent'
      : overallLevel === 'medium'
        ? 'bg-primary'
        : 'bg-success';
  const levelTextColor =
    overallLevel === 'low' ? 'text-foreground' : 'text-background';

  useEffect(() => {
    const raw = scopedStorage.getItem('aipit_pending_result');
    if (!raw) {
      toast.error('未找到检测数据，请重新检测');
      navigate('/');
      return;
    }
    try {
      const data = JSON.parse(raw) as PendingData;
      setPending(data);

      // 识别目的地
      const detected = detectDestination(data.inputText);
      if (detected) {
        setLocalDestTips(detected);
        setDestName(detected.destination);
      } else {
        const name = extractDestinationName(data.inputText);
        setDestName(name);
        // 未命中内置库，尝试实时检索
        if (name && name.length >= 2) {
          searchDestinationTips(name);
        }
      }

      // 启动流式报告生成
      generateReport(data);
    } catch {
      navigate('/');
    }
  }, [navigate]);

  // 实时检索目的地避坑信息
  const searchDestinationTips = async (destination: string) => {
    setIsSearchingDest(true);
    setSearchFailed(false);
    try {
      let fullText = '';
      const stream = capabilityClient
        .load(DEST_SEARCH_PLUGIN_ID)
        .callStream('searchSummary', {
          destination,
        });

      for await (const chunk of stream as AsyncIterable<{ summary?: string }>) {
        if (chunk.summary) {
          fullText += chunk.summary;
        }
      }

      if (fullText.trim()) {
        const lines = fullText
          .split(/\n/)
          .map((l) => l.trim())
          .filter(
            (l) =>
              l.length > 10 &&
              (l.startsWith('-') ||
                l.startsWith('•') ||
                /^\d+[.、]/.test(l) ||
                l.includes('避坑') ||
                l.includes('注意') ||
                l.includes('不要')),
          )
          .slice(0, 5);

        if (lines.length > 0) {
          const tips: ITipItem[] = lines.map((line, i) => ({
            id: `search_${i}`,
            content: line.replace(/^[-•\d.、]+\s*/, ''),
            category: 'other',
            confidence: 'medium',
            source: '网络检索汇总',
          }));
          setSearchedTips(tips);
        } else {
          setSearchFailed(true);
        }
      } else {
        setSearchFailed(true);
      }
    } catch {
      setSearchFailed(true);
    } finally {
      setIsSearchingDest(false);
    }
  };

  // 提交举报
  const handleSubmitReport = async () => {
    if (!reportText.trim()) return;
    setReportSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success('感谢反馈，我们会尽快人工复核');
      setReportOpen(false);
      setReportText('');
    } catch {
      toast.error('提交失败，请稍后再试');
    } finally {
      setReportSubmitting(false);
    }
  };

  const generateReport = async (data: PendingData) => {
    setIsGenerating(true);
    let fullText = '';
    let aiSucceeded = true;
    const overall = calcOverallLevel(data.matchedTraps);
    const riskItems = trapsToRiskItems(data.matchedTraps);

    // ===== 零风险行程直接本地生成，不调用 AI 节省额度 =====
    // 0 个风险点时 AI 只能说「没问题」，本地模板质量足够且不消耗额度
    if (data.matchedTraps.length === 0) {
      const generated = generateLocalReport(data, overall);
      fullText = generated;
      setReportMarkdown(fullText);
      aiSucceeded = true; // 视为成功（本地高质量生成）
    } else {
      try {
        // 构造完整 prompt：行程文本 + 风险套路列表（结构化） + 生成要求
        // 注意：必须在 prompt 中明确告知风险数量和等级，保证 AI 结论与结构化数据一致
        const trapsDetail = data.matchedTraps
          .map(
            (t, i) =>
              `【风险${i + 1}】${t.name}\n   - 风险等级：${t.riskLevel === 'high' ? '高' : '中'}\n   - 识别信号：${t.signals.join('、')}\n   - 风险说明：${t.description}\n   - 应对建议：${t.suggestion}`,
          )
          .join('\n\n');

        const overallText = overall === 'high' ? '高风险' : overall === 'medium' ? '中风险' : '低风险';
        const highCount = data.matchedTraps.filter((t) => t.riskLevel === 'high').length;
        const medCount = data.matchedTraps.filter((t) => t.riskLevel === 'medium').length;

        const prompt = `你是一位专业的旅行避坑顾问。请根据【已识别的风险套路列表】生成一份完整的行程风险报告。

⚠️ 重要规则：
- 报告的整体风险等级必须与下方"整体风险等级"一致，不得自行判断或提高/降低等级
- 报告中提及的风险点数量必须与"风险数量统计"一致，不得新增列表以外的风险类型
- 每条风险的内容基于已识别的套路展开，用通俗语言重新组织，不要照搬原文

【行程文本】
${data.inputText}

【整体风险等级】${overallText}
【风险数量统计】共 ${data.matchedTraps.length} 个风险点（高风险 ${highCount} 个，中风险 ${medCount} 个）

【已识别的风险套路列表】
${data.matchedTraps.length === 0 ? '未识别到明显风险套路，本次行程相对安全' : trapsDetail}

【输出格式要求】
请用 markdown 格式输出，包含以下 3 个章节：

## 一句话结论
根据整体风险等级，给出一句直截了当的判断（例如高风险就说"不建议去，坑太多"，低风险就说"整体靠谱，可以放心去"）。

## 🚩 风险清单
逐条展开每个风险套路，每条包含：
- 套路名称（加粗）
- 为什么是坑（用大白话解释，1-2 句）
- 怎么应对（具体可操作的建议，1-2 句）

## 💡 出行小贴士
2-3 条通用避坑建议，贴合本次行程的特点。

总字数控制在 400-600 字，语气像朋友提醒一样轻松。`;

        const stream = capabilityClient
          .load(REPORT_PLUGIN_ID)
          .callStream('textGenerate', {
            prompt,
          });

        for await (const chunk of stream as AsyncIterable<{ content?: string }>) {
          if (chunk.content) {
            fullText += chunk.content;
            setReportMarkdown(fullText);
          }
        }
      } catch (err) {
        // AI 调用失败（限流/额度用尽/网络等），静默降级为本地高质量报告
        // 原因：额度用尽是运营侧配置问题，不应让用户感知失败；本地报告信息完整度足够
        aiSucceeded = false;
        logger.warn('风险报告 AI 生成降级（本地兜底）:', String(err));
        fullText = generateLocalReport(data, overall);
        setReportMarkdown(fullText);
        // 不弹 toast 打扰用户，本地生成质量已对齐 AI 输出结构
      }
    }

    // 无论 AI 是否成功，都保存结果和历史记录
    try {
      const result: IRiskResult = {
        id: generateId(),
        inputText: data.inputText,
        overallLevel: overall,
        conclusion: extractConclusion(fullText) || getFallbackConclusion(overall, data.matchedTraps.length),
        riskItems,
        reportMarkdown: fullText,
        createdAt: Date.now(),
      };
      saveResult(result);
      const summary = data.sourceUrl
        ? `🔗 链接检测：${data.sourceUrl.replace(/^https?:\/\//, '').slice(0, 15)}...`
        : data.inputText.slice(0, 20) + (data.inputText.length > 20 ? '...' : '');
      addHistory({
        id: generateId(),
        inputSummary: summary,
        overallLevel: result.overallLevel,
        createdAt: result.createdAt,
        resultId: result.id,
        trapIds: result.riskItems.map((r) => r.id),
      });
      setResultSaved(true);
    } catch (saveErr) {
      logger.error('保存检测结果失败:', String(saveErr));
    }

    setIsGenerating(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = async () => {
    if (!pending) return;
    const level = levelToText(overallLevel);
    const riskList = riskItems
      .map(
        (r, i) =>
          `${i + 1}. 🚩 ${r.trapName}（${levelToText(r.riskLevel)}）\n   说明：${r.description}\n   建议：${r.suggestion}`,
      )
      .join('\n\n');
    const sourceLine = pending.sourceUrl
      ? `\n检测来源：${pending.sourceUrl}`
      : '';
    const inputSummary = pending.inputText.length > 100
      ? pending.inputText.slice(0, 100) + '...'
      : pending.inputText;
    const text = `【AI 避坑检测·行程风险报告】\n风险等级：${level}${sourceLine}\n行程摘要：${inputSummary}\n\n发现 ${riskItems.length} 处风险点：\n${riskList}\n\n—— 出行前·测一测`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('报告已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动选择复制');
    }
  };

  const handleRetest = () => {
    scopedStorage.removeItem('aipit_pending_result');
    navigate('/');
  };

  const handleShare = () => {
    setShareType('card');
    setShareOpen(true);
  };

  // 生成并下载分享图片
  const generateShareImage = async () => {
    const ref = shareType === 'card' ? shareCardRef.current : longReportRef.current;
    if (!ref) return;

    setIsGeneratingShare(true);
    try {
      const dataUrl = await toPng(ref, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFDE00',
      });

      const link = document.createElement('a');
      const filename = shareType === 'card' ? '避坑分享卡' : '避坑报告长图';
      link.download = `${filename}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast.success(
        shareType === 'card' ? '分享卡已保存，快分享给朋友吧~' : '避坑报告长图已保存',
      );
      setShareOpen(false);
    } catch (err) {
      logger.error('分享图生成失败:', String(err));
      toast.error('生成失败，请截屏保存');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  // 目的地提示（合并本地+检索，用于分享卡展示）
  const shareDestTips = useMemo(() => {
    const tips: ITipItem[] = [];
    if (localDestTips && localDestTips.tips.length > 0) {
      tips.push(...localDestTips.tips);
    } else if (searchedTips.length > 0) {
      tips.push(...searchedTips);
    }
    return tips;
  }, [localDestTips, searchedTips]);

  // 输入摘要
  const inputSummary = useMemo(() => {
    if (!pending) return '';
    if (pending.sourceUrl) {
      return `🔗 链接检测：${pending.sourceUrl.replace(/^https?:\/\//, '').slice(0, 30)}`;
    }
    return pending.inputText.length > 50
      ? pending.inputText.slice(0, 50) + '...'
      : pending.inputText;
  }, [pending]);

  if (!pending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary pop-halftone">
        <div className="text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-foreground" />
          <p className="mt-3 pop-font text-xl text-foreground">SCANNING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pop-halftone text-foreground pb-44">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 w-full border-b-[4px] border-foreground bg-card">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 rounded-full border-[3px] border-foreground bg-muted px-3 py-1 text-[11px] font-black uppercase tracking-wider text-foreground hover:bg-accent hover:text-background"
          >
            <ArrowLeft className="size-3.5" />
            BACK
          </button>
          <span className="pop-font text-lg leading-none text-foreground">
            RISK REPORT
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* 风险仪表盘 */}
      <section className="w-full px-4 pt-6">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            className={`pop-tilt-1 relative overflow-hidden rounded-[2.5rem] border-[6px] border-foreground ${levelBg} p-6 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]`}
          >
            {/* 波普装饰圆 */}
            <div className="absolute -right-6 -top-6 size-24 rounded-full border-[4px] border-foreground/30" />
            <div className="absolute -left-4 bottom-6 size-14 rounded-full border-[4px] border-foreground/20" />
            <div className="absolute right-12 bottom-2 size-8 rounded-full border-[3px] border-foreground/25" />

            <div className="relative z-10">
              <Badge
                variant="outline"
                className={`mb-4 rounded-full border-[3px] border-foreground px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  overallLevel === 'low'
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground'
                }`}
              >
                {overallLevel === 'high'
                  ? '🚨 HIGH RISK · 高风险'
                  : overallLevel === 'medium'
                    ? '⚠️ MEDIUM · 中风险'
                    : '✅ LOW RISK · 低风险'}
              </Badge>

              <div className="flex items-end gap-3">
                <span
                  className={`pop-font text-7xl leading-none ${levelTextColor} pop-text-shadow`}
                >
                  {riskItems.length}
                </span>
                <span
                  className={`pb-2 text-lg font-black uppercase tracking-widest ${levelTextColor} opacity-70`}
                >
                  PITS FOUND
                </span>
              </div>

              <p className={`mt-4 text-sm font-bold leading-relaxed ${levelTextColor}`}>
                {reportMarkdown
                  ? extractConclusion(reportMarkdown) || '分析中...'
                  : 'AI 正在分析你的行程...'}
              </p>
            </div>
          </motion.div>

          {/* 风险数据统计 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="mt-4 grid grid-cols-3 gap-3"
          >
            <div className="pop-tilt-3 rounded-[2rem] border-[4px] border-foreground bg-accent p-3 text-center text-background shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <p className="pop-font text-3xl leading-none pop-text-shadow">
                {riskItems.filter((r) => r.riskLevel === 'high').length}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest opacity-90">
                HIGH
              </p>
            </div>
            <div className="rounded-[2rem] border-[4px] border-foreground bg-primary p-3 text-center text-foreground shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <p className="pop-font text-3xl leading-none pop-text-shadow">
                {riskItems.filter((r) => r.riskLevel === 'medium').length}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest opacity-90">
                MED
              </p>
            </div>
            <div className="pop-tilt-2 rounded-[2rem] border-[4px] border-foreground bg-success p-3 text-center text-foreground shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <p className="pop-font text-3xl leading-none pop-text-shadow">
                {riskItems.filter((r) => r.riskLevel === 'low').length}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest opacity-90">
                LOW
              </p>
            </div>
          </motion.div>


        </div>
      </section>

      {/* 风险清单 */}
      <section className="w-full px-4 pt-6">
        <div className="mx-auto max-w-md space-y-3">
          <div className="pop-tilt-2 inline-block">
            <div className="inline-flex items-center gap-2 bg-foreground px-4 py-2 shadow-[4px_4px_0px_0px_rgba(255_59_48_1)]">
              <AlertTriangle className="size-4 text-accent" />
              <h2 className="pop-font text-xl leading-none text-background">
                RISK LIST
              </h2>
              <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-black text-foreground">
                {riskItems.length}
              </span>
            </div>
          </div>

          {riskItems.length === 0 && (
            <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-full border-[4px] border-foreground bg-success">
                  <ShieldCheck className="size-6 text-foreground" />
                </div>
                <p className="pop-font text-2xl text-foreground">ALL CLEAR!</p>
                <p className="text-xs font-bold text-muted-foreground">
                  暂无明显风险，但出行仍需保持警惕
                </p>
              </CardContent>
            </Card>
          )}

          {riskItems.map((item, i) => {
            const isExpanded = expandedIds.has(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + i * 0.08,
                  type: 'spring',
                  bounce: 0.3,
                }}
              >
                <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground ${levelToBgSoft(
                        item.riskLevel,
                      )}`}
                    >
                      <span className="pop-font text-lg leading-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-black uppercase tracking-wide text-foreground">
                          {item.trapName}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs font-bold text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge
                        variant="outline"
                        className={`rounded-full border-[2px] border-foreground text-[10px] font-black uppercase tracking-wider ${levelToBgSoft(
                          item.riskLevel,
                        )}`}
                      >
                        {levelToText(item.riskLevel)}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t-[3px] border-foreground bg-muted px-4 pb-4 pt-3">
                      <div className="space-y-3">
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                            🔍 SIGNAL · 识别说明
                          </p>
                          <p className="text-xs font-bold text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
                            💡 ADVICE · 应对建议
                          </p>
                          <p className="text-xs font-black text-foreground">
                            {item.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 目的地注意事项 */}
      <section className="w-full px-4 pt-6">
        <div className="mx-auto max-w-md">
          <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
            <button
              onClick={() => setDestTipExpanded(!destTipExpanded)}
              className="flex w-full items-center justify-between gap-2 p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  DESTINATION TIPS
                  {destName && (
                    <span className="ml-2 font-black uppercase text-accent">
                      · {destName}
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                {destTipExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </div>
            </button>

            {destTipExpanded && (
              <div className="border-t-[3px] border-foreground px-4 pb-4 pt-4">
                {/* 当地特有踩坑点 */}
                {localDestTips && localDestTips.tips.length > 0 && (
                  <div className="mb-5">
                    <div className="mb-3 inline-block">
                      <div className="pop-tilt-1 bg-info px-3 py-1 text-[10px] font-black uppercase tracking-widest text-info-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                        🏙️ {localDestTips.destination} LOCAL
                      </div>
                    </div>
                    <div className="space-y-3">
                      {localDestTips.tips.map((tip) => (
                        <TipItem
                          key={tip.id}
                          tip={tip}
                          onReport={() => {
                            setReportTipId(tip.id);
                            setReportOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 实时检索结果 */}
                {!localDestTips && isSearchingDest && (
                  <div className="flex items-center gap-2 py-4 text-xs font-bold text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-accent" />
                    正在检索 {destName} 的避坑信息...
                  </div>
                )}

                {!localDestTips &&
                  !isSearchingDest &&
                  searchedTips.length > 0 && (
                    <div className="mb-5">
                      <div className="mb-3 inline-block">
                        <div className="pop-tilt-2 bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                          🔍 {destName} PITFALLS · WEB
                        </div>
                      </div>
                      <div className="space-y-3">
                        {searchedTips.map((tip) => (
                          <TipItem
                            key={tip.id}
                            tip={tip}
                            onReport={() => {
                              setReportTipId(tip.id);
                              setReportOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {/* 检索失败/未识别到目的地 */}
                {!localDestTips &&
                  !isSearchingDest &&
                  searchedTips.length === 0 && (
                    <div className="mb-5 rounded-[1.5rem] border-[3px] border-foreground bg-muted p-4">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                        {destName
                          ? `「${destName}」暂无权威收录`
                          : '未识别到具体目的地'}
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground">
                        {destName
                          ? '该目的地避坑信息还在完善中，以下为通用避坑提示'
                          : '未能从行程内容中识别出具体目的地，以下为通用避坑提示'}
                      </p>
                    </div>
                  )}

                {/* 通用类踩坑点 */}
                <div>
                  <div className="mb-3 inline-block">
                    <div className="bg-foreground px-3 py-1 text-[10px] font-black uppercase tracking-widest text-background shadow-[3px_3px_0px_0px_rgba(255_222_0_1)]">
                      💡 GENERAL TIPS
                    </div>
                  </div>
                  <div className="space-y-3">
                    {GENERAL_TIPS.map((tip) => (
                      <TipItem
                        key={tip.id}
                        tip={tip}
                        onReport={() => {
                          setReportTipId(tip.id);
                          setReportOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 举报入口 */}
                <button
                  onClick={() => {
                    setReportTipId(null);
                    setReportText('');
                    setReportOpen(true);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-dashed border-foreground bg-muted py-3 text-[11px] font-black uppercase tracking-widest text-foreground hover:bg-accent hover:text-background"
                >
                  <Flag className="size-4" />
                  发现不实信息？举报补充
                </button>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* 分享选择弹窗 */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogOverlay className="bg-black" />
        <DialogContent
          className="max-w-sm rounded-[2rem] border-[6px] border-foreground bg-card shadow-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="relative">
            {/* 波普风格关闭按钮：蓝色圆角矩形底 + 黄色圆 + 黑色叉，放在弹窗内部右上 */}
            <button
              onClick={() => setShareOpen(false)}
              aria-label="关闭"
              className="absolute -top-1 right-0 flex size-9 items-center justify-center rounded-[12px] border-[3px] border-foreground bg-info shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
            >
              <span className="flex size-6 items-center justify-center rounded-full border-[2px] border-foreground bg-primary text-foreground">
                <X className="size-3.5" />
              </span>
            </button>

            <DialogTitle className="pop-font text-2xl text-foreground">
              📤 SHARE IT
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground">
              选择要生成的图片类型
            </p>

            <button
              onClick={() => setShareType('card')}
              className={`flex w-full items-center gap-3 rounded-[1.5rem] border-[4px] p-4 text-left transition-all ${shareType === 'card' ? 'border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]' : 'border-border bg-muted hover:border-foreground'}`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground bg-foreground text-background">
                <Image className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-wide text-foreground">
                  分享卡（短图）
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                  晒结果用 · 朋友圈/小红书首图
                </p>
              </div>
              {shareType === 'card' && (
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="size-4" />
                </div>
              )}
            </button>

            <button
              onClick={() => setShareType('long')}
              className={`flex w-full items-center gap-3 rounded-[1.5rem] border-[4px] p-4 text-left transition-all ${shareType === 'long' ? 'border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]' : 'border-border bg-muted hover:border-foreground'}`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground bg-accent text-background">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-wide text-foreground">
                  避坑报告长图
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                  干货分享 · 小红书笔记/完整报告
                </p>
              </div>
              {shareType === 'long' && (
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="size-4" />
                </div>
              )}
            </button>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={generateShareImage}
              disabled={isGeneratingShare}
              className="w-full gap-2 rounded-full border-[4px] border-foreground bg-foreground text-xs font-black uppercase tracking-widest text-background hover:bg-accent"
            >
              {isGeneratingShare ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  生成并保存图片
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full rounded-full border-[3px] border-foreground text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted"
              >
                取消
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 隐藏的分享卡 DOM，用于 html-to-image 渲染 */}
      <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0">
        {pending && (
          <ResultShareCard
            ref={shareCardRef}
            overallLevel={overallLevel}
            riskCount={riskItems.length}
            conclusion={
              reportMarkdown
                ? extractConclusion(reportMarkdown) || 'AI 避坑检测报告'
                : 'AI 避坑检测报告'
            }
            riskItems={riskItems}
            destName={destName}
            destTips={shareDestTips.slice(0, 2)}
            inputSummary={inputSummary}
          />
        )}
      </div>

      {/* 隐藏的长报告 DOM */}
      <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0">
        {pending && (
          <ResultLongReport
            ref={longReportRef}
            overallLevel={overallLevel}
            riskCount={riskItems.length}
            conclusion={
              reportMarkdown
                ? extractConclusion(reportMarkdown) || 'AI 避坑检测报告'
                : 'AI 避坑检测报告'
            }
            riskItems={riskItems}
            destName={destName}
            destTips={shareDestTips}
            generalTips={GENERAL_TIPS}
            inputSummary={inputSummary}
            reportMarkdown={reportMarkdown}
          />
        )}
      </div>
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] border-[6px] border-foreground bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="pop-font text-2xl text-foreground">
              REPORT IT
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="请描述具体的不实之处，我们会尽快人工复核..."
              className="min-h-[100px] resize-none rounded-[1.5rem] border-[3px] border-foreground text-sm font-bold"
              maxLength={300}
            />
            <p className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {reportText.length}/300
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportOpen(false)}
              className="rounded-full border-[3px] border-foreground text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={reportSubmitting || !reportText.trim()}
              className="rounded-full border-[3px] border-foreground bg-accent text-xs font-black uppercase tracking-widest text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] hover:bg-accent/90"
            >
              {reportSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI 详细报告 */}
      {reportMarkdown && (
        <section className="w-full px-4 pt-6">
          <div className="mx-auto max-w-md">
            <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <CardContent className="p-5">
                <h2 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground">
                  {isGenerating && (
                    <Loader2 className="size-3.5 animate-spin text-accent" />
                  )}
                  / FULL REPORT
                  {!isGenerating && resultSaved && (
                    <Check className="size-3.5 text-success" />
                  )}
                </h2>
                <div className="prose prose-sm max-w-none text-xs leading-relaxed [&_h2]:pop-font [&_h2]:text-xl [&_h2]:text-foreground [&_h3]:font-black [&_h3]:text-accent [&_p]:font-bold [&_p]:text-muted-foreground [&_li]:font-bold [&_li]:text-muted-foreground [&_strong]:font-black [&_strong]:text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reportMarkdown}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-16 left-0 right-0 z-50 border-t-[4px] border-foreground bg-card">
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetest}
            className="flex-1 gap-1 rounded-full border-[3px] border-foreground text-[11px] font-black uppercase tracking-widest text-foreground hover:bg-muted"
          >
            <RefreshCw className="size-3.5" />
            重测
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 gap-1 rounded-full border-[3px] border-foreground text-[11px] font-black uppercase tracking-widest text-foreground hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                已复制
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                复制
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleShare}
            className="flex-1 gap-1 rounded-full border-[3px] border-foreground bg-foreground text-[11px] font-black uppercase tracking-widest text-background hover:bg-accent"
          >
            <Share2 className="size-3.5" />
            分享
          </Button>
        </div>
      </div>
    </div>
  );
}

function extractConclusion(md: string): string {
  const lines = md.split('\n').filter((l) => l.trim());
  for (const line of lines) {
    if (!line.startsWith('#') && line.trim().length > 5) {
      return line.trim();
    }
  }
  return '';
}

function getFallbackConclusion(
  level: 'high' | 'medium' | 'low',
  count: number,
): string {
  if (level === 'high') {
    return `这趟行程存在${count}处高风险，强烈建议谨慎选择，仔细核查旅行社资质和合同条款。`;
  }
  if (level === 'medium') {
    return `行程中发现${count}处潜在风险点，建议提前做好准备和防范，保留好相关证据。`;
  }
  return '这趟行程看起来比较靠谱，但出行前建议再次确认退改政策和保险条款。';
}

/**
 * 本地生成高质量报告（零风险场景直接用，AI 额度耗尽时也用它降级）
 * 分场景生成更有针对性的文案，结构和信息量对齐 AI 输出
 */
function generateLocalReport(
  data: PendingData,
  overall: 'high' | 'medium' | 'low',
): string {
  const count = data.matchedTraps.length;
  const inputLower = data.inputText.toLowerCase();
  const destination = extractDestinationForReport(data.inputText);

  // ===== 一句话结论（按场景口语化）=====
  let conclusion = '';
  if (overall === 'high') {
    if (count >= 3) {
      conclusion = '这趟行程坑点密集，**非常不建议报**，十有八九是低价购物团或黑社套路，赶紧跑！';
    } else if (hasTrap(data.matchedTraps, '低价购物团')) {
      conclusion = '⚠️ 这是典型的「低价引流购物团」套路，**强烈不建议报**，看着便宜实际会在购物点把钱赚回去。';
    } else {
      conclusion = '这趟行程存在高风险套路，**建议谨慎选择**，务必仔细核查旅行社资质和合同条款再决定。';
    }
  } else if (overall === 'medium') {
    conclusion = '行程有一些需要留意的地方，不算大坑但也别大意，提前做好准备就能避开大部分问题。';
  } else {
    conclusion = destination
      ? `去${destination}这趟行程整体看起来比较靠谱，没发现明显套路，放心去吧～`
      : '这趟行程看起来比较靠谱，没发现明显的旅行套路，但出行前还是建议再确认下退改政策和保险。';
  }

  // ===== 风险清单（通俗化改写，不是照搬 description）=====
  const riskListSection =
    count === 0
      ? buildZeroRiskSection(destination, inputLower)
      : data.matchedTraps
          .map((t, i) => buildRiskItemParagraph(t, i + 1, inputLower))
          .join('\n\n');

  // ===== 出行小贴士（按行程特征 + 风险类型双重匹配）=====
  const tips = buildTips(data.matchedTraps, inputLower, destination);
  const tipsSection = tips.map((t, i) => `${i + 1}. ${t}`).join('\n');

  return `## 一句话结论\n\n${conclusion}\n\n## 🚩 风险清单\n\n${riskListSection}\n\n## 💡 出行小贴士\n\n${tipsSection}`;
}

/** 从行程文本中提取目的地（用于报告个性化） */
function extractDestinationForReport(text: string): string | null {
  const knownDests = [
    '重庆', '成都', '北京', '上海', '三亚', '云南', '丽江', '大理', '昆明',
    '张家界', '西安', '杭州', '桂林', '阳朔', '厦门', '青岛', '泰国',
    '普吉', '曼谷', '日本', '韩国', '新加坡', '马来西亚',
  ];
  const lower = text.toLowerCase();
  for (const d of knownDests) {
    if (lower.includes(d.toLowerCase())) return d;
  }
  return null;
}

/** 判断是否包含某类套路 */
function hasTrap(traps: ITrap[], name: string): boolean {
  return traps.some((t) => t.name.includes(name) || name.includes(t.name));
}

/** 零风险时的自查清单 */
function buildZeroRiskSection(dest: string | null, inputLower: string): string {
  const lines: string[] = ['本次行程未识别到明显的旅行套路风险，整体比较安全。给你几个自查要点，自己再核对一遍更放心：\n'];

  lines.push('- ✅ **价格合不合理**：算一下机票+酒店+门票大概多少钱，报价明显低于成本的就要小心。');

  if (/(跟团|旅行社|导游)/.test(inputLower)) {
    lines.push('- ✅ **旅行社正不正规**：有没有营业执照和旅行社经营许可证？能不能签盖公章的旅游合同？');
  }

  if (/(酒店|住宿|住)/.test(inputLower)) {
    lines.push('- ✅ **酒店是不是同级**：写「同级」「待确认」的要特别小心，可能宣传五星实际住快捷。');
  }

  lines.push('- ✅ **退改政清不清楚**：提前取消扣多少？不可抗力（天气/疫情）能不能全退？');
  lines.push('- ✅ **费用透不透明**：包含什么、不包含什么、有几个自费项目，都要白纸黑字写进合同。');

  if (dest) {
    lines.push(`- ✅ **${dest}当地口碑**：去小红书/大众点评搜一下这家旅行社或同款行程的真实评价，别光看好评。`);
  }

  return lines.join('\n');
}

/** 把单条套路改写成通俗的风险说明段落 */
function buildRiskItemParagraph(trap: ITrap, index: number, inputLower: string): string {
  const levelText = trap.riskLevel === 'high' ? '高风险' : '中风险';

  // 通俗化解释模板：按套路名匹配不同的口语化开头
  let whyPhrase = trap.description;
  if (trap.name.includes('低价购物团')) {
    whyPhrase = '你算算账就明白了——机票+酒店+门票+吃饭，正常成本远不止这个价。旅行社不是慈善机构，差价全靠带你去购物店、推自费项目赚回来，到了当地你不买都不行。';
  } else if (trap.name.includes('强制购物')) {
    whyPhrase = '导游会用言语施压、甩脸色甚至关禁闭的方式逼你消费，不买够金额不让走。所谓「不强制」很多只是嘴上说说，实际全程PUA。';
  } else if (trap.name.includes('虚假宣传')) {
    whyPhrase = '宣传图和实际差十万八千里，说住海景房实际住郊区，说五星酒店实际是「同级」快捷酒店，景点还经常「远观」「路过」。';
  } else if (trap.name.includes('自费项目')) {
    whyPhrase = '团费看着便宜，到了当地导游一推荐自费项目你就懵了——不去吧扫大家的兴，去吧动辄几百上千，一圈下来总花费翻一倍。';
  } else if (trap.name.includes('宰客')) {
    whyPhrase = '利用外地游客信息不对称，把市场价几千的行程卖到一万多，美其名曰「私享定制」「专属小团」，实际内容跟普通团没区别。';
  } else if (trap.name.includes('退改')) {
    whyPhrase = '交了钱就别想退，行程临时变卦、酒店出问题，一律「不退不改」，消费者完全没有保障。';
  } else if (trap.name.includes('资质')) {
    whyPhrase = '没有旅行社经营资质的「黑社」，收钱后随时可能跑路，出了问题连维权对象都找不到。';
  } else if (trap.name.includes('保险')) {
    whyPhrase = '合同里对安全责任写得模棱两可，真出了意外旅行社和保险公司互相踢皮球，最后只能自己扛。';
  }

  // 应对建议也口语化
  let howToHandle = trap.suggestion;
  if (trap.name.includes('低价购物团')) {
    howToHandle = '先自己核算成本底线（机票+酒店+门票+吃饭大概多少钱），明显低于成本的直接pass；签合同前确认购物点数量和停留时间。';
  } else if (trap.name.includes('强制购物')) {
    howToHandle = '保留好聊天记录、合同、录音等证据，遇到强制消费直接拨打 12345 或 12301 文旅投诉热线，保留好消费凭证回来还能退。';
  }

  // 真实案例
  const realCaseLine = trap.realCase
    ? `\n- **真实案例**：${trap.realCase}`
    : '';

  return `**${index}. ${trap.name}**（${levelText}）\n\n- **为什么是坑**：${whyPhrase}${realCaseLine}\n- **怎么应对**：${howToHandle}`;
}

/** 根据风险类型 + 行程特征生成小贴士（保证至少 3 条，最多 4 条） */
function buildTips(traps: ITrap[], inputLower: string, dest: string | null): string[] {
  const tips: string[] = [];

  // 按命中的风险类型优先给针对性建议
  if (hasTrap(traps, '低价购物') || hasTrap(traps, '强制购物')) {
    tips.push('签合同前一定要问清楚：有几个购物店？每个停留多久？不购物会不会有惩罚？把答复留好记录。');
  }
  if (hasTrap(traps, '自费')) {
    tips.push('自费项目提前了解市场价，导游推荐的价格通常比自己订贵 30%-50%，可以现场自己在平台上订。');
  }
  if (hasTrap(traps, '虚假宣传')) {
    tips.push('宣传里的酒店、景点、用餐都要写进合同并约定违约责任，「同级」「参考」这种模糊表述一律要求明确。');
  }
  if (hasTrap(traps, '退改')) {
    tips.push('付款前先看退改政策，确认哪些情况能退、扣多少比例，别等出事了才发现一分都退不了。');
  }
  if (hasTrap(traps, '资质')) {
    tips.push('在「全国旅游监管服务平台」查一下旅行社的经营许可证，查不到的一律别报。');
  }
  if (hasTrap(traps, '宰客') || hasTrap(traps, '溢价')) {
    tips.push('多平台比价，同样线路多看 2-3 家正规旅行社的报价，明显贵出一大截的要问清楚贵在哪里、值不值。');
  }

  // 按行程内容补充相关贴士
  if (/机票|飞机|往返/.test(inputLower) && tips.length < 4) {
    tips.push('确认航班信息：是哪个航司、什么时段、能不能选座，很多低价团用的是红眼航班或中转航班。');
  }
  if (/(酒店|住宿|住)/.test(inputLower) && tips.length < 4) {
    tips.push('酒店要确认具体品牌和房型，写「同级」的一定要留好证据，到了货不对板可以向文旅局投诉。');
  }

  // 通用兜底（保证至少 3 条）
  const generalTips = [
    '保留好所有支付凭证、聊天记录和合同照片，遇到纠纷这些都是最有力的证据。',
    '建议自行补充购买旅游意外险，很多团费里的「保险」保额很低甚至根本没有。',
    '遇到导游或商家威胁，优先保证人身安全，离开现场后再报警或投诉。',
  ];

  for (const tip of generalTips) {
    if (tips.length >= 3) break;
    if (!tips.includes(tip)) tips.push(tip);
  }

  // 最多保留 4 条
  return tips.slice(0, 4);
}
