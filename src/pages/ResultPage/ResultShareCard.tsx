import { forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  levelToText,
  levelToBgSoft,
} from '@/lib/risk-utils';
import type { IRiskItem } from '@/lib/storage';
import type { ITipItem } from '@/data/destinations';

interface ResultShareCardProps {
  overallLevel: 'high' | 'medium' | 'low';
  riskCount: number;
  conclusion: string;
  riskItems: IRiskItem[];
  destName: string | null;
  destTips: ITipItem[];
  inputSummary: string;
}

const ResultShareCard = forwardRef<HTMLDivElement, ResultShareCardProps>(
  function ResultShareCard(
    { overallLevel, riskCount, conclusion, riskItems, destName, destTips, inputSummary },
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
        className="relative w-[375px] overflow-hidden bg-primary p-5"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* 波普半色调底 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(rgba(0,0,0,0.12) 2px, transparent 2px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative z-10">
          {/* 顶部品牌 */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full border-[3px] border-foreground bg-foreground text-background">
                <span className="pop-font text-base">🚩</span>
              </div>
              <div>
                <p className="pop-font text-lg leading-none text-foreground">
                  AI 避坑检测
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
                  PIT HUNTER · 出行前测一测
                </p>
              </div>
            </div>
          </div>

          {/* 检测对象 */}
          <div className="mb-4 rounded-[1.5rem] border-[4px] border-foreground bg-card px-4 py-3 shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              检测对象
            </p>
            <p className="mt-1 text-sm font-black text-foreground line-clamp-2">
              {inputSummary}
            </p>
          </div>

          {/* 风险徽章主卡 */}
          <div
            className={`relative mb-4 overflow-hidden rounded-[2rem] border-[5px] border-foreground ${levelBg} p-5 shadow-[10px_10px_0px_0px_rgba(0_0_0_1)]`}
          >
            {/* 装饰圆 */}
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
                <span className={`pop-font text-6xl leading-none ${levelTextColor}`}>
                  {riskCount}
                </span>
                <span
                  className={`pb-1.5 text-base font-black uppercase tracking-widest ${levelTextColor} opacity-70`}
                >
                  PITS FOUND
                </span>
              </div>

              <p className={`mt-3 text-sm font-bold leading-relaxed ${levelTextColor}`}>
                {conclusion || '正在分析中...'}
              </p>
            </div>
          </div>

          {/* 风险清单 */}
          <div className="mb-4">
            <div className="mb-2 inline-block">
              <div className="inline-flex items-center gap-2 bg-foreground px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(255_59_48_1)]">
                <h3 className="pop-font text-base leading-none text-background">
                  RISK LIST
                </h3>
                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-black text-foreground">
                  {riskCount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {riskItems.slice(0, 3).map((item, i) => (
                <div
                  key={item.id}
                  className="rounded-[1.5rem] border-[3px] border-foreground bg-card px-3 py-2.5 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border-[2px] border-foreground ${levelToBgSoft(
                        item.riskLevel,
                      )}`}
                    >
                      <span className="pop-font text-xs leading-none">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-black uppercase tracking-wide text-foreground">
                          {item.trapName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`shrink-0 rounded-full border-[2px] border-foreground text-[9px] font-black uppercase tracking-wider ${levelToBgSoft(
                            item.riskLevel,
                          )}`}
                        >
                          {levelToText(item.riskLevel)}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-bold text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {riskCount > 3 && (
                <div className="text-center text-[11px] font-black uppercase tracking-widest text-foreground/60">
                  +{riskCount - 3} 更多风险 · 查看完整报告
                </div>
              )}
            </div>
          </div>

          {/* 目的地注意事项 */}
          {destTips.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 inline-block">
                <div className="pop-tilt-1 bg-info px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-info-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                  📍 {destName || '目的地'} TIPS
                </div>
              </div>
              <div className="space-y-2">
                {destTips.slice(0, 2).map((tip) => (
                  <div
                    key={tip.id}
                    className="rounded-[1.25rem] border-[3px] border-foreground bg-card px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]"
                  >
                    <p className="text-[11px] font-bold leading-relaxed text-foreground">
                      ⚠️ {tip.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底部品牌引导 */}
          <div className="mt-4 rounded-[1.5rem] border-[4px] border-foreground bg-foreground px-4 py-3 text-center shadow-[6px_6px_0px_0px_rgba(255_222_0_1)]">
            <p className="pop-font text-xl leading-none text-primary">
              出行前 · 测一测
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-background/80">
              扫码用 AI 避坑检测器
            </p>
          </div>
        </div>
      </div>
    );
  },
);

export default ResultShareCard;
