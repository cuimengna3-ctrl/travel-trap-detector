import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  User,
  Shield,
  ScanLine,
  Heart,
  Trophy,
  History,
  ChevronRight,
  BookOpen,
  Sparkles,
  Star,
  Flag,
  FileWarning,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';
import {
  getHistory,
  getFavorites,
  getPersonalityUnlockedCount,
  getPersonalityCollection,
  addReport,
  getReports,
  type IHistoryItem,
  type IPersonalityRecord,
} from '@/lib/storage';
import { MOCK_TRAPS, type ITrap } from '@/data/traps';
import PersonalityCodex from '@/components/PersonalityCodex';
import HistoryDetailDialog from '@/components/HistoryDetailDialog';
import TrapDetailDialog from '@/components/TrapDetailDialog';
import ReportsListDialog from '@/components/ReportsListDialog';

const STATS = [
  {
    key: 'scan',
    label: 'SCAN',
    code: '检测',
    icon: ScanLine,
    unit: '次',
    color: 'bg-accent',
  },
  {
    key: 'pit',
    label: 'PIT',
    code: '避坑',
    icon: Shield,
    unit: '个',
    color: 'bg-primary',
  },
  {
    key: 'fav',
    label: 'FAV',
    code: '收藏',
    icon: Heart,
    unit: '个',
    color: 'bg-info',
  },
  {
    key: 'codex',
    label: 'CODEX',
    code: '图鉴',
    icon: Trophy,
    unit: '/20',
    color: 'bg-success',
  },
];

const MENU_ITEMS = [
  {
    key: 'history',
    label: 'SCAN HISTORY',
    sub: '最近检测记录',
    icon: History,
    color: 'bg-info',
    emoji: '📋',
  },
  {
    key: 'favorites',
    label: 'FAVORITES',
    sub: '我的收藏套路',
    icon: Heart,
    color: 'bg-primary',
    emoji: '❤️',
  },
  {
    key: 'reports',
    label: 'MY REPORTS',
    sub: '我的举报记录',
    icon: FileWarning,
    color: 'bg-warning',
    emoji: '🚩',
  },
];

