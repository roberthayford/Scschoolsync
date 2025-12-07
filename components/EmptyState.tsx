import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-brand-lavender p-5 rounded-card mb-4">
                <Icon size={32} className="text-brand-purple" />
            </div>
            <h3 className="text-xl font-bold text-foreground-primary mb-2 font-serif">{title}</h3>
            <p className="text-foreground-muted text-sm max-w-xs mb-6">{description}</p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 bg-foreground-primary text-white rounded-pill font-medium text-sm hover:opacity-90 transition-all shadow-soft active:scale-95"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
