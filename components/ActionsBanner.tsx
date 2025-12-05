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
            className="bg-white border border-red-100 shadow-[0_2px_8px_rgba(239,68,68,0.08)] rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all group"
        >
            <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                    <p className="font-semibold text-slate-900 text-[15px] leading-tight">Action Required</p>
                    <p className="text-slate-500 text-[13px] mt-0.5">{pendingCount} {pendingCount === 1 ? 'item needs' : 'items need'} attention</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 pl-3">
                <span className="text-xs font-medium text-red-500/80 group-hover:text-red-600 transition-colors">Review</span>
                <ChevronRight size={16} className="text-red-400 group-hover:text-red-600 transition-colors" />
            </div>
        </div>
    );
};
