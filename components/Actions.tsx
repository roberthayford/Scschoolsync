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
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const getUrgencyColor = (level: UrgencyLevel) => {
    switch (level) {
      case UrgencyLevel.CRITICAL: return 'text-red-600';
      case UrgencyLevel.HIGH: return 'text-orange-600';
      case UrgencyLevel.MEDIUM: return 'text-yellow-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Actions</h2>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setFilter('outstanding')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'outstanding' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Outstanding
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'completed' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredActions.map(action => {
          const child = childrenList.find(c => c.id === action.childId);
          const daysLeft = differenceInDays(parseISO(action.deadline), new Date());
          const isOverdue = daysLeft < 0 && !action.isCompleted;

          return (
            <div
              key={action.id}
              className={`
                relative bg-white p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4
                ${action.isCompleted ? 'border-slate-100 opacity-60' : 'border-slate-200/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:border-indigo-300 hover:shadow-md'}
              `}
            >
              <button
                onClick={() => onToggleAction(action.id)}
                className={`mt-1 text-slate-400 hover:text-indigo-600 transition-colors ${action.isCompleted ? 'text-green-500' : ''}`}
              >
                {action.isCompleted ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h3 className={`font-semibold text-lg ${action.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {action.title}
                  </h3>
                  {!action.isCompleted && (
                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${getUrgencyColor(action.urgency)}`}>
                      {action.urgency === UrgencyLevel.CRITICAL && <AlertTriangle size={14} />}
                      {action.urgency} Priority
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm mt-2">
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-100">
                    <div className={`w-2 h-2 rounded-full bg-${child?.color || 'gray'}-500`}></div>
                    <span className="font-medium text-slate-600">{child?.name}</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                    <Clock size={14} />
                    <span>
                      {isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : `Due ${format(parseISO(action.deadline), 'MMM do')}`}
                    </span>
                  </div>
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