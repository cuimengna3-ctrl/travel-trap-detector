import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  MapPin,
  FileText,
  Flag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  levelToText,
  levelToBgSoft,
} from '@/lib/risk-utils';
import {
  getResult,
  type IRiskResult,
} from '@/lib/storage';
import type { IHistoryItem } from '@/lib/storage';

interface HistoryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: IHistoryItem | null;
}

export default function HistoryDetailDialog({
  open,
  onOpenChange,
  record,
}: HistoryDetailDialogProps) {
  const [result, setResult] = useState<IRiskResult | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && record) {
      const r = getResult(record.resultId);
      setResult(r);
      setExpandedIds(new Set());
    } else {
      setResult(null);
    }
  }, [open, record]);

  const overallLevel = result?.overallLevel || record?.overallLevel || 'low';
  const riskItems = result?.riskItems || [];

  const levelBg =
    overallLevel === 'high'
      ? 'bg-accent'
      : overallLevel === 'medium'
        ? 'bg-primary'
        : 'bg-success';

  const levelTextColor =
    overallLevel === 'low' ? 'text-foreground' : 'text-background';

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const conclusion = useMemo(() => {
    if (result?.conclusion) return result.conclusion;
    if (riskItems.length === 0) return '本次检测未发现明显风险点，出行仍需保持警惕。';
    return `检测发现 ${riskItems.length} 个风险点，请注意查看并提前做好应对准备。`;
  }, [result, riskItems.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[88vh] w-[94vw] max-w-md flex-col overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card p-0 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]"
      >
        {/* 顶栏 */}
        <div className="relative border-b-[4px] border-foreground bg-info px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                <FileText className="size-5 text-foreground" />
              </div>
              <div>
                <h2 className="pop-font text-2xl leading-none text-foreground">
                  REPORT DETAIL
                </h2>
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-foreground/70">
                  {record
                    ? new Date(record.createdAt).toLocaleDateString('zh-CN')
                    : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="flex size-9 items-center justify-center rounded-full border-[3px] border-foreground bg-primary text-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
              aria-label="关闭"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-12 text-center"
              >
                <p className="pop-font text-xl text-foreground/40">NO DETAIL</p>
                <p className="mt-2 text-xs font-bold text-muted-foreground">
                  暂无完整报告详情
                </p>
                {record && (
                  <div className="mx-auto mt-6 max-w-[80%] rounded-[1.5rem] border-[3px] border-foreground bg-muted p-4 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      检测摘要
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {record.inputSummary}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`rounded-full border-[2px] border-foreground text-[10px] font-black uppercase ${record.overallLevel === 'high' ? 'bg-accent text-background' : record.overallLevel === 'medium' ? 'bg-warning text-foreground' : 'bg-success text-foreground'}`}
                      >
                        {record.overallLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {result && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 px-4 py-4"
              >
                {/* 风险徽章 */}
                <div
                  className={`relative overflow-hidden rounded-[2rem] border-[5px] border-foreground ${levelBg} p-5 shadow-[10px_10px_0px_0px_rgba(0_0_0_1)]`}
                >
                  <div className="absolute -right-4 -top-4 size-16 rounded-full border-[3px] border-foreground/30" />
                  <div className="absolute -left-3 bottom-4 size-10 rounded-full border-[3px] border-foreground/20" />

                  <div className="relative z-10">
                    <Badge
                      variant="outline"
                      className={`mb-3 rounded-full border-[3px] border-foreground px-3 py-0.5 text-[10px] font-black uppercase tracking-widest ${
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

                    <div className="flex items-end gap-2">
                      <span className={`pop-font text-5xl leading-none ${levelTextColor}`}>
                        {riskItems.length}
                      </span>
                      <span
                        className={`pb-1.5 text-sm font-black uppercase tracking-widest ${levelTextColor} opacity-70`}
                      >
                        PITS FOUND
                      </span>
                    </div>

                    <p className={`mt-3 text-sm font-bold leading-relaxed ${levelTextColor}`}>
                      {conclusion}
                    </p>
                  </div>
                </div>

                {/* 检测对象 */}
                <div className="rounded-[1.5rem] border-[3px] border-foreground bg-muted px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    检测对象
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {result.inputText.length > 100
                      ? result.inputText.slice(0, 100) + '...'
                      : result.inputText}
                  </p>
                </div>

                {/* 风险清单 */}
                <div>
                  <div className="mb-2 inline-block">
                    <div className="inline-flex items-center gap-2 bg-foreground px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(255_59_48_1)]">
                      <AlertTriangle className="size-3.5 text-accent" />
                      <h3 className="pop-font text-base leading-none text-background">
                        RISK LIST
                      </h3>
                      <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-black text-foreground">
                        {riskItems.length}
                      </span>
                    </div>
                  </div>

                  {riskItems.length === 0 && (
                    <div className="rounded-[1.5rem] border-[3px] border-foreground bg-card p-5 text-center shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                      <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full border-[3px] border-foreground bg-success">
                        <ShieldAlert className="size-5 text-foreground" />
                      </div>
                      <p className="pop-font text-lg text-foreground">ALL CLEAR!</p>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">
                        暂无明显风险点
                      </p>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {riskItems.map((item, i) => {
                      const isExpanded = expandedIds.has(item.id);
                      return (
                        <Card
                          key={item.id}
                          className="border-[3px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150"
                        >
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex w-full items-start gap-3 p-3.5 text-left"
                          >
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full border-[2px] border-foreground ${levelToBgSoft(
                                item.riskLevel === 'high' ? 'high' : 'medium',
                              )}`}
                            >
                              <span className="pop-font text-sm leading-none">
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
                                  item.riskLevel === 'high' ? 'high' : 'medium',
                                )}`}
                              >
                                {levelToText(item.riskLevel)}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="size-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="border-t-[3px] border-foreground bg-muted px-3.5 pb-3.5 pt-3">
                              <div className="space-y-3">
                                <div>
                                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                                    🔍 识别说明
                                  </p>
                                  <p className="text-xs font-bold text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
                                    💡 应对建议
                                  </p>
                                  <p className="text-xs font-black text-foreground">
                                    {item.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* AI 报告（如有） */}
                {result.reportMarkdown && (
                  <div>
                    <div className="mb-2 inline-block">
                      <div className="pop-tilt-1 bg-info px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-info-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                        🤖 AI REPORT
                      </div>
                    </div>
                    <Card className="border-[3px] border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                      <p className="text-xs font-bold leading-relaxed text-foreground">
                        {result.reportMarkdown.replace(/[#*_`]/g, '').slice(0, 300)}
                        {result.reportMarkdown.length > 300 ? '...' : ''}
                      </p>
                    </Card>
                  </div>
                )}

                {/* 元信息 */}
                <div className="pt-1 text-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  检测时间：{new Date(result.createdAt).toLocaleString('zh-CN')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部操作 */}
        {result && (
          <div className="border-t-[4px] border-foreground bg-muted px-4 py-3">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-full border-[3px] border-foreground bg-foreground text-xs font-black uppercase tracking-widest text-background hover:bg-accent"
            >
              关闭报告
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
