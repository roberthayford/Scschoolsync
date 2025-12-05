import React, { useState } from 'react';
import { ActionItem, Child, UrgencyLevel } from '../types';
import { CheckSquare, Square, AlertTriangle, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

interface ActionsProps {
  actions: ActionItem[];
  childrenList: Child[];
  onToggleAction: (id: string) => void;
}

const Actions: React.FC<ActionsProps> = ({ actions, childrenList, onToggleAction }) => {
  const [filter, setFilter] = useState<'outstanding' | 'completed'>('outstanding');

  const filteredActions = actions
    .filter(a => filter === 'outstanding' ? !a.isCompleted : a.isCompleted)
    .sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return dateA - dateB;
    });

  const getUrgencyColor = (level: UrgencyLevel) => {
    switch (level) {
      case UrgencyLevel.CRITICAL: return 'text-red-600';
      case UrgencyLevel.HIGH: return 'text-orange-600';
      case UrgencyLevel.MEDIUM: return 'text-yellow-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0"> {/* Padding for mobile nav */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Actions</h2>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
          <button
            onClick={() => setFilter('outstanding')}
            className={`flex-1 md:flex-none px-4 py-2 md:py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'outstanding' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Outstanding
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 md:flex-none px-4 py-2 md:py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'completed' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {filteredActions.map(action => {
          const child = childrenList.find(c => c.id === action.childId);
          const daysLeft = action.deadline ? differenceInDays(parseISO(action.deadline), new Date()) : null;
          const isOverdue = daysLeft !== null && daysLeft < 0 && !action.isCompleted;

          return (
            <div
              key={action.id}
              className={`
                relative bg-white p-4 md:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-3 md:gap-4 group
                ${action.isCompleted ? 'border-slate-100 opacity-60' : 'border-slate-200/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:border-indigo-300 hover:shadow-md'}
              `}
            >
              <button
                onClick={() => onToggleAction(action.id)}
                className={`mt-1 md:mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors p-1 -ml-1 ${action.isCompleted ? 'text-green-500' : ''}`}
              >
                {action.isCompleted ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-2 mb-1">
                  <h3 className={`font-semibold text-base md:text-lg leading-snug ${action.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {action.title}
                  </h3>
                  {!action.isCompleted && (
                    <div className={`flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider self-start md:self-auto ${getUrgencyColor(action.urgency)}`}>
                      {action.urgency === UrgencyLevel.CRITICAL && <AlertTriangle size={14} />}
                      {action.urgency} <span className="hidden sm:inline">Priority</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm mt-2">
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-100">
                    <div className={`w-2 h-2 rounded-full bg-${child?.color || 'gray'}-500`}></div>
                    <span className="font-medium text-slate-600">{child?.name || 'Unknown'}</span>
                  </div>

                  {action.deadline && (
                    <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                      <Clock size={14} />
                      <span>
                        {isOverdue ? `Overdue by ${Math.abs(daysLeft!)} days` : `Due ${format(parseISO(action.deadline), 'MMM do')}`}
                      </span>
                    </div>
                  )}
                  {!action.deadline && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={14} />
                      <span>No deadline</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredActions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No actions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Actions;