export default function ProfilePage() {
  const [scanCount, setScanCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [codexCount, setCodexCount] = useState(0);
  const [lastRecord, setLastRecord] = useState<IHistoryItem | null>(null);
  const [latestPersonality, setLatestPersonality] = useState<IPersonalityRecord | null>(null);
  const [codexOpen, setCodexOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportTrapType, setReportTrapType] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // 详情弹窗状态
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<IHistoryItem | null>(null);
  const [trapDetailOpen, setTrapDetailOpen] = useState(false);
  const [selectedTrap, setSelectedTrap] = useState<ITrap | null>(null);
  const [reportsListOpen, setReportsListOpen] = useState(false);
  const [reportCount, setReportCount] = useState(0);

  const loadStats = () => {
    const history = getHistory();
    setScanCount(history.length);
    setFavCount(getFavorites().length);
    setCodexCount(getPersonalityUnlockedCount());
    setLastRecord(history[0] || null);
    setReportCount(getReports().length);
    const collection = getPersonalityCollection();
    if (collection.length > 0) {
      const sorted = [...collection].sort(
        (a, b) => b.firstUnlockedAt - a.firstUnlockedAt,
      );
      setLatestPersonality(sorted[0]);
    }
  };

  useEffect(() => {
    loadStats();
    const handler = () => loadStats();
    window.addEventListener('personality:refresh', handler);
    window.addEventListener('favorites:refresh', handler);
    window.addEventListener('reports:refresh', handler);
    return () => {
      window.removeEventListener('personality:refresh', handler);
      window.removeEventListener('favorites:refresh', handler);
      window.removeEventListener('reports:refresh', handler);
    };
  }, []);

  const uniquePits = new Set(
    getHistory().flatMap((r) => r.trapIds || []),
  ).size;

  return (
    <div className="min-h-screen bg-primary pop-halftone pb-10">
      {/* 顶部 Hero */}
      <section className="relative w-full overflow-hidden border-b-[4px] border-foreground bg-foreground">
        <div className="absolute -right-6 top-4 size-16 rounded-full border-[4px] border-primary/30" />
        <div className="absolute -left-5 bottom-5 size-14 rounded-full border-[4px] border-accent/30" />
        <div className="relative mx-auto max-w-md px-4 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex size-18 items-center justify-center overflow-hidden rounded-full border-[5px] border-primary bg-card shadow-[6px_6px_0px_0px_rgba(255_222_0_1)]">
                <Image
                  src={avatarImages.avatarImg1}
                  alt="用户头像"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -right-2 -bottom-2 flex size-9 items-center justify-center rounded-full border-[3px] border-foreground bg-accent text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                <Star className="size-4 fill-primary text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="pop-font text-3xl leading-none text-background pop-text-shadow">
                PIT HUNTER
              </h1>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
                LV.{Math.max(1, Math.floor(scanCount / 3) + 1)} · 避坑猎人
              </p>
              <Badge className="mt-2 rounded-full border-[2px] border-primary bg-transparent text-[9px] font-black uppercase tracking-widest text-primary">
                ELITE MEMBER
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="w-full px-4 pt-5">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">
            / STATS DASHBOARD
          </p>
          <div className="grid grid-cols-4 gap-2">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              const value =
                stat.key === 'scan'
                  ? scanCount
                  : stat.key === 'pit'
                    ? uniquePits
                    : stat.key === 'fav'
                      ? favCount
                      : codexCount;
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.08,
                    type: 'spring',
                    bounce: 0.4,
                  }}
                >
                  <Card className="rounded-[1.5rem] border-[4px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0_0_0_1)]">
                    <CardContent className="flex flex-col items-center gap-1 px-2 py-3 text-center">
                      <div
                        className={`flex size-9 items-center justify-center rounded-full border-[3px] border-foreground ${stat.color}`}
                      >
                        <Icon className="size-4 text-foreground" />
                      </div>
                      <span className="pop-font text-2xl leading-none text-foreground pop-text-shadow">
                        {value}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 最新人格卡 */}
      {latestPersonality && (
        <section className="w-full px-4 pt-5">
          <div className="mx-auto max-w-md">
            <button
              onClick={() => setCodexOpen(true)}
              className="w-full text-left"
            >
              <Card className="overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0_0_0_1)]">
                <div className="flex items-center gap-3 bg-accent px-4 py-3">
                  <Sparkles className="size-4 text-background" />
                  <span className="flex-1 text-[10px] font-black uppercase tracking-[0.3em] text-background">
                    LATEST PERSONALITY
                  </span>
                  <ChevronRight className="size-4 text-background" />
                </div>
                <div className="flex items-center gap-4 p-4">
                  <div className="relative">
                    <Image
                      src={latestPersonality.portraitImage}
                      alt={latestPersonality.name}
                      className="h-16 w-16 object-contain"
                    />
                    {latestPersonality.isHidden && (
                      <div className="absolute -right-2 -top-2 rounded-full border-[2px] border-foreground bg-primary px-1.5 py-0.5 text-[8px] font-black uppercase text-foreground shadow-[2px_2px_0px_0px_rgba(0_0_0_1)]">
                        ✨
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate pop-font text-2xl font-bold leading-none text-foreground pop-text-shadow">
                      {latestPersonality.name}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {latestPersonality.code} · 已收集 {codexCount}/20
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          </div>
        </section>
      )}

      {/* 菜单列表 */}
      <section className="w-full px-4 pt-5">
        <div className="mx-auto max-w-md space-y-3">
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const onClick = () => {
              if (item.key === 'codex') {
                setCodexOpen(true);
              } else if (item.key === 'history') {
                setHistoryOpen(true);
              } else if (item.key === 'favorites') {
                setFavoritesOpen(true);
              } else if (item.key === 'reports') {
                setReportsListOpen(true);
              }
            };
            return (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
                onClick={onClick}
                className="flex w-full items-center gap-3 rounded-[1.5rem] border-[4px] border-foreground bg-card p-4 text-left shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl border-[3px] border-foreground ${item.color} shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]`}
                >
                  <Icon className="size-5 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-wide text-foreground">
                    {item.emoji} {item.label}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                    {item.sub}
                  </p>
                </div>
                <ChevronRight className="size-5 text-foreground" />
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 举报踩坑经历 */}
      <section className="w-full px-4 pt-5">
        <div className="mx-auto max-w-md">
          <motion.button
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
            onClick={() => setReportOpen(true)}
            className="flex w-full items-center gap-3 rounded-[1.5rem] border-[4px] border-foreground bg-card p-4 text-left shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl border-[3px] border-foreground bg-accent shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
              <Flag className="size-5 text-background" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black uppercase tracking-wide text-foreground">
                🚩 REPORT PIT
              </p>
              <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                举报踩坑经历
              </p>
            </div>
            <ChevronRight className="size-5 text-foreground" />
          </motion.button>
        </div>
      </section>

      {/* 关于 */}
      <section className="w-full px-4 pt-8 pb-2">
        <div className="mx-auto max-w-md text-center">
          <p className="pop-font text-xl text-foreground pop-text-shadow">
            AI PIT DETECTOR
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">
            v2.0 · SCAN BEFORE YOU GO
          </p>
        </div>
      </section>

      {/* 图鉴弹窗 */}
      <PersonalityCodex open={codexOpen} onOpenChange={setCodexOpen} />

      {/* 历史记录弹窗 */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent showCloseButton={false} className="flex max-h-[85vh] w-[92vw] max-w-md flex-col overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card p-0 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]">
          <div className="relative border-b-[4px] border-foreground bg-info px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                  <History className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="pop-font text-2xl leading-none text-foreground">
                    HISTORY
                  </h2>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/70">
                    最近检测记录 · 共 {scanCount} 条
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="flex size-9 items-center justify-center rounded-full border-[3px] border-foreground bg-primary text-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
                aria-label="关闭"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {(() => {
              const list = getHistory();
              if (list.length === 0) {
                return (
                  <div className="py-12 text-center">
                    <p className="pop-font text-xl text-foreground/40">NO RECORDS</p>
                    <p className="mt-2 text-xs font-bold text-muted-foreground">暂无检测记录</p>
                  </div>
                );
              }
               return list.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => {
                     setSelectedHistory(item);
                     setHistoryDetailOpen(true);
                   }}
                   className="mb-3 w-full text-left"
                 >
                   <div
                     className="rounded-[1.5rem] border-[3px] border-foreground bg-card p-3 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]"
                   >
                     <div className="flex items-start gap-3">
                       <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[2px] border-foreground bg-primary">
                         <ScanLine className="size-4 text-foreground" />
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="truncate text-sm font-black uppercase text-foreground">
                           {item.inputSummary || '扫描记录'}
                         </p>
                         <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                           {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                         </p>
                       </div>
                       <Badge
                         variant="outline"
                         className={`shrink-0 rounded-full border-[2px] border-foreground text-[9px] font-black uppercase ${item.overallLevel === 'high' ? 'bg-accent text-background' : item.overallLevel === 'medium' ? 'bg-warning text-foreground' : 'bg-success text-foreground'}`}
                       >
                         {item.overallLevel.toUpperCase()}
                       </Badge>
                     </div>
                   </div>
                 </button>
               ));
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* 收藏套路弹窗 */}
      <Dialog open={favoritesOpen} onOpenChange={setFavoritesOpen}>
        <DialogContent showCloseButton={false} className="flex max-h-[85vh] w-[92vw] max-w-md flex-col overflow-hidden rounded-[2rem] border-[5px] border-foreground bg-card p-0 shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]">
          <div className="relative border-b-[4px] border-foreground bg-primary px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0_0_0_1)]">
                  <Heart className="size-5 text-accent fill-accent" />
                </div>
                <div>
                  <h2 className="pop-font text-2xl leading-none text-foreground">
                    FAVORITES
                  </h2>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/70">
                    我的收藏套路 · 共 {favCount} 条
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFavoritesOpen(false)}
                className="flex size-9 items-center justify-center rounded-full border-[3px] border-foreground bg-card text-foreground shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0_0_0_1)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0_0_0_1)]"
                aria-label="关闭"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {(() => {
              const favIds = getFavorites();
              const favTraps = MOCK_TRAPS.filter((t) => favIds.includes(t.id));
              if (favTraps.length === 0) {
                return (
                  <div className="py-12 text-center">
                    <p className="pop-font text-xl text-foreground/40">NO FAVORITES</p>
                    <p className="mt-2 text-xs font-bold text-muted-foreground">还没有收藏的套路</p>
                  </div>
                );
              }
               return favTraps.map((trap) => (
                 <button
                   key={trap.id}
                   onClick={() => {
                     setSelectedTrap(trap);
                     setTrapDetailOpen(true);
                   }}
                   className="mb-3 w-full text-left"
                 >
                   <div
                     className="rounded-[1.5rem] border-[3px] border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_rgba(0_0_0_1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0_0_0_1)]"
                   >
                     <div className="flex items-start gap-3">
                       <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[2px] border-foreground bg-accent text-background">
                         <span className="text-base">🚩</span>
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="text-sm font-black uppercase text-foreground">
                           {trap.name}
                         </p>
                         <p className="mt-1 text-xs font-bold text-muted-foreground line-clamp-2">
                           {trap.description}
                         </p>
                       </div>
                       <Badge
                         variant="outline"
                         className={`shrink-0 rounded-full border-[2px] border-foreground text-[9px] font-black uppercase ${trap.riskLevel === 'high' ? 'bg-accent text-background' : 'bg-warning text-foreground'}`}
                       >
                         {trap.riskLevel.toUpperCase()}
                       </Badge>
                     </div>
                   </div>
                 </button>
               ));
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* 举报弹窗 */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="w-[92vw] max-w-sm rounded-[2rem] border-[5px] border-foreground bg-card shadow-[12px_12px_0px_0px_rgba(0_0_0_1)]">
          <DialogHeader>
            <DialogTitle className="pop-font text-2xl text-foreground">
              REPORT IT
            </DialogTitle>
          </DialogHeader>
           <div className="space-y-3">
             <p className="text-xs font-bold text-muted-foreground">
               分享你的故事，让更多人避坑
             </p>
             <div>
               <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-foreground">
                 套路类型
               </label>
               <Input
                 value={reportTrapType}
                 onChange={(e) => setReportTrapType(e.target.value)}
                 placeholder="如：低价购物团 / 黑车加价"
                 className="rounded-[1rem] border-[3px] border-foreground text-sm font-bold"
                 maxLength={20}
               />
             </div>
             <div>
               <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-foreground">
                 地点/对象
               </label>
               <Input
                 value={reportLocation}
                 onChange={(e) => setReportLocation(e.target.value)}
                 placeholder="如：云南 / 某旅行社"
                 className="rounded-[1rem] border-[3px] border-foreground text-sm font-bold"
                 maxLength={30}
               />
             </div>
             <div>
               <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-foreground">
                 详细描述
               </label>
               <Textarea
                 value={reportText}
                 onChange={(e) => setReportText(e.target.value)}
                 placeholder="描述一下你遇到的踩坑经历..."
                 className="min-h-[100px] resize-none rounded-[1.25rem] border-[3px] border-foreground text-sm font-bold"
                 maxLength={300}
               />
               <p className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                 {reportText.length}/300
               </p>
             </div>
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
               onClick={async () => {
                 if (!reportText.trim()) return;
                 setReportSubmitting(true);
                 try {
                   addReport({
                     trapType: reportTrapType.trim() || '其他套路',
                     location: reportLocation.trim(),
                     description: reportText.trim(),
                   });
                   toast.success('已提交，感谢你的避坑贡献 🚩');
                   setReportOpen(false);
                   setReportTrapType('');
                   setReportLocation('');
                   setReportText('');
                   loadStats();
                   window.dispatchEvent(new Event('reports:refresh'));
                 } catch {
                   toast.error('提交失败，请稍后再试');
                 } finally {
                   setReportSubmitting(false);
                 }
               }}
              disabled={reportSubmitting || !reportText.trim()}
              className="rounded-full border-[3px] border-foreground bg-accent text-xs font-black uppercase tracking-widest text-background shadow-[3px_3px_0px_0px_rgba(0_0_0_1)] hover:bg-accent/90"
            >
              {reportSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </Button>
          </DialogFooter>
        </DialogContent>
       </Dialog>

      {/* 历史记录详情弹窗 */}
      <HistoryDetailDialog
        open={historyDetailOpen}
        onOpenChange={setHistoryDetailOpen}
        record={selectedHistory}
      />

      {/* 套路详情弹窗 */}
      <TrapDetailDialog
        open={trapDetailOpen}
        onOpenChange={setTrapDetailOpen}
        trap={selectedTrap}
      />

      {/* 我的举报列表弹窗 */}
      <ReportsListDialog
        open={reportsListOpen}
        onOpenChange={setReportsListOpen}
      />
    </div>
  );
}
