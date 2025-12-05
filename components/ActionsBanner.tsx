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
            className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-center justify-between cursor-pointer active:bg-red-100 transition-colors sticky top-0 z-10"
        >
            <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="font-bold text-red-800 text-sm">{pendingCount} actions need attention</p>
                    <p className="text-red-600 text-xs">Tap to view details</p>
                </div>
            </div>
            <ChevronRight size={20} className="text-red-400" />
        </div>
    );
};
