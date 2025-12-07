import React from 'react';
import { ActionItem, Child } from '../types';
import { childColours } from '../src/theme/colors';
import { UrgencyBadge } from './UrgencyBadge';
import { CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

interface ActionCardProps {
    action: ActionItem;
    child?: Child;
    onToggle: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, child, onToggle }) => {
    const controls = useAnimation();
    const navigate = useNavigate();
    const theme = child
        ? (childColours[child.name.toLowerCase() as keyof typeof childColours] || childColours.shared)
        : childColours.shared;

    // Confetti trigger
    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [theme.primary, '#FBBF24', '#34D399']
        });
    };

    const handleToggle = () => {
        if (!action.isCompleted) {
            triggerConfetti();
        }
        onToggle(action.id);
    };

    // Swipe logic
    const handleDragEnd = async (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            // Swiped right -> Complete
            if (!action.isCompleted) {
                triggerConfetti();
                onToggle(action.id);
            } else {
                controls.start({ x: 0 }); // Reset if already done
            }
        } else {
            controls.start({ x: 0 }); // Reset position
        }
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (action.relatedEmailId) {
            navigate(`/inbox?emailId=${action.relatedEmailId}`);
        } else {
            navigate('/inbox');
        }
    };

    return (
        <motion.div
            layout
            animate={controls}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x: 0 }}
            className={`bg-background-primary rounded-card shadow-soft p-5 mb-3 relative overflow-hidden cursor-pointer hover:shadow-floating transition-all ${action.isCompleted ? 'opacity-60 bg-gray-50' : ''}`}
        >
            {/* Visual cue for swipe - rendered behind content if needed, currently implicit */}

            <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: action.isCompleted ? '#9CA3AF' : theme.primary }}
            />

            <div className="flex justify-between items-start gap-3 pl-2">
                {/* Icon & Content */}
                <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 ${action.isCompleted ? 'text-gray-400' : 'text-amber-500'}`}>
                        <AlertCircle size={24} />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-semibold text-lg leading-tight font-serif ${action.isCompleted ? 'text-foreground-muted line-through' : 'text-foreground-primary'}`}>
                                {action.title}
                            </h3>
                            {!action.isCompleted && (
                                <UrgencyBadge urgency={action.urgency} deadline={action.deadline} />
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-3">
                            {child && <span className="font-medium" style={{ color: action.isCompleted ? '#6B7280' : theme.dark }}>{child.name}</span>}
                            {child && <span>•</span>}
                            <span>Action Required</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium transition-colors border-none shadow-sm ${action.isCompleted
                                    ? 'bg-background-secondary text-foreground-muted hover:bg-gray-200'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                            >
                                <CheckCircle size={14} />
                                {action.isCompleted ? 'Mark as Undone' : 'Mark as Done'}
                            </button>

                            <button
                                onClick={handleView}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium text-foreground-secondary bg-background-secondary hover:bg-gray-200 transition-colors shadow-sm"
                            >
                                <FileText size={14} />
                                View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
