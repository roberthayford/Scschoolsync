import React from 'react';
import { motion } from 'framer-motion';
import { Child } from '../types';
import { childColours } from '../src/theme/colors';

interface ChildFilterProps {
    childrenList: Child[];
    selectedChildId: string | 'all';
    onSelect: (childId: string | 'all') => void;
}

export const ChildFilter: React.FC<ChildFilterProps> = ({ childrenList, selectedChildId, onSelect }) => {
    return (
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect('all')}
                className={`px-5 py-2.5 rounded-pill text-sm font-medium transition-all whitespace-nowrap shadow-sm ${selectedChildId === 'all'
                    ? 'bg-foreground-primary text-white shadow-soft'
                    : 'bg-background-primary text-foreground-secondary hover:bg-background-secondary'
                    }`}
            >
                All
            </motion.button>

            {childrenList.map((child) => {
                const theme = childColours[child.name.toLowerCase() as keyof typeof childColours] || childColours.shared;
                const isSelected = selectedChildId === child.id;

                return (
                    <motion.button
                        key={child.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(child.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-pill text-sm font-medium transition-all whitespace-nowrap shadow-sm`}
                        style={{
                            backgroundColor: isSelected ? theme.primary : '#FFFFFF',
                            color: isSelected ? 'white' : '#3C3C43',
                        }}
                    >
                        <span
                            className={`w-2 h-2 rounded-full`}
                            style={{ backgroundColor: isSelected ? 'white' : theme.primary }}
                        />
                        {child.name}
                    </motion.button>
                );
            })}
        </div>
    );
};
