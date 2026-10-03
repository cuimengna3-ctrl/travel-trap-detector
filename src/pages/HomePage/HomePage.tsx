import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Search,
  Sparkles,
  ChevronRight,
  Zap,
  Flag,
  Link,
  AlignLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { scopedStorage, capabilityClient } from '@lark-apaas/client-toolkit-lite';
import { MOCK_TRAPS, type ITrap } from '@/data/traps';
import { levelToBgSoft, matchTrapsByNames, matchTrapsByKeywords } from '@/lib/risk-utils';
import { getTrapHeat } from '@/lib/storage';
import TrapDetailDialog from '@/components/TrapDetailDialog';

const DEFAULT_SAMPLE = '999元云南6天5晚，含机票酒店门票，购物自愿，免费升级...';

const INPUT_MODES = [
  { key: 'text', label: '粘贴文字', icon: AlignLeft },
  { key: 'link', label: '粘贴链接', icon: Link },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<'text' | 'link'>('text');
  const [input, setInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const handleModeChange = (mode: 'text' | 'link') => {
    setInputMode(mode);
    setInput('');
  };

  const handleFillSample = () => {
    setInput(DEFAULT_SAMPLE);
  };

  const charCount = input.length;
  const MAX_LENGTH = 500;

  const handleDetect = async () => {
    if (!input.trim()) {
      toast.error(inputMode === 'link' ? '请粘贴要检测的链接' : '请输入要检测的行程');
      return;
    }
    if (inputMode === 'link' && !/^https?:\/\//i.test(input.trim())) {
      toast.error('请输入有效的链接（以 http 开头）');
      return;
    }
    setIsDetecting(true);

    let matchedTraps: ITrap[] = [];
    try {
      // Step 1: 本地关键词规则匹配（结果稳定、零延迟、保证结构化数据非空）
      const keywordMatch = matchTrapsByKeywords(input);

      // Step 2: 调用 AI 分类插件做补充确认（丰富语义匹配）
      const routineCategories = MOCK_TRAPS.map((t) => t.name);
      let aiMatchedNames: string[] = [];

      try {
        const result = await capabilityClient
          .load('itinerary_risk_routine_categorization_1')
          .call('aiCategorize', {
            itinerary_text: input,
            routine_categories: routineCategories,
            custom_classify_requirements:
              '请严格从提供的套路库分类中选择匹配的项，返回所有匹配的套路名称数组；如果没有明显匹配，返回空数组。不要返回套路库以外的名称。',
          });

        const cats = (result as { categories?: string[] }).categories || [];
        if (Array.isArray(cats) && cats.length > 0) {
          aiMatchedNames = cats;
        }
      } catch (err) {
        // AI 调用失败不影响结果，以本地规则为准
      }

      // Step 3: 合并本地匹配 + AI 匹配，本地规则优先（保证稳定），AI 做补充
      const aiMatchedTraps = matchTrapsByNames(aiMatchedNames);
      const allIds = new Set<string>();
      const merged: ITrap[] = [];
      for (const t of keywordMatch) {
        if (!allIds.has(t.id)) {
          allIds.add(t.id);
          merged.push(t);
        }
      }
      for (const t of aiMatchedTraps) {
        if (!allIds.has(t.id)) {
          allIds.add(t.id);
          merged.push(t);
        }
      }
      // 高风险排前面
      merged.sort((a, b) => {
        if (a.riskLevel !== b.riskLevel) return a.riskLevel === 'high' ? -1 : 1;
        return 0;
      });
      matchedTraps = merged.length > 0 ? merged : MOCK_TRAPS.slice(0, 2).filter((t) => t.riskLevel === 'medium');

      // 构造待检测数据，写入 scopedStorage 供结果页读取
      const pendingData = {
        inputText: input,
        sourceUrl: inputMode === 'link' ? input : undefined,
        matchedTraps,
        riskListStr: matchedTraps.map((t) => t.name).join('、'),
      };
      scopedStorage.setItem('aipit_pending_result', JSON.stringify(pendingData));
      scopedStorage.setItem('__app_aipit_currentInput', input);

      toast.success('检测完成，正在生成报告...');
      navigate('/result');
    } catch (err) {
      toast.error('检测失败，请稍后重试');
    } finally {
      setIsDetecting(false);
    }
  };

  const [selectedTrap, setSelectedTrap] = useState<ITrap | null>(null);
  const [trapDetailOpen, setTrapDetailOpen] = useState(false);

  // 热门套路：基于热度数据排序（检测+举报+收藏），热度为0时按默认顺序
  const hotTraps = useMemo(() => {
    const heat = getTrapHeat();
    const withHeat = MOCK_TRAPS.map((trap) => {
      const h = heat[trap.id] || heat[trap.name] || { total: 0, detect: 0, report: 0, favorite: 0 };
      return { trap, heat: h.total, detail: h };
    });
    withHeat.sort((a, b) => {
      if (b.heat !== a.heat) return b.heat - a.heat;
      // 热度相同时高风险排前
      if (a.trap.riskLevel !== b.trap.riskLevel)
        return a.trap.riskLevel === 'high' ? -1 : 1;
      return 0;
    });
    return withHeat.slice(0, 5);
  }, []);

  return (
    <div className="min-h-screen bg-primary pop-halftone pb-10">
      {/* 顶部 Hero 区 */}
      <section className="relative w-full overflow-hidden">
        <div className="mx-auto max-w-md px-4 pt-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
            className="text-center"
          >
            {/* 品牌徽章 */}
            <div className="mb-3 inline-block">
              <div className="pop-tilt-3 flex items-center gap-2 rounded-full border-[4px] border-foreground bg-card px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                <span className="text-base">🛡</span>
                <span className="pop-font text-xl leading-none text-foreground">
                  PIT BUSTER
                </span>
              </div>
            </div>

            <h1 className="pop-font text-5xl leading-[0.95] text-foreground pop-text-shadow">
              AI 避坑
              <br />
              <span className="text-accent">检测器</span>
            </h1>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.3em] text-foreground/60">
              SCAN BEFORE YOU GO · 出行前测一测
            </p>

            {/* 装饰小圆点 */}
            <div className="mt-4 flex justify-center gap-2">
              <span className="size-3 rounded-full border-2 border-foreground bg-accent" />
              <span className="size-3 rounded-full border-2 border-foreground bg-success" />
              <span className="size-3 rounded-full border-2 border-foreground bg-info" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 检测输入卡 */}
      <section className="w-full px-4">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, type: 'spring', bounce: 0.4 }}
            className="pop-tilt-2 relative"
          >
            <Card className="border-[6px] border-foreground bg-card shadow-lg">
              <CardContent className="p-5">
                {/* 输入模式 Tab */}
                <div className="mb-4 flex rounded-full border-[4px] border-foreground bg-muted p-1">
                  {INPUT_MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = inputMode === mode.key;
                    return (
                      <button
                        key={mode.key}
                        onClick={() => handleModeChange(mode.key as 'text' | 'link')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isActive
                          ? 'bg-foreground text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] -translate-y-0.5'
                          : 'text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        <Icon className="size-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                {/* 输入框 */}
                <div className="mb-2">
                  <p className="mb-2 text-sm font-black text-foreground">
                    粘贴行程 / 输入目的地+报价
                  </p>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
                    placeholder={inputMode === 'link' ? '粘贴行程链接、商品链接、报名链接...' : '例如：999元云南6天5晚，含机票酒店门票，购物自愿，免费升级...'}
                    rows={4}
                    className="w-full resize-none rounded-[1.5rem] border-[4px] border-foreground bg-muted px-4 pt-4 pb-4 text-sm font-bold text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-0 focus:border-accent"
                  />
                </div>

                {/* 字符计数 */}
                <div className="mb-3 text-right text-[10px] font-black uppercase tracking-widest text-foreground/50 tabular-nums">
                  {charCount}/{MAX_LENGTH}
                </div>

                {/* 示例填充（仅文字模式） */}
                {inputMode === 'text' && (
                  <button
                    onClick={handleFillSample}
                    className="mb-4 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-accent hover:underline"
                  >
                    <Zap className="size-3.5" />
                    试试示例行程
                  </button>
                )}

                {/* 检测按钮 */}
                <Button
                  onClick={handleDetect}
                  disabled={isDetecting}
                  size="lg"
                  className="w-full rounded-full border-[4px] border-foreground bg-accent text-base font-black uppercase tracking-[0.2em] text-background shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] hover:bg-accent/90 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0_0_0_1)]"
                >
                  {isDetecting ? (
                    <>
                      <Sparkles className="size-5 animate-pulse" />
                      SCANNING...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="size-5" />
                      AI 检测
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 左上角装饰小旗 */}
            <div className="absolute -top-2 -left-2">
              <Flag className="size-6 text-accent pop-text-shadow" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 今日热门套路 */}
      <section className="w-full px-4 pt-8">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="pop-tilt-1 mb-4 inline-block"
          >
            <div className="inline-flex items-center gap-2 bg-foreground px-4 py-2 shadow-[6px_6px_0px_0px_rgba(255_222_0_1)]">
              <span className="text-base">🔥</span>
              <h2 className="pop-font text-2xl leading-none text-background">
                HOT TRAPS
              </h2>
            </div>
          </motion.div>

          <div className="space-y-3">
             {hotTraps.map((item, i) => (
               <motion.div
                 key={item.trap.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.35, delay: 0.3 + i * 0.08, type: 'spring', bounce: 0.4 }}
                 onClick={() => {
                   setSelectedTrap(item.trap);
                   setTrapDetailOpen(true);
                 }}
                 className="cursor-pointer"
               >
                 <Card className="border-[4px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
                   <CardContent className="flex items-center gap-4 p-4">
                     <div
                       className={`flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground ${levelToBgSoft(
                         item.trap.riskLevel === 'high' ? 'high' : 'medium',
                       )}`}
                     >
                       <span className="pop-font text-lg leading-none text-foreground">
                         {i + 1}
                       </span>
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className="flex items-center gap-2">
                         <h3 className="truncate text-sm font-black uppercase tracking-wide text-foreground">
                           {item.trap.name}
                         </h3>
                       </div>
                       <p className="mt-1 line-clamp-1 text-xs font-bold text-muted-foreground">
                         {item.trap.description}
                       </p>
                       <div className="mt-1.5 flex items-center gap-2">
                         <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent">
                           🔥 热度 {item.heat > 0 ? item.heat : '--'}
                         </span>
                       </div>
                     </div>
                     <Badge
                       variant="outline"
                       className={`shrink-0 rounded-full border-[2px] border-foreground text-[10px] font-black uppercase tracking-wider ${levelToBgSoft(
                         item.trap.riskLevel === 'high' ? 'high' : 'medium',
                       )}`}
                     >
                       {item.trap.riskLevel === 'high' ? 'HIGH' : 'MED'}
                     </Badge>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
          </div>

          <button
            onClick={() => navigate('/wiki')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-foreground bg-info px-4 py-3 text-sm font-black uppercase tracking-widest text-info-foreground shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]"
          >
            查看全部套路
            <ChevronRight className="size-4" />
          </button>
        </div>
      </section>

      {/* 底部波普装饰 */}
      <section className="w-full px-4 pt-10 pb-2">
        <div className="mx-auto max-w-md text-center">
          <p className="pop-font text-lg text-foreground/30">
            PIT BUSTER v1.0
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-foreground/30">
            DON&apos;T GET SCAMMED · 出行避坑神器
          </p>
        </div>
       </section>

      {/* 套路详情弹窗 */}
      <TrapDetailDialog
        open={trapDetailOpen}
        onOpenChange={setTrapDetailOpen}
        trap={selectedTrap}
      />
    </div>
  );
}
