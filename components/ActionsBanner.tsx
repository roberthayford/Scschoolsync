import React from 'react';
import { ActionItem } from '../types';
import { ChevronRight, AlertTriangle } from 'lucide-react';

interface ActionsBannerProps {
    actions: ActionItem[];
    onClick: () => void;
}

export const ActionsBanner: React.FC<ActionsBannerProps> = ({ actions, onClick }) => {
    const pendingCount = actions.filter(a => !a.isCompleted).length;

    if (pendingCount === 0) return null;

    return (
        <div
            onClick={onClick}
            className="bg-background-primary shadow-soft rounded-card p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all group hover:shadow-floating"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-priority-high-bg rounded-inner flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-priority-high-text" />
                </div>
                <div>
                    <p className="font-bold text-foreground-primary text-base leading-tight font-serif">Action Required</p>
                    <p className="text-foreground-secondary text-sm mt-0.5">{pendingCount} {pendingCount === 1 ? 'item needs' : 'items need'} your attention</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 pl-3">
                <span className="text-sm font-bold text-priority-high-text/80 group-hover:text-priority-high-text transition-colors uppercase tracking-wide">Review</span>
                <ChevronRight size={18} className="text-priority-high-text group-hover:text-red-700 transition-colors" />
            </div>
        </div>
    );
};
