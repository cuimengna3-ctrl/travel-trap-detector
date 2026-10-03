import { Outlet } from 'react-router-dom';
import BottomTabBar from '@/components/BottomTabBar';

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
};
