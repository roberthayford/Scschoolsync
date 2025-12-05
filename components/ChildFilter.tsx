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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border whitespace-nowrap ${selectedChildId === 'all'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border whitespace-nowrap`}
                        style={{
                            backgroundColor: isSelected ? theme.primary : 'white',
                            borderColor: isSelected ? theme.primary : '#E2E8F0',
                            color: isSelected ? 'white' : '#475569',
                        }}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : ''}`}
                            style={{ backgroundColor: isSelected ? 'white' : theme.primary }}
                        />
                        {child.name}
                    </motion.button>
                );
            })}
        </div>
    );
};
