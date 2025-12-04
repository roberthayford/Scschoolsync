import React, { useState } from 'react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { Child, SchoolEvent, CategoryType } from '../types';
import { Filter, Calendar as CalIcon, MapPin } from 'lucide-react';

interface TimelineProps {
  events: SchoolEvent[];
  childrenList: Child[];
}

const Timeline: React.FC<TimelineProps> = ({ events, childrenList }) => {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter Logic
  const filteredEvents = events
    .filter(evt => selectedChild === 'all' || evt.childId === selectedChild)
    .filter(evt => selectedCategory === 'all' || evt.category === selectedCategory)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCategoryColor = (cat: CategoryType) => {
    switch (cat) {
      case CategoryType.ACTION_REQUIRED: return 'text-red-600 bg-red-50 border-red-100';
      case CategoryType.EVENT_PARENT: return 'text-purple-600 bg-purple-50 border-purple-100';
      case CategoryType.EVENT_ATTENDANCE: return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Timeline</h2>
        
        {/* Filters */}
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <select 
            value={selectedChild} 
            onChange={(e) => setSelectedChild(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 py-1 px-3 outline-none cursor-pointer"
           >
             <option value="all">All Children</option>
             {childrenList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
           <div className="w-px bg-slate-200 my-1"></div>
           <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 py-1 px-3 outline-none cursor-pointer"
           >
             <option value="all">All Categories</option>
             {Object.values(CategoryType).map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      <div className="space-y-8">
        {filteredEvents.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
             <p className="text-slate-400">No events found matching your filters.</p>
           </div>
        ) : (
          filteredEvents.map((event, index) => {
            const date = parseISO(event.date);
            const prevEvent = filteredEvents[index - 1];
            const showMonthHeader = !prevEvent || !isSameMonth(parseISO(prevEvent.date), date);
            const child = childrenList.find(c => c.id === event.childId);

            return (
              <div key={event.id}>
                {showMonthHeader && (
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 sticky top-0 bg-slate-50 py-2 z-10">
                    {format(date, 'MMMM yyyy')}
                  </h3>
                )}
                
                <div className="flex group mb-4">
                  {/* Date Column */}
                  <div className="flex flex-col items-center mr-4 pt-1 w-12 shrink-0">
                    <span className="text-xl font-bold text-slate-900">{format(date, 'd')}</span>
                    <span className="text-xs font-medium text-slate-400 uppercase">{format(date, 'EEE')}</span>
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm group-hover:border-indigo-300 group-hover:shadow-md transition-all relative overflow-hidden">
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-${child?.color || 'gray'}-500`}></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <CalIcon size={12} /> {event.time}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${child?.color || 'gray'}-500`}></div>
                        <span className="text-xs font-semibold text-slate-600">{child?.name}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-slate-900 mb-1">{event.title}</h4>
                    {event.location && (
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Timeline;