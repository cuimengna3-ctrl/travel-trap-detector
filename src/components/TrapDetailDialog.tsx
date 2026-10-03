import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  BookOpen,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  levelToText,
  levelToBgSoft,
} from '@/lib/risk-utils';
import { toggleFavorite, getFavorites } from '@/lib/storage';
import type { ITrap } from '@/data/traps';

interface TrapDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trap: ITrap | null;
}

export default function TrapDetailDialog({
  open,
  onOpenChange,
  trap,
}: TrapDetailDialogProps) {
  const [isFavorited, setIsFavorited] = useState(
    trap ? getFavorites().includes(trap.id) : false,
  );
  const [expandedSignals, setExpandedSignals] = useState(true);

  const handleToggleFav = () => {
    if (!trap) return;
    const willAdd = toggleFavorite(trap.id);
    setIsFavorited(willAdd);
    toast.success(willAdd ? '已收藏该套路' : '已取消收藏');
    window.dispatchEvent(new Event('favorites:refresh'));
  };

  if (!trap) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[88vh] w-[94vw] max-w-md flex-col overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card p-0 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]"
      >
        {/* 顶栏 */}
        <div className="relative border-b-[4px] border-foreground bg-primary px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                <ShieldAlert className="size-5 text-foreground" />
              </div>
              <div className="min-w-0 max-w-[170px]">
                <h2 className="pop-font text-xl leading-none text-foreground truncate">
                  {trap.name}
                </h2>
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-foreground/70">
                  避坑百科 · WIKI
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="flex size-9 items-center justify-center rounded-full border-[3px] border-foreground bg-card text-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
              aria-label="关闭"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 px-4 py-4"
          >
            {/* 风险徽章 + 收藏 */}
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`rounded-full border-[3px] border-foreground px-4 py-1.5 text-[11px] font-black uppercase tracking-widest ${levelToBgSoft(
                  trap.riskLevel === 'high' ? 'high' : 'medium',
                )}`}
              >
                {trap.riskLevel === 'high' ? '🚨 HIGH · 高风险' : '⚠️ MED · 中风险'}
              </Badge>
              <button
                onClick={handleToggleFav}
                className={`ml-auto flex items-center gap-1.5 rounded-full border-[3px] border-foreground px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isFavorited
                    ? 'bg-primary text-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]'
                    : 'bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Heart className={`size-3.5 ${isFavorited ? 'fill-foreground' : ''}`} />
                {isFavorited ? '已收藏' : '收藏'}
              </button>
            </div>

            {/* 风险说明 */}
            <div className="rounded-[1.5rem] border-[3px] border-foreground bg-muted p-4 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-foreground">
                📝 风险说明
              </p>
              <p className="text-sm font-bold leading-relaxed text-foreground">
                {trap.description}
              </p>
            </div>

            {/* 识别信号 */}
            <div className="rounded-[1.5rem] border-[3px] border-foreground bg-card overflow-hidden shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
              <button
                onClick={() => setExpandedSignals(!expandedSignals)}
                className="flex w-full items-center justify-between gap-2 p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-accent" />
                  <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
                    识别信号
                  </h3>
                  <Badge
                    variant="outline"
                    className="rounded-full border-[2px] border-foreground bg-warning text-[9px] font-black uppercase text-foreground"
                  >
                    {trap.signals?.length || 0}
                  </Badge>
                </div>
                {expandedSignals ? (
                  <ChevronUp className="size-4 text-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-foreground" />
                )}
              </button>
              <AnimatePresence>
                {expandedSignals && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t-[3px] border-foreground bg-muted p-4">
                      <div className="space-y-2">
                        {trap.signals?.map((sig, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2"
                          >
                            <span className="mt-0.5 shrink-0 text-base">🚩</span>
                            <span className="text-xs font-bold text-foreground">
                              {sig}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 应对建议 */}
            <div className="rounded-[1.5rem] border-[3px] border-foreground bg-success p-4 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-foreground">
                💡 应对建议
              </p>
              <p className="text-sm font-black leading-relaxed text-foreground">
                {trap.suggestion}
              </p>
            </div>

            {/* 真实案例 */}
            {trap.realCase && (
              <div className="rounded-[1.5rem] border-[3px] border-foreground bg-accent p-4 text-background shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-background/80">
                  📖 真实案例
                </p>
                <p className="text-sm font-bold leading-relaxed text-background">
                  「{trap.realCase}」
                </p>
              </div>
            )}

            {/* 来源 */}
            <div className="pt-1 text-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
              来源：AI 避坑知识库 · 群众举报共建
            </div>
          </motion.div>
        </div>

        {/* 底部操作 */}
        <div className="border-t-[4px] border-foreground bg-muted px-4 py-3">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full border-[3px] border-foreground bg-foreground text-xs font-black uppercase tracking-widest text-background hover:bg-accent"
          >
            我懂了
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
