import React, { useState } from 'react';
import { ActionItem, Child } from '../types';
import { CheckSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ActionCard } from './ActionCard';
import { EmptyState } from './EmptyState';

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
      // Sort by urgency/deadline
      const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return dateA - dateB;
    });

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Actions</h2>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilter('outstanding')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'outstanding'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Outstanding
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'completed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="min-h-[300px]">
        <AnimatePresence mode='popLayout'>
          {filteredActions.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyState
                icon={CheckSquare}
                title={filter === 'outstanding' ? "You're all caught up!" : "No completed actions yet"}
                description={filter === 'outstanding' ? "Great job! No outstanding actions." : "Completed actions will show up here."}
              />
            </motion.div>
          ) : (
            filteredActions.map((action, index) => {
              const child = childrenList.find(c => c.id === action.childId);
              if (!child) return null;

              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ActionCard
                    action={action}
                    child={child}
                    onToggle={() => onToggleAction(action.id)}
                    onViewDetails={() => { }}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Actions;