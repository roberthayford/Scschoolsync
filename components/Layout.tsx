import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Users, Inbox, Settings, Loader2 } from 'lucide-react';
import UserAccountWidget from './UserAccountWidget';

interface LayoutProps {
  children: React.ReactNode;
  isSyncing?: boolean;
  syncStatus?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children, isSyncing = false, syncStatus }) => {
  const location = useLocation();

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
    <div className="flex h-screen bg-background-secondary text-foreground-primary font-sans overflow-hidden">

      {/* Sidebar - Hidden on Mobile, Visible on Desktop */}
      <aside className="hidden lg:flex z-30 w-72 h-full bg-background-primary border-r border-gray-100 shadow-soft flex-col">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground-primary rounded-inner flex items-center justify-center">
              <span className="text-white font-bold text-lg font-serif">S</span>
            </div>
            <h1 className="text-xl font-bold text-foreground-primary tracking-tight font-serif">SchoolSync</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3.5 rounded-card transition-all duration-200 group
                ${isActive
                  ? 'bg-foreground-primary text-white shadow-soft font-medium'
                  : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground-primary'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-foreground-muted group-hover:text-foreground-primary'} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <UserAccountWidget />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-background-primary/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground-primary font-serif">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Background Sync Status Indicator */}
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-lavender text-brand-purple rounded-pill text-sm font-medium animate-pulse">
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-primary border-t border-gray-100 shadow-floating z-40 pb-safe">
          <div className="flex items-center justify-around h-20 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                  ${isActive ? 'text-foreground-primary' : 'text-foreground-muted hover:text-foreground-primary'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
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