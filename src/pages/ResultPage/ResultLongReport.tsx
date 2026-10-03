import { forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  levelToText,
  levelToBgSoft,
} from '@/lib/risk-utils';
import type { IRiskItem } from '@/lib/storage';
import type { ITipItem } from '@/data/destinations';

interface ResultLongReportProps {
  overallLevel: 'high' | 'medium' | 'low';
  riskCount: number;
  conclusion: string;
  riskItems: IRiskItem[];
  destName: string | null;
  destTips: ITipItem[];
  generalTips: ITipItem[];
  inputSummary: string;
  reportMarkdown: string;
}

const ResultLongReport = forwardRef<HTMLDivElement, ResultLongReportProps>(
  function ResultLongReport(
    {
      overallLevel,
      riskCount,
      conclusion,
      riskItems,
      destName,
      destTips,
      generalTips,
      inputSummary,
    },
    ref,
  ) {
    const levelBg =
      overallLevel === 'high'
        ? 'bg-accent'
        : overallLevel === 'medium'
          ? 'bg-primary'
          : 'bg-success';

    const levelTextColor =
      overallLevel === 'low' ? 'text-foreground' : 'text-background';

    return (
      <div
        ref={ref}
        className="relative w-[375px] overflow-hidden bg-primary"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* 波普半色调底 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(rgba(0,0,0,0.12) 2px, transparent 2px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 p-5 pb-6">
          {/* ========== 顶部品牌 ========== */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-foreground bg-foreground text-background">
                <span className="pop-font text-lg">🚩</span>
              </div>
              <div>
                <p className="pop-font text-xl leading-none text-foreground">
                  AI 避坑检测
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
                  PIT HUNTER · 出行前测一测
                </p>
              </div>
            </div>
          </div>

          {/* ========== 检测对象 ========== */}
          <div className="mb-5 rounded-[1.5rem] border-[4px] border-foreground bg-card px-4 py-3.5 shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              检测对象
            </p>
            <p className="mt-1.5 text-sm font-black leading-relaxed text-foreground">
              {inputSummary}
            </p>
          </div>

          {/* ========== 风险等级大徽章 ========== */}
          <div
            className={`relative mb-5 overflow-hidden rounded-[2rem] border-[5px] border-foreground ${levelBg} p-6 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]`}
          >
            <div className="absolute -right-5 -top-5 size-20 rounded-full border-[4px] border-foreground/30" />
            <div className="absolute -left-4 bottom-5 size-12 rounded-full border-[3px] border-foreground/20" />
            <div className="absolute right-16 bottom-3 size-8 rounded-full border-[3px] border-foreground/25" />

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
                <span className={`pop-font text-7xl leading-none ${levelTextColor}`}>
                  {riskCount}
                </span>
                <span
                  className={`pb-2 text-lg font-black uppercase tracking-widest ${levelTextColor} opacity-70`}
                >
                  PITS FOUND
                </span>
              </div>

              <p className={`mt-4 text-sm font-bold leading-relaxed ${levelTextColor}`}>
                {conclusion || 'AI 正在分析中...'}
              </p>
            </div>
          </div>

          {/* ========== 统计三栏 ========== */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="pop-tilt-3 rounded-[1.5rem] border-[4px] border-foreground bg-accent p-3 text-center text-background shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <p className="pop-font text-3xl leading-none">
                {riskItems.filter((r) => r.riskLevel === 'high').length}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest opacity-90">
                HIGH
              </p>
            </div>
            <div className="rounded-[1.5rem] border-[4px] border-foreground bg-primary p-3 text-center text-foreground shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <p className="pop-font text-3xl leading-none">
                {riskItems.filter((r) => r.riskLevel === 'medium').length}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest opacity-90">
                MED
              </p>
            </div>
            <div className="pop-tilt-2 rounded-[1.5rem] border-[4px] border-foreground bg-success p-3 text-center text-foreground shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <p className="pop-font text-3xl leading-none">
                {riskItems.filter((r) => r.riskLevel === 'low').length}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest opacity-90">
                LOW
              </p>
            </div>
          </div>

          {/* ========== 完整风险清单 ========== */}
          <div className="mb-5">
            <div className="mb-3 inline-block">
              <div className="inline-flex items-center gap-2 bg-foreground px-4 py-2 shadow-[4px_4px_0px_0px_rgba(255_59_48_1)]">
                <h2 className="pop-font text-lg leading-none text-background">
                  完整风险清单
                </h2>
                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-black text-foreground">
                  {riskCount}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {riskItems.map((item, i) => (
                <div
                  key={item.id}
                  className="rounded-[1.5rem] border-[4px] border-foreground bg-card p-4 shadow-[5px_5px_0px_0px_rgba(0_0_0_1)]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground ${levelToBgSoft(
                        item.riskLevel,
                      )}`}
                    >
                      <span className="pop-font text-base leading-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-black uppercase tracking-wide text-foreground">
                          {item.trapName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`shrink-0 rounded-full border-[2px] border-foreground text-[10px] font-black uppercase tracking-wider ${levelToBgSoft(
                            item.riskLevel,
                          )}`}
                        >
                          {levelToText(item.riskLevel)}
                        </Badge>
                      </div>

                      <div className="mt-2.5 space-y-2.5">
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            🔍 识别说明
                          </p>
                          <p className="text-xs font-bold leading-relaxed text-foreground">
                            {item.description}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
                            💡 应对建议
                          </p>
                          <p className="text-xs font-black leading-relaxed text-foreground">
                            {item.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {riskItems.length === 0 && (
                <div className="rounded-[1.5rem] border-[4px] border-foreground bg-card p-6 text-center shadow-[5px_5px_0px_0px_rgba(0_0_0_1)]">
                  <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full border-[4px] border-foreground bg-success">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <p className="pop-font text-2xl text-foreground">ALL CLEAR!</p>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">
                    暂无明显风险点
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========== 目的地注意事项 ========== */}
          {(destTips.length > 0 || generalTips.length > 0) && (
            <div className="mb-5">
              <div className="mb-3 inline-block">
                <div className="pop-tilt-1 bg-info px-4 py-2 text-[11px] font-black uppercase tracking-widest text-info-foreground shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                  📍 {destName || '出行'} 避坑提示
                </div>
              </div>

              <div className="space-y-2.5">
                {destTips.slice(0, 4).map((tip) => (
                  <div
                    key={tip.id}
                    className="rounded-[1.25rem] border-[3px] border-foreground bg-card px-3.5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]"
                  >
                    <p className="text-xs font-bold leading-relaxed text-foreground">
                      ⚠️ {tip.content}
                    </p>
                  </div>
                ))}
                {generalTips.slice(0, 2).map((tip) => (
                  <div
                    key={tip.id}
                    className="rounded-[1.25rem] border-[3px] border-foreground bg-muted px-3.5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]"
                  >
                    <p className="text-xs font-bold leading-relaxed text-foreground">
                      💡 {tip.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== 结尾引导 ========== */}
          <div className="mt-6 rounded-[1.75rem] border-[5px] border-foreground bg-foreground p-5 text-center shadow-[8px_8px_0px_0px_rgba(255_222_0_1)]">
            <p className="pop-font text-2xl leading-none text-primary">
              出行前 · 测一测
            </p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-background/80">
              AI 帮你识破套路 · 避开陷阱
            </p>
            <div className="mx-auto mt-3 flex size-16 items-center justify-center rounded-full border-[3px] border-primary/40 bg-background/10">
              <span className="text-2xl">🚩</span>
            </div>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary/80">
              PIT HUNTER · AI避坑检测器
            </p>
          </div>
        </div>
      </div>
    );
  },
);

export default ResultLongReport;
