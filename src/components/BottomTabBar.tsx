import { NavLink, useLocation } from 'react-router-dom';
import { Shield, Brain, BookOpen, User } from 'lucide-react';

const TABS = [
  { path: '/', label: '体检', icon: Shield, code: 'SCAN' },
  { path: '/test', label: '测试', icon: Brain, code: 'TEST' },
  { path: '/wiki', label: '百科', icon: BookOpen, code: 'WIKI' },
  { path: '/profile', label: '我的', icon: User, code: 'ME' },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-[4px] border-foreground bg-card">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-all duration-150 ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                className={`size-5 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {tab.code}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
