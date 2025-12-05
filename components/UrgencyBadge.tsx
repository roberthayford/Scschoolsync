import React from 'react';
import { UrgencyLevel } from '../types';
import { urgencyColours } from '../src/theme/colors';

interface UrgencyBadgeProps {
    urgency: UrgencyLevel;
    deadline?: string;
    compact?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, deadline, compact = false }) => {
    const getColors = (level: UrgencyLevel) => {
        switch (level) {
            case UrgencyLevel.CRITICAL:
                return urgencyColours.critical;
            case UrgencyLevel.HIGH:
                return urgencyColours.attention;
            case UrgencyLevel.MEDIUM:
                return urgencyColours.upcoming;
            case UrgencyLevel.LOW:
            default:
                return urgencyColours.default;
        }
    };

    const colors = getColors(urgency);

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
        return (
            <div
                className={`w-3 h-3 rounded-full ${urgency === UrgencyLevel.CRITICAL ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: colors.badge }}
                title={text}
            />
        );
    }

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${urgency === UrgencyLevel.CRITICAL ? 'animate-pulse' : ''}`}
            style={{
                backgroundColor: colors.background,
                color: colors.text,
                border: `1px solid ${colors.badge}20`
            }}
        >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: colors.badge }}></span>
            {text}
        </span>
    );
};
