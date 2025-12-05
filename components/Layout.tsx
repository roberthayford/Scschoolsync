import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Users, Inbox, Settings, Loader2, Sun, Moon } from 'lucide-react';
import UserAccountWidget from './UserAccountWidget';
import { useTheme } from '../src/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  isSyncing?: boolean;
  syncStatus?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children, isSyncing = false, syncStatus }) => {
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Timeline', path: '/timeline', icon: Calendar },
    { name: 'Actions', path: '/actions', icon: CheckSquare },
    { name: 'Children', path: '/children', icon: Users },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => item.path === location.pathname);
    return current ? current.name : 'SchoolSync';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">

      {/* Sidebar - Hidden on Mobile, Visible on Desktop */}
      <aside className="hidden lg:flex z-30 w-72 h-full bg-white dark:bg-slate-800 border-r border-slate-200/60 dark:border-slate-700 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] flex-col transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SchoolSync</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <UserAccountWidget />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700 flex items-center justify-between px-4 lg:px-10 z-10 sticky top-0 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Background Sync Status Indicator */}
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium animate-pulse">
                <Loader2 className="animate-spin" size={16} />
                <span className="hidden sm:inline">{syncStatus || 'Syncing...'}</span>
                <span className="sm:hidden">Syncing</span>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>

        {/* Bottom Navigation Bar - Mobile Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 pb-safe transition-colors duration-200">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                  ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;