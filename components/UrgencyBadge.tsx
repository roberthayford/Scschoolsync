import React from 'react';
import { UrgencyLevel } from '../types';
import { urgencyColours } from '../src/theme/colors';

interface UrgencyBadgeProps {
    urgency: UrgencyLevel;
    deadline?: string;
    compact?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, deadline, compact = false }) => {
    const getBadgeClasses = (level: UrgencyLevel) => {
        switch (level) {
            case UrgencyLevel.CRITICAL:
            case UrgencyLevel.HIGH:
                return 'bg-priority-high-bg text-priority-high-text';
            case UrgencyLevel.MEDIUM:
                return 'bg-priority-medium-bg text-priority-medium-text';
            case UrgencyLevel.LOW:
            default:
                return 'bg-priority-low-bg text-priority-low-text';
        }
    };

    const badgeClass = getBadgeClasses(urgency);

    // Parse deadline to display "Due X" text if needed
    const getDeadlineText = () => {
        if (!deadline) return urgency;

        // Simple date handling for now, can be enhanced with date-fns or similar
        const date = new Date(deadline);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) return 'Due Today';
        return `Due ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    };

    const text = getDeadlineText();

    if (compact) {
        // Map urgency to simple bg colors for dot
        const dotColor = urgency === UrgencyLevel.CRITICAL || urgency === UrgencyLevel.HIGH ? 'bg-red-500'
            : urgency === UrgencyLevel.MEDIUM ? 'bg-orange-500'
                : 'bg-blue-500';

        return (
            <div
                className={`w-3 h-3 rounded-full ${dotColor} ${urgency === UrgencyLevel.CRITICAL ? 'animate-pulse' : ''}`}
                title={text}
            />
        );
    }

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-inner text-xs font-bold uppercase tracking-wide ${badgeClass} ${urgency === UrgencyLevel.CRITICAL ? 'animate-pulse' : ''}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70`}></span>
            {text}
        </span>
    );
};
