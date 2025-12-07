import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Loader2,
  X,
  CalendarDays,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { isToday, isTomorrow, isThisWeek, parseISO, compareAsc } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { Child, ActionItem, SchoolEvent } from '../types';
import { askDashboardAgent } from '../services/geminiService';
import { useAuth } from '../src/contexts/AuthContext';

// Components
import { EventCard } from './EventCard';
import { ActionCard } from './ActionCard';
import { ActionsBanner } from './ActionsBanner';
import { EmptyState } from './EmptyState';
import { ChildFilter } from './ChildFilter';
import DashboardSkeleton from './DashboardSkeleton';

interface DashboardProps {
  childrenList: Child[];
  events: SchoolEvent[];
  actions: ActionItem[];
  onToggleAction: (id: string) => void;
  isLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ childrenList, events, actions, onToggleAction, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const greeting = getGreeting();

  // --- Filtering & Data Processing ---

  const filterByChild = (item: { childId: string }) => {
    return selectedChildId === 'all' || item.childId === selectedChildId;
  };

  // Sort events chronologically
  const sortedEvents = [...events]
    .filter(filterByChild)
    .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));

  // Group events
  const todayEvents = sortedEvents.filter(e => isToday(parseISO(e.date)));
  const tomorrowEvents = sortedEvents.filter(e => isTomorrow(parseISO(e.date)));
  const thisWeekEvents = sortedEvents.filter(e =>
    !isToday(parseISO(e.date)) &&
    !isTomorrow(parseISO(e.date)) &&
    isThisWeek(parseISO(e.date), { weekStartsOn: 1 })
  );

  // Urgent/Pending Actions for Banner (overdue or due soon)
  const pendingActions = actions
    .filter(a => !a.isCompleted)
    .filter(filterByChild);

  // Helper to find child for an item
  const getChild = (childId: string) => childrenList.find(c => c.id === childId);

  // Chart Data Preparation
  const chartData = childrenList.map(child => {
    const childEvents = events.filter(e => e.childId === child.id).length;
    const childActions = actions.filter(a => a.childId === child.id && !a.isCompleted).length;
    return {
      name: child.name,
      Events: childEvents,
      'Actions Due': childActions
    };
  });

  const handleAskAgent = async () => {
    if (!query.trim()) return;
    setIsAsking(true);
    setAnswer(null);
    try {
      const enrichedEvents = events.map(e => ({
        ...e,
        childName: getChild(e.childId)?.name || 'Unknown'
      }));
      const enrichedActions = actions.map(a => ({
        ...a,
        childName: getChild(a.childId)?.name || 'Unknown'
      }));

      const response = await askDashboardAgent(query, { events: enrichedEvents, actions: enrichedActions });
      setAnswer(response);
    } catch (e) {
      setAnswer("Something went wrong with the AI agent.");
    } finally {
      setIsAsking(false);
    }
  };

  const simulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 relative min-h-screen">

      {/* Pull to Refresh Indicator (Visual Only) */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center py-4"
          >
            <div className="bg-background-primary rounded-full p-2 shadow-soft">
              <Loader2 className="animate-spin text-brand-purple" size={20} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Banner */}
      <div className="mb-6">
        <ActionsBanner
          actions={pendingActions}
          onClick={() => navigate('/actions')}
        />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div onClick={simulateRefresh} className="cursor-pointer">
          {/* Date Display */}
          <p className="text-foreground-secondary font-medium text-sm font-serif">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-3xl font-bold text-foreground-primary mt-1 font-serif">{greeting}, {displayName} 👋</h2>
        </div>

        {/* Quick Process Button */}
        <Link to="/inbox" className="hidden md:flex bg-background-primary text-foreground-secondary px-6 py-2 rounded-pill text-sm font-medium transition-all shadow-soft items-center gap-2 hover:shadow-floating">
          <span>Synced just now</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </Link>
      </div>

      {/* Child Filter */}
      <ChildFilter
        childrenList={childrenList}
        selectedChildId={selectedChildId}
        onSelect={setSelectedChildId}
      />

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Column: Timeline */}
        <div className="flex-1 space-y-8">

          {/* TODAY Section */}
          <section>
            <h3 className="text-sm font-bold text-foreground-secondary uppercase tracking-wider mb-4 font-sans">Today</h3>
            <AnimatePresence mode='popLayout'>
              {todayEvents.length > 0 ? (
                todayEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    child={getChild(event.childId)}
                  />
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <EmptyState
                    icon={CalendarDays}
                    title="All clear for today! ✨"
                    description={tomorrowEvents.length > 0 ? "Check tomorrow's schedule below." : "No events scheduled for today."}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* TOMORROW Section */}
          <section>
            <h3 className="text-sm font-bold text-foreground-secondary uppercase tracking-wider mb-4 font-sans">Tomorrow</h3>
            <AnimatePresence mode='popLayout'>
              {tomorrowEvents.length > 0 ? (
                tomorrowEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    child={getChild(event.childId)}
                  />
                ))
              ) : (
                <p className="text-foreground-muted text-sm italic ml-2">Nothing scheduled for tomorrow yet.</p>
              )}
            </AnimatePresence>
          </section>

          {/* THIS WEEK Section */}
          {thisWeekEvents.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground-secondary uppercase tracking-wider font-sans">Rest of this Week</h3>
                <Link to="/timeline" className="text-brand-purple text-sm font-medium hover:underline">View Calendar</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {thisWeekEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    child={getChild(event.childId)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* PENDING ACTIONS */}
          {pendingActions.length > 0 && (
            <section className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-foreground-secondary uppercase tracking-wider mb-4 font-sans">Outstanding Actions</h3>
              <AnimatePresence>
                {pendingActions.slice(0, 3).map(action => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    child={getChild(action.childId)}
                    onToggle={onToggleAction}
                  />
                ))}
              </AnimatePresence>
              {pendingActions.length > 3 && (
                <Link to="/actions" className="block text-center text-sm text-brand-purple font-medium py-2 hover:bg-brand-lavender rounded-inner transition-colors">
                  View {pendingActions.length - 3} more actions
                </Link>
              )}
            </section>
          )}
        </div>

        {/* Right Column: AI & Widgets (Desktop) */}
        <div className="w-full lg:w-80 xl:w-96 space-y-6">

          {/* AI Assistant */}
          <div className="bg-brand-purple rounded-card p-6 text-white shadow-soft relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-brand-lime" />
                <h3 className="font-bold text-lg font-serif">Assistant</h3>
              </div>
              <p className="text-brand-lavender text-sm mb-4">Ask about schedules, payments, or find details.</p>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="w-full bg-white/10 border border-white/20 rounded-pill px-4 py-3 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 transition-all text-sm"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskAgent()}
                />
                <button
                  onClick={handleAskAgent}
                  className="absolute right-2 top-[5px] p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  {isAsking ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>

              {answer && (
                <div className="mt-4 bg-white/10 rounded-inner p-3 text-sm animate-in fade-in">
                  <p>{answer}</p>
                  <button onClick={() => setAnswer(null)} className="absolute top-2 right-2 text-white/50 hover:text-white"><X size={12} /></button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-background-primary rounded-card p-6 shadow-soft hidden md:block">
            <h3 className="text-sm font-bold text-foreground-primary mb-4 font-sans uppercase tracking-wider">Activity Overview</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Events" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Actions Due" fill="#fca5a5" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;