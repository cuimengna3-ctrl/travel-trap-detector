import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_TRAPS, type ITrap } from '@/data/traps';
import { levelToBgSoft, levelToText } from '@/lib/risk-utils';
import { getFavorites, toggleFavorite, getTrapHeat } from '@/lib/storage';

function getSignals(trap: ITrap): string[] {
  return (trap.signals || (trap as unknown as { signs?: string[] }).signs || []);
}

type FilterType = 'all' | 'high' | 'medium' | 'fav' | 'hot';

const FILTERS: { key: FilterType; label: string; code: string; emoji: string }[] = [
  { key: 'all', label: 'ALL', code: '全', emoji: '🌟' },
  { key: 'hot', label: 'HOT', code: '热', emoji: '🔥' },
  { key: 'high', label: 'HIGH', code: '高', emoji: '🚨' },
  { key: 'medium', label: 'MED', code: '中', emoji: '⚠️' },
  { key: 'fav', label: 'FAV', code: '藏', emoji: '❤️' },
];

export default function WikiPage() {
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
   const [favorites, setFavorites] = useState<string[]>(getFavorites());

   // 收藏变更时刷新
   useEffect(() => {
     const handler = () => setFavorites(getFavorites());
     window.addEventListener('favorites:refresh', handler);
     return () => window.removeEventListener('favorites:refresh', handler);
   }, []);

  const filteredTraps = useMemo(() => {
    let list: ITrap[] = MOCK_TRAPS;
    if (filter === 'high') list = list.filter((t) => t.riskLevel === 'high');
    else if (filter === 'medium') list = list.filter((t) => t.riskLevel === 'medium');
    else if (filter === 'fav') list = list.filter((t) => favorites.includes(t.id));
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(kw) ||
          t.description.toLowerCase().includes(kw) ||
          getSignals(t).some((s) => s.toLowerCase().includes(kw)),
      );
    }
    // 热门排序：按热度从高到低
    if (filter === 'hot') {
      const heat = getTrapHeat();
      const withHeat = list.map((t) => ({
        trap: t,
        heat: (heat[t.id]?.total || 0) + (heat[t.name]?.total || 0),
      }));
      withHeat.sort((a, b) => b.heat - a.heat);
      return withHeat.map((x) => x.trap);
    }
    return list;
  }, [keyword, filter, favorites]);

  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = toggleFavorite(id);
    setFavorites(getFavorites());
    toast.success(isFav ? '已收藏' : '已取消收藏');
  };

  const handleClear = () => setKeyword('');

  return (
    <div className="min-h-screen bg-primary pop-halftone pb-10">
      {/* 顶部标题横幅 */}
      <section className="relative w-full overflow-hidden border-b-[4px] border-foreground bg-foreground">
        <div className="absolute -right-6 -top-6 size-20 rounded-full border-[4px] border-accent/40" />
        <div className="absolute -left-4 bottom-3 size-12 rounded-full border-[3px] border-success/40" />
        <div className="relative mx-auto max-w-md px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border-[4px] border-foreground bg-accent text-background shadow-[4px_4px_0px_0px_rgba(255_255_255_1)]">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h1 className="pop-font text-4xl leading-none text-background">
                PIT WIKI
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                {MOCK_TRAPS.length} TRAPS · 避坑百科
              </p>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="mt-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground/40" />
              <Input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="SEARCH TRAP..."
                className="h-12 rounded-full border-[4px] border-foreground bg-card pl-12 pr-12 text-sm font-black uppercase tracking-wider text-foreground placeholder:text-foreground/40 focus-visible:ring-0 focus-visible:border-accent"
              />
              {keyword && (
                <button
                  onClick={handleClear}
                  className="!absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-[2px] border-foreground bg-muted text-foreground hover:bg-accent hover:text-background"
                  aria-label="清除"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 分类筛选 */}
      <section className="w-full px-4 pt-5">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-5 gap-2">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex flex-col items-center gap-1 rounded-[1.5rem] border-[3px] border-foreground py-2.5 text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
                    isActive
                      ? 'bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] -translate-y-0.5'
                      : 'bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
            / {filteredTraps.length} RESULTS
          </p>
        </div>
      </section>

      {/* 套路列表 */}
      <section className="w-full px-4 pt-4">
        <div className="mx-auto max-w-md space-y-3">
          {filteredTraps.length === 0 && (
            <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <BookOpen className="size-10 text-accent" />
                <p className="pop-font text-xl text-foreground">NOT FOUND!</p>
                <p className="text-xs font-bold text-muted-foreground">
                  {filter === 'fav' ? '还没有收藏的套路' : '换个关键词试试'}
                </p>
              </CardContent>
            </Card>
          )}

          {filteredTraps.map((trap, i) => {
            const isExpanded = expandedId === trap.id;
            const isFav = favorites.includes(trap.id);
            const level = trap.riskLevel === 'high' ? 'high' : 'medium';
            return (
              <motion.div
                key={trap.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.05,
                  type: 'spring',
                  bounce: 0.3,
                }}
              >
                <Card className="rounded-[2rem] border-[4px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : trap.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground ${levelToBgSoft(
                        level,
                      )}`}
                    >
                      <span className="pop-font text-lg leading-none">
                        {trap.riskLevel === 'high' ? '!' : '?'}
                      </span>
                    </div>
                     <div className="min-w-0 flex-1 pt-0.5">
                       <span className="truncate text-sm font-black uppercase tracking-wide text-foreground">
                         {trap.name}
                       </span>
                       <p className="mt-1 line-clamp-2 text-xs font-bold text-muted-foreground">
                         {trap.description}
                       </p>
                       {filter === 'hot' && (
                         <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent">
                           <Flame className="size-3" />
                           热度 {(getTrapHeat()[trap.id]?.total || 0) + (getTrapHeat()[trap.name]?.total || 0)}
                         </p>
                       )}
                     </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge
                        variant="outline"
                        className={`rounded-full border-[2px] border-foreground text-[10px] font-black uppercase tracking-wider ${levelToBgSoft(
                          level,
                        )}`}
                      >
                        {levelToText(level)}
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
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-accent">
                            🚩 SIGNALS · 识别信号
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {getSignals(trap).map((s) => (
                              <span
                                key={s}
                                className="rounded-full border-[2px] border-foreground bg-card px-3 py-1 text-[10px] font-black uppercase tracking-wider text-foreground"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                            RISK · 风险说明
                          </p>
                          <p className="text-xs font-bold text-muted-foreground">
                            {trap.description}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-success">
                            💡 ADVICE · 应对建议
                          </p>
                          <p className="text-xs font-black text-foreground">
                            {trap.suggestion}
                          </p>
                        </div>
                        {trap.realCase && (
                          <div className="rounded-[1.5rem] border-[3px] border-foreground bg-accent/10 p-3">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
                              📖 CASE · 真实案例
                            </p>
                            <p className="text-xs font-bold text-foreground/80">
                              {trap.realCase}
                            </p>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleToggleFav(trap.id, e)}
                          className="w-full gap-2 rounded-full border-[3px] border-foreground text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted"
                        >
                          <Heart
                            className={`size-4 ${
                              isFav
                                ? 'fill-accent text-accent'
                                : ''
                            }`}
                          />
                          {isFav ? 'FAVORITED' : 'FAVORITE'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

