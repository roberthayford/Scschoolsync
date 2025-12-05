import React from 'react';
import { SchoolEvent, Child, CategoryType } from '../types';
import { childColours, categoryColours } from '../src/theme/colors';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventCardProps {
    event: SchoolEvent;
    child?: Child;
    onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, child, onClick }) => {
    // Determine colors based on child or default to shared
    const theme = child
        // naive mapping of child color string to our theme keys if possible, or fallback
        ? (childColours[child.name.toLowerCase() as keyof typeof childColours] || childColours.shared)
        : childColours.shared;

    const getCategoryIcon = (category: CategoryType) => {
        // Return icon based on category - leveraging Lucide react icons
        switch (category) {
            case CategoryType.EVENT_ATTENDANCE: return <Calendar size={20} />;
            case CategoryType.EVENT_PARENT: return <Calendar size={20} />; // distinct icon if available
            default: return <Calendar size={20} />;
        }
    };

    const categoryStyle = categoryColours.eventChild; // Default for now, can perform mapping based on event.category

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden flex flex-col gap-2"
            style={{ borderLeftWidth: '4px', borderLeftColor: theme.primary }}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.icon }}
                    >
                        {getCategoryIcon(event.category)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {child && (
                                <span className="font-medium" style={{ color: theme.dark }}>{child.name}</span>
                            )}
                            {child && <span>•</span>}
                            {event.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {event.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                    </div>
                    {event.time && (
                        <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-0.5">
                            <Clock size={12} />
                            {event.time}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
