import React, { useState } from 'react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { Child, SchoolEvent, CategoryType } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { EventCard } from './EventCard';
import { ChildFilter } from './ChildFilter';
import { EmptyState } from './EmptyState';
import { Calendar as CalIcon } from 'lucide-react';

interface TimelineProps {
  events: SchoolEvent[];
  childrenList: Child[];
}

const Timeline: React.FC<TimelineProps> = ({ events, childrenList }) => {
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter Logic
  const filteredEvents = events
    .filter(evt => selectedChildId === 'all' || evt.childId === selectedChildId)
    .filter(evt => selectedCategory === 'all' || evt.category === selectedCategory)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Timeline</h2>
          {/* Category Dropdown - Keeping simple for now, could be improved to a pill list too if specific categories are important to filter frequently */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium py-2 pl-4 pr-8 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Categories</option>
              {Object.values(CategoryType).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        <ChildFilter
          childrenList={childrenList}
          selectedChildId={selectedChildId}
          onSelect={setSelectedChildId}
        />
      </div>

      <div className="space-y-8 min-h-[300px]">
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              icon={CalIcon}
              title="No events found"
              description="Try adjusting your filters to see more events."
            />
          </motion.div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {filteredEvents.map((event, index) => {
              const date = parseISO(event.date);
              const prevEvent = filteredEvents[index - 1];
              const showMonthHeader = !prevEvent || !isSameMonth(parseISO(prevEvent.date), date);
              const child = childrenList.find(c => c.id === event.childId);

              // Skip if child data is missing
              if (!child) return null;

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {showMonthHeader && (
                    <div className="sticky top-0 bg-slate-50 py-2 z-10 mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        {format(date, 'MMMM yyyy')}
                      </h3>
                    </div>
                  )}

                  <div className="flex group mb-2">
                    {/* Date Column */}
                    <div className="flex flex-col items-center mr-4 pt-1 w-12 shrink-0">
                      <span className="text-xl font-bold text-slate-900">{format(date, 'd')}</span>
                      <span className="text-xs font-medium text-slate-400 uppercase">{format(date, 'EEE')}</span>
                    </div>

                    {/* Event Card */}
                    <div className="flex-1 min-w-0">
                      <EventCard event={event} child={child} onClick={() => { }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Timeline;