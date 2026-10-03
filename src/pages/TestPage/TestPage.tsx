import { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Share2,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Trophy,
  Download,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { capabilityClient, logger } from '@lark-apaas/client-toolkit-lite';
import { toPng } from 'html-to-image';
import {
  MOCK_PERSONALITY_QUESTIONS,
  DIMENSIONS,
  PERSONALITY_TYPES,
  calcPersonality,
  type IPersonalityType,
  type DimensionKey,
} from '@/data/personality';
import { Image } from '@/components/ui/image';
import {
  recordPersonality,
  getPersonalityUnlockedCount,
} from '@/lib/storage';
import PersonalityCodex from '@/components/PersonalityCodex';

const TEST_RESULT_PLUGIN_ID = 'physique_test_result_generate_1';

interface DimensionDisplay {
  key: DimensionKey;
  label: string;
  emoji: string;
  leftLabel: string;
  rightLabel: string;
  leftCode: string;
  rightCode: string;
  leftPercent: number;
}

export default function TestPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    type: IPersonalityType;
    dimensions: DimensionDisplay[];
    isHidden: boolean;
    aiDescription?: string;
  } | null>(null);
  const [tipsExpanded, setTipsExpanded] = useState(true);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [codexOpen, setCodexOpen] = useState(false);
  const [isNewUnlocked, setIsNewUnlocked] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    setUnlockedCount(getPersonalityUnlockedCount());
  }, []);

  const total = MOCK_PERSONALITY_QUESTIONS.length;
  const currentQuestion = MOCK_PERSONALITY_QUESTIONS[currentIndex];
  const progress = ((currentIndex + (answers[currentQuestion.id] ? 1 : 0)) / total) * 100;
  const answeredCount = Object.keys(answers).length;
  const isCompleted = answeredCount === total;

  const dimensionProgress = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of MOCK_PERSONALITY_QUESTIONS) {
      if (answers[q.id]) {
        map[q.dimension] = (map[q.dimension] || 0) + 1;
      }
    }
    return map;
  }, [answers]);

  const handleSelect = (optionId: string) => {
    if (isGenerating) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (isCompleted) {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      const { type, dimensionScores, isHidden } = calcPersonality(
        MOCK_PERSONALITY_QUESTIONS,
        answers,
      );

      const dimensions: DimensionDisplay[] = DIMENSIONS.map((d) => {
        const score = dimensionScores[d.key as DimensionKey];
        return {
          key: d.key as DimensionKey,
          label: d.label,
          emoji: d.emoji,
          leftLabel: d.left.label,
          rightLabel: d.right.label,
          leftCode: d.left.code,
          rightCode: d.right.code,
          leftPercent: score.leftPercent,
        };
      });

      setResult({ type, dimensions, isHidden });

      const { isNew } = recordPersonality(
        type.code,
        type.name,
        type.emoji,
        type.portraitImage,
        isHidden,
      );
      setIsNewUnlocked(isNew);
      setUnlockedCount(getPersonalityUnlockedCount());

      window.dispatchEvent(new CustomEvent('personality:refresh'));

      if (isNew) {
        if (isHidden) {
          toast.success(`🎉 UNLOCKED RARE: ${type.name}!`, {
            description: 'Check your codex now',
          });
        } else {
          toast.success(`✨ NEW UNLOCK: ${type.name}`);
        }
      }

      generateAIDescription(type, dimensions);
    } catch (err) {
      logger.error('测试结果生成失败:', String(err));
      toast.error('结果生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIDescription = async (
    type: IPersonalityType,
    dimensions: DimensionDisplay[],
  ) => {
    try {
      const dimStr = dimensions
        .map((d) => `${d.label}: ${d.leftPercent}% ${d.leftLabel} / ${100 - d.leftPercent}% ${d.rightLabel}`)
        .join('；');

      const prompt = `你是一位旅行避坑人格分析专家。请根据以下信息，用轻松幽默、有梗的语气，为用户生成一段 100 字左右的个性化人格解读。

人格类型：${type.code} ${type.name}
人设梗：${type.slogan}
维度分布：${dimStr}
防坑等级：${type.traits.antiPitLevel}
容易踩的坑：${type.traits.commonPit}
最佳旅行搭子：${type.traits.bestBuddy}

要求：语言口语化、带点自嘲或调侃的幽默感，适合社交分享，不要太官方。`;

      let fullText = '';
      const stream = capabilityClient
        .load(TEST_RESULT_PLUGIN_ID)
        .callStream('textGenerate', { prompt });

      for await (const chunk of stream as AsyncIterable<{ content?: string }>) {
        if (chunk.content) {
          fullText += chunk.content;
        }
      }

      if (fullText.trim()) {
        setResult((prev) => (prev ? { ...prev, aiDescription: fullText.trim() } : prev));
      }
    } catch (err) {
      const fallback = `${type.traits.antiPitLevel}。${type.traits.commonPit}。别担心，${type.tips[0]} 带上你的 ${type.traits.bestBuddy}，旅行路上坑都绕着走~`;
      setResult((prev) => (prev ? { ...prev, aiDescription: fallback } : prev));
      logger.warn('体质测试 AI 解读生成降级（本地兜底）:', String(err));
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  const handleGenerateCard = async () => {
    if (!shareCardRef.current) return;
    setIsGeneratingCard(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFDE00',
      });

      const link = document.createElement('a');
      link.download = `避坑体质-${result?.type.code || 'result'}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('分享卡已保存到相册');
    } catch (err) {
      logger.error('分享卡生成失败:', String(err));
      toast.error('生成失败，请截屏保存');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const matchPercent = result
    ? Math.round(
        result.dimensions.reduce((sum, d) => {
          const dominant = Math.max(d.leftPercent, 100 - d.leftPercent);
          return sum + dominant;
        }, 0) / result.dimensions.length,
      )
    : 0;

  const hitDimensions = result
    ? result.dimensions.filter((d) => {
        const dominant = Math.max(d.leftPercent, 100 - d.leftPercent);
        return dominant >= 60;
      }).length
    : 0;

  // ===== 结果页 =====
  if (result) {
    return (
      <div className="min-h-screen bg-primary pop-halftone pb-10">
        {/* 主结果卡 Hero */}
        <section className="relative w-full overflow-hidden border-b-[4px] border-foreground bg-accent">
          <div className="absolute -right-8 top-8 size-24 rounded-full border-[5px] border-foreground/30" />
          <div className="absolute -left-5 top-20 size-14 rounded-full border-[4px] border-foreground/25" />
          <div className="absolute right-20 bottom-2 size-10 rounded-full border-[3px] border-foreground/20" />

          <div className="mx-auto max-w-md px-4 pt-8 pb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
              className="relative"
            >
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-background/80">
                YOUR PERSONALITY TYPE
              </p>
              <h1 className="pop-font text-5xl font-black leading-[0.95] text-background pop-text-shadow">
                {result.type.name}
              </h1>
              <p className="mt-1 pop-font text-3xl text-foreground pop-text-shadow">
                {result.type.code}
              </p>
              {result.isHidden && (
                <div className="mt-3 inline-block rounded-full border-[4px] border-foreground bg-primary px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-foreground shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                  ✨ {result.type.rarity}
                </div>
              )}
              <div className="mt-5 flex justify-center">
                <div className="relative rounded-[2rem] border-[6px] border-foreground bg-card p-3 shadow-[10px_10px_0px_0px_rgba(0_0_0_1)]">
                  <Image
                    src={result.type.portraitImage}
                    alt={result.type.name}
                    className="h-40 w-40 object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 匹配度卡片 */}
        <section className="w-full px-4 pt-5">
          <div className="mx-auto max-w-md">
            <Card className="rounded-[2rem] border-[5px] border-foreground bg-card shadow-[8px_8px_0px_0px_rgba(0_0_0_1)]">
              <CardContent className="space-y-3 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  / DOMINANT TYPE
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="pop-font text-5xl leading-none text-foreground pop-text-shadow">
                    {result.type.code}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border-[3px] border-foreground bg-accent text-[11px] font-black uppercase tracking-widest text-background">
                    MATCH {matchPercent}%
                  </Badge>
                  <Badge className="rounded-full border-[3px] border-foreground bg-info text-[11px] font-black uppercase tracking-widest text-info-foreground">
                    HIT {hitDimensions}/4 DIM
                  </Badge>
                </div>
                <p className="text-xs font-bold leading-relaxed text-muted-foreground">
                  维度命中度较高，当前结果可视为你的第一人格画像。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 该人格的简单解读 */}
        <section className="w-full px-4 pt-4">
          <div className="mx-auto max-w-md">
            <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <CardContent className="space-y-2 p-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                  / PERSONALITY READ
                </h3>
                <p className="text-sm font-bold leading-relaxed text-foreground">
                  {result.type.traits.antiPitLevel}。{result.type.traits.commonPit}。
                  {result.type.tips[0]}
                </p>
                <p className="text-xs font-bold leading-relaxed text-muted-foreground">
                  最佳旅行搭子：
                  <span className="font-black text-accent">
                    {' '}
                    {result.type.traits.bestBuddy}
                  </span>
                  。击败全国
                  <span className="pop-font text-lg text-accent">
                    {' '}
                    {result.type.beatPercent}%
                  </span>{' '}
                  的旅行者。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI 个性化描述 */}
        {result.aiDescription && (
          <section className="w-full px-4 pt-4">
            <div className="mx-auto max-w-md">
              <Card className="rounded-[2rem] border-[4px] border-foreground bg-foreground text-background shadow-[6px_6px_0px_0px_rgba(255_222_0_1)]">
                <CardContent className="space-y-2 p-5">
                  <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <Sparkles className="size-4" />
                    AI DEEP READ
                  </h3>
                  <p className="text-sm font-bold leading-relaxed text-background/90">
                    {result.aiDescription}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* 4 维度分析 */}
        <section className="w-full px-4 pt-4">
          <div className="mx-auto max-w-md">
            <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <CardContent className="space-y-4 p-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  / DIMENSION ANALYSIS
                </h3>
                {result.dimensions.map((dim, i) => (
                  <motion.div
                    key={dim.key}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span
                        className={
                          dim.leftPercent >= 50
                            ? 'text-accent'
                            : 'text-muted-foreground'
                        }
                      >
                        {dim.emoji} {dim.leftCode} · {dim.leftLabel}
                      </span>
                      <span
                        className={
                          dim.leftPercent < 50
                            ? 'text-info'
                            : 'text-muted-foreground'
                        }
                      >
                        {dim.rightLabel} · {dim.rightCode}
                      </span>
                    </div>
                    <div className="relative h-5 rounded-full border-[3px] border-foreground bg-muted p-0.5">
                      <motion.div
                        initial={{ width: '50%' }}
                        animate={{ width: `${dim.leftPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                        className="absolute inset-y-0.5 left-0.5 rounded-full bg-gradient-to-r from-accent to-primary"
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 防坑建议 */}
        <section className="w-full px-4 pt-4">
          <div className="mx-auto max-w-md">
            <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <button
                onClick={() => setTipsExpanded(!tipsExpanded)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  🛡 ANTI-PIT TIPS
                </h3>
                {tipsExpanded ? (
                  <ChevronUp className="size-5 text-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-foreground" />
                )}
              </button>
              {tipsExpanded && (
                <div className="border-t-[3px] border-foreground bg-muted/50 px-5 pb-5 pt-4">
                  <div className="space-y-3">
                    {result.type.tips.map((tip, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="mt-0 flex size-8 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground bg-accent text-sm font-black text-background">
                          {i + 1}
                        </span>
                        <p className="text-xs font-bold leading-relaxed text-foreground">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* 操作按钮 */}
        <section className="w-full px-4 pt-5">
          <div className="mx-auto max-w-md space-y-3">
            <Button
              onClick={handleGenerateCard}
              disabled={isGeneratingCard}
              size="lg"
              className="h-12 w-full gap-2 rounded-full border-[4px] border-foreground bg-foreground text-sm font-black uppercase tracking-[0.2em] text-background shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] hover:bg-accent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0_0_0_1)]"
            >
              {isGeneratingCard ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Download className="size-5" />
                  SAVE CARD
                </>
              )}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRestart}
                className="flex-1 gap-2 rounded-full border-[3px] border-foreground text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted"
              >
                <RefreshCw className="size-4" />
                RETEST
              </Button>
              <Button
                variant="outline"
                onClick={() => setCodexOpen(true)}
                className="flex-1 gap-2 rounded-full border-[3px] border-foreground bg-accent text-xs font-black uppercase tracking-widest text-background hover:bg-accent/90"
              >
                <Trophy className="size-4" />
                CODEX
              </Button>
            </div>
          </div>
        </section>

        {/* 人格图鉴弹窗 */}
        <PersonalityCodex open={codexOpen} onOpenChange={setCodexOpen} />

        {/* 隐藏的分享卡（用于生成图片） */}
        <div className="fixed left-[-9999px] top-0" aria-hidden>
          <ShareCard ref={shareCardRef} result={result} />
        </div>
      </div>
    );
  }

  // ===== 答题页 =====
  return (
    <div className="min-h-screen bg-primary pop-halftone pb-10">
      <section className="relative w-full overflow-hidden border-b-[4px] border-foreground bg-accent">
        <div className="absolute -right-5 top-6 size-16 rounded-full border-[4px] border-foreground/30" />
        <div className="absolute -left-4 bottom-4 size-10 rounded-full border-[3px] border-foreground/25" />
        <div className="mx-auto max-w-md px-4 pt-6 pb-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border-[4px] border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
              <Brain className="size-5" />
            </div>
            <div>
              <h1 className="pop-font text-3xl leading-none text-background pop-text-shadow">
                PIT TEST 2.0
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-background/80">
                20 Q · 被坑体质测试
              </p>
            </div>
          </div>

          {/* 进度数据卡 */}
          <div className="rounded-[2rem] border-[5px] border-foreground bg-card p-4 shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
            <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="text-muted-foreground">PROGRESS</span>
              <span className="text-accent tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 rounded-full border-[3px] border-foreground bg-muted p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-muted-foreground">
                Q {currentIndex + 1} / {total}
              </span>
              <button
                onClick={() => setCodexOpen(true)}
                className="flex items-center gap-1.5 text-accent hover:underline"
              >
                <BookOpen className="size-3.5" />
                CODEX {unlockedCount}/20
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 题目卡 */}
      <section className="w-full px-4 pt-6">
        <div className="mx-auto max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -30, rotate: -2 }}
              transition={{ duration: 0.35, type: 'spring', bounce: 0.4 }}
            >
              <Card className="rounded-[2rem] border-[5px] border-foreground bg-card shadow-[8px_8px_0px_0px_rgba(0_0_0_1)]">
                <CardContent className="space-y-5 p-5">
                  {/* 维度标签 */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-foreground bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                      {DIMENSIONS.find((d) => d.key === currentQuestion.dimension)?.emoji}
                      {DIMENSIONS.find((d) => d.key === currentQuestion.dimension)?.label} DIM
                    </span>
                    <Zap className="size-4 text-primary" />
                  </div>

                  <h2 className="text-base font-black leading-relaxed text-foreground">
                    {currentQuestion.question}
                  </h2>

                  <div className="space-y-3">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = answers[currentQuestion.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id)}
                          disabled={isGenerating}
                          className={`relative w-full rounded-[1.5rem] border-[4px] border-foreground p-4 text-left text-sm font-black transition-all duration-150 ${
                            isSelected
                              ? 'bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] -translate-x-0.5 -translate-y-0.5'
                              : 'bg-card text-foreground hover:bg-muted hover:shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground pop-font text-base ${
                                isSelected
                                  ? 'bg-foreground text-background'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {idx === 0 ? 'A' : 'B'}
                            </span>
                            <span className="flex-1 leading-relaxed">
                              {opt.text}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0 || isGenerating}
              className="flex-1 gap-1.5 rounded-full border-[3px] border-foreground text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              PREV
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id] || isGenerating}
              className="flex-1 gap-1.5 rounded-full border-[3px] border-foreground bg-foreground text-xs font-black uppercase tracking-widest text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] hover:bg-accent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  GEN
                </>
              ) : currentIndex === total - 1 ? (
                <>
                  <Sparkles className="size-4" />
                  RESULT
                </>
              ) : (
                <>
                  NEXT
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>

          {/* 维度完成度提示 */}
          <div className="mt-6">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">
              / DIMENSION PROGRESS
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DIMENSIONS.map((d) => {
                const done = dimensionProgress[d.key as DimensionKey] || 0;
                return (
                  <div key={d.key} className="flex items-center gap-2">
                    <span className="text-lg">{d.emoji}</span>
                    <div className="flex-1">
                      <div className="h-3 rounded-full border-[2px] border-foreground bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(done / 5) * 100}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full rounded-full bg-accent"
                        />
                      </div>
                    </div>
                    <span className="w-6 text-right text-[9px] font-black uppercase text-foreground/60">
                      {done}/5
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 人格图鉴弹窗 */}
      <PersonalityCodex open={codexOpen} onOpenChange={setCodexOpen} />
    </div>
  );
}

// ===== 分享卡组件（截图用）=====
const ShareCard = forwardRef<
  HTMLDivElement,
  {
    result: {
      type: IPersonalityType;
      dimensions: DimensionDisplay[];
      isHidden: boolean;
    };
  }
>(function ShareCard({ result }, ref) {
  const matchPercent = Math.round(
    result.dimensions.reduce((sum, d) => {
      const dominant = Math.max(d.leftPercent, 100 - d.leftPercent);
      return sum + dominant;
    }, 0) / result.dimensions.length,
  );
  const hitDimensions = result.dimensions.filter((d) => {
    const dominant = Math.max(d.leftPercent, 100 - d.leftPercent);
    return dominant >= 60;
  }).length;

  return (
    <div
      ref={ref}
      style={{ width: 375, height: 720 }}
      className="relative overflow-hidden bg-yellow-400 font-sans"
    >
      {/* 半色调纹理 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0,0,0,0.1) 2px, transparent 2px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* 顶部 */}
      <div className="relative border-b-[8px] border-black bg-red-500 px-6 pb-10 pt-12 text-center">
        <div className="absolute -right-8 -top-8 size-28 rounded-full border-[6px] border-black/30" />
        <div className="absolute -left-5 bottom-6 size-16 rounded-full border-[5px] border-black/25" />
        <div className="relative z-10">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-white/80">
            TRAVEL PIT PERSONALITY
          </p>
          <h1
            style={{
              fontFamily:
                'Bangers, "Noto Sans SC", system-ui, cursive',
              fontSize: '3.5rem',
              lineHeight: 0.95,
              color: 'white',
              textShadow: '3px 3px 0px rgba(0,0,0,1)',
            }}
          >
            {result.type.name}
          </h1>
          <p
            style={{
              fontFamily:
                'Bangers, "Noto Sans SC", system-ui, cursive',
              fontSize: '2rem',
              color: 'black',
              textShadow: '2px 2px 0px rgba(255,255,255,0.5)',
            }}
          >
            {result.type.code}
          </p>
          {result.isHidden && (
            <div className="mt-3 inline-block rounded-full border-[4px] border-black bg-yellow-400 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-black" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              ✨ {result.type.rarity}
            </div>
          )}
          <div className="mt-6 flex justify-center">
            <div className="rounded-[2rem] border-[6px] border-black bg-white p-3" style={{ boxShadow: '10px 10px 0 0 #000' }}>
              <Image
                src={result.type.portraitImage}
                alt={result.type.name}
                className="h-36 w-36 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 匹配度卡 */}
      <div className="px-5 pt-5">
        <div className="rounded-[2rem] border-[5px] border-black bg-white p-4" style={{ boxShadow: '8px 8px 0 0 #000' }}>
          <div className="flex items-baseline gap-3">
            <span
              style={{
                fontFamily:
                  'Bangers, "Noto Sans SC", system-ui, cursive',
                fontSize: '2.5rem',
                lineHeight: 1,
                color: 'black',
                textShadow: '2px 2px 0px rgba(0,0,0,0.15)',
              }}
            >
              {matchPercent}%
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">
              MATCH DEGREE
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full border-[2px] border-black bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">
              HIT {hitDimensions}/4 DIM
            </span>
          </div>
          <p className="mt-3 text-sm font-bold leading-relaxed text-gray-700">
            {result.type.slogan}
          </p>
        </div>
      </div>

      {/* 底部品牌 */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-base font-black uppercase tracking-widest text-black">
          <span className="text-2xl">🛡</span>
          <span>AI PIT DETECTOR</span>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black/60">
          SCAN BEFORE YOU GO
        </p>
      </div>
    </div>
  );
});
