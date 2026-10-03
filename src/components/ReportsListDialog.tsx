import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Flag,
  FileWarning,
  Clock,
  MapPin,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  getReports,
  type IReportItem,
} from '@/lib/storage';

interface ReportsListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: {
    label: '待审核',
    className: 'bg-warning text-foreground',
  },
  verified: {
    label: '已核实',
    className: 'bg-success text-foreground',
  },
  rejected: {
    label: '未采纳',
    className: 'bg-muted text-muted-foreground',
  },
};

export default function ReportsListDialog({
  open,
  onOpenChange,
}: ReportsListDialogProps) {
  const [reports, setReports] = useState<IReportItem[]>([]);

  useEffect(() => {
    if (open) {
      setReports(getReports());
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] w-[92vw] max-w-md flex-col overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card p-0 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]"
      >
        {/* 顶栏 */}
        <div className="relative border-b-[4px] border-foreground bg-accent px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                <Flag className="size-5 text-foreground" />
              </div>
              <div>
                <h2 className="pop-font text-2xl leading-none text-background">
                  MY REPORTS
                </h2>
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.3em] text-background/70">
                  我的举报记录 · 共 {reports.length} 条
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

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {reports.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border-[4px] border-foreground/20 bg-muted">
                <FileWarning className="size-7 text-foreground/30" />
              </div>
              <p className="pop-font text-xl text-foreground/40">NO REPORTS</p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                还没有举报过踩坑经历
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                举报后会显示在这里
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.05,
                    type: 'spring',
                    bounce: 0.3,
                  }}
                >
                  <Card className="border-[3px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[2px] border-foreground bg-accent text-background">
                          <Flag className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-black uppercase tracking-wide text-foreground">
                              {item.trapType || '未分类套路'}
                            </span>
                            <Badge
                              variant="outline"
                              className={`shrink-0 rounded-full border-[2px] border-foreground text-[9px] font-black uppercase ${statusConfig[item.status].className}`}
                            >
                              {statusConfig[item.status].label}
                            </Badge>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-xs font-bold text-muted-foreground">
                            {item.description}
                          </p>
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-muted-foreground">
                            {item.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {item.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div className="border-t-[4px] border-foreground bg-muted px-4 py-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            举报内容由社区审核 · 助力更多人避坑
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
