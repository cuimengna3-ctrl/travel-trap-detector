import { useState, useMemo, useEffect, useRef, forwardRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Download,
  Trophy,
  Lock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import {
  PERSONALITY_TYPES,
  HIDDEN_TYPES,
  type IPersonalityType,
} from '@/data/personality';
import {
  getPersonalityCollection,
  type IPersonalityRecord,
} from '@/lib/storage';
import { toPng } from 'html-to-image';
import { logger } from '@lark-apaas/client-toolkit-lite';

interface PersonalityCodexProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PersonalityCodex({
  open,
  onOpenChange,
}: PersonalityCodexProps) {
  const [collection, setCollection] = useState<IPersonalityRecord[]>([]);
  const [selectedType, setSelectedType] = useState<IPersonalityType | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setCollection(getPersonalityCollection());
    }
  }, [open]);

  const unlockedCount = collection.length;
  const hiddenCount = collection.filter((r) => r.isHidden).length;
  const totalBase = 16;
  const totalHidden = 4;
  const totalAll = 20;

  const progress = (unlockedCount / totalAll) * 100;
  const baseUnlocked = unlockedCount - hiddenCount;

  const baseTypes = useMemo(
    () => PERSONALITY_TYPES.filter((t) => !t.isHidden),
    [],
  );
  const hiddenTypes = useMemo(
    () => HIDDEN_TYPES as IPersonalityType[],
    [],
  );

  const isUnlocked = (code: string) =>
    collection.some((r) => r.code === code);

  const getRecord = (code: string) =>
    collection.find((r) => r.code === code);

  const handleTypeClick = (type: IPersonalityType) => {
    if (isUnlocked(type.code)) {
      setSelectedType(type);
    }
  };

  const handleGenerateCard = async () => {
    if (!shareCardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFDE00',
      });

      const link = document.createElement('a');
      link.download = 'personality-codex.png';
      link.href = dataUrl;
      link.click();

      toast.success('图鉴卡已保存');
    } catch (err) {
      logger.error('图鉴分享卡生成失败:', String(err));
      toast.error('生成失败，请截屏保存');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="flex flex-col max-h-[92vh] w-[92vw] max-w-md overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card p-0 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]">
          <DialogTitle className="sr-only">PERSONALITY CODEX</DialogTitle>
          <DialogDescription className="sr-only">
            被坑体质人格图鉴收集进度
          </DialogDescription>

          {/* 顶部红色标题栏 */}
          <div className="relative overflow-hidden border-b-[4px] border-foreground bg-accent">
            <div className="absolute -right-6 -top-6 size-20 rounded-full border-[5px] border-foreground/30" />
            <div className="absolute -left-5 bottom-2 size-12 rounded-full border-[4px] border-foreground/25" />
            <div className="relative flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                  <Trophy className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="pop-font text-2xl leading-none text-background">
                    CODEX
                  </h2>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.3em] text-background/80">
                    PERSONALITY COLLECTION
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex size-9 items-center justify-center rounded-full border-[3px] border-foreground bg-primary text-foreground hover:bg-primary/90 shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
                aria-label="关闭"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 进度条 */}
            <div className="bg-foreground/10 px-4 pb-3 pt-0">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-background/90">
                  UNLOCKED {unlockedCount}/{totalAll}
                </span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-5 rounded-full border-[3px] border-foreground bg-background p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-success"
                />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-background/80">
                  BASE {baseUnlocked}/{totalBase}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  ✨ RARE {hiddenCount}/{totalHidden}
                </span>
              </div>
            </div>
          </div>

          {/* 图鉴网格内容（可滚动） */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {/* 基础型 */}
            <div className="mb-5 px-1">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                / 16 BASE TYPES · 基础型
              </p>
              <div className="grid grid-cols-4 gap-3">
                {baseTypes.map((type, i) => {
                  const unlocked = isUnlocked(type.code);
                  const record = getRecord(type.code);
                  return (
                    <motion.button
                      key={type.code}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: i * 0.03,
                        type: 'spring',
                        bounce: 0.4,
                      }}
                      onClick={() => handleTypeClick(type)}
                      disabled={!unlocked}
                      className={`relative flex flex-col items-center gap-1.5 rounded-[1.5rem] border-[3px] border-foreground p-2.5 transition-all ${
                        unlocked
                          ? 'bg-card text-foreground shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]'
                          : 'cursor-not-allowed bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center ${
                          unlocked
                            ? 'bg-transparent'
                            : 'rounded-full border-[2px] border-foreground/20 bg-muted/60'
                        }`}
                      >
                        {unlocked ? (
                          <Image
                            src={type.portraitImage}
                            alt={type.name}
                            className="h-14 w-14 object-contain"
                          />
                        ) : (
                          <span className="pop-font text-2xl text-foreground/40">
                            ?
                          </span>
                        )}
                      </div>
                      <span className="w-full truncate text-center text-[9px] font-black uppercase tracking-wider">
                        {unlocked ? type.code : '???'}
                      </span>
                      {record && record.count > 1 && (
                        <span className="absolute -right-1 -top-1 rounded-full border-[2px] border-foreground bg-accent px-1.5 py-0 text-[8px] font-black text-background">
                          ×{record.count}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 稀有隐藏型 */}
            <div className="px-1">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                <Sparkles className="size-3.5" />
                4 RARE HIDDEN · 稀有隐藏型
              </p>
              <div className="grid grid-cols-4 gap-3">
                {hiddenTypes.map((type, i) => {
                  const unlocked = isUnlocked(type.code);
                  const record = getRecord(type.code);
                  return (
                    <motion.button
                      key={type.code}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.2 + i * 0.05,
                        type: 'spring',
                        bounce: 0.4,
                      }}
                      onClick={() => handleTypeClick(type)}
                      disabled={!unlocked}
                      className={`relative flex flex-col items-center gap-1.5 rounded-[1.5rem] border-[3px] p-2.5 transition-all ${
                        unlocked
                          ? 'border-foreground bg-gradient-to-br from-primary/20 to-accent/30 text-foreground shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]'
                          : 'border-dashed border-foreground/30 bg-muted/20 text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center ${
                          unlocked
                            ? 'bg-transparent'
                            : 'rounded-full border-[2px] border-foreground/20 bg-muted/40'
                        }`}
                      >
                        {unlocked ? (
                          <Image
                            src={type.portraitImage}
                            alt={type.name}
                            className="h-14 w-14 object-contain"
                          />
                        ) : (
                          <div className="relative flex h-full w-full items-center justify-center">
                            <Lock className="absolute right-0 top-0 size-3.5 text-foreground/40" />
                            <span className="pop-font text-2xl text-accent/70">
                              ?
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="w-full truncate text-center text-[9px] font-black uppercase tracking-wider">
                        {unlocked ? type.code : '稀有'}
                      </span>
                      {!unlocked && (
                        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border-[2px] border-foreground bg-primary text-[8px] font-black text-foreground">
                          ✨
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 底部保存按钮 */}
          <div className="border-t-[3px] border-foreground bg-muted/40 px-4 py-3">
            <Button
              onClick={handleGenerateCard}
              disabled={isGenerating || unlockedCount === 0}
              size="sm"
              className="w-full gap-2 rounded-full border-[3px] border-foreground bg-foreground text-xs font-black uppercase tracking-widest text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] hover:bg-accent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  SAVE CODEX CARD
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog
        open={!!selectedType}
        onOpenChange={(v) => !v && setSelectedType(null)}
      >
        <DialogContent className="w-[90vw] max-w-sm overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card p-0 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]">
          <DialogTitle className="sr-only">{selectedType?.name}</DialogTitle>
          <DialogDescription className="sr-only">
            人格详情
          </DialogDescription>
          {selectedType && (
            <>
              <div className="relative overflow-hidden border-b-[4px] border-foreground bg-accent px-5 py-6 text-center">
                <div className="absolute -right-8 top-4 size-20 rounded-full border-[5px] border-foreground/30" />
                <div className="relative z-10">
                  <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-none border-[5px] border-foreground bg-background shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
                    <Image
                      src={selectedType.portraitImage}
                      alt={selectedType.name}
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                  <h3 className="pop-font text-3xl leading-none text-background">
                    {selectedType.name}
                  </h3>
                  <p className="mt-1 pop-font text-xl text-foreground">
                    {selectedType.code}
                  </p>
                  {selectedType.isHidden && (
                    <div className="mt-2 inline-block rounded-full border-[3px] border-foreground bg-primary px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                      ✨ {selectedType.rarity}
                    </div>
                  )}
                </div>
              </div>

              <div className="max-h-[40vh] overflow-y-auto p-5">
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      SLOGAN
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {selectedType.slogan}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      ANTI-PIT LEVEL
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedType.traits.antiPitLevel}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
                      COMMON PIT
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedType.traits.commonPit}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-success">
                      BEST BUDDY
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {selectedType.traits.bestBuddy}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      TIPS
                    </p>
                    <ul className="space-y-1.5">
                      {selectedType.tips.slice(0, 3).map((tip, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-xs font-bold text-foreground"
                        >
                          <span className="text-accent">▸</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 隐藏的分享卡 */}
      <div className="fixed left-[-9999px] top-0" aria-hidden>
        <ShareCard ref={shareCardRef} collection={collection} />
      </div>
    </>
  );
}

// ===== 图鉴分享卡 =====
const ShareCard = forwardRef<
  HTMLDivElement,
  { collection: IPersonalityRecord[] }
>(function ShareCard({ collection }, ref) {
  const unlockedCount = collection.length;
  const hiddenCount = collection.filter((r) => r.isHidden).length;
  const baseUnlocked = unlockedCount - hiddenCount;
  const progress = (unlockedCount / 20) * 100;

  const baseTypes = PERSONALITY_TYPES.filter((t) => !t.isHidden);
  const hiddenTypes = HIDDEN_TYPES as IPersonalityType[];

  const isUnlocked = (code: string) =>
    collection.some((r) => r.code === code);

  return (
    <div
      ref={ref}
      style={{ width: 375, height: 760 }}
      className="relative overflow-hidden bg-yellow-400 font-sans"
    >
      {/* 半色调 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0,0,0,0.1) 2px, transparent 2px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* 顶部红色标题栏 */}
      <div className="relative border-b-[8px] border-black bg-red-500 px-6 pb-8 pt-12 text-center">
        <div className="absolute -right-10 -top-8 size-32 rounded-full border-[6px] border-black/30" />
        <div className="absolute -left-6 bottom-5 size-18 rounded-full border-[5px] border-black/25" />
        <div className="relative z-10">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-white/80">
            PERSONALITY CODEX
          </p>
          <h1
            style={{
              fontFamily: 'Bangers, "Noto Sans SC", system-ui, cursive',
              fontSize: '3.5rem',
              lineHeight: 0.95,
              color: 'white',
            }}
          >
            {unlockedCount}/20
          </h1>
          <p className="mt-1 text-sm font-black uppercase tracking-[0.3em] text-white/90">
            COLLECTION PROGRESS
          </p>
          <div className="mx-auto mt-4 h-5 w-3/4 rounded-full border-[3px] border-black bg-white p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-green-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs font-black uppercase tracking-widest text-white/80">
            BASE {baseUnlocked}/16 · RARE {hiddenCount}/4 ✨
          </p>
        </div>
      </div>

      {/* 基础型网格 */}
      <div className="px-5 pt-4">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-black">
          / 16 BASE TYPES
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {baseTypes.map((type) => {
            const unlocked = isUnlocked(type.code);
            return (
              <div
                key={type.code}
                className={`flex flex-col items-center gap-0.5 rounded-xl border-[2px] border-black p-1.5 ${
                  unlocked
                    ? 'bg-white shadow-[2px_2px_0px_0px_rgba(0_0_0_1)]'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border-[2px] border-black ${
                    unlocked ? 'bg-white' : 'bg-gray-100'
                  }`}
                >
                  {unlocked ? (
                    <Image
                      src={type.portraitImage}
                      alt={type.code}
                      className="h-7 w-7 object-contain"
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily:
                          'Bangers, "Noto Sans SC", system-ui, cursive',
                        fontSize: '1rem',
                        color: '#999',
                      }}
                    >
                      ?
                    </span>
                  )}
                </div>
                <span className="text-[7px] font-black uppercase tracking-wider">
                  {unlocked ? type.code : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 稀有隐藏型 */}
      <div className="px-5 pt-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
          ✨ 4 RARE HIDDEN
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {hiddenTypes.map((type) => {
            const unlocked = isUnlocked(type.code);
            return (
              <div
                key={type.code}
                className={`flex flex-col items-center gap-0.5 rounded-xl border-[2px] p-1.5 ${
                  unlocked
                    ? 'border-black bg-gradient-to-br from-yellow-400 to-red-400 shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]'
                    : 'border-dashed border-black/50 bg-gray-100/50 opacity-60'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border-[2px] border-black ${
                    unlocked ? 'bg-white' : 'bg-gray-100/70'
                  }`}
                >
                  {unlocked ? (
                    <Image
                      src={type.portraitImage}
                      alt={type.code}
                      className="h-7 w-7 object-contain"
                    />
                  ) : (
                    <span className="text-xs">🔒</span>
                  )}
                </div>
                <span className="text-[7px] font-black uppercase tracking-wider">
                  {unlocked ? type.code : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部 */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
          <span className="text-xl">🛡</span>
          <span>AI PIT DETECTOR</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">
          SCAN BEFORE YOU GO
        </p>
      </div>
    </div>
  );
});
