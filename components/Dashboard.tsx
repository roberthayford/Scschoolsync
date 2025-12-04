import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Clock,
  Sparkles,
  Loader2,
  X
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
import { format } from 'date-fns';
import { Child, ActionItem, SchoolEvent, UrgencyLevel, CategoryType } from '../types';
import { askDashboardAgent } from '../services/geminiService';

interface DashboardProps {
  childrenList: Child[];
  events: SchoolEvent[];
  actions: ActionItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ childrenList, events, actions }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  
  // Sort actions by urgency and deadline
  const urgentActions = actions
    .filter(a => !a.isCompleted)
    .sort((a, b) => {
      const urgencyMap = { [UrgencyLevel.CRITICAL]: 3, [UrgencyLevel.HIGH]: 2, [UrgencyLevel.MEDIUM]: 1, [UrgencyLevel.LOW]: 0 };
      return urgencyMap[b.urgency] - urgencyMap[a.urgency];
    })
    .slice(0, 3);

  // Get today's events
  const today = new Date().toISOString().split('T')[0];
  const todaysEvents = events.filter(e => e.date.startsWith(today));

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

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case UrgencyLevel.CRITICAL: return 'bg-red-100 text-red-700 border-red-200';
      case UrgencyLevel.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      case UrgencyLevel.MEDIUM: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAskAgent = async () => {
    if (!query.trim()) return;
    setIsAsking(true);
    setAnswer(null);
    try {
      // Simulate context enrichment by adding child names
      const enrichedEvents = events.map(e => ({
        ...e,
        childName: childrenList.find(c => c.id === e.childId)?.name || 'Unknown'
      }));
      const enrichedActions = actions.map(a => ({
        ...a,
        childName: childrenList.find(c => c.id === a.childId)?.name || 'Unknown'
      }));
      
      const response = await askDashboardAgent(query, { events: enrichedEvents, actions: enrichedActions });
      setAnswer(response);
    } catch (e) {
      setAnswer("Something went wrong with the AI agent.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Good Morning, John 👋</h2>
          <p className="text-slate-500">Here is what's happening with school today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/inbox" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2">
            <span>Process New Emails</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-white/20 p-3 rounded-xl shrink-0">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">AI Schedule Assistant</h3>
            <p className="text-indigo-100 text-sm mb-4">Ask about upcoming events, payments, or what you might have missed.</p>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Try: 'Do I have any payments due this week?' or 'When is Emma's swimming?'"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all pr-12"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAgent()}
              />
              <button 
                onClick={handleAskAgent}
                className="absolute right-2 top-2 p-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                disabled={isAsking || !query.trim()}
              >
                {isAsking ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
            
            {answer && (
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 relative">
                <button 
                  onClick={() => { setAnswer(null); setQuery(''); }} 
                  className="absolute top-2 right-2 text-indigo-200 hover:text-white"
                >
                  <X size={14} />
                </button>
                <div className="flex gap-2">
                   <Sparkles size={16} className="text-yellow-300 mt-0.5 shrink-0" />
                   <p className="text-sm leading-relaxed">{answer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Overview Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-500" />
              Today's Schedule
            </h3>
            <span className="text-sm text-slate-400">{format(new Date(), 'EEEE, MMMM do')}</span>
          </div>
          
          {todaysEvents.length > 0 ? (
            <div className="space-y-3">
              {todaysEvents.map(evt => {
                const child = childrenList.find(c => c.id === evt.childId);
                return (
                  <div key={evt.id} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`w-1 h-12 rounded-full bg-${child?.color || 'gray'}-500 shrink-0`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-slate-900">{evt.title}</h4>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-white border border-slate-200 text-slate-600">{evt.time}</span>
                      </div>
                      <p className="text-sm text-slate-500">{child?.name} • {evt.location || 'School'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle size={32} className="mb-2 opacity-50" />
              <p>No events scheduled for today.</p>
            </div>
          )}
        </div>

        {/* Action Required Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-500" />
              Actions Required
            </h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
              {actions.filter(a => !a.isCompleted).length}
            </span>
          </div>

          <div className="space-y-3">
            {urgentActions.map(action => {
              const child = childrenList.find(c => c.id === action.childId);
              return (
                <div key={action.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getUrgencyBadge(action.urgency)}`}>
                      {action.urgency}
                    </span>
                    <span className="text-xs text-slate-400">Due {format(new Date(action.deadline), 'MMM d')}</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 mb-1 leading-snug">{action.title}</h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${child?.color || 'gray'}-500`}></div>
                    <span className="text-xs text-slate-500">{child?.name}</span>
                  </div>
                </div>
              );
            })}
            
            {urgentActions.length === 0 && (
               <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <p>All caught up!</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <Link to="/actions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All Actions &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Activity Overview</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="Events" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="Actions Due" fill="#fca5a5" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;